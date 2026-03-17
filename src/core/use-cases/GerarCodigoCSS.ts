import type { Componente, EstilosCSS } from '../domain/Componente';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Resultado da geração de código CSS. */
export interface ResultadoCSS {
  /** String formatada contendo o bloco CSS gerado. */
  readonly codigo: string;
  /** Seletor CSS utilizado (ex: `.button-abc123`). */
  readonly seletor: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converte uma string camelCase para kebab-case.
 *
 * @example camelParaKebab('borderRadius')  // 'border-radius'
 * @example camelParaKebab('backgroundColor')  // 'background-color'
 */
function camelParaKebab(valor: string): string {
  return valor.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Propriedades CSS que devem ser ignoradas na geração
 * (vazias, puramente whitespace ou potencialmente inseguras).
 */
function valorEhValido(valor: any): boolean {
  if (typeof valor === 'number') return true;
  if (typeof valor !== 'string') return false;
  return valor.trim().length > 0;
}

/**
 * Formata o mapa de estilos em declarações CSS indentadas, uma por linha.
 */
function formatarDeclaracoes(estilos: EstilosCSS): string[] {
  const IGNORE_PROPS = ['isGradient', 'gradientColor1', 'gradientColor2', 'gradientAngle', 'iconName', 'iconPosition'];
  
  const declaracoes: string[] = [];

  // Lógica de Fundo (Sólido vs Gradiente)
  if (estilos.isGradient) {
    const cor1 = estilos.gradientColor1 || '#3b82f6';
    const cor2 = estilos.gradientColor2 || '#9333ea';
    const angulo = estilos.gradientAngle ?? 90;
    declaracoes.push(`  background: linear-gradient(${angulo}deg, ${cor1}, ${cor2});`);
  } else if (estilos.backgroundColor) {
    declaracoes.push(`  background-color: ${estilos.backgroundColor};`);
  }

  // Outras propriedades
  Object.entries(estilos).forEach(([prop, valor]) => {
    if (IGNORE_PROPS.includes(prop) || prop === 'backgroundColor') return;
    if (!valorEhValido(valor)) return;

    // Filtra bordas pontilhadas (são indicadores visuais do editor, não devem aparecer no site)
    if (prop === 'border' && typeof valor === 'string' && valor.includes('dashed')) return;

    const valorFormatado = typeof valor === 'string' ? valor.trim() : valor;
    declaracoes.push(`  ${camelParaKebab(prop)}: ${valorFormatado};`);
  });

  return declaracoes;
}

// ─── Use Case ─────────────────────────────────────────────────────────────────

/**
 * Caso de uso: **Gerar Código CSS**
 *
 * @param componentes - Entidades de domínio `Componente`.
 * @param larguraReferencia - A largura do canvas no momento da edição (default 1024).
 * @returns `ResultadoCSS` com o código gerado e o seletor utilizado.
 */
export function gerarCodigoCSS(componentes: Componente[], larguraReferencia: number = 1024): ResultadoCSS {
  if (!componentes || componentes.length === 0) {
    throw new Error('Nenhum componente fornecido para gerar CSS.');
  }

  const blocosCSS: string[] = [];
  const seletoresUsados: string[] = [];

  for (const componente of componentes) {
    const { id, tipo, estilos, x, y, width, height, zIndex } = componente;

    // Constrói as declarações baseadas nos estilos do editor
    const declaracoes = formatarDeclaracoes(estilos);

    // ─── Posicionamento Absoluto (pixel-perfect) ───
    // Usamos os valores EXATOS de X e Y do react-rnd.
    // Funciona porque os elementos ficam dentro de .canvas-wrapper
    // que tem position: relative e a mesma largura do canvas do editor.
    declaracoes.push(`  position: absolute;`);
    declaracoes.push(`  left: ${x}px;`);
    declaracoes.push(`  top: ${y}px;`);
    
    // Gerenciamento de Camadas
    const zBase = tipo === 'container' ? 0 : 1000;
    const finalZIndex = (zIndex !== undefined ? zIndex : 0) + zBase;
    declaracoes.push(`  z-index: ${finalZIndex};`);
    
    // Width e Height (valores diretos em pixel)
    if (width !== undefined && width !== 'auto') {
      declaracoes.push(`  width: ${typeof width === 'number' ? `${width}px` : width.toString().trim()};`);
    }
    if (height !== undefined && height !== 'auto') {
      declaracoes.push(`  height: ${typeof height === 'number' ? `${height}px` : height};`);
    }

    // Suporte para Flexbox em botões e ícones
    if ((tipo === 'button' || tipo === 'icon') && !estilos.display) {
      declaracoes.push('  display: flex;');
      declaracoes.push('  align-items: center;');
      declaracoes.push('  justify-content: center;');
      if (tipo === 'button' && estilos.iconName && !estilos.gap) {
        declaracoes.push('  gap: 8px;');
      }
    }

    const seletor = `.${tipo}-${id}`;
    seletoresUsados.push(seletor);

    const codigoBloco = [
      `${seletor} {`,
      ...declaracoes,
      `}`,
    ].join('\n');

    blocosCSS.push(codigoBloco);
  }

  const codigoConsolidado = blocosCSS.join('\n\n');

  return { codigo: codigoConsolidado, seletor: seletoresUsados.join(', ') };
}
