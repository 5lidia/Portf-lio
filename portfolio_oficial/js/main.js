/* =========================================================
   PORTFÓLIO – main.js
   Saudação, ano automático, modo claro/escuro, menu e formulário.
   ========================================================= */

/* EDITE AQUI: e-mail que receberá as mensagens do formulário */
const EMAIL = "seuemail@exemplo.com";

/* ---------- localStorage seguro ---------- */
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignora */ } }
};

/* ---------- Ano no rodapé ---------- */
document.getElementById("ano").textContent = new Date().getFullYear();

/* ---------- Saudação ---------- */
const hora = new Date().getHours();
document.getElementById("saudacao").textContent =
  hora >= 5 && hora < 12 ? "Bom dia" : hora >= 12 && hora < 18 ? "Boa tarde" : "Boa noite";

/* ---------- Modo claro / escuro ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function applyTheme(theme) {
  const dark = theme === "dark";
  root.setAttribute("data-theme", theme);
  themeBtn.setAttribute("aria-pressed", String(dark));
  themeBtn.setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
  themeIcon.textContent = dark ? "☀️" : "🌙";
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(storage.get("tema") || (prefersDark ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  storage.set("tema", next);
});

/* ---------- Menu hambúrguer ---------- */
const menuBtn = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

function setMenu(open) {
  menu.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("open")) {
    setMenu(false);
    menuBtn.focus();
  }
});
window.matchMedia("(max-width: 760px)").addEventListener("change", (e) => { if (!e.matches) setMenu(false); });

/* ---------- Formulário ---------- */
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

const rules = {
  nome: (v) => (v.trim().length >= 2 ? "" : "Informe seu nome (mínimo 2 letras)."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Digite um e-mail válido, como nome@exemplo.com."),
  mensagem: (v) => (v.trim().length >= 10 ? "" : "Escreva uma mensagem com pelo menos 10 caracteres."),
  consentimento: (_, el) => (el.checked ? "" : "Para enviar, é necessário concordar com o uso dos dados.")
};

function validateField(el) {
  const msg = rules[el.name](el.value, el);
  document.getElementById(`erro-${el.name}`).textContent = msg;
  if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
  return !msg;
}

const fields = [...form.querySelectorAll("input, textarea")];
fields.forEach((el) => {
  el.addEventListener("blur", () => validateField(el));
  el.addEventListener("input", () => { if (el.hasAttribute("aria-invalid")) validateField(el); });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.style.color = "";

  const results = fields.map((el) => ({ el, ok: validateField(el) }));
  const firstInvalid = results.find((r) => !r.ok);
  if (firstInvalid) {
    firstInvalid.el.focus();
    statusEl.textContent = "Corrija os campos destacados para continuar.";
    statusEl.style.color = "#b00020";
    return;
  }

  // Nada é guardado nem enviado a servidor: abrimos o app de e-mail com a mensagem pronta.
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const mensagem = form.mensagem.value.trim();
  const assunto = encodeURIComponent(`Contato pelo portfólio – ${nome}`);
  const corpo = encodeURIComponent(`${mensagem}\n\n— ${nome} (${email})`);
  window.location.href = `mailto:${EMAIL}?subject=${assunto}&body=${corpo}`;

  statusEl.textContent = "Tudo certo! Seu aplicativo de e-mail foi aberto com a mensagem pronta.";
  form.reset();
});
