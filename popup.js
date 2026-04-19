// popup.js — 확장 프로그램 팝업 UI 로직

(function () {
  "use strict";

  const showPhotoEl = document.getElementById("showPhoto");
  const showTimestampEl = document.getElementById("showTimestamp");

  // 저장된 설정 로드
  chrome.storage?.local?.get(["yncSettings"], (result) => {
    const s = result?.yncSettings || {};
    showPhotoEl.checked = !!s.showAuthorPhoto;
    showTimestampEl.checked = !!s.showTimestamp;
  });

  function save() {
    const settings = {
      showAuthorPhoto: showPhotoEl.checked,
      showTimestamp: showTimestampEl.checked,
    };
    chrome.storage?.local?.set({ yncSettings: settings });

    // 현재 탭에 설정 전달
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          source: "ync-popup",
          settings,
        });
      }
    });
  }

  showPhotoEl.addEventListener("change", save);
  showTimestampEl.addEventListener("change", save);
})();
