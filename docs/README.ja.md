<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Phrase Manager ロゴ">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <strong>日本語</strong> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>常用語管理 - Phrase Manager</h1>
  <p><strong>uTools で定型文、テキストスニペット、知識項目を管理するローカルプラグイン</strong></p>
</div>

Phrase Manager は uTools で動作するローカルテキスト管理プラグインです。「カテゴリ → グループ → 定型文」の階層で、サポート返信、仕事のテンプレート、プロンプト、コードスニペット、メモを整理できます。データは uTools のローカルデータベースに保存され、JSON でバックアップできます。

## 主な機能

- グループ、カテゴリ、定型文の作成、名前変更、削除、並べ替え
- 検索、プレビュー、コピー、ドラッグ移動、複製、複数選択操作
- JSON バックアップ、iFlytek CSV の入出力、AI インポート
- AI による本文・タイトル生成、分類、本文の最適化
- ダークモード、ローカルフォント、元に戻す／やり直し

## クイックスタート

1. [最新リリース](https://github.com/realSilasYang/phrase-manager/releases/latest) をダウンロードして展開します。
2. uTools 開発者ツールで展開先の `plugin.json` を読み込みます。
3. uTools で「常用語」または `Phrase Manager` を検索して開きます。
4. 「新しいカテゴリ」またはドロップダウンの「新しいカテゴリ…」を選びます。カテゴリが最上位で、各カテゴリにグループが属します。作成前に両方の名前を指定できます。

## ショートカット

| キー | 操作 |
| --- | --- |
| `Ctrl+N` | 定型文を作成 |
| `Ctrl+Shift+N` | カテゴリを作成 |
| `Ctrl+F` | 検索に移動 |
| `Ctrl+S` | 現在の定型文を保存 |
| `Ctrl+Z` / `Ctrl+Y` | 元に戻す / やり直す |
| `F2` | ポインター上のグループまたはカテゴリを変更 |
| `Delete` | ポインター上の項目を削除 |
| `Space` | プレビューを切り替え |

## 対応言語

簡体字中国語、香港繁体字中国語、台湾繁体字中国語、英語、日本語、ベトナム語、韓国語、スペイン語、フランス語、ブラジルポルトガル語、ヨーロッパポルトガル語、ロシア語、ドイツ語、イタリア語に対応しています。「自動」はシステム言語に従い、該当しない場合は簡体字中国語に戻ります。

## 開発

```bash
npm ci
npm run dev
npm run release:build
```

完全な利用ガイドと開発者向け説明は[簡体字中国語版 README](../README.md)を参照してください。プロジェクトは [MIT License](../LICENSE) で公開されています。
