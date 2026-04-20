// content.js — YouTube 메인 페이지에서 실행
// 비디오 위에 채팅 입력 오버레이를 표시

(function () {
  "use strict";

  let overlay = null;
  let layoutActive = false;
  let layoutTimer = null;
  let yncChatFrame = null;

  // [emoji, keywords] — 검색용 키워드 (영어, 한국어, 일본어)
  const EMOJIS = [
    // 얼굴 — 웃음
    ["😊", "smile happy 미소 笑顔"],
    ["😄", "grin happy 활짝 にっこり"],
    ["😁", "beam teeth 이빨"],
    ["😂", "joy lol funny lmao 웃음 笑"],
    ["🤣", "rofl 빵 ㅋㅋ 草 ww"],
    ["😆", "laugh squint 크크"],
    ["😅", "sweat 땀 汗"],
    ["🙂", "slight smile 살짝"],
    ["🙃", "upside down 뒤집"],
    ["😉", "wink 윙크"],
    ["😇", "angel halo 천사 天使"],
    // 얼굴 — 사랑
    ["🥰", "love hearts 사랑 愛"],
    ["😍", "heart eyes 하트눈"],
    ["🤩", "star eyes 스타 별"],
    ["😘", "kiss blow 뽀뽀 キス"],
    ["😗", "kiss 입술 くち"],
    ["😚", "kiss closed 쪽"],
    ["😙", "kiss smile"],
    // 얼굴 — 혀
    ["😋", "yummy delicious 맛 おいしい"],
    ["😛", "tongue 혀"],
    ["😜", "wink tongue 장난"],
    ["🤪", "zany crazy 미친"],
    ["😝", "squint tongue"],
    // 얼굴 — 손
    ["🤗", "hug 포옹 ハグ"],
    ["🤭", "giggle 킥킥 てへ"],
    ["🫢", "oops 앗"],
    ["🫣", "peek 몰래 ちら"],
    ["🤫", "shush quiet 쉿"],
    ["🤔", "think hmm 생각 考え"],
    ["🫡", "salute 경례 敬礼"],
    // 얼굴 — 중립/회의
    ["😐", "neutral 무표정"],
    ["😑", "expressionless 멍"],
    ["😶", "mute silent 조용"],
    ["🫥", "dotted invisible"],
    ["😏", "smirk 씩 ニヤ"],
    ["😒", "unamused 지루"],
    ["🙄", "eye roll 눈굴리기"],
    ["😬", "grimace 으악"],
    ["😮‍💨", "exhale sigh 후 はぁ"],
    // 얼굴 — 졸림/아픔
    ["😴", "sleep zzz 잠 寝る"],
    ["🤤", "drool 침 よだれ"],
    ["😪", "sleepy 졸려"],
    ["🥱", "yawn 하품 あくび"],
    ["🤒", "sick thermometer 아파"],
    ["🤕", "hurt bandage 다쳐"],
    ["🤢", "nausea 메스꺼"],
    ["🤮", "vomit 으웩"],
    // 얼굴 — 감정
    ["🥺", "pleading puppy 살려 お願い"],
    ["😢", "cry tear sad 울 泣く"],
    ["😭", "sob bawl sad 대성통곡 号泣"],
    ["😤", "huff angry 화 怒"],
    ["😠", "angry 화나 おこ"],
    ["😡", "rage furious 분노 激怒"],
    ["🤬", "swear 욕 クソ"],
    ["😈", "devil 악마 悪魔"],
    ["👿", "imp angry devil"],
    // 얼굴 — 놀람/두려움
    ["😮", "open mouth oh 오 え"],
    ["😯", "hushed 놀라"],
    ["😲", "astonished wow 와 すごい"],
    ["😱", "scream horror 공포 きゃー"],
    ["🤯", "exploding mind blown 머리폭발"],
    ["😳", "flushed blush 부끄 恥"],
    // 얼굴 — 기타
    ["🥳", "party celebrate birthday 파티 パーティ"],
    ["🤠", "cowboy"],
    ["😎", "cool sunglasses 쿨 かっこいい"],
    ["🤓", "nerd glasses 너드"],
    ["🧐", "monocle 탐정"],
    ["🫠", "melt 녹아 とろけ"],
    ["💀", "skull dead 죽 ded しんだ"],
    ["👻", "ghost boo 유령 おばけ"],
    ["🤡", "clown 광대 ピエロ"],
    ["🗿", "moai stone moyai"],
    ["🫨", "shake vibrate 흔들"],
    // 손
    ["👍", "thumbs up good yes ok 좋아 いいね"],
    ["👎", "thumbs down bad no 싫어"],
    ["👏", "clap bravo 박수 拍手"],
    ["🙏", "pray please thanks 감사 ありがとう"],
    ["💪", "muscle strong 힘 力"],
    ["✌️", "peace victory ✌ 승리 ピース"],
    ["🤞", "crossed fingers 행운"],
    ["🤟", "love you 사랑해"],
    ["🤘", "rock metal 락"],
    ["👋", "wave bye hi 안녕 バイバイ"],
    ["🤝", "handshake 악수"],
    ["🫶", "heart hands 하트손 ハート"],
    ["👀", "eyes look 눈 目"],
    ["👁️", "eye 눈알"],
    ["👊", "fist bump punch 주먹 パンチ"],
    ["✋", "hand stop 스톱 ストップ"],
    ["🖐️", "hand spread 손바닥"],
    ["🫰", "pinch money 돈"],
    ["🤌", "pinched italian 뭐시기"],
    ["☝️", "point up 위 ☝"],
    ["👆", "up 위로"],
    ["👇", "down 아래로"],
    ["👈", "left 왼쪽"],
    ["👉", "right 오른쪽"],
    // 하트/심볼
    ["❤️", "red heart love 빨강하트 赤ハート"],
    ["🧡", "orange heart 주황하트"],
    ["💛", "yellow heart 노랑하트"],
    ["💚", "green heart 초록하트"],
    ["💙", "blue heart 파랑하트"],
    ["💜", "purple heart 보라하트"],
    ["🖤", "black heart 검정하트"],
    ["🤍", "white heart 하얀하트"],
    ["💗", "growing heart 두근"],
    ["💖", "sparkle heart 반짝하트"],
    ["💕", "two hearts 하트둘"],
    ["💞", "revolving hearts 돌아"],
    ["💓", "heartbeat 두근두근 ドキドキ"],
    ["💔", "broken heart 상처 失恋"],
    ["❤️‍🔥", "fire heart 불타는"],
    ["❤️‍🩹", "mending heart 회복"],
    // 자연/동물
    ["🐱", "cat 고양이 猫 ねこ"],
    ["🐶", "dog 강아지 犬 いぬ"],
    ["🐰", "rabbit bunny 토끼 うさぎ"],
    ["🐻", "bear 곰 くま"],
    ["🐼", "panda 판다 パンダ"],
    ["🐸", "frog 개구리 かえる"],
    ["🐧", "penguin 펭귄 ペンギン"],
    ["🦊", "fox 여우 きつね"],
    ["🐹", "hamster 햄스터 ハムスター"],
    ["🐥", "chick baby 병아리 ひよこ"],
    ["🦋", "butterfly 나비"],
    ["🌸", "cherry blossom sakura 벚꽃 桜 さくら"],
    ["🌹", "rose 장미 バラ"],
    ["🌻", "sunflower 해바라기 ひまわり"],
    ["🍀", "clover luck 클로버 四葉"],
    // 음식
    ["🍕", "pizza 피자"],
    ["🍔", "burger hamburger 햄버거"],
    ["🍣", "sushi 스시 寿司 すし"],
    ["🍜", "ramen noodle 라면 ラーメン"],
    ["🍙", "rice ball onigiri 주먹밥 おにぎり"],
    ["🍰", "cake 케이크 ケーキ"],
    ["🍦", "ice cream 아이스크림 アイス"],
    ["🍺", "beer 맥주 ビール"],
    ["🍷", "wine 와인 ワイン"],
    ["☕", "coffee 커피 コーヒー"],
    ["🧋", "boba bubble tea 버블티 タピオカ"],
    // 활동/물건
    ["⭐", "star 별 星 ほし"],
    ["🔥", "fire hot lit 불 炎 あつい"],
    ["✨", "sparkle shine 반짝 キラキラ"],
    ["💯", "hundred perfect 백점 満点"],
    ["🎉", "party tada congratulations 축하 おめでとう"],
    ["🎊", "confetti celebrate 축하2"],
    ["⚡", "lightning zap 번개 稲妻"],
    ["💥", "boom explosion 폭발 爆発"],
    ["🎵", "music note 음악 音楽"],
    ["🎶", "notes melody 멜로디"],
    ["🎮", "game controller 게임 ゲーム"],
    ["🎯", "target bullseye 타겟"],
    ["🏆", "trophy winner 트로피 優勝"],
    ["🎁", "gift present 선물 プレゼント"],
    ["💎", "gem diamond 다이아 ダイヤ"],
    ["🪄", "magic wand 마법 魔法"],
    ["🫧", "bubbles 거품"],
    ["💤", "sleep zzz 졸려 ねむい"],
    ["💢", "anger 짜증 怒り"],
    ["💬", "speech bubble 말풍선"],
    ["👑", "crown king queen 왕관 王冠"],
    ["🚀", "rocket launch 로켓"],
    ["🌙", "moon night 달 月 つき"],
    ["☀️", "sun sunny 해 太陽"],
    ["🌈", "rainbow 무지개 虹 にじ"],
    ["❄️", "snow winter 눈 雪 ゆき"],
    // 깃발/기호
    ["✅", "check done 확인 OK"],
    ["❌", "cross no 아니 ダメ"],
    ["⭕", "circle correct 맞아"],
    ["❓", "question 물음표 なに"],
    ["❗", "exclamation 느낌표"],
    ["⚠️", "warning 경고 注意"],
    ["🔴", "red circle 빨강"],
    ["🟢", "green circle 초록"],
    ["🔵", "blue circle 파랑"],
    // 텍스트 이모티콘
    ["草", "kusa lol 풀 笑い ww"],
    ["w", "ww www 웃음 笑"],
    ["888", "clap 88888 박수 拍手 パチパチ"],
    ["GG", "good game well played"],
    ["gg", "good game"],
    ["orz", "bow down 좌절 挫折"],
    ["( ˘ω˘ )", "comfy 편안 まったり"],
    ["(´;ω;`)", "cry sad 울어 泣き"],
    ["(≧▽≦)", "happy excited 신나"],
    ["( ´∀`)", "happy relax 기분좋"],
    ["(°▽°)", "wow surprised 오오"],
    ["(╥_╥)", "crying 눈물"],
    ["( ˙-˙ )", "blank 멍"],
    ["(ノ◕ヮ◕)ノ*:・゚✧", "sparkle magic 반짝"],
    ["ヾ(≧▽≦*)o", "cheer 응원"],
    ["(｡>﹏<｡)", "pain cry 아야"],
  ];

  // --- chatframe 유효성 ---
  function isValidChatFrame(frame) {
    return frame && frame.src && frame.src.includes("/live_chat");
  }

  function getChatFrameWindow() {
    const yt = document.querySelector("#chatframe");
    if (isValidChatFrame(yt) && yt.contentWindow) return yt.contentWindow;
    if (yncChatFrame && yncChatFrame.contentWindow) return yncChatFrame.contentWindow;
    return null;
  }

  function ensureChatFrame() {
    const yt = document.querySelector("#chatframe");
    if (isValidChatFrame(yt)) return;
    if (yncChatFrame && yncChatFrame.isConnected) return;

    const videoId = new URLSearchParams(location.search).get("v");
    if (!videoId) return;

    yncChatFrame = document.createElement("iframe");
    yncChatFrame.id = "ync-chatframe";
    yncChatFrame.src = `https://www.youtube.com/live_chat?v=${videoId}&is_popout=1`;
    yncChatFrame.style.cssText =
      "position:fixed!important;top:0!important;right:0!important;" +
      "width:400px!important;height:500px!important;" +
      "opacity:0!important;pointer-events:none!important;" +
      "z-index:-1!important;border:none!important;";
    document.body.appendChild(yncChatFrame);
  }

  // --- 영상 확장 ---
  function expandVideoLayout() {
    if (layoutActive) return;
    layoutActive = true;
    applyLayoutOverrides();
    layoutTimer = setInterval(applyLayoutOverrides, 500);
  }

  function applyLayoutOverrides() {
    const flexy = document.querySelector("ytd-watch-flexy");
    if (flexy) {
      flexy.removeAttribute("live-chat-present-and-expanded");
      flexy.removeAttribute("panel-expanded");
    }

    const chat = document.querySelector("ytd-live-chat-frame#chat");
    if (chat) {
      chat.style.setProperty("position", "fixed", "important");
      chat.style.setProperty("top", "0", "important");
      chat.style.setProperty("right", "0", "important");
      chat.style.setProperty("width", "400px", "important");
      chat.style.setProperty("height", "500px", "important");
      chat.style.setProperty("opacity", "0", "important");
      chat.style.setProperty("pointer-events", "none", "important");
      chat.style.setProperty("z-index", "-1", "important");
    }

    ensureChatFrame();
  }

  function restoreVideoLayout() {
    if (layoutTimer) { clearInterval(layoutTimer); layoutTimer = null; }
    layoutActive = false;

    const chat = document.querySelector("ytd-live-chat-frame#chat");
    if (chat) {
      ["position","top","right","width","height","opacity","pointer-events","z-index"]
        .forEach(p => chat.style.removeProperty(p));
    }
    if (yncChatFrame && yncChatFrame.isConnected) yncChatFrame.remove();
    yncChatFrame = null;
  }

  // --- 오버레이 생성 ---
  function createOverlay() {
    if (overlay) return;

    const videoContainer = document.querySelector("#movie_player, .html5-video-player");
    if (!videoContainer) return;

    expandVideoLayout();

    if (getComputedStyle(videoContainer).position === "static") {
      videoContainer.style.position = "relative";
    }

    overlay = document.createElement("div");
    overlay.id = "ync-overlay";
    overlay.innerHTML = `
      <div class="ync-header" id="ync-header">
        <span class="ync-title">💬</span>
        <button class="ync-close" id="ync-close" title="Close">✕</button>
      </div>
      <div class="ync-input-wrap">
        <input type="text" class="ync-input" id="ync-input" placeholder="Chat..." autocomplete="off">
        <button class="ync-emoji-btn" id="ync-emoji-btn" title="Emoji">😊</button>
        <button class="ync-send-btn" id="ync-send-btn">Send</button>
      </div>
      <div class="ync-emoji-picker" id="ync-emoji-picker"></div>
    `;

    // 초기 위치: 하단 중앙
    const containerRect = videoContainer.getBoundingClientRect();
    overlay.style.left = Math.round((containerRect.width - 320) / 2) + "px";
    overlay.style.bottom = "60px";

    videoContainer.appendChild(overlay);

    buildEmojiPicker();
    setupDrag();
    setupChatInput();

    overlay.querySelector("#ync-close").addEventListener("click", () => {
      overlay.remove();
      overlay = null;
      restoreVideoLayout();
    });
  }

  // --- 이모지 피커 ---
  function buildEmojiPicker() {
    const picker = overlay.querySelector("#ync-emoji-picker");
    const chatInput = overlay.querySelector("#ync-input");
    const btn = overlay.querySelector("#ync-emoji-btn");

    // 검색창
    const searchWrap = document.createElement("div");
    searchWrap.className = "ync-emoji-search-wrap";
    searchWrap.innerHTML = `<input type="text" class="ync-emoji-search" placeholder="Search..." autocomplete="off">`;
    picker.appendChild(searchWrap);

    const searchInput = searchWrap.querySelector(".ync-emoji-search");

    // 이모지 그리드
    const grid = document.createElement("div");
    grid.className = "ync-emoji-grid";
    picker.appendChild(grid);

    // 이모지 아이템 생성
    const items = [];
    for (const [emoji, keywords] of EMOJIS) {
      const span = document.createElement("span");
      span.className = "ync-emoji-item";
      span.textContent = emoji;
      span.title = keywords;
      span.addEventListener("click", () => {
        chatInput.value += emoji;
        chatInput.focus();
      });
      grid.appendChild(span);
      items.push({ el: span, keywords: (emoji + " " + keywords).toLowerCase() });
    }

    // 검색 필터 — 단어별 AND 매칭
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      const words = q.split(/\s+/).filter(Boolean);
      for (const item of items) {
        item.el.style.display = (words.length === 0 || words.every(w => item.keywords.includes(w))) ? "" : "none";
      }
    });

    // 검색창 키 이벤트 전파 방지
    searchInput.addEventListener("keydown", (e) => e.stopPropagation());
    searchInput.addEventListener("keyup", (e) => e.stopPropagation());
    searchInput.addEventListener("keypress", (e) => e.stopPropagation());

    // 토글
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const opening = !picker.classList.contains("ync-picker-open");
      picker.classList.toggle("ync-picker-open");
      if (opening) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
        searchInput.focus();
      }
    });

    // 바깥 클릭하면 닫기
    document.addEventListener("click", (e) => {
      if (!picker.contains(e.target) && e.target !== btn) {
        picker.classList.remove("ync-picker-open");
      }
    });
  }

  // --- 드래그 ---
  function setupDrag() {
    const header = overlay.querySelector("#ync-header");
    let dragging = false;
    let startMouseX, startMouseY, startLeft, startTop;

    header.addEventListener("mousedown", (e) => {
      if (e.target.closest(".ync-close")) return;
      dragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startLeft = overlay.offsetLeft;
      startTop = overlay.offsetTop;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      overlay.style.left = (startLeft + e.clientX - startMouseX) + "px";
      overlay.style.top = (startTop + e.clientY - startMouseY) + "px";
      overlay.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => { dragging = false; });
  }

  // --- 채팅 입력 ---
  function setupChatInput() {
    const input = overlay.querySelector("#ync-input");
    const sendBtn = overlay.querySelector("#ync-send-btn");

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      const win = getChatFrameWindow();
      if (win) {
        win.postMessage({ source: "ync-send-chat", text }, "https://www.youtube.com");
      }
      input.value = "";
    }

    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) sendMessage();
    });
    input.addEventListener("keyup", (e) => e.stopPropagation());
    input.addEventListener("keypress", (e) => e.stopPropagation());
    sendBtn.addEventListener("click", sendMessage);
  }

  // --- 메시지 수신 (오버레이 생성 트리거용) ---
  window.addEventListener("message", (e) => {
    if (e.origin !== "https://www.youtube.com") return;
    if (!e.data || e.data.source !== "ync-chat-observer") return;
    if (e.data.event === "ready" || e.data.event === "message") {
      if (!overlay) createOverlay();
    }
  });

  // --- 팝업 설정 ---
  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg.source === "ync-popup" && msg.settings) {
      // 향후 설정 확장용
    }
  });

  // --- SPA 대응 ---
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (overlay) { overlay.remove(); overlay = null; }
      restoreVideoLayout();
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });
})();
