<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Phrase Manager Logo">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <strong>Deutsch</strong> · <a href="./README.it.md">Italiano</a></p>
  <h1>Phrase Manager</h1>
  <p><strong>Verwalten Sie häufig verwendete Sätze, Textbausteine und Wissenseinträge lokal in uTools</strong></p>
</div>

Phrase Manager ist ein lokales uTools-Plugin. Die Struktur Kategorie → Gruppe → Satz organisiert Supportantworten, Vorlagen, Prompts, Codeausschnitte und Notizen. Die Daten werden in der lokalen uTools-Datenbank gespeichert und können als JSON gesichert werden.

## Funktionen

- Gruppen, Kategorien und Sätze erstellen, umbenennen, löschen, sortieren, verschieben und kopieren
- Suche, Vorschau, Tastenkürzel, Stapelaktionen, Rückgängig und Wiederholen
- JSON-Sicherung, iFlytek-CSV-Import/Export und KI-Import
- KI-gestützte Erstellung von Inhalten und Titeln, Kategorisierung und Optimierung
- Dunkles Design, lokale Schriftarten und responsive Bearbeitung

## Schnellstart

1. Laden Sie die [aktuelle Veröffentlichung](https://github.com/realSilasYang/phrase-manager/releases/latest) herunter und entpacken Sie sie.
2. Laden Sie `plugin.json` im uTools-Entwicklertool.
3. Suchen Sie in uTools nach „常用语“, `Phrase Manager` oder `Phrases`.
4. Wählen Sie „Neue Kategorie“ oder „Neue Kategorie…“. Kategorien sind die oberste Ebene; jede Kategorie enthält Gruppen, und vor dem Erstellen können Sie beide Namen festlegen.

## Tastenkürzel

| Taste | Aktion |
| --- | --- |
| `Ctrl+N` | Satz erstellen |
| `Ctrl+Shift+N` | Kategorie erstellen |
| `Ctrl+F` | Suche fokussieren |
| `Ctrl+S` | Aktuellen Satz speichern |
| `Ctrl+Z` / `Ctrl+Y` | Rückgängig / Wiederholen |
| `F2` | Gruppe oder Kategorie unter dem Zeiger umbenennen |
| `Delete` | Element unter dem Zeiger löschen |
| `Space` | Vorschau umschalten |

## Unterstützte Sprachen

Die Oberfläche unterstützt vereinfachtes Chinesisch, traditionelles Chinesisch aus Hongkong und Taiwan, Englisch, Japanisch, Vietnamesisch, Koreanisch, Spanisch, Französisch, brasilianisches und europäisches Portugiesisch, Russisch, Deutsch und Italienisch. Der automatische Modus folgt der Systemsprache und verwendet vereinfachtes Chinesisch ohne Treffer.

## Entwicklung

```bash
npm ci
npm run dev
npm run release:build
```

Die vollständige Anleitung finden Sie im [README auf vereinfachtem Chinesisch](../README.md). Das Projekt steht unter der [MIT-Lizenz](../LICENSE).
