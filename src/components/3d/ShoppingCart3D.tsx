
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
      {/* Shopping cart made to look like the reference image */}
      <mesh ref={cartRef} position={[0, -0.2, 0]}>
        {/* Cart basket/body - blue box */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.9, 1.1]} />
          <meshStandardMaterial color="#0EA5E9" />
          
          {/* Cart basket grid pattern - front */}
          <mesh position={[0, 0, 0.56]} rotation={[0, 0, 0]}>
            <boxGeometry args={[1.7, 0.8, 0.05]} />
            <meshStandardMaterial color="#1E88E5" />
          </mesh>
          
          {/* Cart basket grid pattern - sides */}
          <mesh position={[0.9, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.8, 1]} />
            <meshStandardMaterial color="#1E88E5" />
          </mesh>
          <mesh position={[-0.9, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.8, 1]} />
            <meshStandardMaterial color="#1E88E5" />
          </mesh>
        </mesh>
        
        {/* Cart base */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[1.8, 0.1, 1.3]} />
          <meshStandardMaterial color="#1E3A8A" />
        </mesh>
        
        {/* Wheels - front */}
        <mesh position={[-0.7, -0.3, 0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#666666" />
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </mesh>
        <mesh position={[0.7, -0.3, 0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#666666" />
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </mesh>
        
        {/* Wheels - back */}
        <mesh position={[-0.7, -0.3, -0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#666666" />
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </mesh>
        <mesh position={[0.7, -0.3, -0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#666666" />
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </mesh>
        
        {/* Handle */}
        <mesh position={[0, 0.8, -0.7]}>
          <cylinderGeometry args={[0.07, 0.07, 1.8, 16]} />
          <meshStandardMaterial color="#CCCCCC" />
          
          {/* Handle supports */}
          <mesh position={[-0.8, 0, 0.35]} rotation={[0, 0, Math.PI / 2.5]}>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 16]} />
            <meshStandardMaterial color="#AAAAAA" />
          </mesh>
          <mesh position={[0.8, 0, 0.35]} rotation={[0, 0, -Math.PI / 2.5]}>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 16]} />
            <meshStandardMaterial color="#AAAAAA" />
          </mesh>
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
