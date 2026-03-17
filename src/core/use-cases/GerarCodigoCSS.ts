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
export function gerarCodigoCSS(componentes: Componente[]): ResultadoCSS {
  if (!componentes || componentes.length === 0) {
    throw new Error('Nenhum componente fornecido para gerar CSS.');
  }

  const blocosCSS: string[] = [];
  const blocosTablet: string[] = [];
  const blocosMobile: string[] = [];
  const seletoresUsados: string[] = [];

  const desktopWidth = 1024;
  const desktopHeight = 800;
  const tabletWidth = 768;
  const mobileWidth = 375;

  const gerarDeclaracoesParaViewport = (
    componente: Componente, 
    viewport: 'desktop' | 'tablet' | 'mobile',
    larguraCanvas: number,
    baseResolved?: any // Dados resolvidos do desktop para comparação (delta)
  ) => {
    const { id, tipo, zIndex } = componente;
    const resolved = {
      x: componente.breakpoints[viewport]?.x,
      y: componente.breakpoints[viewport]?.y,
      width: componente.breakpoints[viewport]?.width,
      height: componente.breakpoints[viewport]?.height,
      dockX: componente.breakpoints[viewport]?.dockX,
      dockY: componente.breakpoints[viewport]?.dockY,
      estilos: componente.breakpoints[viewport]?.estilos || {},
    };

    // No desktop (base), pegamos tudo. 
    // No tablet/mobile, pegamos apenas o que foi explicitamente definido (overwrite)
    const declaracoes: string[] = [];

    // Lógica de Posicionamento e Dimensões
    const processarLayout = (data: any, isBase: boolean) => {
      const layoutProps: string[] = [];
      const { x, y, width, height, dockX, dockY } = data;

      // Só adiciona se for base ou se o valor for diferente do base
      if (isBase || x !== undefined || y !== undefined || dockX !== undefined || dockY !== undefined) {
        const finalX = x ?? (isBase ? 0 : baseResolved.x);
        const finalY = y ?? (isBase ? 0 : baseResolved.y);
        const finalDockX = dockX ?? (isBase ? 'left' : baseResolved.dockX);
        const finalDockY = dockY ?? (isBase ? 'top' : baseResolved.dockY);

        // Resolvemos dimensões para cálculos de docking
        const wVal = width ?? (isBase ? 100 : baseResolved.width);
        const hVal = height ?? (isBase ? 100 : baseResolved.height);
        const wNum = typeof wVal === 'number' ? wVal : parseFloat(String(wVal)) || 0;
        const hNum = typeof hVal === 'number' ? hVal : parseFloat(String(hVal)) || 0;

        layoutProps.push(`  position: absolute;`);

        if (finalDockX === 'right') {
          layoutProps.push(`  right: ${larguraCanvas - (finalX + wNum)}px;`);
          layoutProps.push(`  left: auto;`);
        } else if (finalDockX === 'center') {
          layoutProps.push(`  left: 50%;`);
          layoutProps.push(`  transform: translateX(-50%);`);
        } else {
          layoutProps.push(`  left: ${finalX}px;`);
          layoutProps.push(`  right: auto;`);
        }

        // Vertical: sempre usa top com posição exata do canvas
        // (garante que distâncias fiquem iguais ao preview independente da viewport)
        layoutProps.push(`  top: ${finalY}px;`);
        layoutProps.push(`  bottom: auto;`);
      }


      if (isBase || width !== undefined) {
        const wVal = width ?? (isBase ? 100 : baseResolved.width);
        layoutProps.push(`  width: ${typeof wVal === 'number' ? `${wVal}px` : wVal};`);
      }

      if (isBase || height !== undefined) {
        const hVal = height ?? (isBase ? 100 : baseResolved.height);
        layoutProps.push(`  height: ${typeof hVal === 'number' ? `${hVal}px` : hVal};`);
      }

      return layoutProps;
    };

    if (viewport === 'desktop') {
      declaracoes.push(...processarLayout(resolved, true));
      declaracoes.push(...formatarDeclaracoes(resolved.estilos));
      
      const zBase = tipo === 'container' ? 0 : 1000;
      declaracoes.push(`  z-index: ${zIndex + zBase};`);
    } else {
      // Overwrites para Tablet/Mobile
      declaracoes.push(...processarLayout(resolved, false));
      if (Object.keys(resolved.estilos).length > 0) {
        declaracoes.push(...formatarDeclaracoes(resolved.estilos));
      }
    }

    return declaracoes;
  };

  for (const componente of componentes) {
    const seletor = `.${componente.tipo}-${componente.id}`;
    seletoresUsados.push(seletor);

    // 1. Desktop (Base)
    const baseDeclaracoes = gerarDeclaracoesParaViewport(componente, 'desktop', desktopWidth);
    blocosCSS.push(`${seletor} {\n${baseDeclaracoes.join('\n')}\n}`);

    const baseResolved = {
      x: componente.breakpoints.desktop.x,
      y: componente.breakpoints.desktop.y,
      width: componente.breakpoints.desktop.width,
      height: componente.breakpoints.desktop.height,
      dockX: componente.breakpoints.desktop.dockX,
      dockY: componente.breakpoints.desktop.dockY,
    };

    // 2. Tablet Overwrites
    const tabletDeclaracoes = gerarDeclaracoesParaViewport(componente, 'tablet', tabletWidth, baseResolved);
    if (tabletDeclaracoes.length > 0) {
      blocosTablet.push(`${seletor} {\n${tabletDeclaracoes.join('\n')}\n}`);
    }

    // 3. Mobile Overwrites
    const mobileDeclaracoes = gerarDeclaracoesParaViewport(componente, 'mobile', mobileWidth, baseResolved);
    if (mobileDeclaracoes.length > 0) {
      blocosMobile.push(`${seletor} {\n${mobileDeclaracoes.join('\n')}\n}`);
    }
  }

  let codigoFinal = blocosCSS.join('\n\n');

  if (blocosTablet.length > 0) {
    codigoFinal += `\n\n@media (max-width: 768px) {\n${blocosTablet.join('\n\n')}\n}`;
  }

  if (blocosMobile.length > 0) {
    codigoFinal += `\n\n@media (max-width: 480px) {\n${blocosMobile.join('\n\n')}\n}`;
  }

  return { codigo: codigoFinal, seletor: seletoresUsados.join(', ') };
}


