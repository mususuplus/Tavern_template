export const Schema = z.object({
  系统: z.object({
    日期: z.string().prefault('待初始化'),
    时间段: z.enum(['清晨', '上午', '午后', '傍晚', '深夜']).prefault('清晨'),
    当前区域: z.string().prefault('中央翡翠平原'),
  }).prefault({}),

  酒馆: z.object({
    当前酒馆: z.string().prefault('平原腹地麦田酒馆'),
    今日主题事件: z.string().prefault(''),
    忙碌度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(20),
    老板满意度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(50),
  }).prefault({}),

  人际关系: z.object({
    老板好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(30),
    熟客关系网: z.record(
      z.string().describe('熟客名（用作键）'),
      z.object({
        姓名: z.string().prefault(''),
        性别: z.enum(['男', '女']).prefault('男'),
        年龄: z.coerce.number().transform(v => _.clamp(v, 0, 150)).prefault(0),
        好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        评语: z.string().prefault(''),
      }),
    ),
  }).prefault({}),

  NSFW: z.object({
    当前阶段: z.enum(['idle', 'preparation', 'service', 'aftercare']).prefault('idle'),
    当前指定服装: z.string().prefault(''),
    当日服务次数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
    身体状态: z.object({
      疲劳度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
      敏感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    }).prefault({}),
    客户满意度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(50),
  }).prefault({}),
}).prefault('待初始化');

export type Schema = z.output<typeof Schema>;
