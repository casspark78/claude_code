# claude_code

## 🔮 오늘의 운세 (Daily Fortune)

이름과 생년월일을 입력하면 오늘의 운세를 알려주는 간단한 웹 앱입니다.

### 실행 방법

별도 설치 없이 브라우저에서 `index.html` 파일을 열기만 하면 됩니다.

```bash
# 브라우저에서 바로 열기 (예시)
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows

# 또는 로컬 서버로 실행
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

### 기능

- 총운 · 애정운 · 금전운 · 건강운 · 직장/학업운 5개 카테고리 별점 운세
- 하루 종합 운세 요약과 행운의 숫자 / 색 / 방향
- 이름 · 생년월일 기반 개인화
- **같은 날 같은 입력이면 항상 같은 결과** (날짜 시드 기반 결정론적 생성)
- 결과 클립보드 복사

### 파일 구성

| 파일 | 설명 |
| --- | --- |
| `index.html` | 화면 구조 |
| `style.css` | 스타일 |
| `fortune.js` | 운세 생성 로직 및 UI 동작 |

> 재미로만 봐주세요 😊
