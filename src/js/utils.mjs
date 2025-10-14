// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localstorage
export function getLocalStorage(key) {
  const data = localStorage.getItem(key);
  if (!data) return [];
  const parsed = JSON.parse(data);
  return Array.isArray(parsed) ? parsed : [parsed];
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}


// Fetch and return template HTML
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load template: ${path}`);
  return res.text();
}

// Render template into target element
export function renderWithTemplate(template, target) {
  if (!target) return;
  target.innerHTML = template;
}
// Add a function to the utils.mjs named loadHeaderFooter
export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const headerDisplay = document.querySelector("#main-header");
  renderWithTemplate(headerTemplate, headerDisplay);
  const footerTemplate = await loadTemplate("/partials/footer.html");
  const footerDisplay = document.querySelector("#main-footer");
  renderWithTemplate(footerTemplate, footerDisplay);
}
