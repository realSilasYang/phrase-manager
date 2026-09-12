<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Logo Phrase Manager">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <strong>Français</strong> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>Gestionnaire de phrases - Phrase Manager</h1>
  <p><strong>Gérez localement vos phrases, fragments de texte et notes dans uTools</strong></p>
</div>

Phrase Manager est un plugin uTools local. La hiérarchie Catégorie → Groupe → Phrase permet d’organiser les réponses, modèles, prompts, extraits de code et notes. Les données restent dans la base locale uTools et peuvent être sauvegardées en JSON.

## Fonctionnalités

- Créer, renommer, supprimer, trier, déplacer et copier groupes, catégories et phrases
- Recherche, aperçu, raccourcis, actions groupées, annulation et rétablissement
- Sauvegarde JSON, import/export CSV iFlytek et import assisté par IA
- Génération de contenu et de titres, classement et amélioration par IA
- Mode sombre, polices locales et édition responsive

## Démarrage rapide

1. Téléchargez et décompressez la [dernière version](https://github.com/realSilasYang/phrase-manager/releases/latest).
2. Dans les outils de développement uTools, chargez le fichier `plugin.json`.
3. Recherchez « 常用语 », `Phrase Manager` ou `Phrases` dans uTools.
4. Choisissez « Nouvelle catégorie » ou « Nouvelle catégorie… ». Les catégories constituent le niveau supérieur ; chacune contient des groupes, et vous pouvez définir les deux noms avant la création.

## Raccourcis

| Touche | Action |
| --- | --- |
| `Ctrl+N` | Créer une phrase |
| `Ctrl+Shift+N` | Créer une catégorie |
| `Ctrl+F` | Activer la recherche |
| `Ctrl+S` | Enregistrer la phrase actuelle |
| `Ctrl+Z` / `Ctrl+Y` | Annuler / rétablir |
| `F2` | Renommer le groupe ou la catégorie survolé |
| `Delete` | Supprimer l’élément survolé |
| `Space` | Basculer l’aperçu |

## Langues prises en charge

L’interface prend en charge le chinois simplifié, le chinois traditionnel de Hong Kong et de Taïwan, l’anglais, le japonais, le vietnamien, le coréen, l’espagnol, le français, le portugais brésilien et européen, le russe, l’allemand et l’italien. Le mode automatique suit la langue du système et revient au chinois simplifié sans correspondance.

## Développement

```bash
npm ci
npm run dev
npm run release:build
```

Consultez le [guide complet en chinois simplifié](../README.md). Le projet est distribué sous [licence MIT](../LICENSE).
