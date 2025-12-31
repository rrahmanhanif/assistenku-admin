const KEY = "assistenku_admin_ui_logged_in";

export function setUiLoggedIn(value) {
  if (value) localStorage.setItem(KEY, "1");
  else localStorage.removeItem(KEY);
}

export function isUiLoggedIn() {
  return localStorage.getItem(KEY) === "1";
}
