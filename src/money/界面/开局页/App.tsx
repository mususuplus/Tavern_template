import { AlertTriangle, Play, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Schema, type SchemaType, type TargetType } from '../../schema';

type OpeningMode = 'standard' | 'tycoon';
type TaskType = SchemaType['任务'][string];
type TargetDraft = TargetType & { name: string };

declare function generate(config: {
  generation_id?: string;
  user_input?: string;
  should_stream?: boolean;
}): Promise<string>;
declare function createChatMessages(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; message: string; data?: Record<string, unknown> }>,
  options?: { refresh?: 'none' | 'affected' | 'all' },
): Promise<unknown>;

const targetStatuses: TargetType['当前状态'][] = ['未接触', '已试探', '已交易', '已屈服', '已资产化'];
const shopTiers: SchemaType['系统']['商城权限'][] = ['金钱道具', '感官强化', '心理干涉', '常识修改', '现实权限'];
const riskLevels: SchemaType['系统']['风险等级'][] = ['低', '中', '高', '极高'];

const modePresets = {
  standard: {
    label: '标准模式',
    text: '资金刚启动，目标边界稳定，第一幕以试探和报价为主。',
    data: Schema.parse({
      系统: {
        等级: 1,
        当前资金: 100_000,
        今日额度: 20_000,
        今日已领取: false,
        商城权限: '金钱道具',
        风险等级: '低',
      },
      界面状态: {
        当前行动类型: '未指定',
        当前场景: '普通都市',
        推荐加载阶段: '自动',
      },
      $flag: {
        首次报价: false,
        首次购买道具: false,
        首次常识补丁: false,
      },
    }),
  },
  tycoon: {
    label: '神豪模式',
    text: 'Lv5 满权限，高资金压场，可直接进入高额度报价与权限道具玩法。',
    data: Schema.parse({
      系统: {
        等级: 5,
        当前资金: 50_000_000,
        今日额度: 5_000_000,
        今日已领取: false,
        商城权限: '现实权限',
        风险等级: '中',
      },
      界面状态: {
        当前行动类型: '未指定',
        当前场景: '普通都市',
        推荐加载阶段: '自动',
      },
      $flag: {
        首次报价: false,
        首次购买道具: false,
        首次常识补丁: false,
      },
    }),
  },
} satisfies Record<OpeningMode, { label: string; text: string; data: SchemaType }>;

const defaultTarget: TargetType = Schema.parse({ 目标库: { 新目标: {} } }).目标库.新目标;

function formatMoney(value: number) {
  return `¥${Math.max(0, Math.floor(value)).toLocaleString('zh-CN')}`;
}

function numberInput(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildDefaultTasks(mode: OpeningMode): Record<string, TaskType> {
  if (mode === 'tycoon') {
    return {
      锁定高价值目标: {
        类型: '系统任务',
        要求: '在普通都市场景中锁定一名高社会价值男性目标，并建立可持续报价路线。',
        进度: '0/1',
        奖励资金: 2_000_000,
        推荐目标: '高价值目标',
        状态: '未开始',
      },
      首次权限压迫: {
        类型: '商城解锁',
        要求: '围绕现实权限或常识修改道具设计一次高风险但可谈判的开局事件。',
        进度: '0/1',
        奖励资金: 5_000_000,
        推荐目标: '当前聚焦目标',
        状态: '未开始',
      },
    };
  }
  return {
    完成首次试探报价: {
      类型: '系统任务',
      要求: '选择一名男性目标，完成一次低门槛资金试探，并记录拒绝、谈判或让步结果。',
      进度: '0/1',
      奖励资金: 50_000,
      推荐目标: '任意目标',
      状态: '未开始',
    },
    建立目标档案: {
      类型: '系统任务',
      要求: '记录目标身份、缺钱原因、最低试探报价与当前突破口。',
      进度: '0/1',
      奖励资金: 30_000,
      推荐目标: '新目标',
      状态: '未开始',
    },
  };
}

function buildOpeningPrompt(
  mode: OpeningMode,
  data: SchemaType,
  form: { playerIdentity: string; scene: string; contactMethod: string; firstSceneGoal: string },
) {
  const targets = Object.entries(data.目标库);
  const modeName = modePresets[mode].label;
  const targetText = targets.length
    ? targets
        .map(
          ([name, target]) =>
            `- ${name}：${target.身份}，${target.年龄}岁，突破口=${target.当前突破口}，当前状态=${target.当前状态}`,
        )
        .join('\n')
    : '当前没有预设目标。请在第一幕生成 1-2 名男性目标';

  return [
    `【money 神豪系统开局：${modeName}】`,
    `玩家公开身份：${form.playerIdentity || '普通大学生'}`,
    `开局场景：${form.scene || data.界面状态.当前场景}`,
    `接触方式：${form.contactMethod || '线上闲鱼'}`,
    `第一幕方向：${form.firstSceneGoal || '获得神豪系统，并形成清晰的资金试探机会。'}`,
    '',
    '初始目标：',
    targetText,
    '',
    '叙事要求：',
    '- 背景是普通都市。',
    '- 开场白大纲为：{{user}}获得神豪系统,介绍功能，描述目标',
    '- 交易过程要有试探、拒绝或谈判、加码、让步、事后合理化与风险反馈。',
    '- 标准模式要保持目标边界尚稳，神豪模式可以更快进入高额度报价与权限道具，但仍允许目标抗拒和警觉。',
    '- 如果第一幕新增目标，请在 MVU 中 insert 到 /目标库/目标名',
  ].join('\n');
}

function createEmptyTarget(index: number): TargetDraft {
  return {
    ...defaultTarget,
    name: `目标${index}`,
    身份: '虚构目标',
    年龄: 24,
    估值金额: 100_000,
    最低试探报价: 5_000,
    当前状态: '未接触',
    当前突破口: '等待试探',
    贪欲: 50,
    自尊: 60,
    羞耻: 40,
    堕落度: 0,
    警觉度: 20,
    最近交易: '暂无交易',
  };
}

function targetToSchema(target: TargetDraft): TargetType {
  const { name: _name, ...rest } = target;
  return rest;
}

export default function App() {
  const [mode, setMode] = useState<OpeningMode>('standard');
  const [system, setSystem] = useState(modePresets.standard.data.系统);
  const [playerIdentity, setPlayerIdentity] = useState('普通大学生');
  const [scene, setScene] = useState('大学宿舍');
  const [contactMethod, setContactMethod] = useState('线上闲鱼');
  const [firstSceneGoal, setFirstSceneGoal] = useState('获得神豪系统。');
  const [targets, setTargets] = useState<TargetDraft[]>([]);
  const [useDefaultTasks, setUseDefaultTasks] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hasStatData = useMemo(() => {
    const parsed = Schema.safeParse(
      _.get(getVariables({ type: 'message', message_id: getCurrentMessageId() }), 'stat_data'),
    );
    return parsed.success;
  }, []);

  const modeInfo = modePresets[mode];
  const targetRecord = useMemo(() => {
    return targets.reduce<Record<string, TargetType>>((record, target) => {
      const name = target.name.trim();
      if (name) record[name] = targetToSchema(target);
      return record;
    }, {});
  }, [targets]);

  const applyMode = (nextMode: OpeningMode) => {
    setMode(nextMode);
    setSystem(modePresets[nextMode].data.系统);
    setFirstSceneGoal(
      nextMode === 'tycoon'
        ? '以满权限和高资金打开局面，快速锁定高价值目标，并给出可谈判的高压报价入口。'
        : '建立第一个可报价目标，让对方在拒绝和动摇之间留下交易入口。',
    );
  };

  const updateTarget = (index: number, updater: (target: TargetDraft) => TargetDraft) => {
    setTargets(prev => prev.map((target, targetIndex) => (targetIndex === index ? updater(target) : target)));
  };

  const startOpening = async () => {
    if (busy) return;
    if (hasStatData && !window.confirm('开始开局会覆盖当前楼层的 money MVU，确认继续？')) return;
    setBusy(true);
    setError('');
    try {
      const parsed = Schema.parse({
        系统: system,
        界面状态: {
          当前聚焦目标: targets[0]?.name.trim() ?? '',
          当前目标状态: targets[0]?.当前状态 ?? '未接触',
          当前行动类型: '未指定',
          当前场景: scene || '普通都市',
          推荐加载阶段: '自动',
        },
        目标库: targetRecord,
        商城: { 已购买道具: {} },
        任务: useDefaultTasks ? buildDefaultTasks(mode) : {},
        $flag: {
          首次报价: false,
          首次购买道具: false,
          首次常识补丁: false,
        },
      });
      updateVariablesWith(
        variables => {
          _.set(variables, 'stat_data', klona(parsed));
          return variables;
        },
        { type: 'message', message_id: getCurrentMessageId() },
      );
      const reply = await generate({
        user_input: buildOpeningPrompt(mode, parsed, { playerIdentity, scene, contactMethod, firstSceneGoal }),
        should_stream: false,
      });
      await createChatMessages([{ role: 'assistant', message: reply, data: { stat_data: klona(parsed) } }], {
        refresh: 'affected',
      });
    } catch (openingError) {
      console.warn('[money opening] 开局失败', openingError);
      setError(openingError instanceof Error ? openingError.message : '开局失败，请检查表单或酒馆接口。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="opening-page">
      <section className="opening-hero">
        <div>
          <span>OPENING SETUP</span>
          <h2>开局设定</h2>
          <p>{modeInfo.text}</p>
        </div>
        <div className="opening-mode-tabs">
          {(['standard', 'tycoon'] as OpeningMode[]).map(item => (
            <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => applyMode(item)}>
              {item === 'tycoon' ? <Sparkles /> : <Play />}
              <span>{modePresets[item].label}</span>
            </button>
          ))}
        </div>
      </section>

      {hasStatData ? (
        <div className="opening-warning">
          <AlertTriangle />
          当前楼层已有 stat_data；重新开局会覆盖当前 money MVU。
        </div>
      ) : null}

      <section className="panel opening-panel">
        <div className="panel-head">
          <div>
            <span>SYSTEM SEED</span>
            <h2>系统参数</h2>
          </div>
          <Sparkles />
        </div>
        <div className="opening-form-grid">
          <label>
            <span>系统等级</span>
            <input
              type="number"
              min="1"
              max="5"
              value={system.等级}
              onChange={event => setSystem(prev => ({ ...prev, 等级: numberInput(event.target.value) }))}
            />
          </label>
          <label>
            <span>当前资金</span>
            <input
              type="number"
              min="0"
              value={system.当前资金}
              onChange={event => setSystem(prev => ({ ...prev, 当前资金: numberInput(event.target.value) }))}
            />
          </label>
          <label>
            <span>今日额度</span>
            <input
              type="number"
              min="0"
              value={system.今日额度}
              onChange={event => setSystem(prev => ({ ...prev, 今日额度: numberInput(event.target.value) }))}
            />
          </label>
          <label>
            <span>商城权限</span>
            <select
              value={system.商城权限}
              onChange={event =>
                setSystem(prev => ({ ...prev, 商城权限: event.target.value as SchemaType['系统']['商城权限'] }))
              }
            >
              {shopTiers.map(tier => (
                <option key={tier}>{tier}</option>
              ))}
            </select>
          </label>
          <label>
            <span>风险等级</span>
            <select
              value={system.风险等级}
              onChange={event =>
                setSystem(prev => ({ ...prev, 风险等级: event.target.value as SchemaType['系统']['风险等级'] }))
              }
            >
              {riskLevels.map(risk => (
                <option key={risk}>{risk}</option>
              ))}
            </select>
          </label>
          <label>
            <span>今日额度</span>
            <select
              value={system.今日已领取 ? '已领取' : '未领取'}
              onChange={event => setSystem(prev => ({ ...prev, 今日已领取: event.target.value === '已领取' }))}
            >
              <option>未领取</option>
              <option>已领取</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel opening-panel">
        <div className="panel-head">
          <div>
            <span>FIRST SCENE</span>
            <h2>开局场景</h2>
          </div>
          <Play />
        </div>
        <div className="opening-form-grid">
          <label>
            <span>玩家公开身份</span>
            <input value={playerIdentity} onChange={event => setPlayerIdentity(event.target.value)} />
          </label>
          <label>
            <span>当前场景</span>
            <input value={scene} onChange={event => setScene(event.target.value)} />
          </label>
          <label>
            <span>与NPC的接触方式</span>
            <input value={contactMethod} onChange={event => setContactMethod(event.target.value)} />
          </label>
          <label className="opening-wide-field">
            <span>第一幕方向</span>
            <textarea value={firstSceneGoal} onChange={event => setFirstSceneGoal(event.target.value)} />
          </label>
          <label className="opening-check">
            <input
              type="checkbox"
              checked={useDefaultTasks}
              onChange={event => setUseDefaultTasks(event.target.checked)}
            />
            <span>写入模式默认任务</span>
          </label>
        </div>
      </section>

      <section className="panel opening-panel">
        <div className="panel-head">
          <div>
            <span>TARGET SEED</span>
            <h2>初始目标</h2>
          </div>
          <button
            type="button"
            className="control-button gold"
            disabled={targets.length >= 3}
            onClick={() => setTargets(prev => [...prev, createEmptyTarget(prev.length + 1)])}
          >
            <Plus />
            添加目标
          </button>
        </div>
        {targets.length ? (
          <div className="opening-target-list">
            {targets.map((target, index) => (
              <article key={index} className="opening-target-card">
                <div className="opening-target-head">
                  <strong>目标 {index + 1}</strong>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => setTargets(prev => prev.filter((_, targetIndex) => targetIndex !== index))}
                  >
                    <Trash2 />
                  </button>
                </div>
                <div className="opening-form-grid">
                  <label>
                    <span>姓名</span>
                    <input
                      value={target.name}
                      onChange={event => updateTarget(index, prev => ({ ...prev, name: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>身份</span>
                    <input
                      value={target.身份}
                      onChange={event => updateTarget(index, prev => ({ ...prev, 身份: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>年龄</span>
                    <input
                      type="number"
                      min="18"
                      value={target.年龄}
                      onChange={event =>
                        updateTarget(index, prev => ({ ...prev, 年龄: numberInput(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    <span>估值金额</span>
                    <input
                      type="number"
                      min="0"
                      value={target.估值金额}
                      onChange={event =>
                        updateTarget(index, prev => ({ ...prev, 估值金额: numberInput(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    <span>最低试探报价</span>
                    <input
                      type="number"
                      min="0"
                      value={target.最低试探报价}
                      onChange={event =>
                        updateTarget(index, prev => ({ ...prev, 最低试探报价: numberInput(event.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    <span>状态</span>
                    <select
                      value={target.当前状态}
                      onChange={event =>
                        updateTarget(index, prev => ({
                          ...prev,
                          当前状态: event.target.value as TargetType['当前状态'],
                        }))
                      }
                    >
                      {targetStatuses.map(status => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="opening-wide-field">
                    <span>当前突破口</span>
                    <input
                      value={target.当前突破口}
                      onChange={event => updateTarget(index, prev => ({ ...prev, 当前突破口: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="opening-slider-grid">
                  {(['贪欲', '自尊', '羞耻', '堕落度', '警觉度'] as const).map(key => (
                    <label key={key}>
                      <span>
                        {key} {target[key]}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={target[key]}
                        onChange={event =>
                          updateTarget(index, prev => ({ ...prev, [key]: numberInput(event.target.value) }))
                        }
                      />
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Sparkles />
            <strong>未预设目标</strong>
            <span>第一幕会要求 AI 生成 1-2 名男性目标。</span>
          </div>
        )}
      </section>

      {error ? (
        <div className="opening-warning danger">
          <AlertTriangle />
          {error}
        </div>
      ) : null}

      <button type="button" className="primary-wide opening-start" disabled={busy} onClick={startOpening}>
        <Play />
        {busy ? '正在生成第一幕' : '开始开局'}
      </button>
    </div>
  );
}
