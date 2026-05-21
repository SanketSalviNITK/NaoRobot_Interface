import socket
import json
import os
import sys

BLENDER_HOST = '127.0.0.1'
BLENDER_PORT = 9876

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_script = os.path.join(script_dir, "build_nao_model.py")
    
    if not os.path.exists(model_script):
        print("ERROR: Cannot find model script: " + model_script)
        sys.exit(1)
        
    dashboard_public_dir = os.path.join(script_dir, "dashboard", "public")
    if not os.path.exists(dashboard_public_dir):
        os.makedirs(dashboard_public_dir)
        
    export_path = os.path.join(dashboard_public_dir, "nao.glb").replace("\\", "/")

    export_path = os.path.join(dashboard_public_dir, "nao.glb").replace("\\", "/")

    # We send a script that adds the project dir to sys.path, imports the module, builds it, tests it, and exports it.
    full_code = """
import sys
import math
import time
import bpy

# Add project directory to sys.path so we can import the local module
project_dir = r"C:\\Users\\ARVR\\Documents\\ARVRProjects\\EmbodiedAI"
if project_dir not in sys.path:
    sys.path.append(project_dir)

import build_nao_model
# In Python 3, importlib is standard, but try standard ways to reload
try:
    import importlib
    importlib.reload(build_nao_model)
except:
    import imp
    imp.reload(build_nao_model)

# Build the robot!
build_nao_model.build_nao_robot()

def test_joints_and_export():
    import math
    import time
    armature = bpy.data.objects.get("NAO_Armature")
    if not armature:
        print("Armature not found!")
        return
        
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='POSE')
    
    bones_to_test = [
        ("HeadYaw", 'Z'), 
        ("HeadPitch", 'Y'),
        ("LShoulderPitch", 'Y'),
        ("LShoulderRoll", 'X'),
        ("LElbowRoll", 'X'),
        ("LHipPitch", 'Y')
    ]
    
    print("Testing joints visually in Blender...")
    for bone_name, axis in bones_to_test:
        pose_bone = armature.pose.bones.get(bone_name)
        if pose_bone:
            # Wiggle back and forth
            pose_bone.rotation_mode = 'XYZ'
            for angle in [15, 30, 0, -15, -30, 0]:
                if axis == 'X':
                    pose_bone.rotation_euler = (math.radians(angle), 0, 0)
                elif axis == 'Y':
                    pose_bone.rotation_euler = (0, math.radians(angle), 0)
                elif axis == 'Z':
                    pose_bone.rotation_euler = (0, 0, math.radians(angle))
                
                # Force update
                bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)
                time.sleep(0.05)
                
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Export to GLB
    export_path = "{export_path}"
    
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if "NAO" in obj.name:
            obj.select_set(True)
            
    try:
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            use_selection=True
        )
        print("Exported GLB to " + export_path)
    except Exception as e:
        print("Export failed: " + str(e))

test_joints_and_export()
""".format(export_path=export_path)

    print("Sending build, test, and export instructions to Blender...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(60.0)
        s.connect((BLENDER_HOST, BLENDER_PORT))
        s.sendall(full_code.encode('utf-8'))
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
            print("SUCCESS: Blender executed the script!")
            try:
                print(result.get("stdout").encode('ascii', 'replace').decode('ascii'))
            except:
                pass
        else:
            print("ERROR: Blender failed to execute script:")
            try:
                print(result.get("stderr").encode('ascii', 'replace').decode('ascii'))
            except:
                pass
            
    except socket.error as e:
        print("ERROR: Socket error occurred: " + str(e))
    except Exception as e:
        print("ERROR: Unexpected connection issue: " + str(e))

if __name__ == "__main__":
    main()
