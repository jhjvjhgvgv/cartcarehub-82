
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useGLTF, OrbitControls } from '@react-three/drei';

export const ShoppingCart3D = ({ autoRotate = true }: { autoRotate?: boolean }) => {
  const cartRef = useRef<Mesh>(null);
  
  // Rotate the cart automatically
  useFrame(() => {
    if (cartRef.current && autoRotate) {
      cartRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <>
      {/* Simple cart made from primitive shapes */}
      <mesh ref={cartRef}>
        {/* Cart base */}
        <boxGeometry args={[2, 0.2, 1.3]} />
        <meshStandardMaterial color="#3B82F6" />
        
        {/* Cart basket */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.8, 1, 1.1]} />
          <meshStandardMaterial color="#2563EB" wireframe />
        </mesh>
        
        {/* Wheels */}
        <mesh position={[-0.7, -0.2, -0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1E3A8A" />
        </mesh>
        <mesh position={[0.7, -0.2, -0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1E3A8A" />
        </mesh>
        <mesh position={[-0.7, -0.2, 0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1E3A8A" />
        </mesh>
        <mesh position={[0.7, -0.2, 0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1E3A8A" />
        </mesh>
        
        {/* Handle */}
        <mesh position={[0, 0.7, -0.7]}>
          <cylinderGeometry args={[0.07, 0.07, 1.8, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1E40AF" />
        </mesh>
      </mesh>
      
      {/* Add lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      
      {/* Add orbit controls if needed */}
      {!autoRotate && <OrbitControls enableZoom={false} />}
    </>
  );
};
