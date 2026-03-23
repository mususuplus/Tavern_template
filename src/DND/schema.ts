const 能力值键 = z.enum(['力量', '敏捷', '体质', '智力', '感知', '魅力']);
const 任务状态 = z.enum(['进行中', '可选', '完成']);
const 钩子状态 = z.enum(['潜伏', '激活', '兑现']);

export const SchemaObject = z.object({
    角色: z
      .object({
        姓名: z.string().prefault('无名冒险者'),
        种族: z.string().prefault('人类'),
        职业: z.string().prefault('战士'),
        等级: z.coerce
          .number()
          .transform(value => _.clamp(value, 1, 20))
          .prefault(3),
        背景: z.string().prefault('来自边境营地的自由冒险者。'),
        阵营: z.string().prefault('中立善良'),
        熟练加值: z.coerce
          .number()
          .transform(value => _.clamp(value, 1, 10))
          .prefault(2),
        护甲等级: z.coerce
          .number()
          .transform(value => _.clamp(value, 1, 40))
          .prefault(15),
        速度: z.coerce
          .number()
          .transform(value => _.clamp(value, 0, 120))
          .prefault(30),
        生命值: z.coerce
          .number()
          .transform(value => _.clamp(value, 0, 999))
          .prefault(24),
        生命上限: z.coerce
          .number()
          .transform(value => _.clamp(value, 1, 999))
          .prefault(24),
        临时生命: z.coerce
          .number()
          .transform(value => _.clamp(value, 0, 999))
          .prefault(0),
        能力值: z
          .record(
            能力值键,
            z.coerce
              .number()
              .transform(value => _.clamp(value, 1, 30))
              .prefault(10),
          )
          .prefault(() => ({
            力量: 16,
            敏捷: 12,
            体质: 14,
            智力: 10,
            感知: 13,
            魅力: 8,
          })),
      })
      .prefault({}),

    资源: z
      .object({
        金币: z.coerce
          .number()
          .transform(value => _.clamp(value, 0, 999999))
          .prefault(128),
        法术位摘要: z.string().prefault('无施法职业资源'),
        短休剩余: z.coerce
          .number()
          .transform(value => _.clamp(value, 0, 5))
          .prefault(2),
        长休计数: z.coerce
          .number()
          .transform(value => _.clamp(value, 0, 999))
          .prefault(0),
        资源备注: z.string().prefault('补给充足，火把与口粮仍足够支撑两日。'),
      })
      .prefault({}),

    小队: z
      .record(
        z.string().describe('队员名'),
        z.object({
          职责: z.string().prefault('支援'),
          当前生命: z.coerce
            .number()
            .transform(value => _.clamp(value, 0, 999))
            .prefault(10),
          生命上限: z.coerce
            .number()
            .transform(value => _.clamp(value, 1, 999))
            .prefault(10),
          状态: z.string().prefault('戒备'),
          先攻: z.coerce
            .number()
            .transform(value => _.clamp(value, -10, 50))
            .prefault(0),
          备注: z.string().prefault('等待指令'),
        }),
      )
      .prefault(() => ({
        莱拉: { 职责: '游荡者', 当前生命: 18, 生命上限: 18, 状态: '潜行', 先攻: 4, 备注: '在侧翼侦查' },
        托姆: { 职责: '牧师', 当前生命: 22, 生命上限: 22, 状态: '稳定', 先攻: 1, 备注: '保留治疗位' },
      })),

    剧情: z
      .object({
        当前场景: z.string().prefault('荒原边缘的临时营地'),
        场景摘要: z.string().prefault('队伍刚结束一场小规模遭遇战，营火旁正在清点补给、交换情报，并决定下一步路线。'),
        任务列表: z
          .record(
            z.string().describe('任务名'),
            z.object({
              状态: 任务状态.prefault('进行中'),
              摘要: z.string().prefault(''),
              目标: z.string().prefault(''),
            }),
          )
          .prefault(() => ({
            追查失落圣徽: {
              状态: '进行中',
              摘要: '从豺狼人袭击现场追踪被掠走的圣徽。',
              目标: '在黎明前抵达旧礼拜堂外围。',
            },
            与营地商人议价: {
              状态: '可选',
              摘要: '补充绷带、火把和箭矢。',
              目标: '决定是否花费金币补充物资。',
            },
          })),
        战役日志: z
          .record(
            z.string().describe('日志ID'),
            z.object({
              标题: z.string().prefault('新记录'),
              内容: z.string().prefault(''),
              时间: z.string().prefault('刚刚'),
            }),
          )
          .transform(data =>
            _(data)
              .entries()
              .takeRight(10)
              .fromPairs()
              .value(),
          )
          .prefault(() => ({
            'log-1': {
              标题: '夜色中的伏击',
              内容: '队伍在营地北侧击退了一支豺狼人侦察队，并从残破的战旗上发现了新的雇主印记。',
              时间: '今夜',
            },
            'log-2': {
              标题: '营火会议',
              内容: '大家一致认为先补给再追踪圣徽，避免黎明前体力透支。',
              时间: '刚刚',
            },
          })),
        关键线索: z
          .record(z.string().describe('线索ID'), z.string().prefault(''))
          .prefault(() => ({
            线索一: '敌人留下的靴印朝礼拜堂废墟延伸。',
            线索二: '商人提到最近有人高价收购圣职遗物。',
          })),
        剧情钩子: z
          .record(
            z.string().describe('钩子ID'),
            z.object({
              标题: z.string().prefault('未命名钩子'),
              摘要: z.string().prefault(''),
              状态: 钩子状态.prefault('潜伏'),
            }),
          )
          .prefault(() => ({
            hook_ember: {
              标题: '余烬中的第二封信',
              摘要: '若队伍再次搜索袭击现场，可能发现指向真正雇主的残页。',
              状态: '潜伏',
            },
          })),
      })
      .prefault({}),
});

export const Schema = SchemaObject.prefault({});

export type SchemaType = z.output<typeof SchemaObject>;
