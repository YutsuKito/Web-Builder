import { Componente } from '../core/domain/Componente';
import { TemplateElement } from '../core/domain/Templates';

/**
 * Injeta um template gerando novos IDs únicos e mantendo o posicionamento relativo.
 * 
 * @param elements Array de elementos do template
 * @param startZIndex O zIndex inicial para os novos elementos
 * @returns Array de componentes processados com IDs únicos
 */
export function injectTemplate(
  elements: TemplateElement[],
  startZIndex: number = 100
): Componente[] {
  // Em um ambiente real, poderíamos calcular o offset para centralizar no canvas
  // Por agora, usamos as coordenadas definidas no template
  
  return elements.map((el, index) => {
    const newId = crypto.randomUUID();
    
    return {
      ...el,
      id: newId,
      zIndex: startZIndex + index,
      // Se houvesse lógica de children aninhados, precisaríamos de uma 
      // recursão aqui e um mapeamento de IDs antigos para novos.
      // Como o core atual usa childrenIds, vamos garantir que esteja presente se for container.
      ...(el.tipo === 'container' ? { childrenIds: [] } : {}),
    } as Componente;
  });
}
