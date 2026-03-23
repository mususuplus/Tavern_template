const ROLL_REQUEST_BLOCK_REG = /<roll_request>([\s\S]*?)<\/roll_request>/gi;

function readTag(block: string, tagName: string) {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return (match?.[1] ?? '').trim();
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeLabel(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeTargetType(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'AC') {
    return 'AC';
  }
  return 'DC';
}

export function getRollRequestCardStyle() {
  return `
.th-roll-request {
  --roll-bg: linear-gradient(180deg, rgba(82, 53, 31, 0.96), rgba(28, 20, 15, 0.98));
  --roll-panel: rgba(255, 248, 236, 0.06);
  --roll-border: rgba(230, 189, 112, 0.34);
  --roll-border-strong: rgba(230, 189, 112, 0.62);
  --roll-text: #f7eddc;
  --roll-text-soft: rgba(247, 237, 220, 0.74);
  --roll-accent: #efc16b;
  --roll-accent-strong: #ffdf9a;
  --roll-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  position: relative;
  display: grid;
  gap: 12px;
  margin: 12px 0;
  padding: 14px;
  border: 1px solid var(--roll-border);
  border-left: 4px solid var(--roll-accent);
  background: var(--roll-bg);
  color: var(--roll-text);
  box-shadow: var(--roll-shadow);
  overflow: hidden;
}

.th-roll-request::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(255, 223, 154, 0.18), transparent 28%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04), transparent 42%);
  pointer-events: none;
}

.th-roll-request > * {
  position: relative;
  z-index: 1;
}

.th-roll-request__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.th-roll-request__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid var(--roll-border);
  background: rgba(255, 248, 236, 0.06);
  color: var(--roll-accent-strong);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.th-roll-request__badge::before {
  content: 'd20';
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(239, 193, 107, 0.16);
  color: var(--roll-accent-strong);
  font-size: 11px;
  letter-spacing: 0.06em;
}

.th-roll-request__target {
  display: inline-grid;
  justify-items: end;
  gap: 2px;
}

.th-roll-request__target-label {
  color: var(--roll-text-soft);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.th-roll-request__target-value {
  color: var(--roll-accent-strong);
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.th-roll-request__scene {
  margin: 0;
  padding: 12px 13px;
  border: 1px solid rgba(255, 248, 236, 0.08);
  background: var(--roll-panel);
  color: var(--roll-text);
  line-height: 1.7;
}

.th-roll-request__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.th-roll-request__meta-item {
  display: grid;
  gap: 5px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 248, 236, 0.08);
  background: rgba(0, 0, 0, 0.14);
}

.th-roll-request__meta-label {
  color: var(--roll-text-soft);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.th-roll-request__meta-value {
  color: var(--roll-text);
  font-size: 14px;
  font-weight: 700;
}

.th-roll-request__instruction {
  padding: 10px 12px;
  border: 1px solid var(--roll-border-strong);
  background: rgba(239, 193, 107, 0.08);
  color: var(--roll-accent-strong);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .th-roll-request__top,
  .th-roll-request__meta {
    grid-template-columns: 1fr;
  }

  .th-roll-request__top {
    display: grid;
  }

  .th-roll-request__target {
    justify-items: start;
  }
}
`.trim();
}

export function ensureRollRequestCardStyle(id = 'th-roll-request-style') {
  if (document.getElementById(id)) {
    return;
  }

  const style = document.createElement('style');
  style.id = id;
  style.textContent = getRollRequestCardStyle();
  document.head.append(style);
}

export function renderRollRequestCard(block: string) {
  const scene = normalizeLabel(readTag(block, 'scene'), '前方出现了需要检定的关键时刻。');
  const rollType = normalizeLabel(readTag(block, 'roll_type'), 'Check');
  const rollName = normalizeLabel(readTag(block, 'roll_name'), 'Unknown Roll');
  const targetType = normalizeTargetType(readTag(block, 'target_type'));
  const targetNumber = normalizeLabel(readTag(block, 'target_number'), '?');
  const instruction = normalizeLabel(readTag(block, 'instruction'), 'Provide the final d20 total (roll + modifiers).');

  return `
<section class="th-roll-request" data-target-type="${escapeHtml(targetType)}">
  <div class="th-roll-request__top">
    <div class="th-roll-request__badge">${escapeHtml(rollType)}</div>
    <div class="th-roll-request__target">
      <span class="th-roll-request__target-label">${escapeHtml(targetType)}</span>
      <strong class="th-roll-request__target-value">${escapeHtml(targetNumber)}</strong>
    </div>
  </div>
  <p class="th-roll-request__scene">${escapeHtml(scene)}</p>
  <div class="th-roll-request__meta">
    <div class="th-roll-request__meta-item">
      <span class="th-roll-request__meta-label">Roll</span>
      <strong class="th-roll-request__meta-value">${escapeHtml(rollName)}</strong>
    </div>
    <div class="th-roll-request__meta-item">
      <span class="th-roll-request__meta-label">Action</span>
      <strong class="th-roll-request__meta-value">Initiate d20 Test</strong>
    </div>
  </div>
  <div class="th-roll-request__instruction">${escapeHtml(instruction)}</div>
</section>
`.trim();
}

export function replaceRollRequestCards(text: string) {
  if (!text) {
    return '';
  }

  return text.replace(ROLL_REQUEST_BLOCK_REG, (_, block: string) => renderRollRequestCard(block));
}

export const ROLL_REQUEST_CARD_REGEX = ROLL_REQUEST_BLOCK_REG;
