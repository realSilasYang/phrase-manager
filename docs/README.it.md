<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Logo di Phrase Manager">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <strong>Italiano</strong></p>
  <h1>Gestore di frasi - Phrase Manager</h1>
  <p><strong>Gestisci localmente frasi, frammenti di testo e note in uTools</strong></p>
</div>

Phrase Manager è un plugin locale per uTools. La gerarchia Categoria → Gruppo → Frase organizza risposte, modelli, prompt, frammenti di codice e note. I dati restano nel database locale di uTools e possono essere salvati in JSON.

## Funzioni

- Creare, rinominare, eliminare, ordinare, spostare e copiare gruppi, categorie e frasi
- Ricerca, anteprima, scorciatoie, azioni multiple, annullamento e ripetizione
- Backup JSON, importazione/esportazione CSV iFlytek e importazione con IA
- Generazione di contenuti e titoli, categorizzazione e ottimizzazione con IA
- Tema scuro, caratteri locali ed editing responsivo

## Avvio rapido

1. Scarica ed estrai l'[ultima release](https://github.com/realSilasYang/phrase-manager/releases/latest).
2. Negli strumenti per sviluppatori di uTools carica `plugin.json`.
3. Cerca “常用语”, `Phrase Manager` o `Phrases` in uTools.
4. Scegli “Nuova categoria” o “Nuova categoria…”. Le categorie sono il livello superiore; ogni categoria contiene gruppi e puoi definire entrambi i nomi prima della creazione.

## Scorciatoie

| Tasto | Azione |
| --- | --- |
| `Ctrl+N` | Crea una frase |
| `Ctrl+Shift+N` | Crea una categoria |
| `Ctrl+F` | Attiva la ricerca |
| `Ctrl+S` | Salva la frase corrente |
| `Ctrl+Z` / `Ctrl+Y` | Annulla / ripeti |
| `F2` | Rinomina il gruppo o la categoria indicati |
| `Delete` | Elimina l'elemento indicato |
| `Space` | Attiva/disattiva l'anteprima |

## Lingue supportate

L'interfaccia include cinese semplificato, cinese tradizionale di Hong Kong e Taiwan, inglese, giapponese, vietnamita, coreano, spagnolo, francese, portoghese brasiliano ed europeo, russo, tedesco e italiano. La modalità automatica segue la lingua del sistema e usa il cinese semplificato quando non trova corrispondenze.

## Sviluppo

```bash
npm ci
npm run dev
npm run release:build
```

Consulta la [guida completa in cinese semplificato](../README.md). Il progetto è distribuito con [licenza MIT](../LICENSE).
