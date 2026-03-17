import { EstilosCSS } from '../core/domain/Componente';
import React from 'react';

export const getValidStyles = (estilos: EstilosCSS): React.CSSProperties => {
  const { isGradient, gradientColor1, gradientColor2, gradientAngle, ...validStyles } = estilos;
  
  if (isGradient) {
    const c1 = gradientColor1 || '#3b82f6';
    const c2 = gradientColor2 || '#9333ea';
    const angle = gradientAngle ?? 90;
    validStyles.backgroundImage = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    validStyles.backgroundColor = 'transparent'; // Garante que o fundo sólido não se sobreponha
  }
  
  return validStyles as React.CSSProperties;
};
