/* 오늘의 운세 리포트 생성기
 * fortune.js 의 순수 로직을 재사용해 그날의 운세를 자체 완결형 HTML 로 저장한다.
 *  - reports/YYYY-MM-DD.html : 그날의 리포트 (인라인 CSS 포함, 단독 실행 가능)
 *  - reports/index.html      : 지금까지 생성된 리포트 아카이브 목록
 */

const fs = require("fs");
const path = require("path");
const { generateFortune, stars } = require("./fortune.js");

const REPORTS_DIR = path.join(__dirname, "reports");
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

// GitHub Actions 러너는 UTC 이므로 9시간 더해 KST 기준 날짜를 얻는다.
function kstNow() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

function formatKoreanDate(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${DAYS[date.getDay()]})`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const BASE_CSS = `
  :root{--bg:#0f0c29;--bg2:#302b63;--bg3:#24243e;--card:rgba(255,255,255,.08);
    --border:rgba(255,255,255,.18);--text:#f5f3ff;--muted:#c7c3e0;--accent:#ffd76b;--accent2:#b388ff}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;color:var(--text);
    font-family:"Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;
    background:linear-gradient(135deg,var(--bg),var(--bg2),var(--bg3));background-attachment:fixed;
    display:flex;justify-content:center;padding:28px 16px 56px}
  .container{width:100%;max-width:560px}
  .hero{text-align:center;margin-bottom:22px}
  .hero h1{font-size:2rem;margin:8px 0 4px}
  .today{color:var(--muted);margin:0}
  .card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:24px;
    margin-bottom:18px;backdrop-filter:blur(10px);box-shadow:0 8px 30px rgba(0,0,0,.25)}
  .result-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
  .result-head h2{margin:0;font-size:1.2rem}
  .score{font-size:1.15rem;letter-spacing:2px;color:var(--accent)}
  .summary{margin:0 0 18px;padding:14px 16px;border-left:3px solid var(--accent);
    background:rgba(255,255,255,.05);border-radius:8px;line-height:1.6}
  .fortunes{list-style:none;margin:0 0 18px;padding:0}
  .fortunes li{padding:12px 0;border-bottom:1px dashed var(--border)}
  .fortunes li:last-child{border-bottom:none}
  .fortunes .cat{display:flex;align-items:center;justify-content:space-between;font-weight:700;margin-bottom:4px}
  .fortunes .stars{color:var(--accent);letter-spacing:1px}
  .fortunes .desc{color:var(--muted);line-height:1.55;font-size:.95rem}
  .lucky{display:flex;gap:10px;margin-bottom:6px}
  .lucky-item{flex:1;text-align:center;padding:14px 8px;background:rgba(255,255,255,.05);border-radius:12px}
  .lucky-label{display:block;font-size:.75rem;color:var(--muted);margin-bottom:6px}
  .lucky-item strong{font-size:1.05rem}
  .foot{text-align:center;color:var(--muted);opacity:.8;margin-top:8px}
  .foot a{color:var(--accent2)}
  .archive{list-style:none;margin:0;padding:0}
  .archive li{border-bottom:1px dashed var(--border)}
  .archive li:last-child{border-bottom:none}
  .archive a{display:flex;justify-content:space-between;padding:14px 4px;color:var(--text);
    text-decoration:none;font-weight:600}
  .archive a:hover{color:var(--accent)}
  .archive .date-stars{color:var(--accent);font-weight:400}
`;

function renderReportHTML(result, dateObj) {
  const items = result.fortunes
    .map(
      (f) => `        <li>
          <div class="cat"><span>${f.icon} ${esc(f.key)}</span><span class="stars">${stars(f.score)}</span></div>
          <div class="desc">${esc(f.desc)}</div>
        </li>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>오늘의 운세 · ${result.dayKey} 🔮</title>
  <style>${BASE_CSS}</style>
</head>
<body>
  <main class="container">
    <header class="hero">
      <h1>🔮 오늘의 운세</h1>
      <p class="today">${formatKoreanDate(dateObj)}</p>
    </header>

    <section class="card">
      <div class="result-head">
        <h2>오늘의 종합 운세</h2>
        <div class="score">${stars(result.overall)}</div>
      </div>
      <blockquote class="summary">${esc(result.summary)}</blockquote>
      <ul class="fortunes">
${items}
      </ul>
      <div class="lucky">
        <div class="lucky-item"><span class="lucky-label">행운의 숫자</span><strong>${result.luckyNumber}</strong></div>
        <div class="lucky-item"><span class="lucky-label">행운의 색</span><strong>${esc(result.luckyColor)}</strong></div>
        <div class="lucky-item"><span class="lucky-label">행운의 방향</span><strong>${esc(result.luckyDirection)}</strong></div>
      </div>
    </section>

    <footer class="foot">
      <small><a href="./index.html">← 지난 운세 모아보기</a> · 재미로만 봐주세요 😊</small>
    </footer>
  </main>
</body>
</html>
`;
}

function renderArchiveHTML(entries) {
  const list = entries
    .map(
      (e) => `        <li><a href="./${e.file}"><span>${e.dayKey} (${e.dow})</span><span class="date-stars">${e.score}</span></a></li>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>오늘의 운세 아카이브 🔮</title>
  <style>${BASE_CSS}</style>
</head>
<body>
  <main class="container">
    <header class="hero">
      <h1>🔮 오늘의 운세 아카이브</h1>
      <p class="today">매일 아침 7시에 새 운세가 올라와요</p>
    </header>
    <section class="card">
      <ul class="archive">
${list || '        <li><a href="#">아직 생성된 리포트가 없어요</a></li>'}
      </ul>
    </section>
    <footer class="foot"><small>재미로만 봐주세요 😊</small></footer>
  </main>
</body>
</html>
`;
}

function main() {
  const now = kstNow();
  const result = generateFortune("", "", now);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // 그날의 리포트 저장
  const reportFile = `${result.dayKey}.html`;
  fs.writeFileSync(path.join(REPORTS_DIR, reportFile), renderReportHTML(result, now));

  // 아카이브 목록 재생성 (reports 폴더의 YYYY-MM-DD.html 스캔)
  const entries = fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
    .sort()
    .reverse()
    .map((f) => {
      const dayKey = f.replace(/\.html$/, "");
      const d = new Date(`${dayKey}T00:00:00`);
      const r = generateFortune("", "", d);
      return { file: f, dayKey, dow: DAYS[d.getDay()], score: stars(r.overall) };
    });

  fs.writeFileSync(path.join(REPORTS_DIR, "index.html"), renderArchiveHTML(entries));

  console.log(`Generated reports/${reportFile} and reports/index.html (${entries.length} entries)`);
}

// 직접 실행할 때만 리포트를 생성 (require 로 함수만 재사용 가능하도록)
if (require.main === module) {
  main();
}

module.exports = { renderReportHTML, renderArchiveHTML, formatKoreanDate, kstNow };
