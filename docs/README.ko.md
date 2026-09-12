<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Phrase Manager 로고">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <strong>한국어</strong> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>상용구 관리 - Phrase Manager</h1>
  <p><strong>uTools에서 상용구, 텍스트 조각과 지식 항목을 로컬로 관리하세요</strong></p>
</div>

Phrase Manager는 uTools에서 실행되는 로컬 텍스트 관리 플러그인입니다. 카테고리 → 그룹 → 상용구 구조로 고객 응답, 업무 템플릿, 프롬프트, 코드 조각과 메모를 정리합니다. 데이터는 uTools 로컬 데이터베이스에 저장되며 JSON으로 백업할 수 있습니다.

## 주요 기능

- 그룹, 카테고리, 상용구의 생성, 이름 변경, 삭제, 정렬, 이동 및 복사
- 검색, 미리보기, 단축키, 일괄 작업, 실행 취소와 다시 실행
- JSON 백업, iFlytek CSV 가져오기/내보내기, AI 가져오기
- AI 콘텐츠·제목 생성, 분류 및 콘텐츠 개선
- 다크 모드, 로컬 글꼴, 반응형 편집

## 빠른 시작

1. [최신 릴리스](https://github.com/realSilasYang/phrase-manager/releases/latest)를 다운로드하고 압축을 풉니다.
2. uTools 개발자 도구에서 압축을 푼 폴더의 `plugin.json`을 불러옵니다.
3. uTools에서 “常用语”, `Phrase Manager` 또는 `Phrases`를 검색합니다.
4. “카테고리 만들기” 또는 드롭다운의 “카테고리 만들기…”를 선택합니다. 카테고리가 최상위이며 각 카테고리에 그룹이 속합니다. 만들기 전에 두 이름을 지정할 수 있습니다.

## 단축키

| 키 | 동작 |
| --- | --- |
| `Ctrl+N` | 상용구 만들기 |
| `Ctrl+Shift+N` | 카테고리 만들기 |
| `Ctrl+F` | 검색창으로 이동 |
| `Ctrl+S` | 현재 상용구 저장 |
| `Ctrl+Z` / `Ctrl+Y` | 실행 취소 / 다시 실행 |
| `F2` | 가리킨 그룹 또는 카테고리 이름 변경 |
| `Delete` | 가리킨 항목 삭제 |
| `Space` | 미리보기 전환 |

## 지원 언어

간체 중국어, 홍콩 번체 중국어, 대만 번체 중국어, 영어, 일본어, 베트남어, 한국어, 스페인어, 프랑스어, 브라질 포르투갈어, 유럽 포르투갈어, 러시아어, 독일어와 이탈리아어를 지원합니다. 자동 모드는 시스템 언어를 따르며 일치하지 않으면 간체 중국어로 돌아갑니다.

## 개발

```bash
npm ci
npm run dev
npm run release:build
```

전체 안내는 [간체 중국어 README](../README.md)를 참고하세요. 프로젝트는 [MIT License](../LICENSE)로 공개됩니다.
