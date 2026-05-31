const miko = document.querySelector("#miko");
const stage = document.querySelector("#stage");
const guide = document.querySelector("#guide");
const guideTitle = document.querySelector("#guideTitle");
const guideText = document.querySelector("#guideText");
const counter = document.querySelector("#counter");
const startButton = document.querySelector("#start");
const result = document.querySelector("#result");
const flash = document.querySelector("#flash");
const fortuneName = document.querySelector("#fortuneName");
const fortuneText = document.querySelector("#fortuneText");
const fortuneDetails = document.querySelector("#fortuneDetails");
const retry = document.querySelector("#retry");
const hidePaper = document.querySelector("#hidePaper");
const showPaper = document.querySelector("#showPaper");
const paper = document.querySelector(".paper");

const MAX_SHAKES = 12;
const imagePaths = {
  idle: "assets/miko01.jpg",
  up: "assets/miko02.jpg",
  down: "assets/miko03.jpg",
  result: "assets/miko04.jpg",
};

const fortunes = [
  {
    name: "大吉",
    text: "願いごとは勢いよく進みます。今日は思い切って一歩前へ。",
    details: { 恋愛: "満開", 金運: "上昇", 勝負: "強気" },
  },
  {
    name: "中吉",
    text: "穏やかな追い風があります。焦らず整えるほど良い日です。",
    details: { 恋愛: "会話", 金運: "堅実", 勝負: "観察" },
  },
  {
    name: "小吉",
    text: "小さな幸運が足元にあります。見落とさず拾ってください。",
    details: { 恋愛: "微笑", 金運: "節約", 勝負: "一手待ち" },
  },
  {
    name: "吉",
    text: "いつも通りのことが力になります。丁寧さが運を呼びます。",
    details: { 恋愛: "自然体", 金運: "安定", 勝負: "平常心" },
  },
  {
    name: "末吉",
    text: "あとから効いてくる運勢です。今日は種まきに向いています。",
    details: { 恋愛: "連絡", 金運: "準備", 勝負: "温存" },
  },
  {
    name: "凶",
    text: "無理は禁物。休む、片づける、よく食べる。それで十分です。",
    details: { 恋愛: "休憩", 金運: "守り", 勝負: "撤退" },
  },
];

let shakeCount = 0;
let lastY = 0;
let dragging = false;
let started = false;
let finished = false;
let direction = 1;
let revealTimer = 0;

function preloadImages() {
  Object.values(imagePaths).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function updateCounter() {
  counter.textContent = `${shakeCount} / ${MAX_SHAKES}`;
}

function beginOmikuji() {
  if (started || finished) return;
  started = true;
  guideTitle.textContent = "上下にスライド";
  guideText.textContent = "巫女さんに合わせて振ってください";
  startButton.hidden = true;
}

function handleSlide(currentY) {
  if (!dragging || !started || finished) return;
  const diff = currentY - lastY;
  if (Math.abs(diff) < 34) return;

  lastY = currentY;
  direction = diff < 0 ? -1 : 1;
  shake();
}

function shake() {
  if (!started || finished) return;

  shakeCount += 1;
  updateCounter();
  guideTitle.textContent = "その調子";
  guideText.textContent = "おみくじが開きそうです";

  miko.src = direction < 0 ? imagePaths.up : imagePaths.down;
  miko.classList.remove("shake-up", "shake-down");
  void miko.offsetWidth;
  miko.classList.add(direction < 0 ? "shake-up" : "shake-down");

  window.clearTimeout(revealTimer);
  revealTimer = window.setTimeout(() => {
    if (!finished) {
      miko.src = shakeCount % 2 === 0 ? imagePaths.up : imagePaths.down;
      miko.classList.remove("shake-up", "shake-down");
    }
  }, 120);

  if (shakeCount >= MAX_SHAKES) {
    finish();
  }
}

function finish() {
  finished = true;
  dragging = false;
  guide.hidden = true;
  flash.classList.remove("active");
  void flash.offsetWidth;
  flash.classList.add("active");

  window.setTimeout(() => {
    stage.classList.add("result-mode");
    miko.src = imagePaths.result;
    miko.classList.remove("shake-up", "shake-down");
    miko.classList.add("revealed");
  }, 320);

  window.setTimeout(showResult, 620);
}

function showResult() {
  const data = fortunes[Math.floor(Math.random() * fortunes.length)];
  fortuneName.textContent = data.name;
  fortuneText.textContent = data.text;
  fortuneDetails.innerHTML = Object.entries(data.details)
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
  result.hidden = false;
  result.classList.remove("paper-hidden");
  showPaper.hidden = true;
}

function resetGame() {
  shakeCount = 0;
  lastY = 0;
  dragging = false;
  started = false;
  finished = false;
  direction = 1;
  window.clearTimeout(revealTimer);
  stage.classList.remove("result-mode");
  miko.src = imagePaths.idle;
  miko.classList.remove("shake-up", "shake-down", "revealed");
  guide.hidden = false;
  guideTitle.textContent = "準備はよろしいですか";
  guideText.textContent = "ボタンを押してから上下に振ってください";
  startButton.hidden = false;
  result.hidden = true;
  result.classList.remove("paper-hidden");
  showPaper.hidden = true;
  flash.classList.remove("active");
  updateCounter();
}

stage.addEventListener("pointerdown", (event) => {
  if (!started || finished) return;
  dragging = true;
  lastY = event.clientY;
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", (event) => {
  handleSlide(event.clientY);
});

stage.addEventListener("pointerup", (event) => {
  dragging = false;
  if (stage.hasPointerCapture(event.pointerId)) {
    stage.releasePointerCapture(event.pointerId);
  }
});

stage.addEventListener("pointercancel", () => {
  dragging = false;
});

stage.addEventListener("wheel", (event) => {
  if (!started || finished) return;
  direction = event.deltaY < 0 ? -1 : 1;
  shake();
});

window.addEventListener("keydown", (event) => {
  if (!started || finished) return;
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown" && event.key !== " ") return;
  direction = event.key === "ArrowUp" ? -1 : 1;
  shake();
});

["pointerdown", "pointermove", "pointerup", "click", "wheel"].forEach((type) => {
  paper.addEventListener(type, (event) => {
    event.stopPropagation();
  });
});

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  beginOmikuji();
});

hidePaper.addEventListener("click", (event) => {
  event.stopPropagation();
  result.classList.add("paper-hidden");
  showPaper.hidden = false;
});

showPaper.addEventListener("click", (event) => {
  event.stopPropagation();
  result.classList.remove("paper-hidden");
  showPaper.hidden = true;
});

retry.addEventListener("click", (event) => {
  event.stopPropagation();
  resetGame();
});

preloadImages();
resetGame();
