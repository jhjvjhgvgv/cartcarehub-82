
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ShoppingCart3D } from './ShoppingCart3D';

export const Cart3DCanvas = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ 
          background: 'transparent',
          width: '100%',
          height: '100%',
        }}
      >
        <ShoppingCart3D autoRotate={false} />
      </Canvas>
    </div>
  );
};
