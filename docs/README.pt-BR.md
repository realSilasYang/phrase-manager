<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Logotipo do Phrase Manager">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <strong>Português (Brasil)</strong> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>Gerenciador de frases - Phrase Manager</h1>
  <p><strong>Gerencie frases, trechos de texto e itens de conhecimento localmente no uTools</strong></p>
</div>

O Phrase Manager é um plugin local para uTools. A hierarquia Grupo → Categoria → Frase organiza respostas, modelos, prompts, trechos de código e anotações. Os dados ficam no banco local do uTools e podem ser salvos em JSON.

## Recursos

- Criar, renomear, excluir, ordenar, mover e copiar grupos, categorias e frases
- Pesquisa, visualização, atalhos, ações em lote, desfazer e refazer
- Backup JSON, importação/exportação CSV do iFlytek e importação com IA
- Geração de conteúdo e títulos, categorização e otimização com IA
- Modo escuro, fontes locais e edição responsiva

## Início rápido

1. Baixe e extraia a [versão v1.0.5](https://github.com/realSilasYang/phrase-manager/releases/tag/v1.0.5).
2. Nas ferramentas de desenvolvedor do uTools, carregue o `plugin.json` extraído.
3. Pesquise “常用语”, `Phrase Manager` ou `Phrases` no uTools.
4. Escolha “Novo grupo” ou “Novo grupo…” no menu. Um nome personalizado é solicitado antes de criar grupos e categorias.

## Atalhos

| Tecla | Ação |
| --- | --- |
| `Ctrl+N` | Criar frase |
| `Ctrl+Shift+N` | Criar categoria |
| `Ctrl+F` | Focar a pesquisa |
| `Ctrl+S` | Salvar a frase atual |
| `Ctrl+Z` / `Ctrl+Y` | Desfazer / refazer |
| `F2` | Renomear o grupo ou categoria sob o ponteiro |
| `Delete` | Excluir o item sob o ponteiro |
| `Space` | Alternar a visualização |

## Idiomas compatíveis

A interface oferece chinês simplificado, chinês tradicional de Hong Kong e Taiwan, inglês, japonês, vietnamita, coreano, espanhol, francês, português do Brasil e europeu, russo, alemão e italiano. O modo automático segue o idioma do sistema e usa chinês simplificado quando não há correspondência.

## Desenvolvimento

```bash
npm ci
npm run dev
npm run release:build
```

Consulte o [guia completo em chinês simplificado](../README.md). O projeto usa a [licença MIT](../LICENSE).
