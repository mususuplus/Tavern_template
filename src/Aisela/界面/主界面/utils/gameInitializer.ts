/**
 * 游戏初始化工具
 * 参考 src/mhjg/utils/gameInitializer.ts：写入 0 层变量、创建 1 层开局消息
 * 表单未填的字段使用下方预填值，避免势力等为空。
 */

import { Schema, type SchemaType } from '../../../schema';
import { AISELA_ASSISTANT_READY } from './messageParser';
import {
  buildChronicleTickerItems,
  getFocusedProphecyName,
  getHostPhaseData,
  getTheologyEcho,
  WORLD_REGIONS,
} from '../data/worldData';

export type OpeningFormConfig = {
  profession: string;
  faith: string;
  location: string;
  status: string;
  currency: { gold: number; silver: number; copper: number };
};

/** 开局时主角的预填值（表单未覆盖的字段） */
const DEFAULT_主角预填 = {
  称号: '你好世界',
  生命: 450,
  生命上限: 450,
  法力: 200,
  法力上限: 200,
  奥法之灾觉醒度: 0,
  奥法之灾觉醒度上限: 100,
} as const;

/** 开局时势力列表的预填值 */
const DEFAULT_势力: Record<string, { 声望: string; 描述: string }> = {
  神圣罗兰帝国: {
    声望: '中立',
    描述: '人类与兽人共治的君主-神权国家，占据大陆中央最富饶的翡翠平原。帝国已与南方的魔国进行三百年战争，国力从巅峰缓慢下滑。皇权与神权并立，当今国教为光明神教，皇帝为狮兽人威廉·格里亚斯，四大贵族家族各掌军事、财政、魔法、情报大权。这里是冒险者最活跃的区域。',
  },
  永夜森林议会: {
    声望: '中立',
    描述: '精灵的封闭长老议会，统治西方遮天蔽日的永夜森林。四大氏族分管祭祀、军事、知识与生态，由740岁的月精灵议长露娜统领。精灵寿命悠长、行动缓慢，视帝国为"急躁的孩子"，但对魔国保持绝对敌意。森林南部正遭受无名荒芜侵蚀，这是议会最深层的焦虑。',
  },
  矮人地下城: {
    声望: '中立',
    描述: '矮人称其为卡兹·莫丹，工匠行会联合统治的地下要塞，位于凛冬山脉深处。四大行会分管锻造、符文、爆破与勘探，由217岁的首席大工匠泰德统领。这里是帝国抗魔前线的军备供应商，六成以上的武器盔甲产自此处。城市呈倒锥形向下延伸，越深处越热、越富、也越危险。',
  },
  观测者组织: {
    声望: '中立',
    描述: '国际公认的第三方监测机构，总部位于大陆地理中心的虚空圣所。通过遍布各地的观测塔和"以太共鸣雷达"网络，监测七大灭世要素的苏醒迹象。末日时钟的指针位置，代表当前灭世风险的综合评估。巡查使拥有跨国执法权，是学会的外勤精英。',
  },
  远方行歌: {
    声望: '中立',
    描述: '跨国界冒险者互助联盟，总部位于漂移的浮空城"天际港"。通过遍布各地的"狮鹫酒馆"网络发布委托、收购素材、认证等级。等级从铜牌到苍蓝共五级，全大陆苍蓝级仅十二人。冒险者公约是唯一的规则——拒绝明显违法的委托，报酬与风险必须匹配。',
  },
  星语协会: {
    声望: '中立',
    描述: '跨国魔法学术权威机构，总部位于浮空的"语石群岛"。垄断从学徒到传奇的全部法师认证，运营着大陆最完整的魔法文献库"无尽书廊"。七座主塔对应七个研究方向，由七位传奇法师（星语长席）统领。协会维护一份"封缄目录"，禁止研究涉及灭世要素、灵魂永续等危险课题。',
  },
  魔国: {
    声望: '敌对',
    描述: '魔王统治的神权军事帝国，盘踞于暗影裂谷。以"暗影同化"将俘虏转化为服从的战士——浅层同化者保留自我但绝对服从，深层同化者成为魔王意志的延伸。三百年来持续发动"魔潮"冲击帝国防线，是文明世界最直接的军事威胁。',
  },
  灭世教派: {
    声望: '敌对',
    描述: '跨国极端宗教联盟，崇拜七大灭世要素，认为现世是"诸神黄昏后拼凑的残次品"，唤醒灭世要素即是"修复真实"。四大派系分别崇拜噬根之蛇、寂静圣画、钢铁神子和魔王，由从未现身的"先知"通过精神指令操控。总部"幽灵方舟"在枯萎之地边缘游荡，观测者至今无法锁定。',
  },
};

/**
 * 将开局表单配置转为完整 stat_data 并写入 0 层消息楼层变量
 * 表单字段与预填值合并；势力等未在表单中的结构使用 DEFAULT_势力 等预填。
 */
export async function initializeGameVariables(config: OpeningFormConfig): Promise<boolean> {
  try {
    const hostPhase = getHostPhaseData(DEFAULT_主角预填.奥法之灾觉醒度);
    const currentRegion = WORLD_REGIONS.find(region => region.name === config.location) ?? WORLD_REGIONS[0]!;
    const focusedProphecy = getFocusedProphecyName(
      config.location,
      3,
      DEFAULT_主角预填.奥法之灾觉醒度,
      config.faith === '无' ? '无' : config.faith.split('(')[0],
    );
    const theologyEcho = getTheologyEcho(
      config.location,
      focusedProphecy,
      config.faith === '无' ? '无' : config.faith.split('(')[0],
      DEFAULT_主角预填.奥法之灾觉醒度,
    );
    const tickerItems = buildChronicleTickerItems(null, {
      region: currentRegion,
      prophecy: focusedProphecy,
      hostPhase,
      questNames: [],
    });

    const stat_data = Schema.parse({
      主角: {
        ...DEFAULT_主角预填,
        职业: config.profession,
        信仰: config.faith === '无' ? '无' : config.faith.split('(')[0],
        当前地点: config.location,
        状态: config.status,
        宿主档案: {
          阶段代码: hostPhase.code,
          阶段名称: hostPhase.name,
          阶段称谓: hostPhase.label,
          异象前兆: hostPhase.omen,
          风险提示: hostPhase.risk,
          下一阈值: hostPhase.nextTrigger,
          可能代价: hostPhase.cost,
        },
        货币: {
          金狮: config.currency.gold,
          银辉币: config.currency.silver,
          铜叶币: config.currency.copper,
        },
      },
      世界: {
        当前聚焦预言: focusedProphecy,
        当前聚焦说明: `开局阶段档案馆优先关注 ${focusedProphecy}，并以 ${currentRegion.short} 的区域局势作为解释背景。`,
        神学回声: theologyEcho,
        本幕纪要: `开局：${config.profession}，${config.location}。`,
        区域态势: {
          主导危机: currentRegion.dominantCrisis,
          推荐关注: currentRegion.recommendedFocus,
          典型异象: currentRegion.signatureAnomaly,
          势力拉扯: currentRegion.factionTension,
        },
        情报流: {
          地点变化: tickerItems[0]?.text ?? '',
          势力动作: tickerItems[1]?.text ?? '',
          宿主异常: tickerItems[2]?.text ?? '',
          当前任务: tickerItems[3]?.text ?? '',
        },
      },
      势力: DEFAULT_势力,
    }) as SchemaType;

    let variables: Record<string, any>;
    try {
      variables = getVariables({ type: 'message', message_id: 0 });
    } catch {
      variables = {};
    }
    if (!variables.stat_data) variables.stat_data = {};

    await updateVariablesWith(
      vars => {
        const next = { ...vars, stat_data: klona(stat_data) };
        return next;
      },
      { type: 'message', message_id: 0 },
    );

    console.info('[Aisela] 已初始化 0 层游戏变量');
    return true;
  } catch (err) {
    console.error('[Aisela] 初始化 0 层游戏变量失败:', err);
    return false;
  }
}

/**
 * 创建开局介绍楼层（1 层），包含 <maintext> 与 <option>
 */
export async function createOpeningStoryMessage(config: OpeningFormConfig): Promise<boolean> {
  try {
    const faithLabel = config.faith === '无' ? '无' : config.faith;
    const maintext = `<maintext>
诸神黄昏的灰烬落定已逾三千年。

在那场将古神系彻底埋葬的战争中，世界被撕裂又再度缝合。幸存的新神——索利昂、诺克萨拉、瓦尔坎、莫尔甘、艾尔薇恩、梅萨娜、图尔克——在废墟上立下沉默誓约：永不主动干涉凡间因果，只回应祈祷。七位神祇以光明与黑暗、战争与死亡、自然与锻造的六柱对位，加上居中的魔法之神，构建起今日艾瑟兰的法则根基。他们的圣徽高悬于神殿穹顶，他们的名号铭刻在每一座城镇的基石之上。

但誓约无法抹去的，是那七道深埋于世界本质中的裂痕。

《末日预言书》 记载着七大灭世要素——它们是诸神黄昏未被清算的遗产，是旧世界崩溃时残存的力量残余，指向世界存续的七个根本维度。魔王已在三百年前觉醒，于暗影裂谷深处建立魔国，其暗影同化如瘟疫般向中央平原蔓延；无名荒芜从南方枯萎之地持续北侵，所过之处物理法则逐层失效，存在本身被缓慢抹消；噬根之蛇沉睡于根源地脉深处，以时间为食，一旦苏醒便将吞食因果本身，奥法之灾——魔力奇点——预言中"一次呼吸便能焚毁真理根基"的容器，至今下落不明；寂静圣画遗失在历史的褶皱里，等待着将现实收录于画中；盲目之光会消解"我们"；钢铁神子沉睡于某处失落的封印中，当它睁开眼睛，生命将按名单被逐一清算。

在这灭世的阴影下，凡人的文明如同摇曳的烛火。

神圣罗兰帝国雄踞中央翡翠平原，狮兽人皇帝威廉·格里亚斯在神权与贵族的夹缝中维系着人类与兽人共治的脆弱平衡。永夜森林议会的精灵们在世界树的根系间倾听自然之声，月精灵议长露娜·约尔兰德已七百四十岁，见证过帝国尚未建立时的岁月。矮人地下城卡兹·莫丹的熔炉在凛冬山脉深处昼夜不息，首席大工匠泰德·托亚锻造的武器正源源不断运往抗魔前线。星语协会的七座浮空塔在语石群岛上空旋转，魔法之神的信徒们以理性丈量着法则的边界。远方行歌的冒险者们从浮空城天际港出发，将足迹印遍大陆的每一个角落。而观测者学会的末日时钟，此刻正指向刻度三——距离"午夜"的危机等级，还有九个刻度。

暗影纪元第三百年的初春。

圣罗兰城的钟声正越过圣河的薄雾，狮鹫旗帜在皇宫塔楼上猎猎作响。银潮港的商船满载着矮人的符文钢锭起锚，永夜森林的露水从世界树的枝叶间滴落，绝境长城上的哨兵揉了揉因注视暗影太久而酸涩的眼睛。

而某个尚未知晓自己命运的灵魂，正在过着再平常不过的一天。

诸神沉默。预言苏醒。

你是一名${config.profession}，信仰${faithLabel}。此刻你身处${config.location}，状态${config.status}。

命运的轮盘已经开始转动。你准备好了吗？
</maintext>`;

    const sum = `<sum>开局：${config.profession}，${config.location}。</sum>`;
    const option = `<option>
A. 开始这场旅程。
</option>`;
    const message = `${maintext}\n\n${sum}\n\n${option}`;

    let layer0Data: Record<string, any> = { stat_data: {}, display_data: {}, delta_data: {} };
    try {
      const vars = getVariables({ type: 'message', message_id: 0 });
      if (vars && vars.stat_data) {
        layer0Data = {
          stat_data: vars.stat_data ?? {},
          display_data: vars.display_data ?? {},
          delta_data: vars.delta_data ?? {},
        };
      }
    } catch {
      // 使用空对象
    }

    await createChatMessages([{ role: 'assistant', message, data: layer0Data }], { refresh: 'none' });

    window.dispatchEvent(new CustomEvent(AISELA_ASSISTANT_READY));
    console.info('[Aisela] 已创建开局介绍楼层（1 层）');
    return true;
  } catch (err) {
    console.error('[Aisela] 创建开局介绍楼层失败:', err);
    return false;
  }
}
