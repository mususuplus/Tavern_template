export type RollInputTarget = 'main-panel' | 'tavern' | 'none';

type RollRequestFillPayload = {
  success: boolean;
  total: number;
  target: number;
};

const TAVERN_INPUT_SELECTORS = [
  '#send_textarea',
  'textarea#send_textarea',
  'textarea[name="send_textarea"]',
  '#send_text',
  'textarea[data-testid="send_textarea"]',
];

function getResultText(payload: RollRequestFillPayload) {
  return `${payload.success ? '检定成功' : '检定失败'}，${payload.total}/${payload.target}`;
}

function getAccessibleDocuments() {
  const docs: Document[] = [document];

  try {
    const parentDocument = window.parent?.document;
    if (parentDocument && parentDocument !== document) {
      docs.push(parentDocument);
    }
  } catch (error) {
    console.warn('[DND] 无法访问父级文档，回填酒馆输入框时将仅使用当前文档。', error);
  }

  return docs;
}

function findTavernInput() {
  const docs = getAccessibleDocuments();

  for (const currentDocument of docs) {
    for (const selector of TAVERN_INPUT_SELECTORS) {
      const element = currentDocument.querySelector<HTMLTextAreaElement | HTMLInputElement>(selector);
      if (element) {
        return element;
      }
    }
  }

  return null;
}

function dispatchInputEvents(element: HTMLTextAreaElement | HTMLInputElement) {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function setElementValue(element: HTMLTextAreaElement | HTMLInputElement, value: string) {
  const prototype =
    element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

export function fillRollResultInput(target: RollInputTarget, payload: RollRequestFillPayload) {
  if (target === 'none') {
    return null;
  }

  const nextValue = getResultText(payload);

  if (target === 'main-panel') {
    const input = document.querySelector<HTMLTextAreaElement>('#main-panel-prompt');
    if (!input) {
      console.warn('[DND] 未找到主面板输入框，无法自动回填检定结果。');
      return null;
    }

    setElementValue(input, nextValue);
    dispatchInputEvents(input);
    input.focus();
    return nextValue;
  }

  const tavernInput = findTavernInput();
  if (!tavernInput) {
    console.warn('[DND] 未找到酒馆输入框，无法自动回填检定结果。');
    return null;
  }

  setElementValue(tavernInput, nextValue);
  dispatchInputEvents(tavernInput);
  tavernInput.focus();
  return nextValue;
}
