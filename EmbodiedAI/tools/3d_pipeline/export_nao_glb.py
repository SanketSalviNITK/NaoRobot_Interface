import socket
import json
import os

BLENDER_HOST = '127.0.0.1'
BLENDER_PORT = 9876

def main():
    dashboard_public_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dashboard", "public")
    if not os.path.exists(dashboard_public_dir):
        os.makedirs(dashboard_public_dir)
        
    export_path = os.path.join(dashboard_public_dir, "nao.glb").replace("\\", "/")

    blender_script = """
import bpy

export_path = "{export_path}"

# Make sure all NAO objects are selected
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if "NAO" in obj.name:
        obj.select_set(True)

# Export to GLB
try:
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=True,
        export_materials='EXPORT',
        export_colors=True,
        export_yup=True
    )
    print("Exported GLB to " + export_path)
except Exception as e:
    print("Export failed: " + str(e))
""".format(export_path=export_path)

    print("Sending export instruction to Blender...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(10.0)
        s.connect((BLENDER_HOST, BLENDER_PORT))
        s.sendall(blender_script.encode('utf-8'))
        s.shutdown(socket.SHUT_WR)
        
        # Read response
        response_data = []
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response_data.append(chunk.decode('utf-8'))
        s.close()
        
        result_str = "".join(response_data)
        if not result_str.strip():
            print("WARNING: Empty response from Blender.")
            return
            
        result = json.loads(result_str)
        if result.get("success"):
            print("SUCCESS: Blender exported the GLB model!")
            print(result.get("stdout"))
        else:
            print("ERROR: Blender failed to execute export script:")
            print(result.get("stderr"))
            
    except socket.error as e:
        print("ERROR: Connection refused! Is Blender open and addon server running?")
    except Exception as e:
        print("ERROR: Unexpected connection issue: " + str(e))

if __name__ == "__main__":
    main()
