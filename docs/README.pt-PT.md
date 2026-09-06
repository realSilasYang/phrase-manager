<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Logótipo do Phrase Manager">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <strong>Português (Portugal)</strong> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>Gestor de frases - Phrase Manager</h1>
  <p><strong>Gira frases, fragmentos de texto e notas localmente no uTools</strong></p>
</div>

O Phrase Manager é um plugin local para uTools. A hierarquia Grupo → Categoria → Frase organiza respostas, modelos, prompts, fragmentos de código e notas. Os dados são guardados na base de dados local do uTools e podem ser exportados para JSON.

## Funcionalidades

- Criar, mudar o nome, eliminar, ordenar, mover e copiar grupos, categorias e frases
- Pesquisa, pré-visualização, atalhos, operações em lote, anular e refazer
- Cópia de segurança JSON, importação/exportação CSV do iFlytek e importação com IA
- Geração de conteúdo e títulos, categorização e otimização com IA
- Modo escuro, tipos de letra locais e edição responsiva

## Início rápido

1. Transfira e extraia a [versão mais recente](https://github.com/realSilasYang/phrase-manager/releases/latest).
2. Nas ferramentas de programador do uTools, carregue o `plugin.json` extraído.
3. Procure “常用语”, `Phrase Manager` ou `Phrases` no uTools.
4. Escolha “Novo grupo” ou “Novo grupo…” no menu. É pedido um nome personalizado antes de criar grupos e categorias.

## Atalhos

| Tecla | Ação |
| --- | --- |
| `Ctrl+N` | Criar frase |
| `Ctrl+Shift+N` | Criar categoria |
| `Ctrl+F` | Focar a pesquisa |
| `Ctrl+S` | Guardar a frase atual |
| `Ctrl+Z` / `Ctrl+Y` | Anular / refazer |
| `F2` | Mudar o nome do grupo ou categoria sob o ponteiro |
| `Delete` | Eliminar o item sob o ponteiro |
| `Space` | Alternar a pré-visualização |

## Idiomas suportados

A interface inclui chinês simplificado, chinês tradicional de Hong Kong e Taiwan, inglês, japonês, vietnamita, coreano, espanhol, francês, português do Brasil e europeu, russo, alemão e italiano. O modo automático segue o idioma do sistema e utiliza chinês simplificado quando não encontra correspondência.

## Desenvolvimento

```bash
npm ci
npm run dev
npm run release:build
```

Consulte o [guia completo em chinês simplificado](../README.md). O projeto é distribuído sob a [licença MIT](../LICENSE).
