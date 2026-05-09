# money EJS 阶段控制器

条目名称:
```text
money_EJS_阶段加载控制器
```

条目内容:
```javascript
@@preprocessing
<%_
if (typeof moneySystemLevel === 'undefined') var moneySystemLevel = getvar('stat_data.系统.等级', { defaults: 1 });
if (typeof moneyRiskLevel === 'undefined') var moneyRiskLevel = getvar('stat_data.系统.风险等级', { defaults: '低' });
if (typeof moneyShopPermission === 'undefined') var moneyShopPermission = getvar('stat_data.系统.商城权限', { defaults: '金钱道具' });
if (typeof moneyFocusTarget === 'undefined') var moneyFocusTarget = getvar('stat_data.界面状态.当前聚焦目标', { defaults: '' });
if (typeof moneyFocusStatus === 'undefined') var moneyFocusStatus = getvar('stat_data.界面状态.当前目标状态', { defaults: '未接触' });
if (typeof moneyActionType === 'undefined') var moneyActionType = getvar('stat_data.界面状态.当前行动类型', { defaults: '未指定' });
if (typeof moneyRouteStage === 'undefined') var moneyRouteStage = getvar('stat_data.界面状态.推荐加载阶段', { defaults: '自动' });
if (typeof moneyFirstQuote === 'undefined') var moneyFirstQuote = getvar('stat_data.$flag.首次报价', { defaults: false });
if (typeof moneyFirstPurchase === 'undefined') var moneyFirstPurchase = getvar('stat_data.$flag.首次购买道具', { defaults: false });
if (typeof moneyFirstRulePatch === 'undefined') var moneyFirstRulePatch = getvar('stat_data.$flag.首次常识补丁', { defaults: false });
_%>

<%_ if (moneyRouteStage === '原味交易') { _%>
money_阶段01_原味交易
<%_ } else if (moneyRouteStage === '私密素材') { _%>
money_阶段02_私密素材
<%_ } else if (moneyRouteStage === '线上支配') { _%>
money_阶段03_线上支配
<%_ } else if (moneyRouteStage === '线下见面') { _%>
money_阶段04_线下见面
<%_ } else if (moneyRouteStage === '恶堕转折') { _%>
money_阶段05_恶堕转折
<%_ } else if (moneyRouteStage === '资产化') { _%>
money_阶段06_资产化
<%_ } else if (moneyActionType === '原味交易') { _%>
money_阶段01_原味交易
<%_ } else if (moneyActionType === '私密素材') { _%>
money_阶段02_私密素材
<%_ } else if (moneyActionType === '线上支配') { _%>
money_阶段03_线上支配
<%_ } else if (moneyActionType === '线下见面') { _%>
money_阶段04_线下见面
<%_ } else if (moneyActionType === '恶堕转折') { _%>
money_阶段05_恶堕转折
<%_ } else if (moneyActionType === '资产化维护') { _%>
money_阶段06_资产化
<%_ } else if (moneyActionType === '常识补丁') { _%>
money_常识规则_场景补丁
<%_ } else if (moneyFocusStatus === '未接触') { _%>
money_阶段01_原味交易
<%_ } else if (moneyFocusStatus === '已试探') { _%>
money_阶段01_原味交易
money_阶段02_私密素材
<%_ } else if (moneyFocusStatus === '已交易') { _%>
money_阶段02_私密素材
money_阶段03_线上支配
<%_ } else if (moneyFocusStatus === '已屈服') { _%>
money_阶段04_线下见面
money_阶段05_恶堕转折
<%_ } else if (moneyFocusStatus === '已资产化') { _%>
money_阶段06_资产化
<%_ } else if (moneySystemLevel === 1) { _%>
money_阶段01_原味交易
<%_ } else if (moneySystemLevel === 2) { _%>
money_阶段01_原味交易
money_阶段02_私密素材
<%_ } else if (moneySystemLevel === 3) { _%>
money_阶段02_私密素材
money_阶段03_线上支配
<%_ } else if (moneySystemLevel === 4) { _%>
money_阶段03_线上支配
money_阶段04_线下见面
money_常识规则_场景补丁
<%_ } else if (moneySystemLevel >= 5) { _%>
money_阶段04_线下见面
money_阶段05_恶堕转折
money_阶段06_资产化
money_常识规则_场景补丁
<%_ } else { _%>
money_阶段01_原味交易
<%_ } _%>

<%_ if (moneyShopPermission === '感官强化') { _%>
money_商城权限_感官强化
<%_ } else if (moneyShopPermission === '心理干涉') { _%>
money_商城权限_感官强化
money_商城权限_心理干涉
<%_ } else if (moneyShopPermission === '常识修改') { _%>
money_商城权限_感官强化
money_商城权限_心理干涉
money_商城权限_常识修改
<%_ } else if (moneyShopPermission === '现实权限') { _%>
money_商城权限_感官强化
money_商城权限_心理干涉
money_商城权限_常识修改
money_商城权限_现实权限
<%_ } _%>

<%_ if (moneyRiskLevel === '中') { _%>
money_风险规则_中风险
<%_ } else if (moneyRiskLevel === '高') { _%>
money_风险规则_高风险
<%_ } else if (moneyRiskLevel === '极高') { _%>
money_风险规则_极高风险
<%_ } _%>

<%_ if (moneyFirstQuote === false || moneyFirstQuote === 'false') { _%>
money_首次事件_首次报价
<%_ } _%>

<%_ if (moneyFirstPurchase === false || moneyFirstPurchase === 'false') { _%>
money_首次事件_首次购买道具
<%_ } _%>

<%_ if (moneyFirstRulePatch === false || moneyFirstRulePatch === 'false') { _%>
money_首次事件_首次常识补丁
<%_ } _%>
```

涉及的关键词条目:
```yaml
关键词条目:
  常驻基础:
    说明:
      - 以下三条不由 EJS 控制，不写入控制器输出。
      - 在酒馆世界书中单独设置为蓝灯常驻，保证它们始终存在。
    条目:
      - money_世界观核心_普通都市世界
      - money_NPC生成指南
      - money_核心玩法说明

  阶段条目:
    - money_阶段01_原味交易
    - money_阶段02_私密素材
    - money_阶段03_线上支配
    - money_阶段04_线下见面
    - money_阶段05_恶堕转折
    - money_阶段06_资产化

  商城权限条目:
    - money_商城权限_感官强化
    - money_商城权限_心理干涉
    - money_商城权限_常识修改
    - money_商城权限_现实权限

  风险规则条目:
    - money_风险规则_中风险
    - money_风险规则_高风险
    - money_风险规则_极高风险

  首次事件条目:
    - money_首次事件_首次报价
    - money_首次事件_首次购买道具
    - money_首次事件_首次常识补丁

  常识规则条目:
    - money_常识规则_场景补丁
```

配置说明:
```yaml
控制器条目:
  名称: money_EJS_阶段加载控制器
  状态: 蓝灯常驻
  顺序: 100
  要求:
    - 必须开启 EJS。
    - 必须保留 @@preprocessing。
    - 不要勾选不可递归；需要让输出关键词继续激活绿灯条目。
    - 控制器只输出动态条目关键词，不输出常驻基础条目。

常驻基础条目:
  状态: 蓝灯常驻
  建议顺序: 80-90
  条目:
    - money_世界观核心_普通都市世界
    - money_NPC生成指南
    - money_核心玩法说明
  要求:
    - 不受 EJS 开关、系统等级、目标状态和风险等级影响。
    - 不要让控制器重复输出这些关键词，避免常驻内容被阶段路由污染。

被加载条目:
  状态: 绿灯关键词触发
  关键词:
    - 使用对应条目名称本身作为关键词。
  顺序建议:
    阶段条目: 120
    商城权限条目: 130
    风险规则条目: 140
    首次事件条目: 150
    常识规则条目: 160
  要求:
    - 不要蓝灯常驻阶段条目。
    - 不要勾选不可递归。
    - 条目正文使用 src/money/世界书/神豪系统世界书条目.md 中对应内容。
```

路由优先级:
```yaml
动态加载优先级:
  - 1. 界面状态.推荐加载阶段: 用于强制加载某个阶段，适合状态栏生成行动指令时写入。
  - 2. 界面状态.当前行动类型: 用于根据本轮行动直接加载阶段。
  - 3. 界面状态.当前目标状态: 用于围绕当前聚焦目标加载反应阶段。
  - 4. 系统.等级: 作为兜底，只决定当前系统权限下推荐的玩法深度。
  - 5. 系统.商城权限、系统.风险等级、$flag: 作为附加条目叠加。
```

自查清单:
```yaml
EJS自查:
  - 代码基于 EJS模板库 的动态关键词控制器模板。
  - 所有变量都使用 typeof 检查。
  - 所有变量都使用 var 声明。
  - 所有 MVU 路径都以 stat_data. 开头。
  - 没有使用 import、require、JSON.parse、JSON.stringify、fetch、定时器。
  - 控制器只输出关键词，不负责资金、经验、任务、目标属性结算。
  - 控制器不输出常驻基础条目。
```
