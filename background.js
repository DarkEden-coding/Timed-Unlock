// Store locked domains and their unlock times
let lockedDomains = {};
let unlockTimers = {};
let unlockDurations = {};

// Default unlock duration (in milliseconds)
const DEFAULT_UNLOCK_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize from storage
chrome.storage.local.get(
  ["lockedDomains", "unlockTimers", "unlockDurations"],
  (result) => {
    if (result.lockedDomains) lockedDomains = result.lockedDomains;
    if (result.unlockTimers) unlockTimers = result.unlockTimers;
    if (result.unlockDurations) unlockDurations = result.unlockDurations;
  }
);

// Listen for activation from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "lock") {
    lockCurrentSite(
      request.domain,
      request.unlockDuration || DEFAULT_UNLOCK_DURATION
    );
    sendResponse({ success: true });
  } else if (request.action === "startUnlock") {
    startUnlockTimer(request.domain);
    sendResponse({ success: true });
  } else if (request.action === "checkStatus") {
    const domain = request.domain;
    sendResponse({
      isLocked: domain in lockedDomains,
      unlockTimerActive: domain in unlockTimers,
      remainingTime: getRemainingTime(domain),
      unlockDuration: unlockDurations[domain] || DEFAULT_UNLOCK_DURATION,
    });
  } else if (request.action === "updateUnlockDuration") {
    updateUnlockDuration(request.domain, request.duration);
    sendResponse({ success: true });
  }
  return true; // Required for async sendResponse
});

// Lock a website
function lockCurrentSite(domain, duration) {
  lockedDomains[domain] = true;
  unlockDurations[domain] = duration;

  // Save to storage
  chrome.storage.local.set({
    lockedDomains: lockedDomains,
    unlockDurations: unlockDurations,
  });

  // Get all tabs with this domain and reload them
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      try {
        const tabDomain = new URL(tab.url).hostname;
        if (tabDomain === domain) {
          // First notify the content script to prepare for reload
          chrome.tabs.sendMessage(tab.id, { action: "prepareLock" }, (response) => {
            // After content script confirms it's ready, reload the tab
            chrome.tabs.reload(tab.id);
          });
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
  });
}

// Start the unlock timer for a domain
function startUnlockTimer(domain) {
  if (unlockTimers[domain]) {
    clearTimeout(unlockTimers[domain].timer);
  }

  const duration = unlockDurations[domain] || DEFAULT_UNLOCK_DURATION;
  const endTime = Date.now() + duration;

  unlockTimers[domain] = {
    endTime: endTime,
    timer: setTimeout(() => {
      unlockSite(domain);
    }, duration),
  };

  // Save to storage
  chrome.storage.local.set({
    unlockTimers: unlockTimers,
  });

  // Update all tabs with unlock progress
  const updateInterval = setInterval(() => {
    const remaining = getRemainingTime(domain);
    if (remaining <= 0) {
      clearInterval(updateInterval);
      return;
    }
    notifyAllTabs(domain, "updateTimer", { remainingTime: remaining });
  }, 1000);
}

// Unlock a website
function unlockSite(domain) {
  delete lockedDomains[domain];
  delete unlockTimers[domain];

  // Save to storage
  chrome.storage.local.set({
    lockedDomains: lockedDomains,
    unlockTimers: unlockTimers,
  });

  // Notify all tabs with this domain to remove the lock screen
  notifyAllTabs(domain, "removeLock");
}

// Update unlock duration for a domain
function updateUnlockDuration(domain, duration) {
  unlockDurations[domain] = duration;
  chrome.storage.local.set({
    unlockDurations: unlockDurations,
  });
}

// Get remaining time for unlock
function getRemainingTime(domain) {
  if (!unlockTimers[domain]) return 0;
  const remaining = unlockTimers[domain].endTime - Date.now();
  return Math.max(0, remaining);
}

// Notify all tabs with the given domain
function notifyAllTabs(domain, action, data = {}) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      try {
        const tabDomain = new URL(tab.url).hostname;
        if (tabDomain === domain) {
          chrome.tabs.sendMessage(tab.id, {
            action: action,
            ...data,
          });
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
  });
}

// Check tabs when they are updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      const domain = new URL(tab.url).hostname;
      if (domain in lockedDomains) {
        chrome.tabs.sendMessage(tabId, {
          action: "showLock",
          remainingTime: getRemainingTime(domain),
        });
      }
    } catch (e) {
      // Skip invalid URLs
    }
  }
}); 