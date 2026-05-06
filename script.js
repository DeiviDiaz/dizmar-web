/* ============================================
   DIZMAR — script.js
   1. Scroll suave con offset del header fijo
   2. Animaciones fade-in al hacer scroll (IntersectionObserver)
   3. Botones de WhatsApp con mensaje dinámico por producto
   ============================================ */

'use strict';

/* ─────────────────────────────────────────────
   CONFIG GLOBAL
   Cambia el número por el de DIZMAR (sin +, sin espacios)
   Ejemplo Colombia: 573001234567
───────────────────────────────────────────── */
const WHATSAPP_NUMBER = '573001234567';
const WHATSAPP_ICON   = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  width="18" height="18" fill="currentColor" aria-hidden="true">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
    -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463
    -2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134
    -.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
    -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371
    -.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462
    1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489
    1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248
    -.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.057 23.428
    a.75.75 0 0 0 .916.925l5.668-1.479A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373
    12-12S18.627 0 12 0zm0 21.75a9.73 9.73 0 0 1-4.965-1.355l-.356-.212-3.693.964
    .984-3.594-.232-.37A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25
    S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
</svg>`;

/* ─────────────────────────────────────────────
   1. SCROLL SUAVE CON OFFSET DEL HEADER FIJO
───────────────────────────────────────────── */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const header   = document.querySelector('header');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Actualiza la URL sin saltar
      history.pushState(null, '', targetId);
    });
  });
}

/* ─────────────────────────────────────────────
   2. HIGHLIGHT DE NAV SEGÚN SECCIÓN VISIBLE
───────────────────────────────────────────── */
function initNavHighlight() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  const header    = document.querySelector('header');

  if (!sections.length || !navLinks.length) return;

  const setActive = id => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, {
    rootMargin: `-${(header?.offsetHeight || 70) + 20}px 0px -60% 0px`,
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}

/* ─────────────────────────────────────────────
   3. ANIMACIONES FADE-IN AL SCROLL
   Agrega clase .visible cuando el elemento entra
   en el viewport; el CSS hace el resto.
───────────────────────────────────────────── */
function initScrollAnimations() {
  // Elementos que se animarán
  const targets = document.querySelectorAll(
    '.product-card, section h2, section > p, .hero-content, address, form'
  );

  targets.forEach(el => el.classList.add('fade-target'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animar solo una vez
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  targets.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   4. BOTONES DE WHATSAPP CON MENSAJE DINÁMICO
───────────────────────────────────────────── */

/**
 * Genera la URL de WhatsApp con el mensaje codificado.
 * @param {string} productName - Nombre del producto
 * @returns {string} URL lista para usar en href
 */
function buildWhatsAppURL(productName) {
  const message = `Hola, estoy interesado en ${productName}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Crea el elemento <a> del botón de WhatsApp.
 * @param {string} productName
 * @returns {HTMLAnchorElement}
 */
function createWhatsAppButton(productName) {
  const btn = document.createElement('a');
  btn.href      = buildWhatsAppURL(productName);
  btn.target    = '_blank';
  btn.rel       = 'noopener noreferrer';
  btn.className = 'btn-whatsapp';
  btn.setAttribute('aria-label', `Consultar por WhatsApp: ${productName}`);
  btn.innerHTML = `${WHATSAPP_ICON}<span>Consultar por WhatsApp</span>`;
  return btn;
}

/**
 * Recorre todas las cards de producto e inyecta el botón.
 */
function initWhatsAppButtons() {
  const cards = document.querySelectorAll('.product-card');

  cards.forEach(card => {
    const titleEl = card.querySelector('h3');
    if (!titleEl) return;

    const productName = titleEl.textContent.trim();
    const btn         = createWhatsAppButton(productName);

    card.appendChild(btn);
  });
}

/* ─────────────────────────────────────────────
   5. HEADER SCROLL SHADOW
   Añade sombra al header cuando el usuario baja
───────────────────────────────────────────── */
function initHeaderShadow() {
  const header = document.querySelector('header');
  if (!header) return;

  const toggle = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle(); // estado inicial
}

/* ─────────────────────────────────────────────
   6. VALIDACIÓN Y FEEDBACK DEL FORMULARIO
───────────────────────────────────────────── */
function initFormFeedback() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn    = form.querySelector('button[type="submit"]');
    const nombre = form.querySelector('#nombre')?.value.trim();

    // Estado de carga
    const originalText = btn.innerHTML;
    btn.disabled   = true;
    btn.innerHTML  = 'Enviando…';
    btn.classList.add('btn-loading');

    // Simulación de envío (2 s)
    setTimeout(() => {
      btn.innerHTML = '✓ Mensaje enviado';
      btn.classList.remove('btn-loading');
      btn.classList.add('btn-success');

      showToast(`¡Gracias${nombre ? ', ' + nombre : ''}! Te contactaremos pronto.`);

      setTimeout(() => {
        btn.disabled  = false;
        btn.innerHTML = originalText;
        btn.classList.remove('btn-success');
        form.reset();
      }, 3000);
    }, 2000);
  });
}

/* ─────────────────────────────────────────────
   UTILIDAD: TOAST DE NOTIFICACIÓN
───────────────────────────────────────────── */
function showToast(message) {
  // Eliminar toast previo si existe
  document.querySelector('.dizmar-toast')?.remove();

  const toast = document.createElement('div');
  toast.className   = 'dizmar-toast';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  document.body.appendChild(toast);

  // Mostrar
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
  });

  // Ocultar a los 4 s
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}

/* ─────────────────────────────────────────────
   INIT — esperar al DOM listo
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initNavHighlight();
  initScrollAnimations();
  initWhatsAppButtons();
  initHeaderShadow();
  initFormFeedback();
});