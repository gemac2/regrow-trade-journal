// components/Logo.tsx
import React from 'react';

export const Logo = () => {
  return (
    <img
      src="/logo.png" // Next.js buscará esto en la carpeta /public
      alt="RegrowTrade Logo"
      // Ajustamos la altura (h-16) y dejamos que el ancho sea automático.
      // 'object-contain' asegura que el logo no se deforme.
      className="w-64 h-auto object-contain transition-transform hover:scale-105 mx-auto"
    />
  );
};