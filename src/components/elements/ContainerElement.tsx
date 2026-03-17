import type { Componente } from '../../core/domain/Componente';
import { getValidStyles, getComputedStyles } from '../../utils/styleHelpers';
import { useEditorStore } from '../../store/useEditorStore';

interface ContainerElementProps {
  elemento: Componente;
  children?: React.ReactNode;
}

export default function ContainerElement({ elemento, children }: ContainerElementProps) {
  const { viewport } = useEditorStore();
  
  const estilos = (elemento as any).estilos || {};
  const styles = getValidStyles(estilos);

  return (
    <div
      style={{
        ...styles,
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        border: styles.border || (children ? 'none' : '2px dashed #cbd5e1'), // Garantir visibilidade
        backgroundColor: styles.backgroundColor || 'rgba(0,0,0,0.02)', // Fundo levíssimo para containers vazios
      }}
      className="container-element"
    >
      {children}
    </div>
  );
}
