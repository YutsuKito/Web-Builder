'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { Componente } from '../../core/domain/Componente';
import { getValidStyles, getComputedStyles } from '../../utils/styleHelpers';
import { useEditorStore } from '../../store/useEditorStore';

interface IconElementProps {
  elemento: Componente;
}

export default function IconElement({ elemento }: IconElementProps) {
  const { viewport } = useEditorStore();
  const estilos = (elemento as any).estilos || {};
  const computedStyles = getComputedStyles(estilos, viewport);


  // O nome do ícone está armazenado no conteúdoTextual
  const iconName = (elemento.conteudoTextual || 'Circle') as keyof typeof LucideIcons;
  
  // Resolve o componente do Lucide React
  const IconComponent = (LucideIcons[iconName] as React.ElementType) || LucideIcons.Circle;

  // O tamanho vem do estilos.fontSize (slider) ou largura/altura
  const size = parseInt(String(computedStyles.fontSize || '48')) || 48;
  const color = computedStyles.color || '#000000';


  return (
    <div
      style={{
        ...getValidStyles(computedStyles),
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: elemento.link ? 'pointer' : 'default'
      }}

      className="overflow-hidden"
    >
      <IconComponent 
        size={size} 
        color={color} 
        strokeWidth={2}
      />
    </div>
  );
}
