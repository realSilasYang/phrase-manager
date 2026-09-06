<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Logotipo de Phrase Manager">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <strong>Español</strong> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>Gestor de frases - Phrase Manager</h1>
  <p><strong>Administra frases, fragmentos de texto y notas de conocimiento localmente en uTools</strong></p>
</div>

Phrase Manager es un complemento local para uTools. Organiza respuestas, plantillas, prompts, fragmentos de código y notas mediante la jerarquía Grupo → Categoría → Frase. Los datos se guardan en la base de datos local de uTools y se pueden respaldar en JSON.

## Funciones

- Crear, renombrar, eliminar, ordenar, mover y copiar grupos, categorías y frases
- Buscar, previsualizar, copiar, usar atajos, realizar acciones por lotes y deshacer cambios
- Copias JSON, importar/exportar CSV de iFlytek e importación asistida por IA
- Generación de contenido y títulos, clasificación y optimización mediante IA
- Modo oscuro, fuentes locales y edición adaptable

## Inicio rápido

1. Descarga y extrae la [versión v1.0.5](https://github.com/realSilasYang/phrase-manager/releases/tag/v1.0.5).
2. En las herramientas de desarrollador de uTools, carga `plugin.json`.
3. Busca “常用语”, `Phrase Manager` o `Phrases` en uTools.
4. Elige “Nuevo grupo” o “Nuevo grupo…” en el desplegable. Antes de crear un grupo o una categoría se solicita un nombre personalizado.

## Atajos

| Tecla | Acción |
| --- | --- |
| `Ctrl+N` | Crear frase |
| `Ctrl+Shift+N` | Crear categoría |
| `Ctrl+F` | Enfocar búsqueda |
| `Ctrl+S` | Guardar la frase actual |
| `Ctrl+Z` / `Ctrl+Y` | Deshacer / rehacer |
| `F2` | Renombrar el grupo o la categoría bajo el puntero |
| `Delete` | Eliminar el elemento bajo el puntero |
| `Space` | Cambiar el modo de vista previa |

## Idiomas compatibles

La interfaz incluye chino simplificado, chino tradicional de Hong Kong y Taiwán, inglés, japonés, vietnamita, coreano, español, francés, portugués de Brasil y Portugal, ruso, alemán e italiano. El modo automático sigue el idioma del sistema y usa chino simplificado si no hay coincidencia.

## Desarrollo

```bash
npm ci
npm run dev
npm run release:build
```

Consulta la [guía completa en chino simplificado](../README.md). El proyecto se publica bajo la [licencia MIT](../LICENSE).
