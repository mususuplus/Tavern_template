(() => {
  const GLOBAL_KEY = '__moneyStageEffectsInstalled';
  const STYLE_ID = 'money-stage-effects-style';
  const CONTAINER_ID = 'money-stage-effects-container';
  const MESSAGE_ATTR = 'data-money-stage-effects';
  const TOOL_ATTR = 'data-money-tools-enhanced';

  const tooltips = {
    标价眼镜: {
      type: '金钱道具',
      level: 'Lv1',
      risk: '低',
      text: '读取目标当前可接受的最低试探报价区间。',
    },
    匿名黑卡: {
      type: '金钱道具',
      level: 'Lv1',
      risk: '低',
      text: '隐藏资金来源，降低首次试探时的社会风险。',
    },
    私密委托合同: {
      type: '金钱道具',
      level: 'Lv1',
      risk: '中',
      text: '将一次非公开请求包装成资金委托。',
    },
    诚实香水: {
      type: '感官强化',
      level: 'Lv2',
      risk: '中',
      text: '降低目标伪装强度，让真实动摇更容易暴露。',
    },
    羞耻回声贴片: {
      type: '感官强化',
      level: 'Lv2',
      risk: '中',
      text: '放大目标对交易边界的自我感知。',
    },
    暗示芯片: {
      type: '心理干涉',
      level: 'Lv3',
      risk: '高',
      text: '植入短期行为暗示，稳定性受目标状态影响。',
    },
    服从口令卡: {
      type: '心理干涉',
      level: 'Lv3',
      risk: '高',
      text: '设定限定场景内生效的口令规则。',
    },
    局部常识补丁: {
      type: '常识修改',
      level: 'Lv4',
      risk: '极高',
      text: '让指定场景短期接受一条异常交易常识。',
    },
    公开异常屏蔽器: {
      type: '常识修改',
      level: 'Lv4',
      risk: '极高',
      text: '让旁观者自动为异常行为寻找合理解释。',
    },
    身份重写合同: {
      type: '现实权限',
      level: 'Lv5',
      risk: '极高',
      text: '将目标绑定为新的社会身份与长期收益节点。',
    },
  };

  const toolNames = Object.keys(tooltips).sort((a, b) => b.length - a.length);
  const toolPattern = toolNames.length ? new RegExp(toolNames.map(escapeRegExp).join('|'), 'g') : null;

  function getPageDocument() {
    try {
      return window.parent && window.parent.document ? window.parent.document : document;
    } catch (error) {
      return document;
    }
  }

  function getPageWindow() {
    try {
      return window.parent || window;
    } catch (error) {
      return window;
    }
  }

  function safeToast(type, message) {
    if (typeof toastr !== 'undefined' && toastr && typeof toastr[type] === 'function') {
      toastr[type](message);
      return;
    }
    console.info(`[money stage effects] ${message}`);
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function injectStyle() {
    const doc = getPageDocument();
    if (doc.getElementById(STYLE_ID)) return;

    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${CONTAINER_ID} {
        position: fixed;
        z-index: 100000;
        top: 18px;
        right: 18px;
        display: grid;
        gap: 10px;
        width: min(340px, calc(100vw - 28px));
        pointer-events: none;
      }
      .money-stage-toast {
        overflow: hidden;
        border: 1px solid rgba(214, 178, 94, 0.36);
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(12, 12, 14, 0.96), rgba(23, 18, 10, 0.94));
        color: #f3ead2;
        box-shadow: 0 18px 58px rgba(0, 0, 0, 0.42);
        animation: moneyToastIn 360ms ease, moneyToastOut 360ms ease 3200ms forwards;
      }
      .money-stage-toast::before {
        content: "";
        display: block;
        height: 2px;
        background: linear-gradient(90deg, transparent, #f8d879, transparent);
        animation: moneyScan 1200ms ease infinite;
      }
      .money-stage-toast__body {
        padding: 10px 12px 12px;
      }
      .money-stage-toast__title {
        margin: 0 0 5px;
        color: #f8d879;
        font-size: 13px;
        font-weight: 800;
      }
      .money-stage-toast__detail {
        margin: 0;
        color: #f2ead6;
        font-size: 12px;
        line-height: 1.45;
      }
      .money-stage-toast--risk {
        border-color: rgba(236, 77, 74, 0.55);
        background: linear-gradient(135deg, rgba(30, 8, 9, 0.96), rgba(12, 12, 14, 0.96));
      }
      .money-stage-toast--risk .money-stage-toast__title {
        color: #ff918b;
      }
      .money-stage-toast--deal .money-stage-toast__title {
        color: #a9f5c8;
      }
      .money-risk-flash {
        position: fixed;
        z-index: 99998;
        inset: 0;
        border: 0 solid rgba(236, 77, 74, 0);
        box-shadow: inset 0 0 0 rgba(236, 77, 74, 0);
        pointer-events: none;
        animation: moneyRiskFlash 900ms ease forwards;
      }
      .money-level-overlay {
        position: fixed;
        z-index: 100001;
        inset: 0;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at center, rgba(154, 98, 255, 0.18), transparent 34%),
          linear-gradient(135deg, rgba(4, 7, 14, 0.9), rgba(8, 6, 10, 0.86));
        color: #f8d879;
        pointer-events: none;
        animation: moneyOverlayFade 2200ms ease forwards;
      }
      .money-level-overlay__panel {
        min-width: min(460px, calc(100vw - 38px));
        padding: 22px 26px;
        border: 1px solid rgba(214, 178, 94, 0.55);
        background: rgba(8, 8, 10, 0.88);
        box-shadow: 0 0 58px rgba(154, 98, 255, 0.22), 0 0 34px rgba(240, 200, 108, 0.16);
        text-align: center;
      }
      .money-level-overlay__title {
        margin: 0 0 8px;
        font-size: 22px;
        font-weight: 900;
      }
      .money-level-overlay__detail {
        margin: 0;
        color: #d9c2ff;
        font-size: 13px;
      }
      .money-deal-stamp {
        position: absolute;
        z-index: 3;
        right: 20px;
        top: 18px;
        transform: rotate(-12deg) scale(0.82);
        padding: 7px 14px;
        border: 2px solid rgba(240, 200, 108, 0.72);
        border-radius: 6px;
        color: rgba(248, 216, 121, 0.9);
        font-size: 20px;
        font-weight: 900;
        letter-spacing: 0;
        text-shadow: 0 0 12px rgba(240, 200, 108, 0.28);
        opacity: 0;
        pointer-events: none;
        animation: moneyStampIn 1200ms cubic-bezier(.2, 1.7, .3, 1) forwards;
      }
      .money-stage-tool {
        position: relative;
        display: inline;
        color: #d9c2ff;
        border-bottom: 1px dotted rgba(154, 98, 255, 0.86);
        font-weight: 800;
        cursor: help;
      }
      .money-stage-tool:hover {
        color: #f8d879;
      }
      .money-stage-tooltip {
        position: fixed;
        z-index: 100002;
        max-width: min(320px, calc(100vw - 28px));
        padding: 11px 12px;
        border: 1px solid rgba(214, 178, 94, 0.42);
        border-radius: 8px;
        background: rgba(8, 8, 10, 0.97);
        color: #f2ead6;
        box-shadow: 0 18px 58px rgba(0, 0, 0, 0.46);
        pointer-events: none;
      }
      .money-stage-tooltip strong {
        display: block;
        margin-bottom: 6px;
        color: #f8d879;
      }
      .money-stage-tooltip span {
        display: inline-block;
        margin: 0 6px 7px 0;
        padding: 2px 6px;
        border-radius: 999px;
        background: rgba(154, 98, 255, 0.18);
        color: #d9c2ff;
        font-size: 11px;
      }
      .money-stage-tooltip p {
        margin: 0;
        font-size: 12px;
        line-height: 1.5;
      }
      @keyframes moneyToastIn {
        from { opacity: 0; transform: translateX(28px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes moneyToastOut {
        to { opacity: 0; transform: translateX(24px); }
      }
      @keyframes moneyScan {
        0% { transform: translateX(-60%); }
        100% { transform: translateX(60%); }
      }
      @keyframes moneyRiskFlash {
        0% { border-width: 0; box-shadow: inset 0 0 0 rgba(236, 77, 74, 0); }
        28% { border-width: 7px; box-shadow: inset 0 0 58px rgba(236, 77, 74, 0.42); }
        100% { border-width: 0; box-shadow: inset 0 0 0 rgba(236, 77, 74, 0); }
      }
      @keyframes moneyOverlayFade {
        0% { opacity: 0; transform: scale(1.02); }
        14% { opacity: 1; transform: scale(1); }
        76% { opacity: 1; }
        100% { opacity: 0; visibility: hidden; }
      }
      @keyframes moneyStampIn {
        0% { opacity: 0; transform: rotate(-12deg) scale(1.8); }
        28% { opacity: 1; transform: rotate(-12deg) scale(0.96); }
        100% { opacity: 0.76; transform: rotate(-12deg) scale(1); }
      }
      @media (max-width: 640px) {
        #${CONTAINER_ID} {
          top: 10px;
          right: 10px;
          width: calc(100vw - 20px);
        }
        .money-deal-stamp {
          right: 12px;
          top: 12px;
          font-size: 16px;
        }
      }
    `;
    doc.head.appendChild(style);
  }

  function getContainer() {
    const doc = getPageDocument();
    let container = doc.getElementById(CONTAINER_ID);
    if (!container) {
      container = doc.createElement('div');
      container.id = CONTAINER_ID;
      doc.body.appendChild(container);
    }
    return container;
  }

  function showToast(title, detail, className) {
    const doc = getPageDocument();
    const toast = doc.createElement('div');
    toast.className = `money-stage-toast ${className || ''}`;
    toast.innerHTML = `
      <div class="money-stage-toast__body">
        <p class="money-stage-toast__title">${escapeHtml(title)}</p>
        <p class="money-stage-toast__detail">${escapeHtml(detail)}</p>
      </div>
    `;
    getContainer().appendChild(toast);
    setTimeout(() => toast.remove(), 3800);
  }

  function showRiskFlash() {
    const doc = getPageDocument();
    const flash = doc.createElement('div');
    flash.className = 'money-risk-flash';
    doc.body.appendChild(flash);
    setTimeout(() => flash.remove(), 950);
  }

  function showLevelOverlay(title, detail) {
    const doc = getPageDocument();
    const overlay = doc.createElement('div');
    overlay.className = 'money-level-overlay';
    overlay.innerHTML = `
      <div class="money-level-overlay__panel">
        <p class="money-level-overlay__title">${escapeHtml(title)}</p>
        <p class="money-level-overlay__detail">${escapeHtml(detail)}</p>
      </div>
    `;
    doc.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2300);
  }

  function addDealStamp($message) {
    if ($message.find('.money-deal-stamp').length) return;
    const message = $message[0];
    if (!message) return;
    const currentPosition = String($(message).css('position') || '');
    if (currentPosition === 'static' || !currentPosition) {
      $(message).css('position', 'relative');
    }
    $('<div class="money-deal-stamp">成交确认</div>').appendTo($message);
  }

  function extractFundAmount(text) {
    const amount = '(?:[+＋]\\s*)?[¥￥]?\\s*\\d[\\d,]*(?:\\.\\d+)?\\s*(?:万|亿)?\\s*(?:资金|元|块)?';
    const leadPattern = new RegExp(`(?:到账|入账|获得资金|领取今日额度|资金到账|转账完成|额度发放)[^\\n。；;]{0,28}?(${amount})`, 'i');
    const signedPattern = new RegExp(`([+＋]\\s*[¥￥]?\\s*\\d[\\d,]*(?:\\.\\d+)?\\s*(?:万|亿)?\\s*(?:资金|元|块)?)`, 'i');
    const lead = text.match(leadPattern);
    if (lead && lead[1]) return lead[1].replace(/\s+/g, '');
    const signed = text.match(signedPattern);
    if (signed && signed[1]) return signed[1].replace(/\s+/g, '');
    return '';
  }

  function detectRisk(text) {
    if (/极高风险|风险[:：]?\s*极高|严重曝光|强烈反噬|失控/i.test(text)) return '极高风险';
    if (/高风险|风险[:：]?\s*高|曝光|反噬|警觉度(?:上升|提高|增加)/i.test(text)) return '高风险';
    return '';
  }

  function detectDeal(text) {
    return /成交|已成交|已收款|完成交易|交易完成|屈服事件完成|合同生效|资产化/i.test(text);
  }

  function detectLevel(text) {
    const level = text.match(/(?:系统等级|等级)(?:提升|升级|突破)?(?:至|到|为)?\s*(?:Lv\.?|LV\.?|lv\.?)?\s*([1-5])/);
    if (level && level[1]) return `系统等级提升至 Lv${level[1]}`;
    const permission = text.match(/(?:商城权限|权限|黑市权限)(?:解锁|开放|升级)[^。；;\n]{0,24}/);
    if (permission && permission[0]) return permission[0];
    return '';
  }

  function shouldSkipToolNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest('.money-stage-tool, .money-stage-tooltip, script, style, textarea, input, select, button'));
  }

  function enhanceTools($text) {
    if (!toolPattern || $text.attr(TOOL_ATTR) === 'true') return;
    $text.attr(TOOL_ATTR, 'true');

    const doc = $text[0].ownerDocument;
    const ownerWindow = doc.defaultView || window;
    const walker = doc.createTreeWalker($text[0], ownerWindow.NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (shouldSkipToolNode(node)) return ownerWindow.NodeFilter.FILTER_REJECT;
        if (!node.textContent || !toolPattern.test(node.textContent)) {
          toolPattern.lastIndex = 0;
          return ownerWindow.NodeFilter.FILTER_REJECT;
        }
        toolPattern.lastIndex = 0;
        return ownerWindow.NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const text = node.textContent || '';
      toolPattern.lastIndex = 0;
      let lastIndex = 0;
      const wrapper = doc.createElement('span');
      for (const match of text.matchAll(toolPattern)) {
        const name = match[0];
        const index = match.index == null ? -1 : match.index;
        if (!name || index < 0) continue;
        wrapper.appendChild(doc.createTextNode(text.slice(lastIndex, index)));
        const span = doc.createElement('span');
        span.className = 'money-stage-tool';
        span.dataset.toolName = name;
        span.textContent = name;
        wrapper.appendChild(span);
        lastIndex = index + name.length;
      }
      wrapper.appendChild(doc.createTextNode(text.slice(lastIndex)));
      node.replaceWith(...Array.from(wrapper.childNodes));
    }
  }

  function showToolTip(element) {
    const name = element.dataset.toolName;
    const info = tooltips[name];
    if (!info) return;

    removeToolTip();
    const doc = getPageDocument();
    const tip = doc.createElement('div');
    tip.className = 'money-stage-tooltip';
    tip.innerHTML = `
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(info.type)}</span>
      <span>${escapeHtml(info.level)}</span>
      <span>风险${escapeHtml(info.risk)}</span>
      <p>${escapeHtml(info.text)}</p>
    `;
    doc.body.appendChild(tip);

    const rect = element.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const left = Math.min(Math.max(rect.left, 10), window.innerWidth - tipRect.width - 10);
    const top = rect.top > tipRect.height + 14 ? rect.top - tipRect.height - 10 : rect.bottom + 10;
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.min(top, window.innerHeight - tipRect.height - 10)}px`;
  }

  function removeToolTip() {
    $('.money-stage-tooltip').remove();
  }

  function processMessage($message, animate) {
    const $text = $message.find('.mes_text').first();
    if (!$text.length) return;

    enhanceTools($text);

    if ($message.attr(MESSAGE_ATTR) === 'true') return;
    $message.attr(MESSAGE_ATTR, 'true');

    const text = $text.text();
    if (!text.trim()) return;

    const amount = extractFundAmount(text);
    const risk = detectRisk(text);
    const level = detectLevel(text);
    const deal = detectDeal(text);

    if (deal) addDealStamp($message);
    if (!animate) return;

    if (amount) showToast('资金入账', `系统检测到资金变动：${amount}`, '');
    if (risk) {
      showToast('风险警报', `当前叙事触发 ${risk}，请注意曝光与反噬。`, 'money-stage-toast--risk');
      showRiskFlash();
    }
    if (deal) showToast('交易成交', '本轮交易已留下成交记录。', 'money-stage-toast--deal');
    if (level) showLevelOverlay('权限突破', level);
  }

  function scanMessages(animate) {
    $('.mes').each((_, element) => processMessage($(element), animate));
  }

  function registerToolHover() {
    const doc = getPageDocument();
    $(doc)
      .off('mouseenter.moneyStageTool mouseleave.moneyStageTool', '.money-stage-tool')
      .on('mouseenter.moneyStageTool', '.money-stage-tool', event => showToolTip(event.currentTarget))
      .on('mouseleave.moneyStageTool', '.money-stage-tool', removeToolTip);
  }

  function install() {
    const pageWindow = getPageWindow();
    if (pageWindow[GLOBAL_KEY]) {
      scanMessages(false);
      return;
    }
    pageWindow[GLOBAL_KEY] = true;

    injectStyle();
    registerToolHover();
    scanMessages(false);
    safeToast('success', 'money 演出效果已加载');

    if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined') {
      eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, () => scanMessages(true));
      eventOn(tavern_events.MESSAGE_UPDATED, () => scanMessages(true));
      eventOn(tavern_events.MORE_MESSAGES_LOADED, () => scanMessages(false));
    }

    const observer = new MutationObserver(() => window.setTimeout(() => scanMessages(true), 120));
    observer.observe(getPageDocument().body, { childList: true, subtree: true });

    $(window).on('pagehide', () => {
      observer.disconnect();
      removeToolTip();
      const style = getPageDocument().getElementById(STYLE_ID);
      const container = getPageDocument().getElementById(CONTAINER_ID);
      if (style) style.remove();
      if (container) container.remove();
      delete pageWindow[GLOBAL_KEY];
    });
  }

  $(() => {
    try {
      install();
    } catch (error) {
      console.error('[money stage effects] 加载失败', error);
      safeToast('error', 'money 演出效果加载失败，见控制台');
    }
  });
})();
