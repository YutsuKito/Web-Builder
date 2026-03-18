# Análise completa do projeto e oportunidades de melhoria

Data da análise: 2026-03-17

## 1) Visão geral atual

O projeto é um **builder visual de UI** em Next.js, com foco em criação de componentes e exportação de HTML/CSS.

### Stack principal
- Next.js 16 + React 19 + TypeScript
- Zustand (+ zundo) para estado e undo/redo
- Prisma + PostgreSQL para persistência
- Tailwind CSS 4
- react-rnd para drag/resize

### Estrutura observada
- `src/app`: páginas e layout (inclui `editor/page.tsx` e server actions em `app/actions`)
- `src/components`: canvas, inspector, sidebar, layers, exportação e elementos
- `src/store/useEditorStore.ts`: estado central do editor
- `src/core`: domínio, casos de uso e repositório
- `src/generated/client`: cliente gerado do Prisma

## 2) Diagnóstico técnico (baseline)

Validações executadas:
- `npm run lint`
- `npm run build`

### Resultado prático
- **Lint falha** com alto volume de problemas, incluindo:
  - muitos avisos/erros vindos de `src/generated/client` (código gerado)
  - uso de `any` em arquivos do editor/store
- **Build falha** no ambiente atual por dependência de Google Fonts (`Geist`/`Geist Mono`) em `src/app/layout.tsx`

## 3) Pontos fortes do projeto

- Arquitetura separada em camadas (`domain`, `use-cases`, `infra`)
- Editor já com funcionalidades ricas (drag/resize, camadas, responsividade, exportação)
- Undo/redo bem direcionado com `zundo`
- Prisma e Docker Compose já configurados

## 4) O que melhorar (prioridade alta)

1. **Estabilizar build em ambiente sem acesso externo**
   - Trocar `next/font/google` por fallback local/system font em `src/app/layout.tsx`.

2. **Ajustar lint para código gerado**
   - Ignorar `src/generated/**` no ESLint para evitar ruído de análise.

3. **Reduzir dívida de tipagem**
   - Priorizar remoção de `any` em:
     - `src/store/useEditorStore.ts`
     - `src/app/actions/projectActions.ts`
     - `src/utils/styleHelpers.ts`

4. **Melhorar DX**
   - Adicionar `.env.example` com variáveis mínimas.
   - Adicionar script de typecheck (`tsc --noEmit`) no `package.json`.

5. **Qualidade contínua**
   - Configurar pipeline simples de CI (lint + typecheck + build).

## 5) O que adicionar (funcionalidades)

### Curto prazo (rápido impacto)
- **Tela/lista de projetos salvos** (abrir, renomear, excluir)
- **Atalhos de teclado** (duplicar, agrupar, alinhar, mover por setas)
- **Snap/grid configurável** no editor

### Médio prazo
- **Importação/exportação de templates** (JSON de layout)
- **Pré-visualização multi-breakpoint lado a lado**
- **Auto-save local** (localStorage/session) para recuperar trabalho

### Longo prazo
- **Colaboração em tempo real**
- **Exportação para JSX/React components**
- **Biblioteca/marketplace de templates**

## 6) Roteiro recomendado (incremental)

- **Sprint 1 (hardening)**: build offline + lint baseline + `.env.example` + typecheck
- **Sprint 2 (qualidade)**: testes unitários dos use-cases e store + CI
- **Sprint 3 (produto)**: projetos salvos + atalhos + auto-save

## 7) Arquivos-chave para começar

- `src/app/layout.tsx`
- `eslint.config.mjs`
- `package.json`
- `src/store/useEditorStore.ts`
- `src/app/actions/projectActions.ts`
- `README.md`

