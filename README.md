# 이호진 · Self PR Portfolio

닌텐도 스위치 화면 구성을 빌린 자기 PR 포트폴리오 사이트입니다.

- 포트폴리오: https://lunar3840.github.io/
- 익스트랙션 데이터 편집기(열람 전용): https://lunar3840.github.io/extraction-data-editor/
- 익스트랙션 기획 라이브러리: https://lunar3840.github.io/extraction-design-library/

포트폴리오는 원래 `hojin-switch-portfolio.ehojin0415.chatgpt.site`에 게시되던 사이트를 독립 호스팅으로 옮긴 것입니다(2026-11-21 게시본 기준, 기획 라이브러리·데이터 편집기 링크만 새 주소로 교체).

## 포트폴리오 사용 메모 (2026-11-24 개편)

- 페이지마다 주소가 있습니다. 예: `/#about`, `/#project2`(익스트랙션), `/#design`, `/#about/profile-tools`. 주소로 들어오면 인트로를 건너뜁니다.
- 배터리는 아직 읽지 않은 페이지의 비율입니다. 페이지를 처음 열 때만 줄고, 23쪽을 모두 열어야 0%가 됩니다. 기록은 브라우저에 저장되며 `/?reset`으로 지웁니다.
- DESIGN(분석서·기획서) 페이지의 문서는 `index.html`의 `designDocs` 배열에 추가합니다. `url`이 없고 `pending:true`인 항목은 "준비 중"으로 표시됩니다.
- 상세 페이지의 포인트 색은 홈 타일 색을 따릅니다(`.detail-shell[data-accent=…]`).
- 큰 이미지는 WebP로 바꿨습니다(약 51MB → 6.5MB).

## extraction-data-editor/

`extraction-balance-editor.ehojin0415.chatgpt.site`에서 운영하던 웹 데이터 편집기의 열람 전용 정적판입니다.

- 자료: 마지막 게시 카탈로그(2026-10-23 추출, 103개 분류 · 12,931개 값, 원본 지문 `7dae3ef2…`).
- 할 수 있는 것: 분류별 열람, 전체 검색, 항목별 영향 설명, 분류별 CSV 내려받기(원래 서버의 `/api/export`와 같은 형식).
- 없는 것: 로그인, 웹 저장, CSV 가져오기, Unity 반영 요청. GitHub Pages는 서버(Worker·D1)를 실행하지 않으므로 해당 버튼을 없앴습니다. 값 수정과 게임 반영은 프로젝트 PC의 로컬 편집기(`데이터 편집기 열기.cmd`)에서 합니다.
- 다시 만들기: 프로젝트의 `data-editor-web` 폴더에서 `node build.mjs` 후 `node build-static.mjs <출력 폴더>`.
