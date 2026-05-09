import {
  AlertTriangle,
  Banknote,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Crosshair,
  Database,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  Radar,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Terminal,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Schema, type SchemaType, type ShopItemType, type TargetType } from '../../schema';

type PageKey = 'overview' | 'targets' | 'quote' | 'shop' | 'tasks' | 'manage';
type ModalState = { title: string; prompt: string; risk?: string } | null;
type TargetEntry = [string, TargetType];
type ShopEntry = [string, ShopItemType];
type VariableSnapshot = {
  data: SchemaType;
  hasStatData: boolean;
  option: { type: 'message'; message_id: number | 'latest' };
};
type TaskType = SchemaType['任务'][string];
type OwnedItemType = SchemaType['商城']['已购买道具'][string];

const pageItems: Array<{ key: PageKey; label: string; hint: string }> = [
  { key: 'overview', label: '总览', hint: '资金与权限' },
  { key: 'targets', label: '目标库', hint: '估值市场' },
  { key: 'quote', label: '报价行动', hint: '生成方案' },
  { key: 'shop', label: '黑市商城', hint: '系统道具' },
  { key: 'tasks', label: '任务中心', hint: '升级路线' },
  { key: 'manage', label: '变量管理', hint: '直接写入' },
];

const shopTiers = ['金钱道具', '感官强化', '心理干涉', '常识修改', '现实权限'] as const;

const fallbackShop: Record<string, ShopItemType> = {
  标价眼镜: { 层级: '金钱道具', 价格: 80_000, 描述: '显示目标当前可接受的最低试探报价区间。', 解锁等级: 1, 风险: '低' },
  匿名黑卡: {
    层级: '金钱道具',
    价格: 120_000,
    描述: '隐藏资金来源，降低首次试探时的社会风险。',
    解锁等级: 1,
    风险: '低',
  },
  私密委托合同: { 层级: '金钱道具', 价格: 180_000, 描述: '将一次非公开请求包装成资金委托。', 解锁等级: 1, 风险: '中' },
  诚实香水: {
    层级: '感官强化',
    价格: 260_000,
    描述: '降低目标伪装强度，让真实动摇更容易暴露。',
    解锁等级: 2,
    风险: '中',
  },
  羞耻回声贴片: { 层级: '感官强化', 价格: 340_000, 描述: '放大目标对交易边界的自我感知。', 解锁等级: 2, 风险: '中' },
  暗示芯片: {
    层级: '心理干涉',
    价格: 900_000,
    描述: '植入短期行为暗示，稳定性受目标状态影响。',
    解锁等级: 3,
    风险: '高',
  },
  服从口令卡: { 层级: '心理干涉', 价格: 1_400_000, 描述: '设定限定场景内生效的口令规则。', 解锁等级: 3, 风险: '高' },
  局部常识补丁: {
    层级: '常识修改',
    价格: 4_800_000,
    描述: '让指定场景短期接受一条异常交易常识。',
    解锁等级: 4,
    风险: '极高',
  },
  公开异常屏蔽器: {
    层级: '常识修改',
    价格: 6_600_000,
    描述: '让旁观者自动为异常行为寻找合理解释。',
    解锁等级: 4,
    风险: '极高',
  },
  身份重写合同: {
    层级: '现实权限',
    价格: 18_000_000,
    描述: '将目标绑定为新的社会身份与长期收益节点。',
    解锁等级: 5,
    风险: '极高',
  },
};

function variableOptions() {
  const options = [{ type: 'message' as const, message_id: getCurrentMessageId() }];
  try {
    const latest = getLastMessageId();
    if (latest !== options[0].message_id) options.push({ type: 'message' as const, message_id: latest });
  } catch {
    // Host may not expose latest message in some render contexts.
  }
  return options;
}

function readData() {
  for (const option of variableOptions()) {
    const raw = _.get(getVariables(option), 'stat_data');
    const parsed = Schema.safeParse(raw);
    if (raw && parsed.success) return { data: parsed.data, hasStatData: true, option };
  }
  return { data: Schema.parse({}), hasStatData: false, option: variableOptions()[0] };
}

function formatMoney(value: number) {
  return `¥${Math.max(0, Math.floor(value)).toLocaleString('zh-CN')}`;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskClass(risk: string) {
  return risk === '极高' || risk === '高' ? 'danger' : risk === '中' ? 'warn' : 'safe';
}

function entriesOf<T>(record: Record<string, T>) {
  return Object.entries(record) as Array<[string, T]>;
}

function isTierUnlocked(level: number, tier: string) {
  return level >= Math.max(1, shopTiers.indexOf(tier as (typeof shopTiers)[number]) + 1);
}

const targetStatuses = ['未接触', '已试探', '已交易', '已屈服', '已资产化'] as const;
const taskTypes = ['系统任务', '屈服事件', '商城解锁', '资产任务'] as const;
const taskStatuses = ['未开始', '进行中', '已完成', '已失败'] as const;

const defaultTarget: TargetType = Schema.parse({ 目标库: { 新目标: {} } }).目标库.新目标;
const defaultTask: TaskType = Schema.parse({ 任务: { 新任务: {} } }).任务.新任务;

function numberInput(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildInitPrompt() {
  return [
    '【初始化神豪系统】',
    '请为当前聊天创建 money 神豪系统的轻量 MVU stat_data。',
    '要求：所有目标均为虚构角色；唯一货币为资金；不要写好感、依赖、底线。',
    '初始系统建议：等级 1，当前资金 1000000，今日额度 500000，商城权限 金钱道具，风险等级 低。',
    '界面状态默认：当前聚焦目标为空，当前目标状态 未接触，当前行动类型 未指定，当前场景 未指定，推荐加载阶段 自动。',
    'MVU 注意：只维护 系统、界面状态、目标库、商城.已购买道具、任务、$flag；不要写资产表、常识规则表、商城库存表或认知日志。',
    '新增目标、任务或已购买道具时，可以直接 insert 到动态键路径；批量新增时可 replace 整个父对象并保留旧键。',
    '请在回复末尾用 MVU 更新：系统、界面状态、目标库、商城、任务、$flag。',
  ].join('\n');
}

function buildAllowancePrompt(data: SchemaType) {
  return [
    '【领取今日额度】',
    `当前系统等级：Lv${data.系统.等级}`,
    `当前资金：${formatMoney(data.系统.当前资金)}`,
    `今日额度：${formatMoney(data.系统.今日额度)}`,
    '请根据神豪系统规则结算今日额度领取、资金变化和任务进度。',
    '如果今日已领取，请提示额度已锁定，不要重复增加资金。',
    '请在回复末尾更新 MVU 的 系统、任务、$flag。',
  ].join('\n');
}

function buildQuotePrompt(
  targetName: string,
  target: TargetType | undefined,
  budget: number,
  action: string,
  tools: string[],
) {
  const toolText = tools.length ? tools.join('、') : '无';
  return [
    `【报价行动：${action}】`,
    `目标：${targetName || '未指定'}`,
    `预算：${formatMoney(budget)}`,
    `使用道具：${toolText}`,
    target ? `目标档案：${target.身份} / ${target.年龄}岁 / 状态 ${target.当前状态}` : '目标档案：未读取',
    target
      ? `当前属性：贪欲${target.贪欲}，自尊${target.自尊}，羞耻${target.羞耻}，堕落度${target.堕落度}，警觉度${target.警觉度}`
      : '当前属性：未知',
    '请根据预算、目标属性、道具效果与风险判断剧情结果。',
    '允许目标拒绝、谈条件、抬价或产生警觉；不要把行动写成无条件成功。',
    `请同步更新 界面状态：当前聚焦目标=${targetName || '未指定'}，当前目标状态=目标库中该目标结算后的当前状态，当前行动类型=${action}，当前场景=本轮实际场景，推荐加载阶段=${action}。`,
    'MVU 注意：如果需要新增目标库记录，可以 insert /目标库/目标名；字段名必须严格匹配。',
    '请在回复末尾更新 MVU 的 系统、界面状态、目标库、任务、$flag。',
  ].join('\n');
}

function buildPurchasePrompt(name: string, item: ShopItemType) {
  const routeAction = item.层级 === '常识修改' ? '常识补丁' : '购买道具';
  return [
    '【黑市商城购买】',
    `道具：${name}`,
    `层级：${item.层级}`,
    `价格：${formatMoney(item.价格)}`,
    `风险：${item.风险}`,
    `效果描述：${item.描述}`,
    '请结算是否购买成功、资金扣除、已购买道具变化、首次购买道具标记与可能的系统风险提示。',
    `请同步更新 界面状态：当前行动类型=${routeAction}，推荐加载阶段=自动；如果本轮没有目标，当前聚焦目标保持原值。`,
    'MVU 注意：如果该道具尚未存在于 已购买道具，可以 insert /商城/已购买道具/道具名。新道具值必须是 {数量: 1, 层级: 道具层级}。',
    '请在回复末尾更新 MVU 的 系统、界面状态、商城、任务、$flag。',
  ].join('\n');
}

function StatBar({
  label,
  value,
  tone = 'gold',
}: {
  label: string;
  value: number;
  tone?: 'gold' | 'blue' | 'purple' | 'red' | 'green';
}) {
  return (
    <div className="stat-line">
      <span>{label}</span>
      <div className="stat-track">
        <i className={tone} style={{ width: `${clampPercent(value)}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function MoneyTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? 'money-tile accent' : 'money-tile'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({
  title,
  kicker,
  icon,
  children,
}: {
  title: string;
  kicker?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <span>{kicker ?? 'SYSTEM BLOCK'}</span>
          <h2>{title}</h2>
        </div>
        {icon}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Terminal />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function CompactHud({
  data,
  hasStatData,
  onExpand,
  onAction,
}: {
  data: SchemaType;
  hasStatData: boolean;
  onExpand: () => void;
  onAction: (modal: ModalState) => void;
}) {
  return (
    <div className="money-root compact-hud">
      <div className="brand-chip">
        <Database />
        <div>
          <strong>MONEY SYS</strong>
          <span>{hasStatData ? 'TERMINAL ONLINE' : 'INIT REQUIRED'}</span>
        </div>
      </div>
      <div className="hud-money">
        <span>资金</span>
        <strong>{formatMoney(data.系统.当前资金)}</strong>
      </div>
      <MoneyTile label="系统等级" value={`Lv${data.系统.等级}`} />
      <MoneyTile label="今日额度" value={`${formatMoney(data.系统.今日额度)}${data.系统.今日已领取 ? ' 已领' : ''}`} />
      <MoneyTile label="当前权限" value={data.系统.商城权限} accent />
      <MoneyTile label="风险等级" value={data.系统.风险等级} />
      <button
        type="button"
        className="primary-action"
        onClick={hasStatData ? onExpand : () => onAction({ title: '初始化神豪系统', prompt: buildInitPrompt() })}
      >
        {hasStatData ? <ChevronDown /> : <Sparkles />}
        {hasStatData ? '展开控制台' : '生成初始化指令'}
      </button>
    </div>
  );
}

function Sidebar({ active, level, onChange }: { active: PageKey; level: number; onChange: (page: PageKey) => void }) {
  return (
    <nav className="sidebar" aria-label="SYSTEM NAV">
      <div className="sidebar-title">
        <span>SYSTEM</span>
        <i />
      </div>
      {pageItems.map((page, index) => (
        <button
          key={page.key}
          type="button"
          className={active === page.key ? 'active' : ''}
          onClick={() => onChange(page.key)}
        >
          <b>{String(index + 1).padStart(2, '0')}</b>
          <span>{page.label}</span>
          <small>{page.hint}</small>
          <ChevronRight />
        </button>
      ))}
      <div className="permission-pill">
        <Sparkles />
        <span>Lv{level}</span>
      </div>
    </nav>
  );
}

function TopHud({
  data,
  onCollapse,
  onAction,
}: {
  data: SchemaType;
  onCollapse: () => void;
  onAction: (modal: ModalState) => void;
}) {
  return (
    <header className="top-hud">
      <div className="terminal-mark">
        <WalletCards />
        <span>SECURE LINK</span>
      </div>
      <div className="capital-block">
        <span>资金</span>
        <strong>{formatMoney(data.系统.当前资金)}</strong>
      </div>
      <div className="level-block">
        <span>系统等级</span>
        <strong>Lv{data.系统.等级}</strong>
        <div className="mini-track">
          <i style={{ width: `${data.系统.等级 * 20}%` }} />
        </div>
      </div>
      <div className="level-block">
        <span>今日额度</span>
        <strong>{formatMoney(data.系统.今日额度)}</strong>
        <button
          type="button"
          onClick={() =>
            onAction({
              title: '领取今日额度',
              prompt: buildAllowancePrompt(data),
              risk: data.系统.今日已领取 ? '今日额度已领取，AI 应拒绝重复结算。' : undefined,
            })
          }
        >
          {data.系统.今日已领取 ? '额度已锁定' : '生成领取指令'}
        </button>
      </div>
      <div className="permission-pill">
        <Sparkles />
        <span>{data.系统.商城权限}</span>
      </div>
      <div className={`risk-pill ${riskClass(data.系统.风险等级)}`}>
        <ShieldAlert />
        <span>风险 {data.系统.风险等级}</span>
      </div>
      <button type="button" className="ghost-icon" title="折叠状态栏" onClick={onCollapse}>
        <X />
      </button>
    </header>
  );
}

function OverviewPage({ data, targets }: { data: SchemaType; targets: TargetEntry[] }) {
  const tasks = entriesOf(data.任务);
  const ownedCount = entriesOf(data.商城.已购买道具).reduce((sum, [, item]) => sum + item.数量, 0);
  return (
    <div className="page-grid">
      <Panel title="资金总览" kicker="CAPITAL" icon={<Banknote />}>
        <div className="hero-money">
          <span>可支配资金</span>
          <strong>{formatMoney(data.系统.当前资金)}</strong>
          <p>轻量 MVU：资金、目标、任务与 EJS 路由分离记录。</p>
        </div>
      </Panel>
      <Panel title="系统权限" kicker="PERMISSION" icon={<Radar />}>
        <div className="metrics-grid">
          <MoneyTile label="等级" value={`Lv${data.系统.等级}`} accent />
          <MoneyTile label="商城权限" value={data.系统.商城权限} />
          <MoneyTile label="风险等级" value={data.系统.风险等级} />
          <MoneyTile label="持有道具" value={`${ownedCount}`} />
        </div>
      </Panel>
      <Panel title="当前任务" kicker="TASK FEED" icon={<Clipboard />}>
        {tasks.length ? (
          <div className="task-stack">
            {tasks.slice(0, 3).map(([name, task]) => (
              <article key={name} className="task-row">
                <strong>{name}</strong>
                <span>{task.要求}</span>
                <b>{task.进度}</b>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无任务" text="等待 AI 写入系统任务或屈服事件。" />
        )}
      </Panel>
      <Panel title="目标市场" kicker="TARGET SNAPSHOT" icon={<Target />}>
        {targets.length ? (
          <div className="target-mini-list">
            {targets.slice(0, 4).map(([name, target]) => (
              <div key={name}>
                <strong>{name}</strong>
                <span>
                  {target.当前状态} / {formatMoney(target.估值金额)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="目标库为空" text="让剧情写入第一个虚构目标档案。" />
        )}
      </Panel>
    </div>
  );
}

function TargetCard({ name, target, onQuote }: { name: string; target: TargetType; onQuote: (name: string) => void }) {
  return (
    <article className="target-card">
      <div className="target-head">
        <div>
          <span>
            {target.身份} / {target.年龄}岁
          </span>
          <h3>{name}</h3>
        </div>
        <b>{target.当前状态}</b>
      </div>
      <div className="price-grid">
        <MoneyTile label="估值金额" value={formatMoney(target.估值金额)} accent />
        <MoneyTile label="最低试探" value={formatMoney(target.最低试探报价)} />
      </div>
      <StatBar label="贪欲" value={target.贪欲} />
      <StatBar label="自尊" value={target.自尊} tone="blue" />
      <StatBar label="羞耻" value={target.羞耻} tone="purple" />
      <StatBar label="堕落度" value={target.堕落度} tone="red" />
      <StatBar label="警觉度" value={target.警觉度} tone="green" />
      <div className="breakpoint">
        <span>当前突破口</span>
        <strong>{target.当前突破口}</strong>
      </div>
      <div className="card-actions">
        <button type="button" onClick={() => onQuote(name)}>
          发起试探
        </button>
        <small>{target.最近交易}</small>
      </div>
    </article>
  );
}

function TargetsPage({ targets, onQuote }: { targets: TargetEntry[]; onQuote: (name: string) => void }) {
  const [status, setStatus] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const filtered = targets.filter(([name, target]) => {
    const matchesStatus = status === '全部' || target.当前状态 === status;
    const matchesKeyword = !keyword || `${name}${target.身份}${target.当前突破口}`.includes(keyword);
    return matchesStatus && matchesKeyword;
  });

  return (
    <div className="targets-page">
      <div className="filter-bar">
        <label>
          <span>状态</span>
          <select value={status} onChange={event => setStatus(event.target.value)}>
            {['全部', '未接触', '已试探', '已交易', '已屈服', '已资产化'].map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="search-box">
          <Search />
          <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="输入姓名或突破口" />
        </label>
      </div>
      {filtered.length ? (
        <div className="target-grid">
          {filtered.map(([name, target]) => (
            <TargetCard key={name} name={name} target={target} onQuote={onQuote} />
          ))}
        </div>
      ) : (
        <EmptyState title="没有匹配目标" text="调整筛选条件，或让剧情写入新的目标档案。" />
      )}
    </div>
  );
}

function QuotePage({
  data,
  targets,
  shop,
  selectedTarget,
  onAction,
}: {
  data: SchemaType;
  targets: TargetEntry[];
  shop: ShopEntry[];
  selectedTarget: string;
  onAction: (modal: ModalState) => void;
}) {
  const firstTarget = selectedTarget || targets[0]?.[0] || '';
  const [targetName, setTargetName] = useState(firstTarget);
  const [budget, setBudget] = useState(120_000);
  const [action, setAction] = useState('原味交易');
  const [tools, setTools] = useState<string[]>([]);
  const target = data.目标库[targetName];
  const successRate = target
    ? clampPercent(
        45 +
          target.贪欲 * 0.25 +
          target.羞耻 * 0.12 +
          target.堕落度 * 0.18 -
          target.自尊 * 0.18 -
          target.警觉度 * 0.16 +
          tools.length * 8,
      )
    : 0;
  const risk =
    target && (target.警觉度 > 70 || action.includes('干涉')) ? '高' : target && successRate < 45 ? '中' : '低';

  useEffect(() => {
    if (selectedTarget) setTargetName(selectedTarget);
  }, [selectedTarget]);

  return (
    <div className="quote-layout">
      <Panel title="行动方案生成器" kicker="QUOTE BUILDER" icon={<Crosshair />}>
        <div className="form-grid">
          <label>
            <span>目标</span>
            <select value={targetName} onChange={event => setTargetName(event.target.value)}>
              <option value="">未指定</option>
              {targets.map(([name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>预算</span>
            <input type="number" min="0" value={budget} onChange={event => setBudget(Number(event.target.value))} />
          </label>
          <label>
            <span>行动类型</span>
            <select value={action} onChange={event => setAction(event.target.value)}>
              {['原味交易', '私密素材', '线上支配', '线下见面', '恶堕转折', '资产化维护', '常识补丁'].map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="tool-picker">
          {shop.slice(0, 8).map(([name, item]) => {
            const owned = data.商城.已购买道具[name]?.数量 > 0;
            return (
              <button
                key={name}
                type="button"
                className={tools.includes(name) ? 'active' : ''}
                disabled={!owned}
                onClick={() =>
                  setTools(prev => (prev.includes(name) ? prev.filter(itemName => itemName !== name) : [...prev, name]))
                }
              >
                {owned ? <PackageCheck /> : <Lock />}
                <span>{name}</span>
                <small>{item.层级}</small>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="primary-wide"
          disabled={!targetName}
          onClick={() =>
            onAction({
              title: `报价行动：${action}`,
              prompt: buildQuotePrompt(targetName, target, budget, action, tools),
              risk: budget > data.系统.当前资金 ? '预算高于当前资金，AI 应判定资金不足或要求调整。' : undefined,
            })
          }
        >
          <Send />
          生成行动指令
        </button>
      </Panel>
      <Panel title="风险预览" kicker="RISK MODEL" icon={<AlertTriangle />}>
        <div className="success-ring">
          <strong>{successRate}%</strong>
          <span>预估成功率</span>
        </div>
        <div className={`risk-note ${riskClass(risk)}`}>
          <b>风险等级：{risk}</b>
          <p>失败后可能提高目标警觉、抬升同类报价成本，或触发系统审计痕迹。</p>
        </div>
        {target ? (
          <div className="quote-target">
            <strong>{targetName}</strong>
            <span>{target.当前突破口}</span>
            <small>最低试探 {formatMoney(target.最低试探报价)}</small>
          </div>
        ) : (
          <EmptyState title="未选择目标" text="目标库为空时只能生成初始化或泛用行动。" />
        )}
      </Panel>
    </div>
  );
}

function ShopPage({
  data,
  shop,
  onAction,
}: {
  data: SchemaType;
  shop: ShopEntry[];
  onAction: (modal: ModalState) => void;
}) {
  const initialTier = shopTiers[Math.max(0, Math.min(shopTiers.length - 1, data.系统.等级 - 1))];
  const [tier, setTier] = useState<(typeof shopTiers)[number]>(initialTier);
  return (
    <div className="shop-page">
      <div className="tier-tabs">
        {shopTiers.map(item => {
          const unlocked = isTierUnlocked(data.系统.等级, item);
          return (
            <button
              key={item}
              type="button"
              className={tier === item ? 'active' : ''}
              disabled={!unlocked}
              onClick={() => setTier(item)}
            >
              {unlocked ? <Sparkles /> : <Lock />}
              {item}
            </button>
          );
        })}
      </div>
      <div className="shop-grid">
        {shop
          .filter(([, item]) => item.层级 === tier)
          .map(([name, item]) => {
            const locked = data.系统.等级 < item.解锁等级 || !isTierUnlocked(data.系统.等级, item.层级);
            const poor = data.系统.当前资金 < item.价格;
            return (
              <article key={name} className={locked ? 'shop-card locked' : 'shop-card'}>
                <div>
                  <span>{item.层级}</span>
                  <h3>{name}</h3>
                </div>
                <p>{item.描述}</p>
                <div className="shop-meta">
                  <b>{formatMoney(item.价格)}</b>
                  <small className={riskClass(item.风险)}>风险 {item.风险}</small>
                </div>
                <button
                  type="button"
                  disabled={locked || poor}
                  onClick={() =>
                    onAction({
                      title: `购买道具：${name}`,
                      prompt: buildPurchasePrompt(name, item),
                      risk: poor ? '当前资金不足，AI 应拒绝购买或生成筹资建议。' : undefined,
                    })
                  }
                >
                  {locked ? `Lv${item.解锁等级} 解锁` : poor ? '资金不足' : '生成购买指令'}
                </button>
              </article>
            );
          })}
      </div>
    </div>
  );
}

function TasksPage({ data }: { data: SchemaType }) {
  const tasks = entriesOf(data.任务);
  return tasks.length ? (
    <div className="task-board">
      {tasks.map(([name, task]) => (
        <article key={name} className="mission-card">
          <div>
            <span>{task.类型}</span>
            <h3>{name}</h3>
            <b>{task.状态}</b>
          </div>
          <p>{task.要求}</p>
          <div className="mission-meta">
            <MoneyTile label="进度" value={task.进度} />
            <MoneyTile label="奖励资金" value={formatMoney(task.奖励资金)} accent />
            <MoneyTile label="推荐目标" value={task.推荐目标} />
          </div>
        </article>
      ))}
    </div>
  ) : (
    <EmptyState title="任务中心空白" text="等待系统在剧情中派发任务、屈服事件或商城解锁条件。" />
  );
}

function ManagePage({
  data,
  shop,
  onCommit,
}: {
  data: SchemaType;
  shop: ShopEntry[];
  onCommit: (updater: (prev: SchemaType) => SchemaType) => void;
}) {
  const targetEntries = entriesOf(data.目标库);
  const taskEntries = entriesOf(data.任务);
  const ownedEntries = entriesOf(data.商城.已购买道具);
  const [targetName, setTargetName] = useState(targetEntries[0]?.[0] ?? '');
  const [targetDraft, setTargetDraft] = useState<TargetType>(targetEntries[0]?.[1] ?? defaultTarget);
  const [itemName, setItemName] = useState(shop[0]?.[0] ?? '');
  const [itemTier, setItemTier] = useState<OwnedItemType['层级']>('金钱道具');
  const [taskName, setTaskName] = useState(taskEntries[0]?.[0] ?? '');
  const [taskDraft, setTaskDraft] = useState<TaskType>(taskEntries[0]?.[1] ?? defaultTask);

  useEffect(() => {
    if (!targetName) return;
    setTargetDraft(data.目标库[targetName] ?? defaultTarget);
  }, [data.目标库, targetName]);

  useEffect(() => {
    if (!taskName) return;
    setTaskDraft(data.任务[taskName] ?? defaultTask);
  }, [data.任务, taskName]);

  const saveTarget = () => {
    const name = targetName.trim();
    if (!name) return;
    onCommit(prev => ({
      ...prev,
      目标库: {
        ...prev.目标库,
        [name]: targetDraft,
      },
      界面状态: {
        ...prev.界面状态,
        当前聚焦目标: name,
        当前目标状态: targetDraft.当前状态,
      },
    }));
  };

  const deleteTarget = (name: string) => {
    if (!name) return;
    onCommit(prev => {
      const nextTargets = { ...prev.目标库 };
      delete nextTargets[name];
      const shouldClearFocus = prev.界面状态.当前聚焦目标 === name;
      return {
        ...prev,
        目标库: nextTargets,
        界面状态: shouldClearFocus ? { ...prev.界面状态, 当前聚焦目标: '', 当前目标状态: '未接触' } : prev.界面状态,
      };
    });
    setTargetName('');
    setTargetDraft(defaultTarget);
  };

  const setTargetStatus = (status: TargetType['当前状态']) => {
    const name = targetName.trim();
    if (!name) return;
    const nextTarget = { ...targetDraft, 当前状态: status };
    setTargetDraft(nextTarget);
    onCommit(prev => ({
      ...prev,
      目标库: { ...prev.目标库, [name]: nextTarget },
      界面状态: {
        ...prev.界面状态,
        当前聚焦目标: name,
        当前目标状态: status,
      },
    }));
  };

  const addOwnedItem = () => {
    const name = itemName.trim();
    if (!name) return;
    onCommit(prev => {
      const current = prev.商城.已购买道具[name];
      return {
        ...prev,
        商城: {
          ...prev.商城,
          已购买道具: {
            ...prev.商城.已购买道具,
            [name]: {
              数量: (current?.数量 ?? 0) + 1,
              层级: current?.层级 ?? itemTier,
            },
          },
        },
      };
    });
  };

  const changeOwnedCount = (name: string, delta: number) => {
    onCommit(prev => {
      const current = prev.商城.已购买道具[name];
      if (!current) return prev;
      const nextItems = { ...prev.商城.已购买道具 };
      const nextCount = Math.max(0, current.数量 + delta);
      if (nextCount <= 0) delete nextItems[name];
      else nextItems[name] = { ...current, 数量: nextCount };
      return { ...prev, 商城: { ...prev.商城, 已购买道具: nextItems } };
    });
  };

  const deleteOwnedItem = (name: string) => {
    onCommit(prev => {
      const nextItems = { ...prev.商城.已购买道具 };
      delete nextItems[name];
      return { ...prev, 商城: { ...prev.商城, 已购买道具: nextItems } };
    });
  };

  const saveTask = () => {
    const name = taskName.trim();
    if (!name) return;
    onCommit(prev => ({
      ...prev,
      任务: {
        ...prev.任务,
        [name]: taskDraft,
      },
    }));
  };

  const deleteTask = (name: string) => {
    if (!name) return;
    onCommit(prev => {
      const nextTasks = { ...prev.任务 };
      delete nextTasks[name];
      return { ...prev, 任务: nextTasks };
    });
    setTaskName('');
    setTaskDraft(defaultTask);
  };

  const updateTaskStatus = (name: string, status: TaskType['状态']) => {
    const task = data.任务[name];
    if (!task) return;
    onCommit(prev => ({
      ...prev,
      任务: {
        ...prev.任务,
        [name]: { ...task, 状态: status },
      },
    }));
  };

  const toggleAllowance = () => {
    onCommit(prev => ({
      ...prev,
      系统: {
        ...prev.系统,
        今日已领取: !prev.系统.今日已领取,
      },
    }));
  };

  return (
    <div className="manage-page">
      <Panel title="系统开关" kicker="DIRECT MVU" icon={<Database />}>
        <div className="manage-strip">
          <MoneyTile label="今日额度" value={formatMoney(data.系统.今日额度)} accent />
          <MoneyTile label="领取状态" value={data.系统.今日已领取 ? '已领取' : '未领取'} />
          <button type="button" className="control-button" onClick={toggleAllowance}>
            {data.系统.今日已领取 ? '标记未领取' : '标记已领取'}
          </button>
        </div>
      </Panel>

      <Panel title="目标库管理" kicker="TARGET EDITOR" icon={<Target />}>
        <div className="manager-form">
          <label>
            <span>选择目标</span>
            <select
              value={targetName}
              onChange={event => {
                const name = event.target.value;
                setTargetName(name);
                setTargetDraft(data.目标库[name] ?? defaultTarget);
              }}
            >
              <option value="">新目标</option>
              {targetEntries.map(([name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>目标名称</span>
            <input value={targetName} onChange={event => setTargetName(event.target.value)} placeholder="例如 韩森" />
          </label>
          <label>
            <span>身份</span>
            <input
              value={targetDraft.身份}
              onChange={event => setTargetDraft(prev => ({ ...prev, 身份: event.target.value }))}
            />
          </label>
          <label>
            <span>年龄</span>
            <input
              type="number"
              min="18"
              value={targetDraft.年龄}
              onChange={event => setTargetDraft(prev => ({ ...prev, 年龄: numberInput(event.target.value) }))}
            />
          </label>
          <label>
            <span>估值金额</span>
            <input
              type="number"
              min="0"
              value={targetDraft.估值金额}
              onChange={event => setTargetDraft(prev => ({ ...prev, 估值金额: numberInput(event.target.value) }))}
            />
          </label>
          <label>
            <span>最低试探报价</span>
            <input
              type="number"
              min="0"
              value={targetDraft.最低试探报价}
              onChange={event => setTargetDraft(prev => ({ ...prev, 最低试探报价: numberInput(event.target.value) }))}
            />
          </label>
          <label>
            <span>当前状态</span>
            <select
              value={targetDraft.当前状态}
              onChange={event =>
                setTargetDraft(prev => ({ ...prev, 当前状态: event.target.value as TargetType['当前状态'] }))
              }
            >
              {targetStatuses.map(status => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            <span>当前突破口</span>
            <input
              value={targetDraft.当前突破口}
              onChange={event => setTargetDraft(prev => ({ ...prev, 当前突破口: event.target.value }))}
            />
          </label>
        </div>
        <div className="quick-row">
          {targetStatuses.map(status => (
            <button key={status} type="button" onClick={() => setTargetStatus(status)}>
              {status}
            </button>
          ))}
        </div>
        <div className="manager-actions">
          <button type="button" className="control-button gold" onClick={saveTarget}>
            <Plus />
            保存目标
          </button>
          <button
            type="button"
            className="control-button danger"
            disabled={!targetName || !data.目标库[targetName]}
            onClick={() => deleteTarget(targetName)}
          >
            <Trash2 />
            删除目标
          </button>
        </div>
      </Panel>

      <Panel title="已购买道具" kicker="INVENTORY" icon={<PackageCheck />}>
        <div className="manager-form compact">
          <label>
            <span>道具</span>
            <select value={itemName} onChange={event => setItemName(event.target.value)}>
              {shop.map(([name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>层级</span>
            <select value={itemTier} onChange={event => setItemTier(event.target.value as OwnedItemType['层级'])}>
              {shopTiers.map(tier => (
                <option key={tier}>{tier}</option>
              ))}
            </select>
          </label>
          <button type="button" className="control-button gold" onClick={addOwnedItem}>
            <Plus />
            添加/加一
          </button>
        </div>
        <div className="managed-list">
          {ownedEntries.length ? (
            ownedEntries.map(([name, item]) => (
              <div key={name} className="managed-row">
                <div>
                  <strong>{name}</strong>
                  <span>
                    {item.层级} / 数量 {item.数量}
                  </span>
                </div>
                <div className="row-actions">
                  <button type="button" onClick={() => changeOwnedCount(name, -1)}>
                    <Minus />
                  </button>
                  <button type="button" onClick={() => changeOwnedCount(name, 1)}>
                    <Plus />
                  </button>
                  <button type="button" className="danger" onClick={() => deleteOwnedItem(name)}>
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="暂无已购道具" text="从商城表添加一个已购买道具。" />
          )}
        </div>
      </Panel>

      <Panel title="任务管理" kicker="TASK EDITOR" icon={<Clipboard />}>
        <div className="manager-form">
          <label>
            <span>选择任务</span>
            <select
              value={taskName}
              onChange={event => {
                const name = event.target.value;
                setTaskName(name);
                setTaskDraft(data.任务[name] ?? defaultTask);
              }}
            >
              <option value="">新任务</option>
              {taskEntries.map(([name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>任务名</span>
            <input value={taskName} onChange={event => setTaskName(event.target.value)} />
          </label>
          <label>
            <span>类型</span>
            <select
              value={taskDraft.类型}
              onChange={event => setTaskDraft(prev => ({ ...prev, 类型: event.target.value as TaskType['类型'] }))}
            >
              {taskTypes.map(type => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            <span>状态</span>
            <select
              value={taskDraft.状态}
              onChange={event => setTaskDraft(prev => ({ ...prev, 状态: event.target.value as TaskType['状态'] }))}
            >
              {taskStatuses.map(status => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            <span>进度</span>
            <input
              value={taskDraft.进度}
              onChange={event => setTaskDraft(prev => ({ ...prev, 进度: event.target.value }))}
            />
          </label>
          <label>
            <span>奖励资金</span>
            <input
              type="number"
              min="0"
              value={taskDraft.奖励资金}
              onChange={event => setTaskDraft(prev => ({ ...prev, 奖励资金: numberInput(event.target.value) }))}
            />
          </label>
          <label>
            <span>推荐目标</span>
            <input
              value={taskDraft.推荐目标}
              onChange={event => setTaskDraft(prev => ({ ...prev, 推荐目标: event.target.value }))}
            />
          </label>
          <label className="wide-field">
            <span>要求</span>
            <input
              value={taskDraft.要求}
              onChange={event => setTaskDraft(prev => ({ ...prev, 要求: event.target.value }))}
            />
          </label>
        </div>
        <div className="manager-actions">
          <button type="button" className="control-button gold" onClick={saveTask}>
            <Plus />
            保存任务
          </button>
          <button
            type="button"
            className="control-button danger"
            disabled={!taskName || !data.任务[taskName]}
            onClick={() => deleteTask(taskName)}
          >
            <Trash2 />
            删除任务
          </button>
        </div>
        <div className="managed-list">
          {taskEntries.map(([name, task]) => (
            <div key={name} className="managed-row">
              <div>
                <strong>{name}</strong>
                <span>
                  {task.进度} / {task.状态}
                </span>
              </div>
              <select
                value={task.状态}
                onChange={event => updateTaskStatus(name, event.target.value as TaskType['状态'])}
              >
                {taskStatuses.map(status => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function RightRail({ data, targets }: { data: SchemaType; targets: TargetEntry[] }) {
  const tasks = entriesOf(data.任务).slice(0, 3);
  const recommended = targets
    .slice()
    .sort(([, a], [, b]) => b.贪欲 + b.羞耻 - b.警觉度 - (a.贪欲 + a.羞耻 - a.警觉度))
    .slice(0, 2);
  return (
    <aside className="right-rail">
      <Panel title="系统任务" kicker="TASK LIST" icon={<Clipboard />}>
        {tasks.length ? (
          tasks.map(([name, task]) => (
            <div key={name} className="rail-row">
              <strong>{name}</strong>
              <span>{task.进度}</span>
            </div>
          ))
        ) : (
          <EmptyState title="无任务" text="等待派发" />
        )}
      </Panel>
      <Panel title="推荐目标" kicker="RECOMMEND" icon={<Target />}>
        {recommended.length ? (
          recommended.map(([name, target]) => (
            <div key={name} className="recommend-row">
              <b>{name}</b>
              <span>
                {target.当前状态} / {target.当前突破口}
              </span>
              <small>预估收益 {formatMoney(Math.max(target.最低试探报价, target.估值金额 * 0.08))}+</small>
            </div>
          ))
        ) : (
          <EmptyState title="无目标" text="目标库待写入" />
        )}
      </Panel>
      <Panel title="风险提示" kicker="WARNING" icon={<AlertTriangle />}>
        <ul className="risk-list">
          <li>连续失败会推高同类报价成本。</li>
          <li>高警觉目标需要更高预算或更隐蔽渠道。</li>
        </ul>
      </Panel>
    </aside>
  );
}

function ActionModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!modal) return null;
  const copy = async () => {
    await navigator.clipboard?.writeText(modal.prompt);
    setCopied(true);
  };
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="action-modal" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-title">
          <div>
            <span>ACTION DIRECTIVE</span>
            <h2>{modal.title}</h2>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        {modal.risk ? (
          <div className="modal-risk">
            <AlertTriangle />
            {modal.risk}
          </div>
        ) : null}
        <textarea readOnly value={modal.prompt} />
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
          <button type="button" className="primary-action" onClick={copy}>
            <Clipboard />
            {copied ? '已复制' : '复制指令'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [snapshot, setSnapshot] = useState<VariableSnapshot>(readData);
  const { data, hasStatData } = snapshot;
  const [expanded, setExpanded] = useState(false);
  const [activePage, setActivePage] = useState<PageKey>('overview');
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedTarget, setSelectedTarget] = useState('');
  const targets = useMemo(() => entriesOf(data.目标库), [data.目标库]);
  const shop = useMemo(() => entriesOf(fallbackShop), []);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = readData();
      setSnapshot(prev => (_.isEqual(prev, next) ? prev : next));
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  const commitData = (updater: (prev: SchemaType) => SchemaType) => {
    setSnapshot(prev => {
      const parsed = Schema.safeParse(updater(prev.data));
      if (!parsed.success) {
        console.warn('[money status] MVU 管理写入被 schema 拒绝', parsed.error);
        return prev;
      }
      try {
        updateVariablesWith(variables => {
          _.set(variables, 'stat_data', klona(parsed.data));
          return variables;
        }, prev.option);
      } catch (error) {
        console.warn('[money status] MVU 管理写入失败', error);
        return prev;
      }
      return { data: parsed.data, hasStatData: true, option: prev.option };
    });
  };

  const quoteTarget = (name: string) => {
    setSelectedTarget(name);
    setActivePage('quote');
  };

  if (!expanded) {
    return <CompactHud data={data} hasStatData={hasStatData} onExpand={() => setExpanded(true)} onAction={setModal} />;
  }

  const page = {
    overview: <OverviewPage data={data} targets={targets} />,
    targets: <TargetsPage targets={targets} onQuote={quoteTarget} />,
    quote: <QuotePage data={data} targets={targets} shop={shop} selectedTarget={selectedTarget} onAction={setModal} />,
    shop: <ShopPage data={data} shop={shop} onAction={setModal} />,
    tasks: <TasksPage data={data} />,
    manage: <ManagePage data={data} shop={shop} onCommit={commitData} />,
  } satisfies Record<PageKey, ReactNode>;

  return (
    <div className="money-root console-shell">
      <TopHud data={data} onCollapse={() => setExpanded(false)} onAction={setModal} />
      <div className="console-body">
        <Sidebar active={activePage} level={data.系统.等级} onChange={setActivePage} />
        <main className="main-stage">{page[activePage]}</main>
        <RightRail data={data} targets={targets} />
      </div>
      <footer className="console-footer">
        <span>BLACK MARKET PROTOCOL</span>
        <b>CONFIDENTIAL ACCESS ONLY</b>
        <span>AUDIT LOG: ENABLED</span>
      </footer>
      <ActionModal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}
