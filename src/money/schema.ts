const 等级 = z.coerce.number().transform(value => _.clamp(Math.floor(value), 1, 5));
const 百分比 = z.coerce.number().transform(value => _.clamp(Math.round(value), 0, 100));
const 资金 = z.coerce.number().transform(value => _.clamp(Math.floor(value), 0, 999_999_999_999));
const 风险 = z.coerce.string().transform(value => {
  const text = value.trim();
  if (text.includes('极') || text.includes('严重')) return '极高';
  if (text.includes('高')) return '高';
  if (text.includes('中')) return '中';
  if (text.includes('低')) return '低';
  return '低';
});
const 目标状态 = z.coerce.string().transform(value => {
  const text = value.trim();
  if (text.includes('资产')) return '已资产化';
  if (text.includes('屈服')) return '已屈服';
  if (text.includes('交易') || text.includes('成交')) return '已交易';
  if (text.includes('试探') || text.includes('接触')) return '已试探';
  if (text.includes('未') || !text) return '未接触';
  return text;
});
const 商城层级 = z.coerce.string().transform(value => {
  const text = value.trim();
  if (text.includes('现实')) return '现实权限';
  if (text.includes('常识')) return '常识修改';
  if (text.includes('心理')) return '心理干涉';
  if (text.includes('感官')) return '感官强化';
  return '金钱道具';
});
const 行动类型 = z.coerce
  .string()
  .transform(value => value.trim() || '未指定')
  .prefault('未指定');
const 交易阶段 = z.coerce
  .string()
  .transform(value => value.trim() || '自动')
  .prefault('自动');
const 任务类型 = z
  .string()
  .transform(value => value.trim() || '系统任务')
  .prefault('系统任务');
const 任务状态 = z.coerce.string().transform(value => {
  const text = value.trim();
  if (text.includes('失败')) return '已失败';
  if (text.includes('完成') || text.includes('结束')) return '已完成';
  if (text.includes('进行') || text.includes('执行')) return '进行中';
  if (text.includes('未') || !text) return '未开始';
  return text;
});

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
        当前资金: 资金.prefault(1_000_000),
        今日额度: 资金.prefault(500_000),
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

export type SchemaType = z.output<typeof Schema>;
export type TargetType = SchemaType['目标库'][string];
export type ShopItemType = {
  层级: z.output<typeof 商城层级>;
  价格: number;
  描述: string;
  解锁等级: number;
  风险: z.output<typeof 风险>;
};
