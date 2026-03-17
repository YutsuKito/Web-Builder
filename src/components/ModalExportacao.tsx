'use client';

import { useState, useMemo, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { gerarCodigoCSS } from '../core/use-cases/GerarCodigoCSS';
import type { Componente } from '../core/domain/Componente';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ModalExportacaoProps {
  /** Controla a visibilidade do modal. */
  isOpen: boolean;
  /** Callback executado ao fechar o modal. */
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Gera o HTML semântico que representa todos os componentes,
 * utilizando as classes CSS geradas correspondentes.
 */
/**
 * Garante que a URL tenha um protocolo se não for um link relativo ou âncora.
 */
function formatarUrl(url: string): string {
  if (!url) return '';
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/') || u.startsWith('#') || u.startsWith('mailto:') || u.startsWith('tel:')) {
    return u;
  }
  return `https://${u}`;
}

/**
 * Converte PascalCase/camelCase para kebab-case (ex: HelpCircle -> help-circle, Settings2 -> settings-2).
 * Reforçado para lidar com múltiplos padrões.
 */
function toKebabCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')  // Letra minúscula/número seguida de maiúscula
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')  // Letra seguida de número
    .toLowerCase();
}

function gerarBodyHTML(componentes: Componente[]): string {
  const componentesHtml = componentes.map((componente) => {
    const hasteClass = `${componente.tipo}-${componente.id}`;
    const temLink = !!componente.link;
    const url = formatarUrl(componente.link || '');
    
    // Se tem link, a classe de posicionamento e dimensões vai para o <a>
    const targetClasse = temLink ? '' : ` class="${hasteClass}"`;
    
    // Conteúdo interno do elemento
    let conteudoHtml = '';
    let isFlex = false;
    
    if (componente.tipo === 'button') {
      const iconName = componente.estilos.iconName;
      const iconPosition = componente.estilos.iconPosition || 'left';
      const iconTag = iconName ? `<i data-lucide="${toKebabCase(iconName)}" style="width: 1.2em; height: 1.2em;"></i>` : '';
      
      const text = componente.conteudoTextual || '';
      conteudoHtml = iconPosition === 'left' ? `${iconTag} ${text}` : `${text} ${iconTag}`;
      conteudoHtml = conteudoHtml.trim();
      isFlex = true;

      if (!temLink) {
        return `  <button class="${hasteClass}">${conteudoHtml}</button>`;
      }
    } 
    
    if (componente.tipo === 'image') {
      const src = componente.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
      const alt = componente.alt || '';
      conteudoHtml = `<img src="${src}" alt="${alt}"${targetClasse} style="width: 100%; height: 100%; object-fit: cover; display: block;" />`;
    } else if (componente.tipo === 'text') {
      conteudoHtml = `<p${targetClasse} style="margin: 0; width: 100%; height: 100%;">${componente.conteudoTextual || 'Texto'}</p>`;
    } else if (componente.tipo === 'icon') {
      const iconName = toKebabCase(componente.conteudoTextual || 'help-circle');
      // Usa o fontSize do editor como tamanho real do ícone (igual ao preview)
      const iconSize = parseInt(String(componente.estilos.fontSize || '48')) || 48;
      conteudoHtml = `<i data-lucide="${iconName}"${targetClasse} style="width: ${iconSize}px; height: ${iconSize}px; display: block; pointer-events: none;"></i>`;
      isFlex = true;
    } else {
      const pointerStyle = temLink ? '' : ' style="pointer-events: none;"';
      conteudoHtml = `<div${targetClasse}${pointerStyle}>${componente.conteudoTextual || ''}</div>`;
    }

    if (temLink) {
      const target = componente.linkTarget === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
      const displayType = isFlex ? 'display: flex; align-items: center; justify-content: center;' : 'display: block;';
      return `  <a href="${url}" class="${hasteClass}"${target} style="${displayType} cursor: pointer;">\n    ${conteudoHtml}\n  </a>`;
    }

    return `  ${conteudoHtml}`;
  });

  return componentesHtml.join('\n');
}

/**
 * Monta o documento HTML completo com CSS embutido e os elementos.
 */
function comporDocumentoHTMLCompleto(bodyHtml: string, css: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Exportada - CSS/HTML Generator</title>
  <style>
/* ─── Reset Rigoroso ─── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: #ffffff;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}

/* ─── Canvas Wrapper ─── */
/* position: relative garante que filhos com position: absolute  */
/* usem ESTE elemento como referência, não o body.               */
.canvas-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

a {
  text-decoration: none;
  color: inherit;
}

/* Ícones Lucide */
svg {
  display: inline-block;
  vertical-align: middle;
  stroke: currentColor;
  fill: none;
}

/* ─────────────────────────────────── */
/* Estilos Gerados pelo Editor         */
/* ─────────────────────────────────── */

${css}
  </style>
</head>
<body>
  <main class="canvas-wrapper">
${bodyHtml}
  </main>
  
  <!-- Scripts para Renderizar Ícones -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    function render() {
      if (window.lucide) {
        lucide.createIcons();
      }
    }
    render();
    window.onload = render;
    document.addEventListener('DOMContentLoaded', render);
  </script>
</body>
</html>`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ModalExportacao({ isOpen, onClose }: ModalExportacaoProps) {
  const elementos = useEditorStore((state) => state.elementos);

  // Estado de feedback para os botões "Copiar"
  const [htmlCopiado, setHtmlCopiado] = useState(false);
  const [cssCopiado, setCssCopiado] = useState(false);

  // ── Geração de código ─────────────────────────────────────────────────────

  const codigoGerado = useMemo(() => {
    try {
      if (elementos.length === 0) {
        throw new Error('Adicione pelo menos um elemento ao canvas para exportar.');
      }
      
      const { viewport } = useEditorStore.getState();
      const larguraReferencia = viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : 1024;

      // Ordena elementos para garantir que containers fiquem no fundo no DOM
      const elementosExportacao = [...elementos].sort((a, b) => {
        const priorityA = a.tipo === 'container' ? 0 : 1;
        const priorityB = b.tipo === 'container' ? 0 : 1;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return (a.zIndex || 0) - (b.zIndex || 0);
      });

      const resultadoCSS = gerarCodigoCSS(elementosExportacao, larguraReferencia);
      const innerHtml = gerarBodyHTML(elementosExportacao);
      const htmlCompleto = comporDocumentoHTMLCompleto(innerHtml, resultadoCSS.codigo);

      return { html: htmlCompleto, css: resultadoCSS.codigo, innerHtml, erro: null };
    } catch (err) {
      return { html: '', css: '', innerHtml: '', erro: (err as Error).message };
    }
  }, [elementos]);

  // ── Copiar para a área de transferência ───────────────────────────────────

  const copiarParaClipboard = useCallback(
    async (texto: string, tipo: 'html' | 'css') => {
      try {
        await navigator.clipboard.writeText(texto);

        if (tipo === 'html') {
          setHtmlCopiado(true);
          setTimeout(() => setHtmlCopiado(false), 2000);
        } else {
          setCssCopiado(true);
          setTimeout(() => setCssCopiado(false), 2000);
        }
      } catch {
        console.error('Falha ao copiar para a área de transferência.');
      }
    },
    []
  );

  // ── Download de Blob HTML ─────────────────────────────────────────────────

  const fazerDownloadHtml = useCallback(() => {
    if (!codigoGerado.html) return;
    
    const blob = new Blob([codigoGerado.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ui-exportada-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }, [codigoGerado.html]);

  // ── Fechar ao clicar no overlay ───────────────────────────────────────────

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  // ── Renderização ──────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div style={estilos.overlay} onClick={handleOverlayClick}>
      <div style={estilos.modal}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={estilos.header}>
          <h2 style={estilos.titulo}>Exportar Código</h2>
          <button
            type="button"
            onClick={onClose}
            style={estilos.botaoFechar}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* ── Erro ───────────────────────────────────────────────────────── */}
        {codigoGerado.erro && (
          <div style={estilos.erroContainer}>
            <p style={estilos.erroTexto}>⚠ {codigoGerado.erro}</p>
          </div>
        )}

        {/* ── HTML ───────────────────────────────────────────────────────── */}
        {!codigoGerado.erro && (
          <>
            <div style={estilos.secao}>
              <div style={estilos.secaoHeader}>
                <label style={estilos.label}>HTML Completo (Boilerplate)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => copiarParaClipboard(codigoGerado.html, 'html')}
                    style={{
                      ...estilos.botaoCopiar,
                      ...(htmlCopiado ? estilos.botaoCopiado : {}),
                    }}
                  >
                    {htmlCopiado ? '✓ Copiado!' : '⎘ Copiar'}
                  </button>
                  <button
                    type="button"
                    onClick={fazerDownloadHtml}
                    style={{
                      ...estilos.botaoCopiar,
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                      color: '#a5b4fc',
                    }}
                  >
                    ⬇ Fazer Download (.html)
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={codigoGerado.html}
                style={estilos.textarea}
                rows={10}
              />
            </div>
            
             {/* ── CSS ──────────────────────────────────────────────────────── */}
             <div style={estilos.secao}>
              <div style={estilos.secaoHeader}>
                <label style={estilos.label}>Apenas CSS Gerado</label>
                <button
                  type="button"
                  onClick={() => copiarParaClipboard(codigoGerado.css, 'css')}
                  style={{
                    ...estilos.botaoCopiar,
                    ...(cssCopiado ? estilos.botaoCopiado : {}),
                  }}
                >
                  {cssCopiado ? '✓ Copiado!' : '⎘ Copiar'}
                </button>
              </div>
              <textarea
                readOnly
                value={codigoGerado.css}
                style={estilos.textarea}
                rows={8}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Estilos Inline ───────────────────────────────────────────────────────────

const estilos: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
  },

  modal: {
    backgroundColor: '#1e1e2e',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '640px',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#e0e0e0',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },

  titulo: {
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
    color: '#ffffff',
  },

  botaoFechar: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'color 0.2s, background 0.2s',
  },

  secao: {
    marginBottom: '20px',
  },

  secaoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },

  label: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#a0a0b0',
  },

  botaoCopiar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#c0c0d0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  botaoCopiado: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    color: '#22c55e',
  },

  textarea: {
    width: '100%',
    padding: '14px',
    fontSize: '13px',
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    lineHeight: 1.6,
    backgroundColor: '#12121a',
    color: '#d4d4e0',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    resize: 'vertical' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },

  erroContainer: {
    padding: '14px 18px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    marginBottom: '16px',
  },

  erroTexto: {
    margin: 0,
    fontSize: '14px',
    color: '#f87171',
  },
};
