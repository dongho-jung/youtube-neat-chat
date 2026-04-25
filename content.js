// content.js — YouTube 메인 페이지에서 실행
// 비디오 위에 채팅 입력 오버레이를 표시

(function () {
  "use strict";

  let overlay = null;
  let layoutActive = false;
  let layoutTimer = null;
  let yncChatFrame = null;
  let emojiSearchItems = [];
  let ytEmojiMap = {};
  let pendingYTEmojis = null;

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
    if (yt && yt.contentWindow) return yt.contentWindow;
    if (yncChatFrame && yncChatFrame.contentWindow) return yncChatFrame.contentWindow;
    return null;
  }

  function ensureChatFrame() {
    // 원본 #chatframe이 DOM에 있으면 (display:none이어도 동작함) 중복 생성 안 함
    const yt = document.querySelector("#chatframe");
    if (yt) return;
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
  // --- 레이아웃 오버라이드 CSS ---
  const YNC_STYLE_ID = "ync-layout-style";
  const YNC_LAYOUT_CSS = `
    ytd-watch-flexy {
      --ytd-watch-flexy-sidebar-width: 0px !important;
    }
    ytd-watch-flexy ytd-live-chat-frame#chat,
    ytd-watch-flexy #panels,
    ytd-watch-flexy #secondary {
      position: fixed !important;
      top: -9999px !important;
      left: -9999px !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: -1 !important;
    }
    ytd-watch-flexy #full-bleed-container,
    ytd-watch-flexy #player-theater-container,
    ytd-watch-flexy #player-wide-container,
    ytd-watch-flexy #player-container {
      max-width: 100% !important;
      width: 100% !important;
    }
    ytd-watch-flexy #movie_player,
    ytd-watch-flexy .html5-video-container,
    ytd-watch-flexy .html5-video-container video {
      width: 100% !important;
      max-width: 100% !important;
    }
    ytd-watch-flexy #columns #primary {
      max-width: 100% !important;
      width: 100% !important;
    }
  `;

  function injectLayoutStyle() {
    if (document.getElementById(YNC_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = YNC_STYLE_ID;
    style.textContent = YNC_LAYOUT_CSS;
    document.head.appendChild(style);
  }

  function removeLayoutStyle() {
    document.getElementById(YNC_STYLE_ID)?.remove();
  }

  function expandVideoLayout() {
    if (layoutActive) return;
    layoutActive = true;
    injectLayoutStyle();
    applyLayoutOverrides();
    layoutTimer = setInterval(applyLayoutOverrides, 500);
  }

  function applyLayoutOverrides() {
    injectLayoutStyle();
    const flexy = document.querySelector("ytd-watch-flexy");
    if (flexy) {
      flexy.removeAttribute("live-chat-present-and-expanded");
      flexy.removeAttribute("panel-expanded");
      flexy.removeAttribute("fixed-panels");
      flexy.removeAttribute("watch-while-panels-active");
      flexy.removeAttribute("should-stamp-chat");
    }
    ensureChatFrame();
  }

  function restoreVideoLayout() {
    if (layoutTimer) { clearInterval(layoutTimer); layoutTimer = null; }
    layoutActive = false;
    removeLayoutStyle();
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
        <button class="ync-msglog-btn" id="ync-msglog-btn" title="Chat log">💬</button>
        <span class="ync-header-spacer"></span>
        <button class="ync-close" id="ync-close" title="Close">✕</button>
      </div>
      <div class="ync-msglog" id="ync-msglog">
        <button class="ync-msglog-nav ync-msglog-up" id="ync-msglog-up" title="Previous">▲</button>
        <div class="ync-msglog-display" id="ync-msglog-display"></div>
        <button class="ync-msglog-nav ync-msglog-down" id="ync-msglog-down" title="Next">▼</button>
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

    if (pendingYTEmojis) {
      populateYTEmojis(pendingYTEmojis);
      pendingYTEmojis = null;
    }

    overlay.querySelector("#ync-close").addEventListener("click", () => {
      overlay.remove();
      overlay = null;
      restoreVideoLayout();
    });

    // 메시지 로그 토글
    const msglogBtn = overlay.querySelector("#ync-msglog-btn");
    const msglog = overlay.querySelector("#ync-msglog");
    msglogBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      msglog.classList.toggle("ync-msglog-open");
      if (msglog.classList.contains("ync-msglog-open")) renderCurrentMsg();
    });

    // 페이징 버튼
    overlay.querySelector("#ync-msglog-up").addEventListener("click", (e) => {
      e.stopPropagation();
      if (msgLogIndex > 0) { msgLogIndex--; msgLogFollow = false; renderCurrentMsg(); }
    });
    overlay.querySelector("#ync-msglog-down").addEventListener("click", (e) => {
      e.stopPropagation();
      if (msgLogIndex < chatMessages.length - 1) {
        msgLogIndex++;
        msgLogFollow = (msgLogIndex === chatMessages.length - 1);
        renderCurrentMsg();
      }
    });
  }

  let chatMessages = [];
  let msgLogIndex = -1;
  let msgLogFollow = true; // 최신 메시지 자동 추적

  function appendChatMessage(data) {
    chatMessages.push(data);
    if (chatMessages.length > 200) { chatMessages.shift(); msgLogIndex = Math.max(0, msgLogIndex - 1); }
    if (msgLogFollow) msgLogIndex = chatMessages.length - 1;
    renderCurrentMsg();
  }

  function renderCurrentMsg() {
    if (!overlay) return;
    const display = overlay.querySelector("#ync-msglog-display");
    if (!display) return;
    if (chatMessages.length === 0 || msgLogIndex < 0) {
      display.innerHTML = `<span class="ync-msglog-empty">No messages</span>`;
      return;
    }
    const data = chatMessages[msgLogIndex];
    display.innerHTML =
      `<span class="ync-msglog-author">${escapeHTML(data.author)}</span> ` +
      `<span class="ync-msglog-text">${data.message}</span>`;
    display.title = "Click to copy";
    display.onclick = () => {
      navigator.clipboard.writeText(data.messageText).then(() => {
        display.classList.add("ync-msglog-copied");
        setTimeout(() => display.classList.remove("ync-msglog-copied"), 600);
      });
    };
  }

  function escapeHTML(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
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
    emojiSearchItems = [];
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
      emojiSearchItems.push({ el: span, keywords: (emoji + " " + keywords).toLowerCase() });
    }

    // YouTube emoji section (populated dynamically from chat iframe)
    const ytSection = document.createElement("div");
    ytSection.className = "ync-yt-section";
    ytSection.style.display = "none";
    const ytLabel = document.createElement("div");
    ytLabel.className = "ync-yt-label";
    ytLabel.textContent = "YouTube";
    ytSection.appendChild(ytLabel);
    const ytGrid = document.createElement("div");
    ytGrid.className = "ync-emoji-grid ync-yt-grid";
    ytSection.appendChild(ytGrid);
    picker.appendChild(ytSection);

    // 검색 필터 — 단어별 AND 매칭
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      const words = q.split(/\s+/).filter(Boolean);
      for (const item of emojiSearchItems) {
        item.el.style.display = (words.length === 0 || words.every(w => item.keywords.includes(w))) ? "" : "none";
      }
      // YouTube 섹션: 보이는 아이템이 하나도 없으면 라벨 숨김
      if (ytSection.style.display !== "none") {
        const anyYTVisible = ytGrid.querySelector(".ync-yt-emoji-item:not([style*='display: none'])");
        ytLabel.style.display = (words.length === 0 || anyYTVisible) ? "" : "none";
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

  // --- YouTube 이모지 채우기 ---
  function populateYTEmojis(emojis) {
    if (!overlay) return;
    const ytSection = overlay.querySelector(".ync-yt-section");
    const ytGrid = overlay.querySelector(".ync-yt-grid");
    if (!ytSection || !ytGrid) return;

    ytGrid.innerHTML = "";
    ytEmojiMap = {};

    const chatInput = overlay.querySelector("#ync-input");
    for (const { shortcode, src } of emojis) {
      const span = document.createElement("span");
      span.className = "ync-emoji-item ync-yt-emoji-item";
      const img = document.createElement("img");
      img.src = src;
      img.alt = shortcode;
      img.title = shortcode.replace(/:/g, "");
      img.className = "ync-yt-emoji-img";
      span.appendChild(img);
      span.addEventListener("click", () => {
        chatInput.value += shortcode;
        chatInput.focus();
      });
      ytGrid.appendChild(span);

      emojiSearchItems.push({
        el: span,
        keywords: shortcode.replace(/:/g, " ").trim().toLowerCase(),
      });
      ytEmojiMap[shortcode] = src;
    }

    ytSection.style.display = "";
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
        win.postMessage({ source: "ync-send-chat", text, ytEmojiMap }, "https://www.youtube.com");
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

  // --- 메시지 수신 (오버레이 생성 트리거용 + YouTube 이모지 데이터) ---
  window.addEventListener("message", (e) => {
    if (e.origin !== "https://www.youtube.com") return;
    if (!e.data || e.data.source !== "ync-chat-observer") return;
    if (e.data.event === "ready" || e.data.event === "message") {
      if (!overlay) createOverlay();
      if (e.data.event === "message" && e.data.data) {
        appendChatMessage(e.data.data);
      }
    }
    if (e.data.event === "ytEmojis" && e.data.emojis) {
      if (overlay) {
        populateYTEmojis(e.data.emojis);
      } else {
        pendingYTEmojis = e.data.emojis;
      }
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
