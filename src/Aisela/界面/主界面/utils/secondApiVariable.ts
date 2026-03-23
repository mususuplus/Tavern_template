/**
 * 多 API 模式下，用第二 API（generateRaw + custom_api）仅生成变量更新块
 */

import type { VaultSettings } from './vaultSettings';
import { getVariablePromptFromWorldbook } from './worldbookApiMode';

const TASK_INSTRUCTION = `
请根据上述「变量更新规则」「当前变量」和「变量输出格式」，仅根据「当前正文」输出变量更新内容。
你只能输出一个 <UpdateVariable> 块，块内包含 <JSONPatch> 数组（JSON Patch 格式），不要输出其他内容。`;

/** 读取「当前楼层的前一层」的变量并格式化为「当前变量:」段落（最新楼层变量常为空，故用前一层） */
function getCurrentVariablesSection(): string {
  try {
    const vars = getVariables({ type: 'message', message_id: -2 });
    const str = typeof vars === 'object' && vars !== null ? JSON.stringify(vars, null, 2) : String(vars);
    return `当前变量:\n${str}`;
  } catch (e) {
    console.warn('[Aisela] 读取当前变量失败:', e);
    return '当前变量:\n{}';
  }
}

/**
 * 使用第二 API 生成变量更新块
 * @param maintext 当前正文（主 API 生成的 <maintext> 内容或整段 maintext 标签内的文本）
 * @param settings 当前 vault 设置（需为 multi 且 secondApi 已配置）
 * @returns 第二 API 返回的文本，通常应包含 <UpdateVariable>...</UpdateVariable>
 */
export async function callSecondApiForVariable(maintext: string, settings: VaultSettings): Promise<string> {
  if (settings.apiMode !== 'multi') return '';
  const { secondApi } = settings;
  if (!secondApi?.url?.trim() || !secondApi?.model?.trim()) {
    console.warn('[Aisela] 第二 API 未配置 url 或 model，跳过变量请求');
    return '';
  }

  const variablePrompt = await getVariablePromptFromWorldbook();
  const currentVariables = getCurrentVariablesSection();
  const userInput = [
    variablePrompt ? `## 变量规则与格式\n${variablePrompt}` : '',
    `## ${currentVariables}`,
    '## 当前正文\n' + (maintext || '(无)'),
    TASK_INSTRUCTION,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const rawReply = await generateRaw({
      user_input: userInput,
      custom_api: {
        apiurl: secondApi.url.trim(),
        key: secondApi.apiKey || undefined,
        model: secondApi.model.trim(),
        source: 'openai',
      },
      ordered_prompts: ['user_input'],
      should_silence: true,
    });

    const str = typeof rawReply === 'string' ? rawReply.trim() : '';
    return str;
  } catch (e) {
    console.warn('[Aisela] 第二 API 变量请求失败:', e);
    return '';
  }
}

const UPDATE_VARIABLE_REG = /<UpdateVariable>[\s\S]*?<\/UpdateVariable>/i;

/**
 * 将第二 API 返回的变量块合并进主 API 的完整消息
 * 若主消息中已有 <UpdateVariable>，则替换为 variableBlock；否则在末尾追加
 */
export function mergeVariableBlockIntoMessage(mainMessage: string, variableBlock: string): string {
  const trimmed = (variableBlock || '').trim();
  if (!trimmed) return mainMessage;

  if (UPDATE_VARIABLE_REG.test(mainMessage)) {
    return mainMessage.replace(UPDATE_VARIABLE_REG, trimmed);
  }
  return mainMessage.trimEnd() + '\n\n' + trimmed;
}
