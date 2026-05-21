import json, struct
with open('dashboard/public/nao.glb', 'rb') as f:
    f.read(12)
    clen = struct.unpack('<I', f.read(4))[0]
    f.read(4)
    d = json.loads(f.read(clen).decode('utf-8'))
    
print('Total nodes:', len(d['nodes']))
for n in d['nodes']:
    name = n.get('name', '')
    if name in ['LShoulderPitch', 'LElbowRoll', 'Torso', 'HeadYaw'] or name.startswith('NAO_Mesh_LShoulderPitch') or name.startswith('NAO_Mesh_LElbowRoll'):
        print(f"{name}: T={n.get('translation')} R={n.get('rotation')}")
