import os
import fitz  # PyMuPDF
import chromadb
import requests
import json
import uuid

# LM Studio Embeddings Endpoint
LM_STUDIO_EMBED_URL = "http://169.254.80.100:1234/v1/embeddings"
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

def extract_text(file_path):
    text = ""
    if file_path.lower().endswith(".pdf"):
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text() + "\n"
    elif file_path.lower().endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        raise ValueError("Unsupported file type")
    return text

def chunk_text(text, chunk_size=300, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks

def add_document(file_path, source_name):
    print(f"[RAG] Extracting text from {source_name}...")
    text = extract_text(file_path)
    if not text.strip():
        print("[RAG] No text found in document.")
        return 0
        
    print("[RAG] Chunking text...")
    chunks = chunk_text(text)
    print(f"[RAG] Generated {len(chunks)} chunks. Generating embeddings...")
    
    ids = [str(uuid.uuid4()) for _ in range(len(chunks))]
    metadatas = [{"source": source_name} for _ in range(len(chunks))]
    
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )
    
    print(f"[RAG] Successfully added {len(chunks)} chunks to ChromaDB.")
    return len(chunks)

def query(text, n_results=3):
    print(f"[RAG] Querying vector DB for: '{text}'")
    if collection.count() == 0:
        return ""
        
    results = collection.query(
        query_texts=[text],
        n_results=n_results
    )
    
    context = ""
    if results['documents'] and len(results['documents']) > 0:
        for doc in results['documents'][0]:
            context += doc + "\n\n"
            
    return context.strip()
