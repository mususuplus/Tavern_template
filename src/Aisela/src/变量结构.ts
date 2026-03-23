import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

const 品质 = z.enum(['common', 'rare', 'epic', 'legendary']);
const 时段 = z.enum(['清晨', '上午', '正午', '下午', '黄昏', '深夜']);
const 声望等级 = z.enum(['友善', '中立', '冷淡', '敌对', '通缉', '崇拜', '盟友']);
const 委托类型 = z.enum(['主线', '支线', '每日', '临危受命']);
const 委托状态 = z.enum(['未接取', '进行中', '已完成', '已失败']);
const 状态效果类型 = z.enum(['buff', 'debuff']);
const 立场类型 = z.enum(['帝国侧', '观测侧', '异端侧', '地方侧', '同行侧']);

export const Schema = z
  .object({
    主角: z
      .object({
        职业: z.string().prefault('普通冒险者'),
        信仰: z.string().prefault('无'),
        当前地点: z.string().prefault('中央翡翠平原'),
        称号: z.string().prefault('流浪的守夜人'),
        状态: z.string().prefault('健康'),
        临时状态: z
          .record(
            z.string().describe('状态名'),
            z.object({
              类型: 状态效果类型.prefault('buff'),
              描述: z.string().prefault(''),
            }),
          )
          .prefault({}),
        货币: z
          .object({
            金狮: z.coerce
              .number()
              .transform(v => _.clamp(v, 0, 1e9))
              .prefault(0),
            银辉币: z.coerce
              .number()
              .transform(v => _.clamp(v, 0, 1e9))
              .prefault(0),
            铜叶币: z.coerce
              .number()
              .transform(v => _.clamp(v, 0, 1e9))
              .prefault(0),
            以太结晶: z.coerce
              .number()
              .transform(v => _.clamp(v, 0, 1e6))
              .prefault(0),
          })
          .prefault({}),
        生命: z.coerce
          .number()
          .transform(v => _.clamp(v, 0, 9999))
          .prefault(340),
        生命上限: z.coerce
          .number()
          .transform(v => _.clamp(v, 1, 9999))
          .prefault(450),
        法力: z.coerce
          .number()
          .transform(v => _.clamp(v, 0, 9999))
          .prefault(120),
        法力上限: z.coerce
          .number()
          .transform(v => _.clamp(v, 1, 9999))
          .prefault(200),
        奥法之灾觉醒度: z.coerce
          .number()
          .transform(v => _.clamp(v, 0, 100))
          .prefault(45),
        奥法之灾觉醒度上限: z.coerce
          .number()
          .transform(v => _.clamp(v, 1, 100))
          .prefault(100),
        宿主档案: z
          .object({
            阶段代码: z.string().prefault('S4'),
            阶段名称: z.string().prefault('被追踪调查'),
            阶段称谓: z.string().prefault('前兆潜伏'),
            异象前兆: z.string().prefault('周围魔力浓度偶尔失衡，器物静电、祷文失准、法阵迟滞是最早的信号。'),
            风险提示: z.string().prefault('宿主本人可能尚未察觉，但观测者与敏感施法者已经能捕捉到微弱痕迹。'),
            下一阈值: z.string().prefault('随着剧情推进与情绪压力积累，宿主会被更明确地卷入调查与怀疑。'),
            可能代价: z.string().prefault('每一次忽视异常，都会让失控的那一步更突然。'),
          })
          .prefault({}),
        装备栏: z
          .record(
            z.enum(['主手', '副手', '服饰', '饰品']),
            z
              .object({
                装备名: z.string().prefault('空置'),
                描述: z.string().prefault(''),
                品质: 品质.prefault('common'),
              })
              .prefault({}),
          )
          .prefault(() => ({ 主手: {}, 副手: {}, 服饰: {}, 饰品: {} })),
        物品栏: z
          .record(
            z.string().describe('物品名'),
            z.object({
              描述: z.string().prefault(''),
              数量: z.coerce.number().transform(v => _.clamp(v, 0, 999999)),
              品质: 品质.prefault('common'),
            }),
          )
          .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0))
          .prefault({}),
      })
      .prefault({}),

    世界: z
      .object({
        纪元: z.string().prefault('暗影纪元'),
        月: z.coerce
          .number()
          .transform(v => _.clamp(v, 1, 12))
          .prefault(1),
        日: z.coerce
          .number()
          .transform(v => _.clamp(v, 1, 31))
          .prefault(1),
        时段: 时段.prefault('上午'),
        末日时钟刻度: z.coerce
          .number()
          .transform(v => _.clamp(v, 1, 12))
          .prefault(3),
        委托等级: z.string().prefault('铜牌'),
        当前聚焦预言: z.string().prefault('魔王'),
        当前聚焦说明: z.string().prefault('综合地点、时钟与势力活动后，魔王相关卷宗仍是当前最具解释力的焦点。'),
        神学回声: z.string().prefault('你尚未以某位神祇的语言理解这些征兆，因此档案馆将更依赖地点、势力和危机热度来组织线索。'),
        本幕纪要: z.string().prefault(''),
        区域态势: z
          .object({
            主导危机: z.string().prefault('帝国腹地的秩序表面稳定，实则被魔潮军情与内部派系角力同时拉扯。'),
            推荐关注: z.string().prefault('优先关注帝国军政、观测者调令与商路封锁，它们最先暴露大战前兆。'),
            典型异象: z.string().prefault('白昼仍明亮，但市集消息传播异常迅速，风声往往先于军报抵达。'),
            势力拉扯: z.string().prefault('帝国希望维持稳定表象，观测者更在意异常数据，远方行歌则盯着任务与利润。'),
          })
          .prefault({}),
        情报流: z
          .object({
            地点变化: z.string().prefault('档案流正在等待新的世界摘要。'),
            势力动作: z.string().prefault('各方势力正在重新评估局势。'),
            宿主异常: z.string().prefault('宿主异动尚未形成公开卷宗。'),
            当前任务: z.string().prefault('当前没有可追踪的任务情报。'),
          })
          .prefault({}),
      })
      .prefault({}),

    小队: z
      .record(
        z.string().describe('成员名'),
        z.object({
          职业: z.string().prefault(''),
          生命: z.coerce
            .number()
            .transform(v => _.clamp(v, 0, 9999))
            .prefault(0),
          生命上限: z.coerce
            .number()
            .transform(v => _.clamp(v, 1, 9999))
            .prefault(1),
          状态: z.string().prefault(''),
        }),
      )
      .prefault({}),

    人际关系: z
      .record(
        z.string().describe('NPC名'),
        z.object({
          好感度: z.coerce
            .number()
            .transform(v => _.clamp(v, 0, 100))
            .prefault(0),
          关系: z.string().prefault(''),
          描述: z.string().prefault(''),
          态度温度: z.string().prefault('谨慎观望'),
          立场: 立场类型.prefault('地方侧'),
          阵营牵引: z.string().prefault('暂无明确阵营拉扯情报。'),
        }),
      )
      .prefault({}),

    势力: z
      .record(
        z.string().describe('势力名'),
        z.object({
          声望: 声望等级.prefault('中立'),
          描述: z.string().prefault(''),
        }),
      )
      .prefault({}),

    委托列表: z
      .record(
        z.string().describe('委托名'),
        z.object({
          类型: 委托类型.prefault('支线'),
          说明: z.string().prefault(''),
          目标: z.string().prefault(''),
          奖励: z.string().prefault(''),
          惩罚: z.string().prefault(''),
          状态: 委托状态.prefault('未接取'),
          排序权重: z.coerce.number().prefault(0),
          危机关联: z.string().prefault(''),
        }),
      )
      .prefault({}),
  })
  .prefault({});

$(() => {
  registerMvuSchema(Schema);
});
