// chat-observer.js — YouTube 라이브 채팅 iframe 내부에서 실행
// 새 채팅 메시지를 감지하여 부모 프레임으로 전달

(function () {
  "use strict";

  const SELECTORS = {
    chatItems: "#items.yt-live-chat-item-list-renderer",
    textMessage: "yt-live-chat-text-message-renderer",
    paidMessage: "yt-live-chat-paid-message-renderer",
    membershipItem: "yt-live-chat-membership-item-renderer",
    authorName: "#author-name",
    authorPhoto: "#author-photo img",
    message: "#message",
    timestamp: "#timestamp",
    chatBadge: "yt-live-chat-author-badge-renderer",
  };

  function extractMessage(node) {
    const tagName = node.tagName.toLowerCase();

    // 일반 채팅 메시지
    if (tagName === SELECTORS.textMessage) {
      return extractTextMessage(node);
    }
    // 슈퍼챗
    if (tagName === SELECTORS.paidMessage) {
      return extractPaidMessage(node);
    }
    // 멤버십
    if (tagName === SELECTORS.membershipItem) {
      return extractMembershipMessage(node);
    }
    return null;
  }

  function extractTextMessage(node) {
    const authorEl = node.querySelector(SELECTORS.authorName);
    const messageEl = node.querySelector(SELECTORS.message);
    const photoEl = node.querySelector(SELECTORS.authorPhoto);
    const timestampEl = node.querySelector(SELECTORS.timestamp);
    const badgeEl = node.querySelector(SELECTORS.chatBadge);

    if (!authorEl || !messageEl) return null;

    return {
      type: "chat",
      author: authorEl.textContent.trim(),
      message: getMessageHTML(messageEl),
      messageText: messageEl.textContent.trim(),
      photoUrl: photoEl ? photoEl.src : "",
      timestamp: timestampEl ? timestampEl.textContent.trim() : "",
      isMember: !!badgeEl,
      badgeType: badgeEl ? badgeEl.getAttribute("type") : null,
    };
  }

  function extractPaidMessage(node) {
    const authorEl = node.querySelector("#author-name");
    const messageEl = node.querySelector("#purchase-amount");
    const photoEl = node.querySelector("#author-photo img");

    return {
      type: "superchat",
      author: authorEl ? authorEl.textContent.trim() : "Unknown",
      message: messageEl ? messageEl.textContent.trim() : "",
      messageText: messageEl ? messageEl.textContent.trim() : "",
      photoUrl: photoEl ? photoEl.src : "",
      timestamp: "",
      isMember: false,
      badgeType: null,
    };
  }

  function extractMembershipMessage(node) {
    const authorEl = node.querySelector("#author-name");
    const headerEl = node.querySelector("#header-subtext");

    return {
      type: "membership",
      author: authorEl ? authorEl.textContent.trim() : "Unknown",
      message: headerEl ? headerEl.textContent.trim() : "",
      messageText: headerEl ? headerEl.textContent.trim() : "",
      photoUrl: "",
      timestamp: "",
      isMember: true,
      badgeType: "member",
    };
  }

  function getMessageHTML(messageEl) {
    // 이모지 이미지를 포함한 HTML을 반환
    let html = "";
    for (const child of messageEl.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        html += escapeHTML(child.textContent);
      } else if (child.tagName === "IMG") {
        // 유튜브 이모지
        html += `<img src="${child.src}" alt="${child.alt || ""}" class="ync-emoji">`;
      } else {
        html += escapeHTML(child.textContent);
      }
    }
    return html;
  }

  function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function sendToParent(data) {
    window.parent.postMessage(
      { source: "ync-chat-observer", ...data },
      "https://www.youtube.com"
    );
  }

  function observeChat() {
    const chatContainer = document.querySelector(SELECTORS.chatItems);
    if (!chatContainer) {
      // 아직 로드 안됐으면 재시도
      setTimeout(observeChat, 1000);
      return;
    }

    sendToParent({ event: "ready" });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const data = extractMessage(node);
          if (data) {
            sendToParent({ event: "message", data });
          }
        }
      }
    });

    observer.observe(chatContainer, { childList: true });
  }

  // --- 부모 프레임에서 채팅 전송 요청 수신 ---
  window.addEventListener("message", (e) => {
    if (e.origin !== "https://www.youtube.com") return;
    if (!e.data || e.data.source !== "ync-send-chat") return;

    const text = e.data.text;
    if (!text) return;

    sendChatMessage(text);
  });

  function sendChatMessage(text) {
    // contenteditable div#input (yt-live-chat-text-input-field-renderer 내부)
    const chatInput = document.querySelector(
      "div#input[contenteditable].style-scope.yt-live-chat-text-input-field-renderer"
    );
    if (!chatInput) return;

    // 1. 포커스 확보
    chatInput.focus();

    // 2. 기존 내용 선택 후 삭제
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(chatInput);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("delete", false, null);

    // 3. 텍스트 삽입 — execCommand가 가장 Polymer 호환성 좋음
    document.execCommand("insertText", false, text);

    // 4. Polymer가 인식하도록 이벤트 연쇄 발생
    chatInput.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    chatInput.dispatchEvent(new Event("change", { bubbles: true, composed: true }));

    // 5. 전송 (딜레이를 두고 버튼 활성화 대기 후 클릭)
    waitAndSend(chatInput, 0);
  }

  function waitAndSend(chatInput, attempt) {
    if (attempt > 10) return; // 최대 10번 시도 (총 ~1초)

    setTimeout(() => {
      const sendBtn = document.querySelector(
        "#send-button yt-button-shape button"
      ) || document.querySelector(
        "#send-button button"
      );

      if (sendBtn && !sendBtn.disabled) {
        // 버튼 활성화됨 → 클릭
        sendBtn.click();
      } else if (sendBtn && sendBtn.disabled) {
        // 아직 비활성화 → 재시도
        waitAndSend(chatInput, attempt + 1);
      } else {
        // 버튼 못 찾으면 Enter 키로 시도
        chatInput.dispatchEvent(new KeyboardEvent("keydown", {
          key: "Enter", code: "Enter", keyCode: 13,
          which: 13, bubbles: true, composed: true, cancelable: true,
        }));
      }
    }, 100);
  }

  observeChat();
})();
