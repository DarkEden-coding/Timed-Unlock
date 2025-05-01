// Create lock overlay
let lockOverlay = null;
let timerInterval = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showLock") {
    // Stop all videos before showing lock screen
    stopAllMediaPlayback();
    showLockScreen(request.remainingTime);
  } else if (request.action === "removeLock") {
    removeLockScreen();
  } else if (request.action === "updateTimer") {
    if (!lockOverlay) {
      showLockScreen(request.remainingTime);
    } else {
      updateTimer(request.remainingTime);
      const unlockButton = lockOverlay.querySelector(".focus-lock-button");
      if (unlockButton) {
        unlockButton.disabled = true;
        unlockButton.textContent = "Unlocking...";
      }
    }
  } else if (request.action === "prepareLock") {
    // Stop all videos and respond that we're ready for reload
    stopAllMediaPlayback();
    sendResponse({ success: true });
  }
});

// Check if we need to show lock screen on page load
chrome.runtime.sendMessage(
  {
    action: "checkStatus",
    domain: window.location.hostname,
  },
  (response) => {
    if (response.isLocked) {
      showLockScreen(response.remainingTime);
    }
  }
);

// Create and show the lock screen
function showLockScreen(remainingTime) {
  if (lockOverlay) {
    removeLockScreen();
  }

  lockOverlay = document.createElement("div");
  lockOverlay.id = "focus-lock-overlay";

  const contentBox = document.createElement("div");
  contentBox.className = "focus-lock-content";

  const lockIcon = document.createElement("div");
  lockIcon.className = "focus-lock-icon";
  lockIcon.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

  const title = document.createElement("h2");
  title.textContent = "Website Locked";

  const message = document.createElement("p");
  message.textContent = "This website has been locked to help you stay focused.";

  const timerDisplay = document.createElement("div");
  timerDisplay.id = "focus-lock-timer";
  timerDisplay.className = "focus-lock-timer";

  const unlockButton = document.createElement("button");
  unlockButton.className = "focus-lock-button";
  unlockButton.textContent = "Start Unlock Timer";
  unlockButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "startUnlock",
      domain: window.location.hostname,
    });
    unlockButton.disabled = true;
    unlockButton.textContent = "Unlocking...";
  });

  contentBox.appendChild(lockIcon);
  contentBox.appendChild(title);
  contentBox.appendChild(message);
  contentBox.appendChild(timerDisplay);
  contentBox.appendChild(unlockButton);

  lockOverlay.appendChild(contentBox);
  document.body.appendChild(lockOverlay);

  // Prevent scrolling of the background
  document.body.style.overflow = "hidden";

  // Update timer if there's a countdown in progress
  if (remainingTime && remainingTime > 0) {
    updateTimer(remainingTime);
    unlockButton.disabled = true;
    unlockButton.textContent = "Unlocking...";
  } else {
    timerDisplay.textContent = "";
  }
}

// Remove the lock screen
function removeLockScreen() {
  if (lockOverlay && lockOverlay.parentNode) {
    lockOverlay.parentNode.removeChild(lockOverlay);
    lockOverlay = null;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Restore scrolling
  document.body.style.overflow = "";
}

// Update the timer display
function updateTimer(remainingTime) {
  if (!lockOverlay) return;

  const timerDisplay = document.getElementById("focus-lock-timer");
  if (!timerDisplay) return;

  // Format remaining time
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);
  timerDisplay.textContent = `Unlocking in: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// Function to stop all media playback
function stopAllMediaPlayback() {
  // Stop HTML5 videos
  document.querySelectorAll('video, audio').forEach(media => {
    try {
      media.pause();
      media.currentTime = 0;
    } catch (e) {
      // Ignore errors if media can't be paused
    }
  });

  // Stop YouTube iframes
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      // Try to pause YouTube videos
      if (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be')) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    } catch (e) {
      // Ignore errors if iframe can't be accessed
    }
  });
} 