/* 오늘의 운세 - 날짜와 사용자 정보 기반 결정론적 운세 생성기 */

// 문자열을 32bit 정수 해시로 변환 (같은 입력 -> 같은 결과)
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 시드 기반 의사난수 생성기 (mulberry32)
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATEGORIES = [
  {
    key: "총운",
    icon: "🌟",
    lines: [
      "생각지 못한 곳에서 좋은 기운이 흘러 들어와요. 마음을 열어두면 기회가 보입니다.",
      "잔잔하지만 안정적인 하루예요. 무리하지 않는 선택이 최선의 결과를 가져와요.",
      "작은 결정 하나가 흐름을 바꾸는 날. 직감을 믿어도 좋아요.",
      "조금 분주할 수 있지만, 그만큼 보람도 큰 하루가 될 거예요.",
      "주변 사람과의 조화가 오늘의 운을 끌어올립니다. 함께하면 더 좋아요.",
    ],
  },
  {
    key: "애정운",
    icon: "💗",
    lines: [
      "솔직한 한마디가 관계를 한층 가깝게 만들어요.",
      "상대의 작은 배려를 알아채는 날. 고마움을 표현해 보세요.",
      "혼자여도 매력이 빛나는 하루. 새로운 인연의 기운이 감돌아요.",
      "감정이 앞설 수 있으니 한 박자 쉬어가면 좋아요.",
      "따뜻한 대화가 오래 기억될 추억을 만들어 줍니다.",
    ],
  },
  {
    key: "금전운",
    icon: "💰",
    lines: [
      "예상 밖의 작은 이득이 생길 수 있어요. 영수증은 챙겨두세요.",
      "충동구매는 잠시 미뤄두는 게 좋은 날. 계획적인 소비가 이득이에요.",
      "오래 미뤄둔 정산이나 정리를 하기 좋은 타이밍이에요.",
      "투자보다는 저축에 마음이 기우는 하루. 안정이 곧 이득입니다.",
      "누군가에게 베푼 작은 호의가 뜻밖의 형태로 돌아와요.",
    ],
  },
  {
    key: "건강운",
    icon: "🌿",
    lines: [
      "가벼운 스트레칭 한 번이 하루의 컨디션을 좌우해요.",
      "물을 충분히 마시고 눈을 자주 쉬어주면 좋은 날이에요.",
      "잠깐의 산책이 머릿속을 맑게 정리해 줍니다.",
      "무리한 일정보다 충분한 휴식이 몸을 지켜줘요.",
      "규칙적인 식사가 오늘의 활력을 지켜주는 열쇠입니다.",
    ],
  },
  {
    key: "직장/학업운",
    icon: "📚",
    lines: [
      "집중력이 좋은 날. 어려운 일부터 먼저 처리하면 술술 풀려요.",
      "협업에서 빛나는 하루. 도움을 요청하는 것도 능력이에요.",
      "꼼꼼함이 실수를 막아줍니다. 마무리 점검을 잊지 마세요.",
      "새로운 아이디어가 떠오르는 날. 메모해 두면 큰 자산이 돼요.",
      "차분히 한 걸음씩 나아가면 원하는 성과에 가까워져요.",
    ],
  },
];

const SUMMARIES = [
  "오늘은 당신의 노력이 조용히 결실을 맺는 날이에요.",
  "서두르지 않아도 좋아요. 흐름을 타면 자연스럽게 풀립니다.",
  "작은 용기가 큰 변화를 부르는 하루가 될 거예요.",
  "웃음이 곧 행운이 되는 날. 여유를 잃지 마세요.",
  "예상보다 순조로운 하루. 감사할 일이 하나쯤 생겨요.",
  "마음의 균형을 지키면 모든 것이 제자리를 찾아갑니다.",
];

const COLORS = ["레드", "오렌지", "옐로우", "그린", "블루", "네이비", "퍼플", "핑크", "화이트", "골드", "민트", "라벤더"];
const DIRECTIONS = ["동쪽", "서쪽", "남쪽", "북쪽", "동남쪽", "서남쪽", "동북쪽", "서북쪽"];

function stars(score) {
  const full = Math.round(score);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function todayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateFortune(name, birth, date) {
  const dayKey = todayKey(date);
  const seed = hashString(`${dayKey}|${name.trim().toLowerCase()}|${birth}`);
  const rng = makeRng(seed);

  const summary = pick(rng, SUMMARIES);
  const fortunes = CATEGORIES.map((cat) => {
    const score = 2 + Math.floor(rng() * 4); // 2~5점
    const desc = pick(rng, cat.lines);
    return { key: cat.key, icon: cat.icon, score, desc };
  });

  const overall = Math.round(
    fortunes.reduce((sum, f) => sum + f.score, 0) / fortunes.length
  );

  return {
    dayKey,
    summary,
    fortunes,
    overall,
    luckyNumber: 1 + Math.floor(rng() * 45),
    luckyColor: pick(rng, COLORS),
    luckyDirection: pick(rng, DIRECTIONS),
  };
}

/* ---------- DOM ---------- */

function formatToday(date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

function render(result, name) {
  document.getElementById("greeting").textContent = name
    ? `${name} 님의 오늘의 운세`
    : "오늘의 운세";
  document.getElementById("score").textContent = stars(result.overall);
  document.getElementById("summary").textContent = result.summary;

  const list = document.getElementById("fortunes");
  list.innerHTML = "";
  result.fortunes.forEach((f) => {
    const li = document.createElement("li");
    const cat = document.createElement("div");
    cat.className = "cat";
    cat.innerHTML = `<span>${f.icon} ${f.key}</span><span class="stars">${stars(f.score)}</span>`;
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = f.desc;
    li.appendChild(cat);
    li.appendChild(desc);
    list.appendChild(li);
  });

  document.getElementById("lucky-number").textContent = result.luckyNumber;
  document.getElementById("lucky-color").textContent = result.luckyColor;
  document.getElementById("lucky-direction").textContent = result.luckyDirection;

  document.getElementById("result").hidden = false;
}

function buildShareText(result, name) {
  const who = name ? `${name} 님` : "나";
  const lines = [
    `🔮 ${result.dayKey} ${who}의 오늘의 운세`,
    `종합 ${stars(result.overall)}`,
    "",
    result.summary,
    "",
    ...result.fortunes.map((f) => `${f.icon} ${f.key} ${stars(f.score)}\n  ${f.desc}`),
    "",
    `행운의 숫자 ${result.luckyNumber} · 색 ${result.luckyColor} · 방향 ${result.luckyDirection}`,
  ];
  return lines.join("\n");
}

if (typeof document !== "undefined") {
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  document.getElementById("today").textContent = formatToday(now);

  let lastResult = null;
  let lastName = "";

  document.getElementById("draw-btn").addEventListener("click", () => {
    const name = document.getElementById("name").value;
    const birth = document.getElementById("birth").value;
    lastName = name.trim();
    lastResult = generateFortune(name, birth, new Date());
    render(lastResult, lastName);
    document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("share-btn").addEventListener("click", async () => {
    if (!lastResult) return;
    const text = buildShareText(lastResult, lastName);
    const btn = document.getElementById("share-btn");
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "복사됐어요! ✅";
    } catch {
      btn.textContent = "복사 실패 😢 길게 눌러 복사하세요";
    }
    setTimeout(() => (btn.textContent = "결과 복사하기 📋"), 2000);
  });
});
}

// 테스트/재사용을 위한 export (Node 환경일 때만)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { generateFortune, hashString, makeRng, stars };
}
