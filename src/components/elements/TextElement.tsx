import type { Componente } from '../../core/domain/Componente';
import { getValidStyles, getComputedStyles } from '../../utils/styleHelpers';
import { useEditorStore } from '../../store/useEditorStore';

interface TextElementProps {
  elemento: Componente;
}

export default function TextElement({ elemento }: TextElementProps) {
  const { viewport } = useEditorStore();
  const estilos = (elemento as any).estilos || {};
  const computedStyles = getComputedStyles(estilos, viewport);



  return (
    <div
      style={{
        ...getValidStyles(computedStyles),
        width: '100%',
        height: '100%',
        margin: 0,
        cursor: elemento.link ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: computedStyles.textAlign === 'center' ? 'center' : 'flex-start',
      }}
      className="overflow-hidden"
    >
      {elemento.conteudoTextual || ' '}
    </div>
  );
}
