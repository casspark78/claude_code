# claude_code

## 🔮 오늘의 운세 (Daily Fortune)

매일 아침 **7시(KST)** 에 그날의 운세를 HTML 리포트로 자동 생성해 이 저장소에 커밋합니다.

### 동작 방식

1. GitHub Actions 워크플로(`.github/workflows/daily-fortune.yml`)가 매일 **22:00 UTC = 07:00 KST** 에 실행됩니다.
2. `generate-report.js` 가 그날의 운세를 계산해 아래 파일을 생성/갱신합니다.
   - `reports/YYYY-MM-DD.html` — 그날의 운세 리포트 (인라인 CSS 포함, 단독으로 열림)
   - `reports/index.html` — 지금까지 생성된 리포트 아카이브 목록
3. 변경분을 자동으로 커밋·푸시합니다.

> 예약(schedule) 워크플로는 **기본 브랜치(main)** 에서만 동작합니다. 따라서 이 코드가 `main` 에 병합돼 있어야 매일 자동 실행됩니다.
> Actions 탭에서 **Run workflow** 로 언제든 수동 실행할 수도 있습니다.

### 리포트 내용

- 총운 · 애정운 · 금전운 · 건강운 · 직장/학업운 5개 카테고리 별점 운세
- 하루 종합 운세 요약과 행운의 숫자 / 색 / 방향
- **같은 날이면 항상 같은 결과** (날짜 시드 기반 결정론적 생성)

### 웹으로 공개하기 (GitHub Pages, 선택)

리포트를 웹에서 보고 싶다면 GitHub Pages를 **"Deploy from a branch"** 방식으로 켜세요.

- 저장소 → **Settings → Pages → Source → `Deploy from a branch`**
- Branch: `main` / 폴더: `/ (root)`
- 이 방식은 봇의 자동 커밋을 포함한 모든 푸시에서 자동으로 갱신됩니다.

공개 후 접속 주소:
- 최신 아카이브: `https://casspark78.github.io/claude_code/reports/`
- 특정 날짜: `https://casspark78.github.io/claude_code/reports/2026-07-01.html`
- 이름/생일 넣어 직접 보는 인터랙티브 버전: `https://casspark78.github.io/claude_code/`

### 파일 구성

| 파일 | 설명 |
| --- | --- |
| `generate-report.js` | 그날의 운세 리포트 생성 스크립트 |
| `fortune.js` | 운세 생성 핵심 로직 (리포트/웹앱 공용) |
| `.github/workflows/daily-fortune.yml` | 매일 아침 7시 자동 실행 워크플로 |
| `index.html`, `style.css` | 이름·생일로 직접 보는 인터랙티브 버전 |
| `reports/` | 매일 생성되는 운세 리포트 저장 폴더 |

### 로컬에서 직접 생성해 보기

```bash
node generate-report.js
# reports/ 폴더에 오늘 날짜의 리포트가 생성됩니다.
```

> 재미로만 봐주세요 😊
