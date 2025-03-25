
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { OrbitControls } from '@react-three/drei';

export const ShoppingCart3D = ({ autoRotate = false }: { autoRotate?: boolean }) => {
  const cartRef = useRef<Mesh>(null);
  
  // Simple rotation if enabled
  useFrame(() => {
    if (cartRef.current && autoRotate) {
      cartRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <>
      {/* Simple cart icon like the reference image */}
      <mesh ref={cartRef} position={[0, 0, 0]}>
        {/* Cart body - main rectangular shape */}
        <mesh position={[0, 0.5, 0]}>
          {/* Main outline */}
          <mesh position={[0, 0, 0]}>
            {/* Horizontal top bar */}
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[1.8, 0.15, 0.15]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Right vertical side */}
            <mesh position={[0.825, 0.1, 0]}>
              <boxGeometry args={[0.15, 1.5, 0.15]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Left vertical side */}
            <mesh position={[-0.825, 0.1, 0]}>
              <boxGeometry args={[0.15, 1.5, 0.15]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Bottom horizontal bar */}
            <mesh position={[0, -0.65, 0]}>
              <boxGeometry args={[1.8, 0.15, 0.15]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Grid lines */}
            {/* Vertical grid lines */}
            <mesh position={[-0.45, 0.1, 0]}>
              <boxGeometry args={[0.1, 1.3, 0.05]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[-0.05, 0.1, 0]}>
              <boxGeometry args={[0.1, 1.3, 0.05]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0.35, 0.1, 0]}>
              <boxGeometry args={[0.1, 1.3, 0.05]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Horizontal grid lines */}
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.5, 0.1, 0.05]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 0.1, 0.05]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          </mesh>
        </mesh>
        
        {/* Handle */}
        <mesh position={[-0.9, 0.7, 0]}>
          <mesh position={[-0.3, 0, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.15]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.6, -0.35, 0]}>
            <boxGeometry args={[0.15, 0.85, 0.15]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </mesh>
        
        {/* Wheels */}
        <mesh position={[-0.6, -0.9, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.6, -0.9, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </mesh>
      
      {/* Add lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      
      {/* Add orbit controls if needed */}
      {!autoRotate && <OrbitControls enableZoom={false} />}
    </>
  );
};
