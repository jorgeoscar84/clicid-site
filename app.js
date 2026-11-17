/**
 * Clic ID — interacciones del sitio
 * Sin dependencias. Todo el contenido crítico ya está en el HTML (SSR),
 * este archivo sólo mejora la experiencia.
 */
(function () {
  'use strict';

  var CONFIG = {
    whatsappNumber: '593980359264',
    annualReference: 28.0,
    // Precios finales (IVA incluido) de Persona Natural por años de vigencia
    planPrices: { 1: 18.2, 2: 22.2, 3: 33.28, 4: 44.36, 5: 55.41 }
  };

  function waUrl(message) {
    return 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message);
  }

  function formatUSD(value) {
    return '$' + value.toFixed(2);
  }

  /* ---------------- Navegación ---------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navPanel = document.getElementById('navPanel');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
    });

    if (navPanel) {
      navPanel.addEventListener('click', function (event) {
        if (event.target.closest('a, button')) {
          nav.setAttribute('data-open', 'false');
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.setAttribute('aria-label', 'Abrir menú');
        }
      });
    }
  }

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Pestañas de precios ---------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[role="tab"]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.plan-grid[role="tabpanel"]'));

  function activateTab(tab, focus) {
    if (!tab) return;
    var targetId = tab.getAttribute('aria-controls');

    tabs.forEach(function (item) {
      var isActive = item === tab;
      item.setAttribute('aria-selected', String(isActive));
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach(function (panel) {
      if (panel.id === targetId) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      activateTab(tab, false);
    });

    tab.addEventListener('keydown', function (event) {
      var key = event.key;
      var next = null;

      if (key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      else if (key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (key === 'Home') next = tabs[0];
      else if (key === 'End') next = tabs[tabs.length - 1];

      if (next) {
        event.preventDefault();
        activateTab(next, true);
      }
    });
  });

  /* ---------------- Calculadora de ahorro ---------------- */
  var slider = document.getElementById('yearsSlider');
  var yearsLabel = document.getElementById('sliderYearsVal');
  var savingsEl = document.getElementById('calcSavings');
  var detailEl = document.getElementById('calcDetail');
  var calcWa = document.getElementById('calcWaBtn');

  function updateCalculator() {
    if (!slider) return;

    var years = parseInt(slider.value, 10) || 2;
    var price = CONFIG.planPrices[years] || CONFIG.planPrices[2];
    var renewing = CONFIG.annualReference * years;
    var savings = renewing - price;

    if (yearsLabel) yearsLabel.textContent = years + (years === 1 ? ' año' : ' años');
    if (savingsEl) savingsEl.textContent = formatUSD(savings);
    if (detailEl) {
      detailEl.textContent =
        'Pagas ' + formatUSD(price) + ' en vez de ' + formatUSD(renewing) + ' renovando cada año.';
    }
    if (calcWa) {
      calcWa.href = waUrl(
        'Hola, me interesa la firma electrónica de ' + years + (years === 1 ? ' año' : ' años')
      );
    }
    slider.setAttribute('aria-valuenow', String(years));
  }

  if (slider) {
    slider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  /* ---------------- Formulario express ---------------- */
  var dialog = document.getElementById('expressForm');
  var form = document.getElementById('expressFormEl');
  var closeBtn = document.getElementById('expressClose');
  var planSelect = document.getElementById('efPlan');

  function openForm(plan) {
    if (!dialog) return;
    if (planSelect && plan) {
      var options = Array.prototype.slice.call(planSelect.options);
      var match = options.filter(function (option) {
        return option.textContent.trim().indexOf(plan) !== -1;
      })[0];
      if (match) planSelect.value = match.value;
    }
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    var first = dialog.querySelector('input, select');
    if (first) {
      window.setTimeout(function () {
        first.focus();
      }, 40);
    }
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-open-form]');
    if (trigger) {
      event.preventDefault();
      openForm(trigger.getAttribute('data-plan') || '');
    }
  });

  if (closeBtn && dialog) {
    closeBtn.addEventListener('click', function () {
      dialog.close();
    });
  }

  if (dialog) {
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var lines = [
        'Hola Clic ID, quiero tramitar mi firma electrónica.',
        'Plan: ' + (data.get('plan') || 'por definir'),
        'Nombre: ' + (data.get('nombre') || ''),
        'Cédula / RUC: ' + (data.get('documento') || ''),
        'WhatsApp: ' + (data.get('whatsapp') || '')
      ];
      var tramite = data.get('tramite');
      if (tramite) lines.push('Trámite: ' + tramite);

      window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
      if (dialog) dialog.close();
    });
  }
})();
