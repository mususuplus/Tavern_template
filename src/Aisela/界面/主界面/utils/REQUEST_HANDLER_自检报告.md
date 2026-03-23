# requestHandler 功能自检报告

对照提示词要求，检查 Aisela 项目中是否实现 `utils/requestHandler.ts` 所述功能。

---

## 1. 文件与入口

| 项目 | 要求 | 现状 |
|-----|------|------|
| 文件存在 | `utils/requestHandler.ts` | ❌ **未实现**：该文件不存在，仅有 `utils/messageParser.ts`、`utils/chronicleUpdater.ts` |
| 统一入口 | `handleUnifiedRequest` 接收用户输入 + 回调 | ❌ **未实现**：App.tsx 使用 `handleSend` / `handleRegenerate` 内联逻辑，无统一 requestHandler |

---

## 2. handleUnifiedRequest 各项功能

| 功能点 | 要求 | 现状 |
|--------|------|------|
| 流式/非流式 | 从 localStorage 读取设置，支持两种生成模式 | ❌ 未实现：仅 `generate({ user_input })`，未传 `should_stream`，未读 localStorage |
| 消息隐藏 | 发送前：楼层 ≥30 时隐藏 0 到 (当前楼层-15) | ❌ 未实现：无 `setChatMessages(..., is_hidden)` 等调整逻辑 |
| 预设提示词 | 发送前：开局阶段启用「开局COT」，正常阶段启用「COT」 | ❌ 未实现：无世界书条目切换（getWorldbook/updateWorldbookWith） |
| MVU 基础数据 | 获取基础 MVU 并传到 user 消息 | ❌ 未实现：`createChatMessages([{ role: 'user', message: prompt }])` 未带 `data`，未调用 getBaseMvuData |
| 创建 user 消息 | `refresh: 'none'` | ✅ 已实现：`createChatMessages(..., { refresh: 'none' })` |
| 流式事件 | 若启用流式，注册流式事件监听 | ❌ 未实现：无 `eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, ...)` |
| 调用 generate | 生成 LLM 回复 | ✅ 已实现：`generate({ user_input: prompt })`（但未区分流式/非流式） |
| 移除 thinking/think | 移除 `<thinking>` 和 `<think>` 标签 | ❌ 未实现：rawReply 直接用于创建 assistant，未做 removeThinkingTags |
| 验证格式 | 必须包含 `<maintext>` | ❌ 未实现：无 validateMessage，失败时未删 user 消息、未恢复界面 |
| 提取最后标签 | maintext、option、sum、UpdateVariable、mission 最后一次出现 | ⚠️ 部分：messageParser 有 parseMaintext/parseOptions/parseSum 等，但未在「生成后」统一提取并重组 finalMessage |
| Mvu.parseMessage | 解析消息中的变量更新命令 | ❌ 未实现：当前用 `applyVariableCommands`（基于 JSONPatch），未用 `Mvu.parseMessage` |
| 创建 assistant | 携带解析后的 data | ❌ 未实现：assistant 消息未带 `data`，未传 finalData |
| Mvu.replaceMvuData | 将更新后的变量写回楼层 | ❌ 未实现：未调用 replaceMvuData，仅通过 applyVariableCommands 写酒馆变量 |
| 编年史 | 延迟 500ms 更新编年史 | ❌ 未实现：未调用 checkAndUpdateChronicle，更无 500ms 延迟 |
| 错误处理 | 生成失败时删除 user 消息、恢复界面 | ⚠️ 部分：catch 里只 setLogs，未删 user 消息、未统一 onHideGenerating/onEnableOptions |

---

## 3. 标签提取函数（导出）

| 函数 | 要求 | 现状 |
|------|------|------|
| extractLastMaintext | 最后一次 `<maintext>`，忽略 thinking 内 | ⚠️ messageParser 有 `parseMaintext`，但未以 extractLastMaintext 导出于 requestHandler |
| extractLastOption | 最后一次 `<option>` | ⚠️ 有 parseOptions，无单独 extractLastOption 导出 |
| extractLastSum | 最后一次 `<sum>` | ⚠️ 有 parseSum，无 extractLastSum 导出 |
| extractLastUpdateVariable | 最后一次 `<UpdateVariable>` | ❌ 无 |
| extractLastMission | 最后一次 `<mission>`（若使用） | ❌ 无 |

---

## 4. 流式文本处理函数（内部）

| 函数 | 要求 | 现状 |
|------|------|------|
| extractMaintextFromStream | 从流式文本中提取 `<maintext>`（从标签出现开始显示） | ❌ 未实现 |
| extractMissionFromStream | 从流式文本中提取 `<mission>` | ❌ 未实现 |
| removeThinkingTagsFromStream | 移除流式中的 `<thinking>`（含未闭合） | ❌ 未实现 |

---

## 5. 消息隐藏管理（可选，导出）

| 函数 | 要求 | 现状 |
|------|------|------|
| adjustMessageVisibility | 根据当前楼层调整消息隐藏范围（读档用） | ❌ 未实现 |

---

## 6. 参考实现位置

- 参考实现：`src/mhjg/utils/unifiedRequestHandler.ts`
- 包含：handleUnifiedRequest、流式监听、世界书开局/正常 COT 切换、getBaseMvuData、removeThinkingTags、removeThinkingTagsFromStream、extractLast*、validateMessage、Mvu.parseMessage + replaceMvuData、编年史调用、错误时删 user 消息等。

---

## 7. 结论

- **requestHandler.ts 未实现**，提示词中描述的功能在 Aisela 中**绝大部分未实现**。
- 现有逻辑集中在 **App.tsx** 的 `handleSend` / `handleRegenerate`：仅实现「创建 user → generate → 创建 assistant → applyVariableCommands」，且无流式、无消息隐藏、无预设提示词管理、无 MVU 数据注入与 Mvu.parseMessage/replaceMvuData、无编年史延迟更新、无规范验证与失败时删 user 消息等。
- 若需完整符合提示词，需要在 Aisela 中**新增 `utils/requestHandler.ts`**，并参照 `src/mhjg/utils/unifiedRequestHandler.ts` 实现上述各项，再在 App.tsx 中改为调用 `handleUnifiedRequest`。
