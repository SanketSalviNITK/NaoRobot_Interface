import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const TechSphere = ({ status }) => {
  const mesh = useRef();
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x = time * 0.2;
      mesh.current.rotation.y = time * 0.3;
    }
    if (ring1.current) {
      ring1.current.rotation.z = time * 0.5;
      ring1.current.rotation.x = time * 0.2;
    }
    if (ring2.current) {
      ring2.current.rotation.z = -time * 0.4;
      ring2.current.rotation.y = time * 0.3;
    }
  });

  const color = status.connected ? '#00f2ff' : '#ff007a';
  const intensity = status.connected ? 2 : 0.5;

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        {/* Core */}
        <Sphere args={[1, 64, 64]} ref={mesh}>
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.4}
            radius={1}
            emissive={color}
            emissiveIntensity={intensity}
            roughness={0}
            metalness={1}
            transparent
            opacity={0.6}
          />
        </Sphere>

        {/* Technical Rings */}
        <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
        </mesh>
        
        <mesh ref={ring2} rotation={[0, Math.PI / 4, 0]}>
          <torusGeometry args={[1.8, 0.01, 16, 100]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.4} />
        </mesh>

        <pointLight position={[0, 0, 0]} color={color} intensity={10} distance={5} />
      </Float>
    </group>
  );
};

export default function Hologram({ status }) {
  return (
    <div className="w-full h-[400px] relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <HologramContent status={status} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* HUD Overlays */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none border border-primary/10 flex flex-col justify-between p-4">
        <div className="flex justify-between text-[8px] font-mono text-primary/40 uppercase">
          <span>X: 42.02 // Y: 11.09</span>
          <span>Core_Sync_Active</span>
        </div>
        <div className="flex justify-between text-[8px] font-mono text-primary/40 uppercase">
          <span>Tracking_Enabled</span>
          <span>Sector_7G</span>
        </div>
      </div>
    </div>
  );
}

function HologramContent({ status }) {
  return <TechSphere status={status} />;
}
