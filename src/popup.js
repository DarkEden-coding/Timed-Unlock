document.addEventListener("DOMContentLoaded", function () {
  const lockSiteBtn = document.getElementById("lock-site");
  const startUnlockBtn = document.getElementById("start-unlock");
  const unlockDurationInput = document.getElementById("unlock-duration");
  const saveSettingsBtn = document.getElementById("save-settings");
  const currentSiteElem = document.getElementById("current-site");
  const lockStatusElem = document.getElementById("lock-status");
  const timerDisplayElem = document.getElementById("timer-display");
  const unlockTimerControl = document.getElementById("unlock-timer-control");
  const lockControl = document.getElementById("lock-control");

  let currentDomain = "";
  let timerInterval;

  // Get current tab info
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        currentDomain = url.hostname;
        currentSiteElem.textContent = `Current site: ${currentDomain}`;

        // Check lock status
        checkLockStatus();
      } catch (e) {
        currentSiteElem.textContent = "Unable to determine current site";
        lockSiteBtn.disabled = true;
      }
    }
  });

  // Lock site button click
  lockSiteBtn.addEventListener("click", function () {
    const duration = parseInt(unlockDurationInput.value) * 60 * 1000; // Convert to ms

    chrome.runtime.sendMessage(
      {
        action: "lock",
        domain: currentDomain,
        unlockDuration: duration,
      },
      (response) => {
        if (response.success) {
          checkLockStatus();
        }
      }
    );
  });

  // Start unlock button click
  startUnlockBtn.addEventListener("click", function () {
    chrome.runtime.sendMessage(
      {
        action: "startUnlock",
        domain: currentDomain,
      },
      (response) => {
        if (response.success) {
          startUnlockBtn.disabled = true;
          checkLockStatus();
        }
      }
    );
  });

  // Save settings button click
  saveSettingsBtn.addEventListener("click", function () {
    const duration = parseInt(unlockDurationInput.value) * 60 * 1000; // Convert to ms

    chrome.runtime.sendMessage(
      {
        action: "updateUnlockDuration",
        domain: currentDomain,
        duration: duration,
      },
      (response) => {
        if (response.success) {
          showMessage("Settings saved!");
        }
      }
    );
  });

  // Check lock status and update UI
  function checkLockStatus() {
    chrome.runtime.sendMessage(
      {
        action: "checkStatus",
        domain: currentDomain,
      },
      (response) => {
        updateUI(response);
      }
    );
  }

  // Update UI based on lock status
  function updateUI(status) {
    if (status.isLocked) {
      lockStatusElem.textContent = "Status: Locked";
      lockControl.classList.add("hidden");
      unlockTimerControl.classList.remove("hidden");

      if (status.unlockTimerActive) {
        startUnlockBtn.disabled = true;
        timerDisplayElem.classList.remove("hidden");
        updateTimerDisplay(status.remainingTime);

        // Set interval to update timer
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
          checkLockStatus();
        }, 1000);
      } else {
        startUnlockBtn.disabled = false;
        timerDisplayElem.classList.add("hidden");
      }
    } else {
      lockStatusElem.textContent = "Status: Unlocked";
      lockControl.classList.remove("hidden");
      unlockTimerControl.classList.add("hidden");
      timerDisplayElem.classList.add("hidden");
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    // Update unlock duration input from saved setting
    if (status.unlockDuration) {
      unlockDurationInput.value = Math.floor(status.unlockDuration / 60000);
    }
  }

  // Update timer display
  function updateTimerDisplay(remainingTime) {
    if (remainingTime <= 0) {
      timerDisplayElem.classList.add("hidden");
      return;
    }

    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    timerDisplayElem.textContent = `Unlocking in: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Show a message to the user
  function showMessage(msg) {
    const messageElem = document.createElement("div");
    messageElem.className = "message";
    messageElem.textContent = msg;
    document.body.appendChild(messageElem);

    setTimeout(() => {
      messageElem.classList.add("hide");
      setTimeout(() => messageElem.remove(), 500);
    }, 2000);
  }
}); 