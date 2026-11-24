// Ziada Analysis - Free vs Gold Plan Guard Engine
(function () {
  const DEFAULT_CONFIG = {
    autoApproveFree: true,
    skipEmailVerifyForFree: true,
    freeUnlockAllTools: true,
    freeBlockVideoExport: true,
    freeBlockPdfExport: true,
    freeBlockImageExport: false,
    freeBlockAutoSave: false,
    freeBlockMentalTraining: true,
    freeBlockNeuroTrack: true,
    freeBlockQrRooms: true,
    freeBlockLiveCamera: true,
    maxTacticalClips: 3,
    maxIndividualEvents: 3,
    maxAnimFrames: 2,
    maxRefCases: 2,
    maxLiveClips: 2,
    whatsappNumber: '201027482686',
    goldOfferText: 'افتح التصدير بجودة Full HD، وتقارير PDF و Excel، والتدريب الذهني والـ QR والكاميرا المباشرة بلا حدود.'
  };

  // العروض والأسعار الخاصة بكل أداة (مفعّل حالياً للمدير الفني فقط)
  const PAGE_PROMOS = {
    head_coach: {
      toolName: 'استوديو المدير الفني',
      discountLabel: 'خصم 50%',
      oldPriceShort: '500 ج',
      newPriceShort: '250 ج',
      oldPriceFull: '500 جنيه',
      newPriceFull: '250 جنيه'
    }
  };

  function getPagePromo() {
    if (window.ZIADA_PAGE_PROMO) return window.ZIADA_PAGE_PROMO;
    const url = ((window.location.pathname || '') + ' ' + (window.location.href || '')).toLowerCase();
    for (const key in PAGE_PROMOS) {
      if (url.includes(key)) return PAGE_PROMOS[key];
    }
    if ((document.title || '').includes('المدير الفني')) return PAGE_PROMOS.head_coach;
    return null;
  }

  function getActiveUser() {
    try {
      return JSON.parse(localStorage.getItem('ziada_active_user') || 'null') || {};
    } catch (e) {
      return {};
    }
  }

  function getConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem('ziada_plan_config') || 'null');
      return Object.assign({}, DEFAULT_CONFIG, saved || {});
    } catch (e) {
      return Object.assign({}, DEFAULT_CONFIG);
    }
  }

  function isGold() {
    const u = getActiveUser();
    if (!u || !u.uid) return false;
    if (u.role === 'admin') return true;
    if (u.effectivePlan === 'gold') return true;
    if (u.effectivePlan === 'free') return false;
    if (u.plan === 'free') return false;
    if (u.subscriptionEnd && u.subscriptionEnd !== 'unlimited') {
      const today = new Date().toISOString().split('T')[0];
      if (today > u.subscriptionEnd) return false;
    }
    return u.plan === 'gold' || u.status === 'approved';
  }

  function buildWhatsappLink(reasonText) {
    const cfg = getConfig();
    const u = getActiveUser();
    const promo = getPagePromo();
    const phone = String(cfg.whatsappNumber || '201027482686').replace(/[^\d]/g, '');
    const promoLine = promo
      ? `العرض المطلوب: ${promo.toolName} (${promo.discountLabel}: ${promo.newPriceFull} بدلاً من ${promo.oldPriceFull})\n`
      : '';
    const msg =
      `مرحباً إدارة Ziada Analysis ⚽\n` +
      `أرغب في الترقية إلى باقة Gold ⭐\n` +
      promoLine +
      `الاسم: ${u.name || 'غير محدد'}\n` +
      `البريد الإلكتروني: ${u.email || 'غير محدد'}\n` +
      (reasonText ? `الميزة المطلوبة: ${reasonText}` : '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  function ensureModalInjected() {
    if (document.getElementById('ziadaGoldUpgradeModal')) return;

    const style = document.createElement('style');
    style.textContent = `
      .zg-overlay {
        display: none; position: fixed; inset: 0; background: rgba(2, 6, 23, 0.88);
        backdrop-filter: blur(6px); z-index: 99999; justify-content: center; align-items: center; padding: 16px;
        font-family: 'Cairo', sans-serif; direction: rtl;
      }
      .zg-card {
        background: linear-gradient(160deg, #111827, #0b1220); border: 2px solid #f59e0b;
        border-radius: 18px; padding: 24px 22px; width: 100%; max-width: 440px; text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.25); color: #f8fafc;
      }
      .zg-crown { font-size: 42px; margin-bottom: 6px; }
      .zg-title { color: #fbbf24; font-size: 20px; font-weight: 900; margin-bottom: 8px; }
      .zg-price-box {
        display: none;
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.22), rgba(245, 158, 11, 0.16));
        border: 1.5px dashed #f59e0b; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px;
      }
      .zg-discount-tag {
        display: inline-block; background: #dc2626; color: #fff; font-size: 11.5px; font-weight: 900;
        padding: 2px 10px; border-radius: 20px; margin-bottom: 5px;
      }
      .zg-prices { font-size: 15px; font-weight: 800; color: #e2e8f0; }
      .zg-prices b { color: #4ade80; font-size: 22px; font-weight: 900; margin-left: 6px; }
      .zg-prices s { color: #fca5a5; font-size: 14px; opacity: 0.9; }
      .zg-reason {
        background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fde68a; padding: 9px 12px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-bottom: 12px;
      }
      .zg-offer { color: #cbd5e1; font-size: 13px; line-height: 1.75; margin-bottom: 16px; }
      .zg-btn-wa {
        display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
        padding: 11px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 14px;
        background: linear-gradient(135deg, #d97706, #f59e0b); color: #070b12;
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35); margin-bottom: 10px; transition: 0.2s;
      }
      .zg-btn-wa:hover { filter: brightness(1.1); transform: translateY(-1px); }
      .zg-btn-close {
        width: 100%; padding: 9px; border-radius: 8px; background: #1f2937; color: #cbd5e1;
        border: 1px solid #334155; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit;
      }
      .zg-promo-wrap {
        display: inline-flex; align-items: center; gap: 7px; flex-wrap: wrap;
      }
      .zg-nav-pill {
        display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px;
        font-size: 12px; font-weight: 800; cursor: pointer; text-decoration: none; border: none; font-family: inherit;
      }
      .zg-pill-gold {
        background: rgba(245, 158, 11, 0.16); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); cursor: default;
      }
      .zg-pill-free {
        background: linear-gradient(135deg, #b45309, #f59e0b); color: #070b12;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
      }
      .zg-offer-pill {
        display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 20px;
        font-size: 11.5px; font-weight: 800; cursor: pointer; border: 1px solid #ef4444;
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.24), rgba(245, 158, 11, 0.18));
        color: #fef08a; font-family: inherit; animation: zgOfferPulse 2s infinite;
      }
      .zg-offer-pill b { color: #4ade80; font-size: 12.5px; }
      .zg-offer-pill s { color: #fca5a5; opacity: 0.85; font-size: 11px; }
      @keyframes zgOfferPulse {
        0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.28); }
        50% { box-shadow: 0 0 16px rgba(245, 158, 11, 0.55); }
      }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'ziadaGoldUpgradeModal';
    modal.className = 'zg-overlay';
    modal.innerHTML = `
      <div class="zg-card" onclick="event.stopPropagation()">
        <div class="zg-crown">👑</div>
        <div class="zg-title">ميزة حصرية لباقة Gold</div>
        <div class="zg-price-box" id="zgPriceBox">
          <div class="zg-discount-tag" id="zgDiscountTag"></div>
          <div class="zg-prices" id="zgPricesLine"></div>
        </div>
        <div class="zg-reason" id="zgReasonText"></div>
        <div class="zg-offer" id="zgOfferText"></div>
        <a id="zgWhatsappBtn" href="#" target="_blank" class="zg-btn-wa">
          <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> <span id="zgWaBtnText">ترقية حسابك لـ Gold الآن</span>
        </a>
        <button class="zg-btn-close" onclick="ZiadaPlan.closeUpgradeModal()">متابعة بالباقة المجانية</button>
      </div>
    `;
    modal.addEventListener('click', () => ZiadaPlan.closeUpgradeModal());
    document.body.appendChild(modal);
  }

  function openUpgradeModal(reasonText) {
    ensureModalInjected();
    const cfg = getConfig();
    const promo = getPagePromo();
    const priceBox = document.getElementById('zgPriceBox');
    const waText = document.getElementById('zgWaBtnText');

    if (promo) {
      priceBox.style.display = 'block';
      document.getElementById('zgDiscountTag').textContent = `🔥 عرض خاص (${promo.toolName}) — ${promo.discountLabel}`;
      document.getElementById('zgPricesLine').innerHTML = `<b>${promo.newPriceFull}</b> بدلاً من <s>${promo.oldPriceFull}</s>`;
      waText.textContent = `اشترك الآن بـ ${promo.newPriceFull} بدلاً من ${promo.oldPriceFull}`;
    } else {
      priceBox.style.display = 'none';
      waText.textContent = 'ترقية حسابك لـ Gold الآن';
    }

    document.getElementById('zgReasonText').textContent = reasonText || 'هذه الميزة متاحة لمشتركي باقة Gold فقط.';
    document.getElementById('zgOfferText').textContent = cfg.goldOfferText || DEFAULT_CONFIG.goldOfferText;
    document.getElementById('zgWhatsappBtn').href = buildWhatsappLink(reasonText);
    document.getElementById('ziadaGoldUpgradeModal').style.display = 'flex';
  }

  function closeUpgradeModal() {
    const m = document.getElementById('ziadaGoldUpgradeModal');
    if (m) m.style.display = 'none';
  }

  function requireGold(featureLabel) {
    if (isGold()) return true;
    openUpgradeModal(`ميزة (${featureLabel}) حصرية لمشتركي باقة Gold.`);
    return false;
  }

  function checkFeature(configKey, featureLabel) {
    if (isGold()) return true;
    const cfg = getConfig();
    if (cfg[configKey]) {
      openUpgradeModal(`ميزة (${featureLabel}) متاحة لمشتركي باقة Gold فقط.`);
      return false;
    }
    return true;
  }

  function checkExport(type, featureLabel) {
    if (isGold()) return true;
    const cfg = getConfig();
    if (type === 'video' && cfg.freeBlockVideoExport) {
      openUpgradeModal(`تصدير الفيديو (${featureLabel || 'HD'}) متاح لباقة Gold فقط.`);
      return false;
    }
    if (type === 'pdf' && cfg.freeBlockPdfExport) {
      openUpgradeModal(`تصدير التقارير (${featureLabel || 'PDF / Excel'}) متاح لباقة Gold فقط.`);
      return false;
    }
    if (type === 'image' && cfg.freeBlockImageExport) {
      openUpgradeModal(`حفظ الصور بجودة HD متاح لباقة Gold فقط.`);
      return false;
    }
    return true;
  }

  function checkLimit(limitKey, currentCount, itemLabel) {
    if (isGold()) return true;
    const cfg = getConfig();
    const maxAllowed = parseInt(cfg[limitKey], 10);
    if (!isNaN(maxAllowed) && maxAllowed > 0 && currentCount >= maxAllowed) {
      openUpgradeModal(`وصلت للحد الأقصى في الباقة العادية (${maxAllowed} ${itemLabel}). قم بالترقية لباقة Gold لعدد غير محدود!`);
      return false;
    }
    return true;
  }

  function canAutoSave() {
    if (isGold()) return true;
    return !getConfig().freeBlockAutoSave;
  }

  function injectNavPlanBadge() {
    ensureModalInjected();
    const navRight = document.querySelector('.nav-actions, .top-actions');
    if (!navRight || document.getElementById('zgNavPlanPill')) return;

    const u = getActiveUser();
    const pill = document.createElement('button');
    pill.id = 'zgNavPlanPill';
    pill.type = 'button';

    if (u.role === 'admin') {
      pill.className = 'zg-nav-pill zg-pill-gold';
      pill.innerHTML = '👑 إدارة المنصة';
      navRight.prepend(pill);
    } else if (isGold()) {
      pill.className = 'zg-nav-pill zg-pill-gold';
      pill.innerHTML = '⭐ باقة Gold';
      navRight.prepend(pill);
    } else {
      const promo = getPagePromo();
      pill.className = 'zg-nav-pill zg-pill-free';
      pill.innerHTML = '⭐ ترقية للـ Gold';

      if (promo) {
        const wrap = document.createElement('div');
        wrap.className = 'zg-promo-wrap';

        const offerBtn = document.createElement('button');
        offerBtn.type = 'button';
        offerBtn.className = 'zg-offer-pill';
        offerBtn.innerHTML = `🔥 ${promo.discountLabel} | <b>${promo.newPriceShort}</b> بدلاً من <s>${promo.oldPriceShort}</s>`;
        offerBtn.onclick = () => openUpgradeModal(`اغتنم عرض ${promo.discountLabel} على ${promo.toolName} — ${promo.newPriceFull} بدلاً من ${promo.oldPriceFull}!`);

        pill.onclick = () => openUpgradeModal(`قم بترقية حسابك لـ ${promo.toolName} الآن بـ ${promo.newPriceFull} بدلاً من ${promo.oldPriceFull}.`);

        wrap.appendChild(offerBtn);
        wrap.appendChild(pill);
        navRight.prepend(wrap);
      } else {
        pill.onclick = () => openUpgradeModal('قم بترقية حسابك من الباقة العادية إلى باقة Gold لفتح جميع المميزات بلا حدود.');
        navRight.prepend(pill);
      }
    }
  }

  window.ZiadaPlan = {
    DEFAULT_CONFIG,
    PAGE_PROMOS,
    getPagePromo,
    getConfig,
    isGold,
    requireGold,
    checkFeature,
    checkExport,
    checkLimit,
    canAutoSave,
    openUpgradeModal,
    closeUpgradeModal,
    buildWhatsappLink
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavPlanBadge);
  } else {
    injectNavPlanBadge();
  }
})();