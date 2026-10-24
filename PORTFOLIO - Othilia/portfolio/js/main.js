/* =========================================================
   PORTFÓLIO – main.js
   Funcionalidades: menu hambúrguer, saudação dinâmica,
   modo claro/escuro, validação do formulário e ano automático.
   ========================================================= */

/* ---------- EDITE AQUI: seus dados ---------- */
const CONFIG = {
  nome: "Seu Nome",                 // aparece no logo, título, saudação e rodapé
  email: "seuemail@exemplo.com"     // e-mail que receberá as mensagens do formulário
};

document.documentElement.classList.add("js");

/* ---------- Utilitário: localStorage seguro ---------- */
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignora */ } }
};

/* ---------- 1. Nome nos lugares marcados com data-nome ---------- */
document.querySelectorAll("[data-nome]").forEach((el) => { el.textContent = CONFIG.nome; });
document.title = `${CONFIG.nome} | Portfólio`;
document.querySelector(".logo")?.setAttribute("aria-label", `${CONFIG.nome} – ir para o início`);

/* ---------- 2. Ano automático no rodapé ---------- */
const anoEl = document.getElementById("ano");
if (anoEl) anoEl.textContent = new Date().getFullYear();

/* ---------- 3. Saudação dinâmica ---------- */
const saudacaoEl = document.getElementById("saudacao");
if (saudacaoEl) {
  const hora = new Date().getHours();
  saudacaoEl.textContent =
    hora >= 5 && hora < 12 ? "Bom dia" :
    hora >= 12 && hora < 18 ? "Boa tarde" : "Boa noite";
}

/* ---------- 4. Modo claro / escuro ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  const dark = theme === "dark";
  themeBtn.setAttribute("aria-pressed", String(dark));
  themeBtn.setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
  themeIcon.textContent = dark ? "☀️" : "🌙";
}

const savedTheme = storage.get("tema");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  storage.set("tema", next);
});

/* ---------- 5. Menu hambúrguer ---------- */
const menuBtn = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
const mobileQuery = window.matchMedia("(max-width: 760px)");

function setMenu(open) {
  menu.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

// No mobile o menu fechado fica oculto também para leitores de tela/teclado (via visibility no CSS).
menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("open")) {
    setMenu(false);
    menuBtn.focus();
  }
});
mobileQuery.addEventListener("change", (e) => { if (!e.matches) setMenu(false); });

/* ---------- 6. Link ativo no menu conforme a rolagem ---------- */
const navLinks = [...document.querySelectorAll(".nav-list a:not(.pill)")];
if ("IntersectionObserver" in window) {
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) => {
          const active = a.getAttribute("href") === `#${entry.target.id}`;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));
}

/* ---------- 7. Animação de entrada ao rolar ---------- */
const revealTargets = document.querySelectorAll(
  ".about__text, .about__card, .stickers, .skill-card, .project, .contact__intro, .form"
);
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

/* ---------- 8. Validação do formulário ---------- */
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

const rules = {
  nome: (v) => {
    if (!v.trim()) return "Informe seu nome.";
    if (v.trim().length < 2) return "O nome precisa ter pelo menos 2 caracteres.";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Digite um e-mail válido, como nome@exemplo.com.";
    return "";
  },
  mensagem: (v) => {
    if (!v.trim()) return "Escreva sua mensagem.";
    if (v.trim().length < 10) return "A mensagem precisa ter pelo menos 10 caracteres.";
    return "";
  },
  consentimento: (_, el) => (el.checked ? "" : "Para enviar, é necessário concordar com o uso dos dados.")
};

function validateField(el) {
  const msg = rules[el.name](el.value, el);
  const errorEl = document.getElementById(`erro-${el.name}`);
  errorEl.textContent = msg;
  if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
  return !msg;
}

const fields = [...form.querySelectorAll("input, textarea")];
fields.forEach((el) => {
  el.addEventListener("blur", () => validateField(el));
  el.addEventListener("input", () => { if (el.getAttribute("aria-invalid")) validateField(el); });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  const results = fields.map((el) => ({ el, ok: validateField(el) }));
  const firstInvalid = results.find((r) => !r.ok);
  if (firstInvalid) {
    firstInvalid.el.focus();
    statusEl.textContent = "Corrija os campos destacados para continuar.";
    statusEl.style.color = "#b00020";
    return;
  }

  // Minimização de dados: nada é guardado nem enviado a servidor.
  // Abrimos o app de e-mail do visitante com a mensagem pronta.
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const mensagem = form.mensagem.value.trim();
  const assunto = encodeURIComponent(`Contato pelo portfólio – ${nome}`);
  const corpo = encodeURIComponent(`${mensagem}\n\n— ${nome} (${email})`);
  window.location.href = `mailto:${CONFIG.email}?subject=${assunto}&body=${corpo}`;

  statusEl.style.color = "";
  statusEl.textContent = "Tudo certo! Seu aplicativo de e-mail foi aberto com a mensagem pronta.";
  form.reset();
});
