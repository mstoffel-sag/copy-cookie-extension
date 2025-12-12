document.addEventListener("DOMContentLoaded", async () => {
  const loadingEl = document.getElementById("loading");
  const contentEl = document.getElementById("content");
  const noCookiesEl = document.getElementById("no-cookies");
  const cookiesListEl = document.getElementById("cookies-list");
  const statusMsg = document.getElementById("status-message");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = new URL(tab.url);
    const domain = url.hostname;

    // Get all cookies for the current domain
    const cookies = await chrome.cookies.getAll({ domain });

    loadingEl.style.display = "none";
    contentEl.style.display = "block";

    if (cookies.length === 0) {
      noCookiesEl.style.display = "block";
      return;
    }

    noCookiesEl.style.display = "none";

    // Display cookies
    cookiesListEl.innerHTML =
      "<h2>Available Cookies</h2>" +
      '<div class="cookies-grid">' +
      cookies
        .map(
          (cookie, index) => `
                <div class="cookie-item" data-index="${index}" data-value="${escapeHtml(
            cookie.value
          )}" title="${escapeHtml(cookie.value)}">
                    <div class="cookie-name">${escapeHtml(cookie.name)}</div>
                    <div class="cookie-value">
                        ${escapeHtml(truncate(cookie.value, 100))}
                    </div>
                </div>
            `
        )
        .join("") +
      "</div>";

    // Click on cookie to copy
    document.querySelectorAll(".cookie-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const value = item.getAttribute("data-value");
        try {
          await navigator.clipboard.writeText(value);
          showStatus(`Copied: ${truncate(value, 40)}`, "success");
        } catch (err) {
          showStatus("Failed to copy to clipboard", "error");
        }
      });
    });
  } catch (error) {
    loadingEl.style.display = "none";
    contentEl.style.display = "block";
    contentEl.innerHTML = `<div class="error">Error: ${escapeHtml(
      error.message
    )}</div>`;
  }

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = `status-message status-${type}`;
    statusMsg.style.display = "block";
    setTimeout(() => {
      statusMsg.style.display = "none";
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function truncate(str, length) {
    return str.length > length ? str.substring(0, length) + "..." : str;
  }
});
