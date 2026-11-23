# 이호진 · Self PR Portfolio

닌텐도 스위치 화면 구성을 빌린 자기 PR 포트폴리오 사이트입니다.

- 포트폴리오: https://lunar3840.github.io/
- 익스트랙션 데이터 편집기(열람 전용): https://lunar3840.github.io/extraction-data-editor/
- 익스트랙션 기획 라이브러리: https://lunar3840.github.io/extraction-design-library/

포트폴리오는 원래 `hojin-switch-portfolio.ehojin0415.chatgpt.site`에 게시되던 사이트를 독립 호스팅으로 옮긴 것입니다(2026-11-21 게시본 기준, 기획 라이브러리·데이터 편집기 링크만 새 주소로 교체).

## extraction-data-editor/

`extraction-balance-editor.ehojin0415.chatgpt.site`에서 운영하던 웹 데이터 편집기의 열람 전용 정적판입니다.

- 자료: 마지막 게시 카탈로그(2026-10-23 추출, 103개 분류 · 12,931개 값, 원본 지문 `7dae3ef2…`).
- 할 수 있는 것: 분류별 열람, 전체 검색, 항목별 영향 설명, 분류별 CSV 내려받기(원래 서버의 `/api/export`와 같은 형식).
- 없는 것: 로그인, 웹 저장, CSV 가져오기, Unity 반영 요청. GitHub Pages는 서버(Worker·D1)를 실행하지 않으므로 해당 버튼을 없앴습니다. 값 수정과 게임 반영은 프로젝트 PC의 로컬 편집기(`데이터 편집기 열기.cmd`)에서 합니다.
- 다시 만들기: 프로젝트의 `data-editor-web` 폴더에서 `node build.mjs` 후 `node build-static.mjs <출력 폴더>`.
