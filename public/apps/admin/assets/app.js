import { logout } from "./auth.js";

function setActiveMenu() {
  const path = window.location.pathname.replace(/\/index\.html$/, "");
  document.querySelectorAll(".sidebar a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("/admin")) return;
    if (path === href || path === href.replace(/\/index\.html$/, "")) {
      link.classList.add("active");
    }
  });
}

function setupLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      btn.disabled = true;
      try {
        await logout();
      } finally {
        btn.disabled = false;
      }
    });
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (err) {
    console.warn("SW registration failed", err);
  }
}

export function initShell() {
  setActiveMenu();
  setupLogoutButtons();
  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", initShell);
