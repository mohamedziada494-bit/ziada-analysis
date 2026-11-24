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
    const phone = String(cfg.whatsappNumber || '201027482686').replace(/[^\d]/g, '');
    const msg =
      `مرحباً إدارة Ziada Analysis ⚽\n` +
      `أرغب في الترقية إلى باقة Gold ⭐\n` +
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
        border-radius: 18px; padding: 26px 22px; width: 100%; max-width: 440px; text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.25); color: #f8fafc;
      }
      .zg-crown { font-size: 44px; margin-bottom: 8px; }
      .zg-title { color: #fbbf24; font-size: 20px; font-weight: 900; margin-bottom: 8px; }
      .zg-reason {
        background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fde68a; padding: 9px 12px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-bottom: 12px;
      }
      .zg-offer { color: #cbd5e1; font-size: 13px; line-height: 1.75; margin-bottom: 18px; }
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
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'ziadaGoldUpgradeModal';
    modal.className = 'zg-overlay';
    modal.innerHTML = `
      <div class="zg-card" onclick="event.stopPropagation()">
        <div class="zg-crown">👑</div>
        <div class="zg-title">ميزة حصرية لباقة Gold</div>
        <div class="zg-reason" id="zgReasonText"></div>
        <div class="zg-offer" id="zgOfferText"></div>
        <a id="zgWhatsappBtn" href="#" target="_blank" class="zg-btn-wa">
          <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> ترقية حسابك لـ Gold الآن
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
    } else if (isGold()) {
      pill.className = 'zg-nav-pill zg-pill-gold';
      pill.innerHTML = '⭐ باقة Gold';
    } else {
      pill.className = 'zg-nav-pill zg-pill-free';
      pill.innerHTML = '⭐ ترقية للـ Gold';
      pill.onclick = () => openUpgradeModal('قم بترقية حسابك من الباقة العادية إلى باقة Gold لفتح جميع المميزات بلا حدود.');
    }
    navRight.prepend(pill);
  }

  window.ZiadaPlan = {
    DEFAULT_CONFIG,
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