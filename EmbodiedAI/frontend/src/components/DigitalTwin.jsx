import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Maximize2, MoreHorizontal } from 'lucide-react';

const RobotWireframe = () => {
  return (
    <group scale={1.2}>
      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#00f2ff" wireframe emissive="#00f2ff" emissiveIntensity={2} />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color="#00f2ff" wireframe emissive="#00f2ff" emissiveIntensity={1} />
      </mesh>

      {/* Arms */}
      <mesh position={[0.5, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#00f2ff" wireframe />
      </mesh>
      <mesh position={[-0.5, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#00f2ff" wireframe />
      </mesh>

      {/* Legs */}
      <mesh position={[0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.8]} />
        <meshStandardMaterial color="#00f2ff" wireframe />
      </mesh>
      <mesh position={[-0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.8]} />
        <meshStandardMaterial color="#00f2ff" wireframe />
      </mesh>
    </group>
  );
};

const Callout = ({ label, values, position, align = 'left' }) => (
  <div className={`absolute ${position} flex flex-col ${align === 'left' ? 'items-start' : 'items-end'} pointer-events-none`}>
    <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
    {values.map((v, i) => (
      <div key={i} className="flex gap-2">
         <span className="label-callout">{v.k}:</span>
         <span className="value-callout">{v.v}</span>
      </div>
    ))}
    <div className={`w-8 h-[1px] bg-primary/20 mt-1 ${align === 'left' ? '' : 'self-end'}`}></div>
  </div>
);

export default function DigitalTwin({ status }) {
  return (
    <div className="w-full h-full relative bg-bg-navy/10 flex flex-col">
      <div className="p-4 flex justify-between items-center z-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">DIGITAL TWIN</h3>
        <div className="flex gap-2">
          <button className="text-[9px] font-bold px-2 py-1 bg-white/5 border border-white/10 rounded uppercase">3D View</button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 1.5, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
          <RobotWireframe />
          <OrbitControls enableZoom={true} minDistance={3} maxDistance={8} />
        </Canvas>

        {/* CALLOUTS */}
        <Callout 
          label="Head" 
          position="top-10 left-10" 
          values={[{ k: 'Yaw', v: '-12.4°' }, { k: 'Pitch', v: '6.7°' }]} 
        />
        <Callout 
          label="Left Arm" 
          position="top-20 right-10" 
          align="right"
          values={[{ k: 'Shoulder', v: '-21.3°' }, { k: 'Elbow', v: '88.1°' }, { k: 'Wrist', v: '-15.2°' }]} 
        />
        <Callout 
          label="Right Arm" 
          position="top-60 left-10" 
          values={[{ k: 'Shoulder', v: '32.1°' }, { k: 'Elbow', v: '47.8°' }, { k: 'Wrist', v: '10.3°' }]} 
        />
        <Callout 
          label="Left Leg" 
          position="bottom-20 left-10" 
          values={[{ k: 'Hip', v: '-3.6°' }, { k: 'Knee', v: '5.2°' }, { k: 'Ankle', v: '-1.1°' }]} 
        />
        <Callout 
          label="Right Leg" 
          position="bottom-20 right-10" 
          align="right"
          values={[{ k: 'Hip', v: '4.1°' }, { k: 'Knee', v: '-2.7°' }, { k: 'Ankle', v: '0.9°' }]} 
        />
      </div>

      {/* Control Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 p-2 rounded-full border border-white/5 backdrop-blur-md">
         {[...Array(6)].map((_, i) => (
           <div key={i} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:border-primary cursor-pointer transition-colors">
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
           </div>
         ))}
      </div>
    </div>
  );
}
