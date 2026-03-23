import { Schema, type SchemaType } from '../../schema';
import { createTimeLabel } from './model';

type AbilityKey = keyof SchemaType['角色']['能力值'];

export type CharacterBookForm = {
  presetId: string | null;
  roleplayHook: string;
  角色: {
    姓名: string;
    种族: string;
    职业: string;
    等级: number;
    背景: string;
    阵营: string;
    熟练加值: number;
    护甲等级: number;
    速度: number;
    生命值: number;
    生命上限: number;
    临时生命: number;
    能力值: Record<AbilityKey, number>;
  };
  资源: {
    金币: number;
    法术位摘要: string;
    资源备注: string;
  };
  剧情: {
    当前场景: string;
    场景摘要: string;
    战役日志标题: string;
    战役日志内容: string;
  };
  队伍: Array<{
    id: string;
    名称: string;
    职责: string;
    当前生命: number;
    生命上限: number;
    状态: string;
    先攻: number;
    备注: string;
  }>;
  任务: Array<{
    id: string;
    名称: string;
    状态: '进行中' | '可选' | '完成';
    摘要: string;
    目标: string;
  }>;
  线索: Array<{
    id: string;
    名称: string;
    内容: string;
  }>;
  剧情钩子: Array<{
    id: string;
    标题: string;
    摘要: string;
    状态: '潜伏' | '激活' | '兑现';
  }>;
};

export type CharacterPreset = {
  id: string;
  title: string;
  subtitle: string;
  blurb: string;
  form: CharacterBookForm;
};

type MessageVariables = {
  stat_data?: unknown;
};

declare function getVariables(option: { type: 'message'; message_id: number | 'latest' }): MessageVariables;
declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>,
  option: { type: 'message'; message_id: number | 'latest' },
): Promise<Record<string, any>> | Record<string, any>;

const ABILITY_KEYS = ['力量', '敏捷', '体质', '智力', '感知', '魅力'] as const satisfies ReadonlyArray<AbilityKey>;
const QUEST_STATUS = ['进行中', '可选', '完成'] as const;
const HOOK_STATUS = ['潜伏', '激活', '兑现'] as const;

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultForm(base?: SchemaType): CharacterBookForm {
  const schemaBase = base ?? Schema.parse({});

  return {
    presetId: null,
    roleplayHook: '',
    角色: {
      姓名: schemaBase.角色.姓名,
      种族: schemaBase.角色.种族,
      职业: schemaBase.角色.职业,
      等级: schemaBase.角色.等级,
      背景: schemaBase.角色.背景,
      阵营: schemaBase.角色.阵营,
      熟练加值: schemaBase.角色.熟练加值,
      护甲等级: schemaBase.角色.护甲等级,
      速度: schemaBase.角色.速度,
      生命值: schemaBase.角色.生命值,
      生命上限: schemaBase.角色.生命上限,
      临时生命: schemaBase.角色.临时生命,
      能力值: { ...schemaBase.角色.能力值 },
    },
    资源: {
      金币: schemaBase.资源.金币,
      法术位摘要: schemaBase.资源.法术位摘要,
      资源备注: schemaBase.资源.资源备注,
    },
    剧情: {
      当前场景: schemaBase.剧情.当前场景,
      场景摘要: schemaBase.剧情.场景摘要,
      战役日志标题: '开局记录',
      战役日志内容: `角色卡创建于 ${createTimeLabel()}。`,
    },
    队伍: [
      {
        id: createId('party'),
        名称: '莱拉',
        职责: '游荡者',
        当前生命: 18,
        生命上限: 18,
        状态: '潜行侦察',
        先攻: 4,
        备注: '负责在队伍前方踩点。',
      },
    ],
    任务: [
      {
        id: createId('quest'),
        名称: '写下第一份委托',
        状态: '进行中',
        摘要: '为角色准备一个推动冒险开始的小目标。',
        目标: '确定接下来第一个要去的地点和原因。',
      },
    ],
    线索: [
      {
        id: createId('clue'),
        名称: '线索一',
        内容: '一枚失落徽记的残片，背面刻着陌生公会的印记。',
      },
    ],
    剧情钩子: [
      {
        id: createId('hook'),
        标题: '迟来的邀约',
        摘要: '有人希望你在抵达营地后的第一夜前往旧礼拜堂。',
        状态: '潜伏',
      },
    ],
  };
}

function createPresetForm(overrides: Partial<CharacterBookForm>): CharacterBookForm {
  return _.merge(createDefaultForm(), overrides);
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'iron-vanguard',
    title: '铁誓先锋',
    subtitle: '重甲前排 / 近战压场',
    blurb: '替队伍挡下第一轮冲击的盾墙型角色，适合稳扎稳打的战役开局。',
    form: createPresetForm({
      presetId: 'iron-vanguard',
      roleplayHook: '曾立誓追回被叛军夺走的圣徽。',
      角色: {
        姓名: '阿德里安',
        种族: '人类',
        职业: '战士',
        等级: 4,
        背景: '边境要塞的退役军官，如今以自由冒险者身份重新集结盟友。',
        阵营: '守序善良',
        熟练加值: 2,
        护甲等级: 18,
        速度: 30,
        生命值: 38,
        生命上限: 38,
        临时生命: 4,
        能力值: { 力量: 17, 敏捷: 11, 体质: 16, 智力: 10, 感知: 13, 魅力: 12 },
      },
      资源: {
        金币: 145,
        法术位摘要: '无施法职业资源',
        资源备注: '携带塔盾、两支治疗药水和一张粗略军用地图。',
      },
      剧情: {
        当前场景: '灰烬渡口外的警戒营地',
        场景摘要: '你刚护送一队难民穿过焦土，营地指挥官希望你追查北面的掠袭者。',
        战役日志标题: '先锋的号角',
        战役日志内容: '在灰烬渡口立下新的护卫契约，准备于天亮前踏上追击之路。',
      },
    }),
  },
  {
    id: 'moon-shadow',
    title: '月痕游刃',
    subtitle: '敏捷潜行 / 侦察破局',
    blurb: '擅长侦查、潜入和切断局面僵持点的轻装角色，适合喜欢机动与信息差的玩法。',
    form: createPresetForm({
      presetId: 'moon-shadow',
      roleplayHook: '一封匿名信暗示失踪恩师仍活着。',
      角色: {
        姓名: '希芙',
        种族: '半精灵',
        职业: '游荡者',
        等级: 4,
        背景: '曾为地下情报网奔走，后来带着被篡改的任务档案消失。',
        阵营: '混乱中立',
        熟练加值: 2,
        护甲等级: 15,
        速度: 35,
        生命值: 29,
        生命上限: 29,
        临时生命: 0,
        能力值: { 力量: 9, 敏捷: 18, 体质: 14, 智力: 13, 感知: 15, 魅力: 12 },
      },
      资源: {
        金币: 96,
        法术位摘要: '无施法职业资源',
        资源备注: '携带伪装披风、开锁工具和一枚只剩半边纹章的家徽戒指。',
      },
      剧情: {
        当前场景: '黑水镇后巷的临时据点',
        场景摘要: '你刚躲过一次追捕，得到消息称旧礼拜堂地下有一份能洗清旧案的证据。',
        战役日志标题: '影中的名字',
        战役日志内容: '在黑水镇重新编织旧日联系网，决定先从礼拜堂入口的巡逻路线下手。',
      },
    }),
  },
  {
    id: 'star-warden',
    title: '星律守望',
    subtitle: '施法支援 / 调度资源',
    blurb: '以控场、辅助与知识优势驱动队伍节奏的施法角色，适合喜欢叙事与战术兼顾的体验。',
    form: createPresetForm({
      presetId: 'star-warden',
      roleplayHook: '星盘碎裂前留下的最后坐标，指向一座被遗忘的旧神殿。',
      角色: {
        姓名: '米瑞尔',
        种族: '高等精灵',
        职业: '法师',
        等级: 4,
        背景: '游历学派的抄写员，专门追踪失落秘仪和被禁用的传送图谱。',
        阵营: '中立善良',
        熟练加值: 2,
        护甲等级: 13,
        速度: 30,
        生命值: 24,
        生命上限: 24,
        临时生命: 5,
        能力值: { 力量: 8, 敏捷: 14, 体质: 13, 智力: 18, 感知: 12, 魅力: 11 },
      },
      资源: {
        金币: 121,
        法术位摘要: '1环 4/4 · 2环 3/3',
        资源备注: '法术书已补录三页星象批注，奥术焦点可稳定短距传讯。',
      },
      剧情: {
        当前场景: '雾冠山道的观星营帐',
        场景摘要: '山道上的魔力潮汐正在紊乱，附近商队愿意资助你查明原因并护送他们下山。',
        战役日志标题: '星图余烬',
        战役日志内容: '在雾冠山道重启观测仪后，发现星盘缺口与山中的旧神殿坐标完全吻合。',
      },
    }),
  },
  {
    id: 'lost-mine-of-phandelver',
    title: 'Lost Mine of Phandelver',
    subtitle: '被遗忘国度 / 标准奇幻地城冒险',
    blurb: '世界观：被遗忘国度剑湾地区。风格：新手友好、公路护送与经典地城探险。关键词：凡德林、失落矿坑、护送、哥布林、前哨阴谋。',
    form: createPresetForm({
      presetId: 'lost-mine-of-phandelver',
      roleplayHook: '你接下这趟前往凡德林的护送差事，不只是为了报酬，也想借机查清洛克希克家族背后失落矿脉的传闻。',
      角色: {
        姓名: '托伦',
        种族: '人类',
        职业: '战士',
        等级: 3,
        背景: '常在无冬城与剑湾大道之间接护卫委托的自由佣兵，对消失的矮人矿工故事格外上心。',
        阵营: '中立善良',
        熟练加值: 2,
        护甲等级: 17,
        速度: 30,
        生命值: 31,
        生命上限: 31,
        临时生命: 0,
        能力值: { 力量: 16, 敏捷: 13, 体质: 15, 智力: 10, 感知: 12, 魅力: 11 },
      },
      资源: {
        金币: 34,
        法术位摘要: '无施法职业资源',
        资源备注: '随身带着补给箱、驮马采购清单和一枚属于雇主冈德伦的封蜡信物。',
      },
      剧情: {
        当前场景: '前往凡德林途中的高道旁林间岔口',
        场景摘要: '你护送的补给车刚在高道旁发现两匹倒毙的马，路边泥地里残留着仓促拖拽的痕迹与埋伏后的脚印。',
        战役日志标题: '通往凡德林的第一道血痕',
        战役日志内容: '前往凡德林的路上，冈德伦与萨登先行离队。如今只剩被伏击的迹象、失踪的雇主，以及一条通向荒野深处的小路。',
      },
      任务: [
        {
          id: createId('quest'),
          名称: '追查冈德伦的去向',
          状态: '进行中',
          摘要: '雇主疑似在半路遭到袭击或绑架，继续前进前必须先查清他的下落。',
          目标: '检查伏击现场并决定是否沿着林中的痕迹深入追踪。',
        },
        {
          id: createId('quest'),
          名称: '确保补给安全抵达凡德林',
          状态: '可选',
          摘要: '凡德林仍在等待这批物资，而你需要在救人和履约之间做出取舍。',
          目标: '判断是否先稳住车队与货物，再处理失踪事件。',
        },
      ],
      线索: [
        {
          id: createId('clue'),
          名称: '黑羽箭矢',
          内容: '伏击用箭矢制作粗糙，箭杆上刻有哥布林部落常见的削痕记号。',
        },
        {
          id: createId('clue'),
          名称: '拖拽痕迹',
          内容: '泥地中有一串被强行拖行的深痕，方向通往东北侧荆棘密林。',
        },
      ],
      剧情钩子: [
        {
          id: createId('hook'),
          标题: '回音洞窟的旧名',
          摘要: '如果你继续追查，会逐步得知一座失落矮人矿坑与整场袭击有着更深关联。',
          状态: '潜伏',
        },
      ],
    }),
  },
  {
    id: 'curse-of-strahd',
    title: 'Curse of Strahd',
    subtitle: '巴洛维亚 / 哥特恐怖与诅咒宿命',
    blurb: '世界观：被迷雾封锁的巴洛维亚半位面。风格：哥特恐怖、压迫感与宿命诅咒。关键词：斯特拉德、迷雾、吸血鬼、古堡、恐惧。',
    form: createPresetForm({
      presetId: 'curse-of-strahd',
      roleplayHook: '你本以为只是应下了一桩偏远村庄的求助委托，却在迷雾合拢后意识到自己踏入了一处无法轻易离开的诅咒之地。',
      角色: {
        姓名: '伊莲娜',
        种族: '半精灵',
        职业: '牧师',
        等级: 4,
        背景: '游历各地的流浪神官，习惯在灾厄与瘟疫边缘主持葬礼，也因此对超自然不祥征兆极为敏锐。',
        阵营: '中立善良',
        熟练加值: 2,
        护甲等级: 16,
        速度: 30,
        生命值: 30,
        生命上限: 30,
        临时生命: 0,
        能力值: { 力量: 11, 敏捷: 12, 体质: 14, 智力: 10, 感知: 17, 魅力: 14 },
      },
      资源: {
        金币: 22,
        法术位摘要: '1环 4/4 · 2环 3/3',
        资源备注: '圣徽在迷雾中偶尔发烫，背包里只剩少量圣水、葬仪绷带与一封被雨水浸透的求援信。',
      },
      剧情: {
        当前场景: '巴洛维亚村外的泥泞岔路口',
        场景摘要: '迷雾在你身后无声合拢，前方村庄灯火稀疏、风声像哭泣般掠过屋檐，远处山巅古堡正俯瞰整片谷地。',
        战役日志标题: '迷雾吞没来路',
        战役日志内容: '你被引入巴洛维亚。这里的天色仿佛永不真正放晴，而每一个村民眼中都藏着对同一位领主的恐惧。',
      },
      任务: [
        {
          id: createId('quest'),
          名称: '进入村庄寻找庇护',
          状态: '进行中',
          摘要: '夜色与迷雾都在提醒你，停留在旷野只会更危险。',
          目标: '进入巴洛维亚村，打听求援信的寄信人和这片土地的主人。',
        },
        {
          id: createId('quest'),
          名称: '确认伊莲娜的身份',
          状态: '可选',
          摘要: '村民口中反复出现一个被“伯爵”注视的名字，她似乎与整片土地的诅咒有关。',
          目标: '接触仍愿意说真话的人，拼凑关于伊莲娜与斯特拉德的关系。',
        },
      ],
      线索: [
        {
          id: createId('clue'),
          名称: '求援信残页',
          内容: '信中请求外来冒险者拯救一位少女，落款带着颤抖与匆忙，像是在监视下写成。',
        },
        {
          id: createId('clue'),
          名称: '高处的目光',
          内容: '每当你抬头望向山巅古堡，都会产生一种自己早已被看见的错觉。',
        },
      ],
      剧情钩子: [
        {
          id: createId('hook'),
          标题: '古堡中的邀请',
          摘要: '一旦你在村中停留足够久，那位伯爵也许会亲自向你发出一封优雅而令人不寒而栗的邀约。',
          状态: '潜伏',
        },
      ],
    }),
  },
  {
    id: 'descent-into-avernus',
    title: "Baldur's Gate: Descent into Avernus",
    subtitle: '被遗忘国度 / 都市黑暗与地狱坠落',
    blurb: '世界观：始于被遗忘国度的博德之门，并通向九层地狱第一层阿弗纳斯。风格：都市阴谋、堕落交易与末日公路感。关键词：博德之门、艾尔图瑞尔、地狱、恶魔契约、血战。',
    form: createPresetForm({
      presetId: 'descent-into-avernus',
      roleplayHook: '艾尔图瑞尔的失踪让整个剑湾南方陷入恐慌，而你不相信这只是一次普通的政治灾难。',
      角色: {
        姓名: '马库斯',
        种族: '提夫林',
        职业: '圣武士',
        等级: 4,
        背景: '曾在边境城邦担任巡逻骑士，见惯流民、走私与宗教狂热，对“正义”这件事开始有了更复杂的理解。',
        阵营: '守序中立',
        熟练加值: 2,
        护甲等级: 18,
        速度: 30,
        生命值: 36,
        生命上限: 36,
        临时生命: 0,
        能力值: { 力量: 16, 敏捷: 10, 体质: 15, 智力: 10, 感知: 12, 魅力: 16 },
      },
      资源: {
        金币: 58,
        法术位摘要: '1环 3/3',
        资源备注: '携带破旧徽记、城门通行证和一份关于艾尔图瑞尔失踪后难民流向的简报。',
      },
      剧情: {
        当前场景: '博德之门外城的难民关卡',
        场景摘要: '艾尔图瑞尔的消失让难民潮涌入博德之门，守卫紧张、帮派蠢动，城中正流传着一场比暴乱更糟的阴影交易。',
        战役日志标题: '坠落前夜的城市',
        战役日志内容: '你抵达博德之门时，整座城市已在恐慌与封锁边缘摇摇欲坠。有人失踪，有人牟利，而更可怕的真相正指向地狱本身。',
      },
      任务: [
        {
          id: createId('quest'),
          名称: '调查外城失序前兆',
          状态: '进行中',
          摘要: '暴力事件并非偶发，背后像是有人故意放任城市滑向失控。',
          目标: '搜集与失踪者、地狱崇拜者和城中权力真空有关的情报。',
        },
        {
          id: createId('quest'),
          名称: '追查艾尔图瑞尔的命运',
          状态: '可选',
          摘要: '那座城市不可能凭空消失，必须有人知道它被带去了哪里。',
          目标: '从幸存难民、神殿和旧军旅关系中寻找关于“坠落”的证词。',
        },
      ],
      线索: [
        {
          id: createId('clue'),
          名称: '焦黑的誓印',
          内容: '一枚残损徽章边缘带着异常灼痕，图样与艾尔图瑞尔骑士团的誓印相似，却沾染了硫磺味。',
        },
        {
          id: createId('clue'),
          名称: '低语的契约页',
          内容: '黑市传出的碎纸提到“以整座城市偿债”的措辞，明显不像凡间法庭会使用的语言。',
        },
      ],
      剧情钩子: [
        {
          id: createId('hook'),
          标题: '阿弗纳斯的召唤',
          摘要: '若你继续深挖，线索会把你从博德之门一路拖向血战不断的第一层地狱。',
          状态: '潜伏',
        },
      ],
    }),
  },
  {
    id: 'rime-of-the-frostmaiden',
    title: 'Icewind Dale: Rime of the Frostmaiden',
    subtitle: '被遗忘国度 / 寒地求生与怪谈悬疑',
    blurb: '世界观：被遗忘国度北地冰风谷。风格：极寒生存、荒野探索与怪谈悬疑。关键词：十镇、极夜、霜寒少女、荒原、生存。',
    form: createPresetForm({
      presetId: 'rime-of-the-frostmaiden',
      roleplayHook: '你来到冰风谷原本只是为了躲避旧债与旧仇，可这片永夜冻土很快让你意识到自己卷入了更古老的灾厄。',
      角色: {
        姓名: '布琳',
        种族: '矮人',
        职业: '游侠',
        等级: 3,
        背景: '熟悉北地风雪的赏金猎人与向导，曾多次带队穿过冰原，也见过太多人消失在无尽暴风中。',
        阵营: '中立',
        熟练加值: 2,
        护甲等级: 15,
        速度: 25,
        生命值: 32,
        生命上限: 32,
        临时生命: 0,
        能力值: { 力量: 13, 敏捷: 16, 体质: 15, 智力: 10, 感知: 14, 魅力: 9 },
      },
      资源: {
        金币: 41,
        法术位摘要: '1环 3/3',
        资源备注: '背包中有防寒披毛、鱼油灯、猎兽夹和一份标着十镇补给路线的冰原地图。',
      },
      剧情: {
        当前场景: '十镇之一的不眠港夜间街道',
        场景摘要: '风雪压得木屋吱呀作响，天色却像深冬黄昏般停滞不前。人们压低声音谈论献祭、失踪者和那位令太阳迟迟不升的女神。',
        战役日志标题: '永夜中的第一场风雪',
        战役日志内容: '你抵达十镇时，这里已经太久没有见过真正的白昼。冰风谷的寒冷不只来自天气，更来自每个人都不愿明说的恐惧。',
      },
      任务: [
        {
          id: createId('quest'),
          名称: '调查镇上的异常失踪',
          状态: '进行中',
          摘要: '昨夜又有人在暴风雪里失踪，而镇民对真相讳莫如深。',
          目标: '拜访酒馆、码头与值夜人，拼出失踪事件发生前后的时间线。',
        },
        {
          id: createId('quest'),
          名称: '准备冰原远行补给',
          状态: '可选',
          摘要: '如果线索指向镇外，你需要先解决食物、燃料与抗寒装备的问题。',
          目标: '确认队伍的雪地补给与可能的向导支持。',
        },
      ],
      线索: [
        {
          id: createId('clue'),
          名称: '霜纹祭符',
          内容: '一块被遗落在雪地里的骨片刻有重复的冰晶符号，像是某种献祭或祈愿仪式的一部分。',
        },
        {
          id: createId('clue'),
          名称: '无星的夜空',
          内容: '当地老人坚持说，近来的天象与往年冰风谷的极夜不同，像是有什么存在主动压住了天空。',
        },
      ],
      剧情钩子: [
        {
          id: createId('hook'),
          标题: '霜寒少女的注视',
          摘要: '随着你逐步接近真相，会发现这片永夜并非单纯天灾，而是一位神祇意志对北地的长期笼罩。',
          状态: '潜伏',
        },
      ],
    }),
  },
];

export function getAbilityKeys() {
  return [...ABILITY_KEYS];
}

export function getQuestStatusOptions() {
  return [...QUEST_STATUS];
}

export function getHookStatusOptions() {
  return [...HOOK_STATUS];
}

export function getModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function formatBookModifier(score: number) {
  const modifier = getModifier(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function createCharacterBookForm() {
  return createDefaultForm();
}

export function cloneForm(form: CharacterBookForm) {
  return _.cloneDeep(form);
}

export function getInitialCharacterBookForm(): CharacterBookForm {
  try {
    const variables = getVariables({ type: 'message', message_id: 0 });
    if (variables?.stat_data) {
      return mapSchemaToForm(Schema.parse(variables.stat_data));
    }
  } catch (error) {
    console.warn('[DND][CharacterBook] 读取 0 层角色数据失败，使用默认表单。', error);
  }

  return createDefaultForm();
}

export function mapSchemaToForm(data: SchemaType): CharacterBookForm {
  const logEntry = _(data.剧情.战役日志).entries().last();
  const latestLog = logEntry?.[1] ?? { 标题: '开局记录', 内容: '', 时间: createTimeLabel() };

  return {
    presetId: null,
    roleplayHook: '',
    角色: {
      姓名: data.角色.姓名,
      种族: data.角色.种族,
      职业: data.角色.职业,
      等级: data.角色.等级,
      背景: data.角色.背景,
      阵营: data.角色.阵营,
      熟练加值: data.角色.熟练加值,
      护甲等级: data.角色.护甲等级,
      速度: data.角色.速度,
      生命值: data.角色.生命值,
      生命上限: data.角色.生命上限,
      临时生命: data.角色.临时生命,
      能力值: { ...data.角色.能力值 },
    },
    资源: {
      金币: data.资源.金币,
      法术位摘要: data.资源.法术位摘要,
      资源备注: data.资源.资源备注,
    },
    剧情: {
      当前场景: data.剧情.当前场景,
      场景摘要: data.剧情.场景摘要,
      战役日志标题: latestLog.标题,
      战役日志内容: latestLog.内容,
    },
    队伍: _(data.小队)
      .entries()
      .map(([名称, member]) => ({
        id: createId('party'),
        名称,
        职责: member.职责,
        当前生命: member.当前生命,
        生命上限: member.生命上限,
        状态: member.状态,
        先攻: member.先攻,
        备注: member.备注,
      }))
      .value(),
    任务: _(data.剧情.任务列表)
      .entries()
      .map(([名称, quest]) => ({
        id: createId('quest'),
        名称,
        状态: quest.状态,
        摘要: quest.摘要,
        目标: quest.目标,
      }))
      .value(),
    线索: _(data.剧情.关键线索)
      .entries()
      .map(([名称, 内容]) => ({
        id: createId('clue'),
        名称,
        内容,
      }))
      .value(),
    剧情钩子: _(data.剧情.剧情钩子)
      .entries()
      .map(([id, hook]) => ({
        id: id || createId('hook'),
        标题: hook.标题,
        摘要: hook.摘要,
        状态: hook.状态,
      }))
      .value(),
  };
}

export function mapFormToSchema(form: CharacterBookForm): SchemaType {
  const schemaBase = Schema.parse({});

  return Schema.parse({
    ...schemaBase,
    角色: {
      ...schemaBase.角色,
      ...form.角色,
      能力值: { ...form.角色.能力值 },
    },
    资源: {
      ...schemaBase.资源,
      ...form.资源,
    },
    小队: form.队伍.reduce<SchemaType['小队']>((result, member) => {
      if (!member.名称.trim()) {
        return result;
      }
      result[member.名称.trim()] = {
        职责: member.职责.trim() || '支援',
        当前生命: member.当前生命,
        生命上限: member.生命上限,
        状态: member.状态.trim() || '待命',
        先攻: member.先攻,
        备注: member.备注.trim() || '等待进一步指令。',
      };
      return result;
    }, {}),
    剧情: {
      ...schemaBase.剧情,
      当前场景: form.剧情.当前场景,
      场景摘要: form.剧情.场景摘要,
      任务列表: form.任务.reduce<SchemaType['剧情']['任务列表']>((result, quest) => {
        if (!quest.名称.trim()) {
          return result;
        }
        result[quest.名称.trim()] = {
          状态: quest.状态,
          摘要: quest.摘要.trim(),
          目标: quest.目标.trim(),
        };
        return result;
      }, {}),
      战役日志: {
        'log-opening': {
          标题: form.剧情.战役日志标题.trim() || '开局记录',
          内容: form.剧情.战役日志内容.trim() || `${form.角色.姓名 || '角色'}完成了角色卡创建。`,
          时间: createTimeLabel(),
        },
      },
      关键线索: form.线索.reduce<SchemaType['剧情']['关键线索']>((result, clue, index) => {
        const key = clue.名称.trim() || `线索${index + 1}`;
        result[key] = clue.内容.trim();
        return result;
      }, {}),
      剧情钩子: form.剧情钩子.reduce<SchemaType['剧情']['剧情钩子']>((result, hook, index) => {
        const key = hook.id || `hook-${index + 1}`;
        result[key] = {
          标题: hook.标题.trim() || `剧情钩子 ${index + 1}`,
          摘要: hook.摘要.trim(),
          状态: hook.状态,
        };
        return result;
      }, {}),
    },
  });
}

export async function saveCharacterBookForm(form: CharacterBookForm) {
  const statData = mapFormToSchema(form);
  await updateVariablesWith(variables => {
    const nextVariables = _.cloneDeep(variables ?? {});
    nextVariables.stat_data = statData;
    return nextVariables;
  }, { type: 'message', message_id: 0 });
  return statData;
}

export function createEmptyPartyMember() {
  return {
    id: createId('party'),
    名称: '',
    职责: '支援',
    当前生命: 10,
    生命上限: 10,
    状态: '待命',
    先攻: 0,
    备注: '',
  };
}

export function createEmptyQuest() {
  return {
    id: createId('quest'),
    名称: '',
    状态: '进行中' as const,
    摘要: '',
    目标: '',
  };
}

export function createEmptyClue() {
  return {
    id: createId('clue'),
    名称: '',
    内容: '',
  };
}

export function createEmptyHook() {
  return {
    id: createId('hook'),
    标题: '',
    摘要: '',
    状态: '潜伏' as const,
  };
}
