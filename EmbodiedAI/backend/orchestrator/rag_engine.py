import os
import fitz  # PyMuPDF
import chromadb
import requests
import json
import uuid

# LM Studio Embeddings Endpoint
LM_STUDIO_EMBED_URL = "http://127.0.0.1:1234/v1/embeddings"
EMBEDDING_MODEL = "nomic-embed-text"

DB_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
client = chromadb.PersistentClient(path=DB_PATH)

# Using a custom embedding function class for ChromaDB
class LMStudioEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        embeddings = []
        for text in input:
            payload = {
                "input": text,
                "model": EMBEDDING_MODEL
            }
            try:
                response = requests.post(LM_STUDIO_EMBED_URL, json=payload, timeout=10)
                response.raise_for_status()
                data = response.json()
                embeddings.append(data['data'][0]['embedding'])
            except Exception as e:
                print(f"[RAG Error] Embedding generation failed: {e}")
                # Append a dummy embedding if it fails just to keep dimensions correct, 
                # nomic-embed-text typically has 768 dimensions.
                embeddings.append([0.0] * 768)
        return embeddings

embed_fn = LMStudioEmbeddingFunction()
collection = client.get_or_create_collection(name="nao_knowledge_base", embedding_function=embed_fn)

def extract_text_and_images(file_path, source_name):
    pages_data = []
    # Ensure public folder exists in React app
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dashboard", "public", "rag_pages")
    os.makedirs(public_dir, exist_ok=True)
    
    if file_path.lower().endswith(".pdf"):
        doc = fitz.open(file_path)
        for i, page in enumerate(doc):
            text = page.get_text()
            # Render PNG
            pix = page.get_pixmap(dpi=150)
            img_filename = f"{source_name}_page_{i+1}.png"
            img_path = os.path.join(public_dir, img_filename)
            pix.save(img_path)
            
            pages_data.append({
                "text": text,
                "page_num": i + 1,
                "image_url": f"/rag_pages/{img_filename}"
            })
    elif file_path.lower().endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
            pages_data.append({
                "text": text,
                "page_num": 1,
                "image_url": ""
            })
    else:
        raise ValueError("Unsupported file type")
    return pages_data

def chunk_text(text, chunk_size=300, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks

def add_document(file_path, source_name):
    print(f"[RAG] Extracting text and rendering images from {source_name}...")
    pages_data = extract_text_and_images(file_path, source_name)
    
    all_chunks = []
    all_metadatas = []
    all_ids = []
    
    for page in pages_data:
        if not page["text"].strip():
            continue
        chunks = chunk_text(page["text"])
        for chunk in chunks:
            all_chunks.append(chunk)
            all_metadatas.append({
                "source": source_name,
                "page_num": page["page_num"],
                "image_url": page["image_url"] or ""
            })
            all_ids.append(str(uuid.uuid4()))
            
    if not all_chunks:
        print("[RAG] No valid text chunks found.")
        return 0
        
    print(f"[RAG] Generated {len(all_chunks)} chunks. Generating embeddings...")
    collection.add(
        documents=all_chunks,
        metadatas=all_metadatas,
        ids=all_ids
    )
    
    print(f"[RAG] Successfully added {len(all_chunks)} chunks to ChromaDB.")
    return len(all_chunks)

def list_documents():
    if collection.count() == 0:
        return []
    
    results = collection.get(include=["metadatas"])
    docs_map = {}
    
    if results['metadatas']:
        for meta in results['metadatas']:
            source = meta.get('source')
            if source:
                if source not in docs_map:
                    docs_map[source] = 1
                else:
                    docs_map[source] += 1
                    
    return [{"name": source, "chunks": count, "size": "Saved"} for source, count in docs_map.items()]

def delete_document(source_name):
    print(f"[RAG] Deleting document {source_name} from ChromaDB...")
    
    # 1. Get images to delete before deleting from vector DB
    results = collection.get(where={"source": source_name}, include=["metadatas"])
    images_to_delete = set()
    if results['metadatas']:
        for meta in results['metadatas']:
            img = meta.get('image_url')
            if img:
                images_to_delete.add(img)
                
    # 2. Delete from Vector DB
    collection.delete(where={"source": source_name})
    
    # 3. Delete physical PNG files
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dashboard", "public")
    for img_url in images_to_delete:
        # img_url is like "/rag_pages/doc_page_1.png"
        img_path = os.path.join(public_dir, img_url.lstrip("/"))
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except Exception as e:
                print(f"[RAG Warning] Could not delete image {img_path}: {e}")
                
    print(f"[RAG] Successfully deleted {source_name}.")
    return True

def query(text, active_docs=None, n_results=3):
    print(f"[RAG] Querying vector DB for: '{text}' (Active Docs: {active_docs})")
    if collection.count() == 0:
        return "", []
        
    query_args = {
        "query_texts": [text],
        "n_results": n_results
    }
    
    if active_docs is not None:
        if len(active_docs) == 0:
            # If no docs are selected, return nothing
            return "", []
        elif len(active_docs) == 1:
            query_args["where"] = {"source": active_docs[0]}
        else:
            query_args["where"] = {"source": {"$in": active_docs}}
            
    results = collection.query(**query_args)
    
    context = ""
    source_images = set()
    
    if results['documents'] and len(results['documents']) > 0:
        for doc in results['documents'][0]:
            context += doc + "\n\n"
            
    if results['metadatas'] and len(results['metadatas']) > 0:
        for meta in results['metadatas'][0]:
            if 'image_url' in meta and meta['image_url']:
                source_images.add(meta['image_url'])
                
    return context.strip(), list(source_images)
