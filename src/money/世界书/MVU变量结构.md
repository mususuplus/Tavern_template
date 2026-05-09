# money MVU 变量结构设计规则

<money_mvu_schema>
变量结构摘要:
  设计目标:
    - 使用轻量 MVU 承载“资金报价 -> 目标边界变化 -> 商城道具 -> 任务推进”的核心玩法。
    - 保留 EJS 控制变量，确保阶段条目、商城权限条目、风险条目和首次事件条目仍可精确加载。
    - 删除高负担变量表：资产、常识规则、商城库存、目标认知日志、经验体系、收益维护等不再进入 MVU。
  必须保留:
    - 系统: 等级、当前资金、今日额度、今日已领取、商城权限、风险等级。
    - 界面状态: 当前聚焦目标、当前目标状态、当前行动类型、当前场景、推荐加载阶段。
    - $flag: 首次报价、首次购买道具、首次常识补丁。
  追踪范围:
    - 目标库只记录最小可玩档案：身份、年龄、估值、最低报价、状态、突破口、五个行动属性、最近交易。
    - 商城只记录已购买道具；商品库存由世界书和前端内置表提供，不让 AI 维护。
    - 任务保留，但只记录任务类型、要求、进度、奖励资金、推荐目标、状态。
  动态键处理:
    - 目标库、商城.已购买道具、任务使用 `z.object({}).catchall(...)`，不要使用 `z.record(...)`。
    - 这样可以允许 AI 常见的 `insert /目标库/目标名`、`insert /任务/任务名` 直接扩展对象，避免 non-extensible object 报错。
  不追踪:
    - 职业、社会价值等级、认知稳定、认知日志。
    - 经验、经验上限、消费返利率、影响范围。
    - 资产、每日收益、常识规则明细、商城库存、已解锁层级。

<mvu_schema_script>
import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate/artifact/bundle.js';

const 等级 = z.coerce.number().transform(value => _.clamp(Math.floor(value), 1, 5));
const 百分比 = z.coerce.number().transform(value => _.clamp(Math.round(value), 0, 100));
const 资金 = z.coerce.number().transform(value => _.clamp(Math.floor(value), 0, 999999999999));
const 风险 = z.enum(['低', '中', '高', '极高']);
const 目标状态 = z.enum(['未接触', '已试探', '已交易', '已屈服', '已资产化']);
const 商城层级 = z.enum(['金钱道具', '感官强化', '心理干涉', '常识修改', '现实权限']);
const 行动类型 = z.enum(['未指定', '原味交易', '私密素材', '线上支配', '线下见面', '恶堕转折', '资产化维护', '购买道具', '常识补丁']);
const 交易阶段 = z.enum(['自动', '原味交易', '私密素材', '线上支配', '线下见面', '恶堕转折', '资产化']);
const 任务类型 = z.enum(['系统任务', '屈服事件', '商城解锁', '资产任务']);
const 任务状态 = z.enum(['未开始', '进行中', '已完成', '已失败']);
const 布尔值 = z
  .union([z.boolean(), z.literal('true'), z.literal('false'), z.literal('是'), z.literal('否'), z.literal(1), z.literal(0)])
  .transform(value => value === true || value === 'true' || value === '是' || value === 1);

const 目标档案 = z
  .object({
    身份: z.string().prefault('成年虚构目标'),
    年龄: z.coerce.number().transform(value => _.clamp(Math.floor(value), 18, 99)).prefault(24),
    估值金额: 资金.prefault(0),
    最低试探报价: 资金.prefault(0),
    当前状态: 目标状态.prefault('未接触'),
    当前突破口: z.string().prefault('等待试探'),
    贪欲: 百分比.prefault(50),
    自尊: 百分比.prefault(50),
    羞耻: 百分比.prefault(50),
    堕落度: 百分比.prefault(0),
    警觉度: 百分比.prefault(20),
    最近交易: z.string().prefault('暂无交易'),
  })
  .prefault({});

const 已购买道具 = z.object({
  数量: z.coerce.number().transform(value => _.clamp(Math.floor(value), 0, 999)).prefault(0),
  层级: 商城层级.prefault('金钱道具'),
});

const 任务条目 = z.object({
  类型: 任务类型.prefault('系统任务'),
  要求: z.string().prefault('等待系统派发'),
  进度: z.string().prefault('0/1'),
  奖励资金: 资金.prefault(0),
  推荐目标: z.string().prefault('任意目标'),
  状态: 任务状态.prefault('未开始'),
});

export const Schema = z
  .object({
    系统: z
      .object({
        等级: 等级.prefault(1),
        当前资金: 资金.prefault(1000000),
        今日额度: 资金.prefault(500000),
        今日已领取: 布尔值.prefault(false),
        商城权限: 商城层级.prefault('金钱道具'),
        风险等级: 风险.prefault('低'),
      })
      .prefault({}),

    界面状态: z
      .object({
        当前聚焦目标: z.string().prefault(''),
        当前目标状态: 目标状态.prefault('未接触'),
        当前行动类型: 行动类型.prefault('未指定'),
        当前场景: z.string().prefault('未指定'),
        推荐加载阶段: 交易阶段.prefault('自动'),
      })
      .prefault({}),

    目标库: z
      .object({})
      .catchall(目标档案)
      .prefault({}),

    商城: z
      .object({
        已购买道具: z
          .object({})
          .catchall(已购买道具)
          .transform(data => _.pickBy(data, item => item.数量 > 0))
          .prefault({}),
      })
      .prefault({}),

    任务: z
      .object({})
      .catchall(任务条目)
      .prefault({}),

    $flag: z
      .object({
        首次报价: 布尔值.prefault(false),
        首次购买道具: 布尔值.prefault(false),
        首次常识补丁: 布尔值.prefault(false),
      })
      .prefault({}),
  })
  .prefault({});

$(() => {
  registerMvuSchema(Schema);
});
</mvu_schema_script>
</money_mvu_schema>
