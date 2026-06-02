import React, { useRef, useEffect } from 'react';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function NaoModel({ joints }) {
  const group = useRef();
  // Ensure you place nao.glb in dashboard/public/nao.glb
  const { scene, nodes } = useGLTF('/nao.glb', true, true, (error) => {
    console.error("Failed to load /nao.glb. Did you export it from Blender?", error);
  });

  // Keep a reference to the skeleton's bones
  const bones = useRef({});

  useEffect(() => {
    if (nodes) {
      console.log("Nodes loaded:", nodes);
      const findBonesAndMeshes = (obj) => {
        if (obj.isBone) {
          bones.current[obj.name] = obj;
        }
        // Fix GLTF bone-tail export artifact (4cm offset)
        if (obj.isMesh) {
          obj.position.set(0, 0, 0);
        }
        if (obj.children) {
          obj.children.forEach(findBonesAndMeshes);
        }
      };
      findBonesAndMeshes(scene);
    }
  }, [nodes]);

  useFrame(() => {
    if (!joints) return;
    
    // Dynamically apply all incoming joint angles (already in radians) to the 3D model bones
    Object.keys(joints).forEach((jointName) => {
      const bone = bones.current[jointName];
      if (bone) {
        const rad = joints[jointName];
        
        // Accurate Axis Mapping for Blender T-Pose Armature
        // Arms point mostly along X, Legs point along -Z
        if (jointName.includes('ShoulderPitch') || jointName.includes('HipPitch') || jointName.includes('KneePitch') || jointName.includes('AnklePitch') || jointName.includes('HeadPitch')) {
          bone.rotation.y = rad;
        } else if (jointName.includes('ShoulderRoll')) {
          bone.rotation.z = rad; // Real robot RShoulderRoll already has correct sign mapping
        } else if (jointName.includes('ElbowRoll')) {
          bone.rotation.z = rad;
        } else if (jointName.includes('ElbowYaw') || jointName.includes('WristYaw')) {
          bone.rotation.x = rad;
        } else if (jointName.includes('HipRoll') || jointName.includes('AnkleRoll')) {
          bone.rotation.x = rad;
        } else if (jointName.includes('HipYawPitch') || jointName.includes('HeadYaw')) {
          bone.rotation.z = rad;
        } else if (jointName.includes('Hand')) {
          bone.rotation.z = rad;
        }
      }
    });
  });

  // If the model hasn't loaded yet, show a fallback
  if (!nodes) return null;

  return (
    <group ref={group} dispose={null} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={scene} dispose={null} />
      
      {/* Dynamic Lighting matching the cybernetic dashboard */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={2.5} 
        color="#ffffff"
        castShadow
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={1.0} 
        color="#00c8ff" 
      />
      <Environment preset="city" />
      
      {/* Allow the user to zoom and rotate the NAO model */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={0.5}
        maxDistance={3}
        target={[0, 0.2, 0]} 
      />
    </group>
  );
}

// Preload the model to prevent flickering
useGLTF.preload('/nao.glb');
