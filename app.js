/**
 * IT Department Nigeria (itdepartment.ng)
 * Minimalist B2B Interactive Script:
 * 1. Full-Screen Homepage Hero Image Slider (auto-play + dots + prev/next arrows)
 * 2. FAQ Accordion
 * 3. Pilot Request Form feedback
 * 4. Dedicated Quote Calculator Page (calculator.html)
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Homepage Full-Screen Hero Slider
  // ---------------------------------------------------------------------------
  const bgSlides = document.querySelectorAll('.hero-slide-bg');
  const panelSlides = document.querySelectorAll('.hero-slide-panel');
  const dotBtns = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');

  if (bgSlides.length > 0 && panelSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = panelSlides.length;
    let autoPlayTimer = null;

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;

      bgSlides.forEach((bg, idx) => {
        bg.classList.toggle('active', idx === currentSlide);
      });
      panelSlides.forEach((panel, idx) => {
        panel.classList.toggle('active', idx === currentSlide);
      });
      dotBtns.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 6000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    dotBtns.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-slide-to'), 10) || 0;
        goToSlide(target);
        startAutoPlay();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        startAutoPlay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        startAutoPlay();
      });
    }

    startAutoPlay();
  }

  // ---------------------------------------------------------------------------
  // 2. FAQ Accordion
  // ---------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('#faqAccordion .faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach((other) => other.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Homepage Pilot Booking Form -> Google Sheets + CRM Lead Capture
  // ---------------------------------------------------------------------------
  // Paste your Google Apps Script Web App URL here (or in index.html data-google-sheet-url)
  const GOOGLE_SHEET_WEB_APP_URL = '';

  const pilotForm = document.getElementById('pilotForm');
  const pilotSuccessMsg = document.getElementById('pilotSuccessMsg');
  const pilotSubmitBtn = document.getElementById('pilotSubmitBtn');

  if (pilotForm) {
    pilotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (document.getElementById('pName')?.value || '').trim();
      const role = (document.getElementById('pRole')?.value || '').trim();
      const company = (document.getElementById('pCompany')?.value || '').trim();
      const contact = (document.getElementById('pContact')?.value || '').trim();
      const pcs = (document.getElementById('pPcs')?.value || '20').trim();

      const payload = {
        timestamp: new Date().toISOString(),
        full_name: name,
        role: role,
        company_name: company,
        contact: contact,
        staff_pcs: Number(pcs) || 20,
        source: window.location.href,
      };

      const sheetUrl =
        pilotForm.getAttribute('data-google-sheet-url') || GOOGLE_SHEET_WEB_APP_URL;
      const crmPilotUrl =
        pilotForm.getAttribute('data-crm-pilot-url') ||
        'https://itdepartment-crm.vercel.app/api/crm/pilot-leads';

      if (pilotSubmitBtn) {
        pilotSubmitBtn.disabled = true;
        pilotSubmitBtn.textContent = 'Sending...';
      }

      const requests = [];

      // 1. Google Sheet (Apps Script). no-cors means we can't read the reply,
      //    but a resolved fetch means the request reached Google.
      if (sheetUrl) {
        requests.push(
          fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
          }).then(() => 'sheet')
        );
      }

      // 2. CRM Pilot Leads API: only counts as success on a 2xx response.
      if (crmPilotUrl) {
        requests.push(
          fetch(crmPilotUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then((res) => {
            if (!res.ok) throw new Error('CRM returned ' + res.status);
            return 'crm';
          })
        );
      }

      const results = await Promise.allSettled(requests);
      const delivered = results.some((r) => r.status === 'fulfilled');

      if (pilotSubmitBtn) {
        pilotSubmitBtn.disabled = false;
        pilotSubmitBtn.innerHTML = 'Book My Free Trial &rarr;';
      }

      if (pilotSuccessMsg) {
        pilotSuccessMsg.style.display = 'block';
        pilotSuccessMsg.textContent = '';
        const strong = document.createElement('strong');
        if (delivered) {
          pilotSuccessMsg.style.borderLeftColor = 'var(--green)';
          strong.textContent = `Thank you, ${name}. `;
          pilotSuccessMsg.append(
            strong,
            `We've received your free trial request for ${company}. We'll contact you within 2 business hours.`
          );
        } else {
          pilotSuccessMsg.style.borderLeftColor = '#b42318';
          strong.textContent = "Sorry, we couldn't send your request. ";
          const mail = document.createElement('a');
          mail.href =
            'mailto:hello@itdepartment.ng?subject=' +
            encodeURIComponent('Free trial request: ' + company) +
            '&body=' +
            encodeURIComponent(
              `Name: ${name}\nRole: ${role}\nCompany: ${company}\nContact: ${contact}\nComputers: ${pcs}`
            );
          mail.textContent = 'hello@itdepartment.ng';
          mail.style.textDecoration = 'underline';
          pilotSuccessMsg.append(
            strong,
            'Please check your internet connection and try again, or email us at ',
            mail,
            '.'
          );
        }
      }

      // Only clear the form when the request actually went through
      if (delivered) pilotForm.reset();
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Dedicated Quote Calculator Page (calculator.html)
  // ---------------------------------------------------------------------------
  const pcSlider = document.getElementById('pcSlider');
  if (pcSlider) {
    const pcCountLabel = document.getElementById('pcCountLabel');
    const quickPcBtns = document.querySelectorAll('.quick-pc-btn');
    const chkWeb = document.getElementById('chkWeb');
    const chkOnsite = document.getElementById('chkOnsite');
    const tagWeb = document.getElementById('tagWeb');
    const tagOnsite = document.getElementById('tagOnsite');
    const calcCompanyInput = document.getElementById('calcCompanyInput');
    const propCompanyHeader = document.getElementById('propCompanyHeader');
    const recommendedTierName = document.getElementById('recommendedTierName');
    const monthlyQuoteValue = document.getElementById('monthlyQuoteValue');
    const slaResponseBadge = document.getElementById('slaResponseBadge');
    const printQuoteBtn = document.getElementById('printQuoteBtn');

    function formatNaira(n) {
      return '\u20A6' + Math.round(n).toLocaleString('en-NG');
    }

    function updateCalculator() {
      const pcs = parseInt(pcSlider.value, 10) || 10;
      const includeWeb = chkWeb ? chkWeb.checked : true;
      const includeOnsite = chkOnsite ? chkOnsite.checked : true;

      if (pcCountLabel) pcCountLabel.textContent = pcs + (pcs === 1 ? ' computer' : ' computers');
      quickPcBtns.forEach((btn) => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-pcs'), 10) === pcs);
      });

      if (tagWeb) tagWeb.textContent = includeWeb ? 'INCLUDED' : 'NOT INCLUDED';
      if (tagOnsite) tagOnsite.textContent = includeOnsite ? 'INCLUDED' : 'ONLINE HELP ONLY';

      let monthly = 350000;
      let tier = 'YOUR PLAN: SMALL OFFICE (UP TO 10 COMPUTERS)';
      let isCustom = false;

      if (pcs <= 10) {
        monthly = 350000;
        tier = 'YOUR PLAN: SMALL OFFICE (UP TO 10 COMPUTERS)';
      } else if (pcs <= 20) {
        monthly = 600000;
        tier = 'YOUR PLAN: GROWING OFFICE (11–20 COMPUTERS)';
      } else {
        isCustom = true;
        tier = 'YOUR PLAN: LARGE OR MULTI-BRANCH (21+ COMPUTERS)';
      }

      if (!includeWeb) monthly -= 35000;
      if (!includeOnsite) monthly -= 40000;
      monthly = Math.max(280000, monthly);

      if (recommendedTierName) recommendedTierName.textContent = tier;
      if (monthlyQuoteValue) {
        if (isCustom) {
          monthlyQuoteValue.innerHTML =
            "Let's Talk <span style=\"font-size: 1rem; font-weight: 300;\">(custom quote)</span>";
        } else {
          monthlyQuoteValue.innerHTML =
            formatNaira(monthly) + '<span style="font-size: 1rem; font-weight: 300;"> / month</span>';
        }
      }
      if (slaResponseBadge) {
        slaResponseBadge.textContent =
          `Covers ${pcs} ${pcs === 1 ? 'computer' : 'computers'} • Help within 15 minutes • ` +
          (includeOnsite ? 'Office visits • ' : 'Online help only • ') +
          (includeWeb ? 'Website care' : 'No website care');
      }
      if (propCompanyHeader && calcCompanyInput) {
        const comp = calcCompanyInput.value.trim();
        propCompanyHeader.textContent = comp
          ? 'Prepared for: ' + comp
          : 'Prepared for: Management, HR & Operations';
      }
    }

    pcSlider.addEventListener('input', updateCalculator);
    quickPcBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        pcSlider.value = btn.getAttribute('data-pcs') || '20';
        updateCalculator();
      });
    });
    if (chkWeb) chkWeb.addEventListener('change', updateCalculator);
    if (chkOnsite) chkOnsite.addEventListener('change', updateCalculator);
    if (calcCompanyInput) calcCompanyInput.addEventListener('input', updateCalculator);
    if (printQuoteBtn) {
      printQuoteBtn.addEventListener('click', () => window.print());
    }

    updateCalculator();
  }
})();
