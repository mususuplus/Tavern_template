<template>
  <main class="fur-workbench">
    <section class="mast">
      <div>
        <p class="kicker">fur staged atelier</p>
        <h1>fur 小助手</h1>
      </div>
      <div class="mast-controls">
        <div class="mode-strip" aria-label="成人向模式">
          <button v-for="mode in adultModes" :key="mode" type="button" :class="{ active: state.adult_mode === mode }"
            @click="setAdultMode(mode)">
            {{ mode }}
          </button>
        </div>
        <label class="worldbook-toggle">
          <input v-model="state.worldbook_mode" type="checkbox" @change="toggleWorldbookMode" />
          <span>世界书模式</span>
        </label>
      </div>
    </section>

    <section class="workspace">
      <form class="input-panel" @submit.prevent="generateStage">
        <nav class="stage-tabs" aria-label="定稿阶段">
          <button v-for="stage in stages" :key="stage.key" type="button"
            :class="{ active: activeStage === stage.key, done: finalText(stage.key) }" @click="activeStage = stage.key">
            <span>{{ stage.index }}</span>
            {{ stage.label }}
          </button>
        </nav>

        <template v-if="activeStage !== 'preview'">
          <section class="preset-shelf">
            <button v-for="preset in stagePresets" :key="preset.name" type="button" @click="applyPreset(preset)">
              <span>{{ preset.kind }}</span>
              <strong>{{ preset.name }}</strong>
            </button>
          </section>

          <section class="page-body">
            <div v-if="activeStage === 'concept'" class="field-grid">
              <label>
                <span>概念类型</span>
                <select v-model="state.concept_mode">
                  <option>角色</option>
                  <option>模拟器</option>
                </select>
              </label>
              <label>
                <span>生成标签</span>
                <input :value="stageTag" readonly />
              </label>
              <label>
                <span>捕获楼层</span>
                <input v-model="state.capture_message_id" placeholder="留空=最新AI楼层" />
              </label>
            </div>
            <div v-else-if="activeStage === 'frontend'" class="field-grid">
              <label>
                <span>前端用途</span>
                <input value="只展示 MVU 变量" readonly />
              </label>
              <label>
                <span>变量状态</span>
                <input :value="frontendMissing.length ? `缺少：${frontendMissing.join('、')}` : 'MVU 三段已完成'" readonly />
              </label>
            </div>
            <div v-else-if="mvuStageKeys.includes(activeStage)" class="field-grid">
              <label>
                <span>变量模块</span>
                <select v-model="state.mvu_enabled" @change="persistState">
                  <option :value="true">启用</option>
                  <option :value="false">关闭</option>
                </select>
              </label>
              <label>
                <span>生成标签</span>
                <input :value="stageTag" readonly />
              </label>
              <label>
                <span>捕获楼层</span>
                <input v-model="state.capture_message_id" placeholder="留空=最新AI楼层" />
              </label>
            </div>
            <div v-else class="field-grid">
              <label>
                <span>生成标签</span>
                <input :value="stageTag" readonly />
              </label>
              <label>
                <span>捕获楼层</span>
                <input v-model="state.capture_message_id" placeholder="留空=最新AI楼层" />
              </label>
            </div>

            <label>
              <span>{{ currentStage.inputLabel }}</span>
              <textarea v-model="currentDraft.input" :placeholder="currentStage.placeholder" rows="7" />
            </label>

            <section v-if="activeStage === 'frontend'" class="saved-list">
              <div class="saved-list-head">
                <strong>使用方式</strong>
                <span>手动复制</span>
              </div>
              <article>
                <strong>把 AI 生成的完整 ```html 代码块复制下来。</strong>
                <strong>创建“页面局部正则脚本”，查找正则表达式写 <code>&lt;StatusPlaceHolderImpl/&gt;</code>。</strong>
                <strong>替换内容填入完整前端代码，保留 ```html 代码围栏。</strong>
              </article>
            </section>

            <section v-if="activeStage === 'concept' && state.concept_mode === '角色' && characterFinals.length"
              class="saved-list">
              <div class="saved-list-head">
                <strong>已保存角色</strong>
                <span>{{ characterFinals.length }} 个</span>
              </div>
              <article v-for="character in characterFinals" :key="character.id">
                <strong>{{ character.title }}</strong>
                <button type="button" class="secondary compact" @click="removeCharacterFinal(character.id)">移除</button>
              </article>
            </section>

            <section
              v-if="mvuStageKeys.includes(activeStage) && (state.mvu_schema_final || state.mvu_rules_final || state.mvu_initvar_final)"
              class="saved-list">
              <div class="saved-list-head">
                <strong>已保存变量模块</strong>
                <span>{{ state.mvu_enabled ? '导出时启用' : '导出时关闭' }}</span>
              </div>
              <article>
                <strong>{{ state.mvu_schema_script ? '变量结构脚本已捕获' : '缺少变量结构脚本' }}</strong>
                <strong>{{ state.mvu_update_rules ? '更新规则已捕获' : '缺少更新规则' }}</strong>
                <strong>{{ state.mvu_initvar_yaml ? '初始变量已捕获' : '缺少初始变量' }}</strong>
              </article>
            </section>

            <div class="actions">
              <button type="button" class="secondary" @click="saveDraft">保存草稿</button>
              <button type="submit" class="primary" :disabled="isGenerating || frontendBlocked">
                {{ isGenerating ? '发送中' : frontendBlocked ? '请先补齐 MVU' : currentStage.generateLabel }}
              </button>
            </div>

            <label v-if="activeStage !== 'frontend'">
              <span>最新捕获预览</span>
              <textarea v-model="currentDraft.output" placeholder="点击捕获后，这里会显示从最新 AI 楼层提取到的对应标签内容。" rows="12" />
            </label>

            <div v-if="activeStage !== 'frontend'" class="actions">
              <button type="button" class="secondary" @click="copyPrompt">复制请求</button>
              <button type="button" class="primary" @click="captureAndSave">从最新AI楼层捕获并保存定稿</button>
            </div>
            <div v-else class="actions">
              <button type="button" class="secondary" @click="copyPrompt">复制请求</button>
            </div>
          </section>
        </template>

        <section v-else class="page-body">
          <div v-if="missingStages.length" class="missing-list">
            <strong>仍缺少</strong>
            <span>{{ missingStages.join('、') }}</span>
          </div>
          <label>
            <span>组合预览</span>
            <textarea :value="combinedPreview" rows="24" readonly />
          </label>
          <div class="actions">
            <button type="button" class="secondary" @click="copyCombined">复制组合材料</button>
            <button type="button" class="primary" @click="clearAll">清空本聊天保存</button>
          </div>
        </section>
      </form>

      <aside class="preview-panel">
        <div class="preview-head">
          <p class="kicker">stage preview</p>
          <strong>{{ currentStage.label }}</strong>
          <button type="button" class="secondary compact" @click="exportFinalCard">导出</button>
        </div>

        <section class="status-grid">
          <div v-for="stage in stages.filter(item => item.key !== 'preview')" :key="stage.key">
            <span>{{ stage.label }}</span>
            <strong>{{ stage.key === 'frontend' ? '不保存' : finalText(stage.key) ? '已保存' : '未保存' }}</strong>
          </div>
        </section>

        <template v-if="activeStage !== 'preview'">
          <div class="notice" :class="state.adult_mode === 'NSFW' ? 'notice-hot' : 'notice-calm'">
            <strong>{{ stageTag }}</strong>
            <span>{{ currentStage.hint }}</span>
          </div>
          <div v-if="state.worldbook_mode" class="notice notice-worldbook">
            <strong>世界书模式已开启</strong>
            <span>{{ worldbookModeHint }}</span>
          </div>
          <pre>{{ requestText }}</pre>
        </template>

        <template v-else>
          <pre>{{ combinedPreview }}</pre>
        </template>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';

type StageKey = 'world' | 'concept' | 'mvuSchema' | 'mvuRules' | 'initvar' | 'frontend' | 'opening' | 'preview';
type DraftKey = Exclude<StageKey, 'preview'>;
type ConceptMode = '角色' | '模拟器';
type AdultMode = 'SFW' | 'NSFW';
type Draft = { input: string; output: string };
type CharacterFinal = { id: string; title: string; content: string };
type SavedState = {
  active_stage: StageKey;
  adult_mode: AdultMode;
  concept_mode: ConceptMode;
  worldbook_mode: boolean;
  drafts: Record<DraftKey, Draft>;
  world_final: string;
  character_final: string;
  character_finals: CharacterFinal[];
  simulator_final: string;
  mvu_schema_final: string;
  mvu_rules_final: string;
  mvu_final: string;
  mvu_schema_script: string;
  mvu_update_rules: string;
  mvu_initvar_final: string;
  mvu_initvar_yaml: string;
  mvu_enabled: boolean;
  opening_final: string;
  capture_message_id: string;
};
type Preset = {
  name: string;
  kind: string;
  stage: DraftKey;
  conceptMode?: ConceptMode;
  text: string;
};

const STORAGE_PATH = 'fur_card_helper';
const RULE_WORLDBOOK_ENTRIES = [
  'fur核心准则',
  '世界观定稿规则',
  '角色定稿规则',
  '模拟器定稿规则',
  'MVU变量结构设计规则',
  'MVU变量更新规则',
  'MVU初始变量规则',
  '前端设计规则',
  '开场白定稿规则',
  'NSFW扩展规则',
];
const PROJECT_WORLDBOOK_ENTRIES = [
  'fur项目世界观定稿',
  'fur项目角色/模拟器定稿',
  'fur项目变量结构',
  'fur项目变量更新规则',
  'fur项目初始变量',
];
const adultModes: AdultMode[] = ['SFW', 'NSFW'];
const stages: Array<{ key: StageKey; index: string; label: string; inputLabel: string; placeholder: string; generateLabel: string; hint: string }> = [
  {
    key: 'world',
    index: '01',
    label: '世界观',
    inputLabel: '世界观简述 / 预设',
    placeholder: '输入世界类型、时代、种族/势力、核心冲突、氛围。',
    generateLabel: '生成世界观详设',
    hint: 'AI 输出必须包含 <fur_world>...</fur_world>。',
  },
  {
    key: 'concept',
    index: '02',
    label: '角色/模拟器',
    inputLabel: '角色或模拟器简述',
    placeholder: '输入角色身份、性格、外貌、关系；或模拟器玩法、核心循环、变量。',
    generateLabel: '生成概念详设',
    hint: '角色输出 <fur_character>，模拟器输出 <fur_simulator>，并读取已保存世界观。',
  },
  {
    key: 'mvuSchema',
    index: '03',
    label: '变量结构',
    inputLabel: '变量结构偏好 / 追踪重点',
    placeholder: '输入希望长期追踪的内容，例如关系变化、角色状态、侦探线索、经营资源、任务进度；也可以写“轻量变量，只追踪关系和当前场景”。',
    generateLabel: '生成变量结构',
    hint: '捕获时只读取 <mvu_schema_script>...</mvu_schema_script>。',
  },
  {
    key: 'mvuRules',
    index: '04',
    label: '变量规则',
    inputLabel: '变量更新规则偏好',
    placeholder: '输入希望 AI 如何更新变量，例如关系变化要克制、线索只按已公开信息推进、经营资源按每轮决策结算；也可以留空让 fur 根据已保存 schema 编写规则。',
    generateLabel: '生成变量规则',
    hint: '捕获时只读取 <mvu_update_rules>...</mvu_update_rules>。',
  },
  {
    key: 'initvar',
    index: '05',
    label: '初始变量',
    inputLabel: '初始变量偏好',
    placeholder: '在保存变量结构与变量规则后填写。可指定初始地点、时间、关系数值、角色状态、初始线索/任务等；留空则让 fur 根据设定、变量结构和更新规则给出合理初始值。',
    generateLabel: '生成初始变量',
    hint: '捕获时只读取 <mvu_initvar>...</mvu_initvar>，用于导出 [initvar] 变量初始化条目。',
  },
  {
    key: 'frontend',
    index: '06',
    label: '前端设计',
    inputLabel: '前端展示需求',
    placeholder: '输入想显示哪些变量、UI 风格、布局偏好、交互需求。例如：显示时间地点、主要角色关系、任务状态；做成深色仪表盘，支持折叠分组。',
    generateLabel: '生成前端代码',
    hint: '只生成展示 MVU 变量的 HTML；不捕获、不保存、不导出。',
  },
  {
    key: 'opening',
    index: '07',
    label: '开场白',
    inputLabel: '开场白需求',
    placeholder: '输入开场地点、关系阶段、情绪基调、希望用户如何接话。',
    generateLabel: '生成开场白',
    hint: 'AI 输出必须包含 <fur_opening>...</fur_opening>，并读取已保存世界观与角色/模拟器。',
  },
  {
    key: 'preview',
    index: '08',
    label: '组合预览',
    inputLabel: '',
    placeholder: '',
    generateLabel: '',
    hint: '',
  },
];

const presets: Preset[] = [
  {
    stage: 'world',
    kind: 'world',
    name: '现代人类都市',
    text: '近现实现代都市。主舞台是高压工作、旧城区公寓、警局、夜间便利店与城市边缘地带。核心冲突围绕未结旧案、阶层压力、亲密关系中的信任与隐瞒展开。整体氛围冷峻、克制、生活质感强。',
  },
  {
    stage: 'world',
    kind: 'world',
    name: '兽人共存都市',
    text: '现代都市中人类与兽人共存。兽人拥有不同族群、职业生态，地下赛事、夜间酒吧、族群社群与城市治安构成主要冲突。氛围兼具现实生活、肉体张力与族群身份议题。',
  },
  {
    stage: 'world',
    kind: 'world',
    name: '奇幻港口',
    text: '雾港城市，海裔、兽人商会、人类贵族和走私团体争夺航线与情报。港口酒馆、潮湿仓库、灯塔、黑市拍卖会是主要舞台。核心冲突是秘密、契约、血统与背叛。',
  },
  {
    stage: 'world',
    kind: 'world',
    name: '边境城邦',
    text: '边境城邦位于商路与荒原之间，人类与兽人共同治理。玩家需要平衡财政、粮食、防务、治安、民心与族群议席。适合经营模拟器、政治群像和关系养成。',
  },
  {
    stage: 'concept',
    kind: 'character',
    name: '男性人类刑警',
    conceptMode: '角色',
    text: '生成一名男性人类刑警。外表冷峻疲惫，职业敏锐，责任感强但不善表达。与{{user}}从邻居或案件协作者开始，关系慢热，冲突来自职业纪律、保护与隐瞒、未结旧案。',
  },
  {
    stage: 'concept',
    kind: 'character',
    name: '兽人拳馆老板',
    conceptMode: '角色',
    text: '生成一名成年狼族兽人男性，经营旧城区拳馆，也曾参与地下赛事。高大、旧伤、沉稳、护短，和{{user}}从训练、包扎、夜间陪伴中逐步建立亲密关系。',
  },
  {
    stage: 'concept',
    kind: 'character',
    name: '异族情报贩子',
    conceptMode: '角色',
    text: '生成一名男性幻想种情报贩子，经营港口酒馆。外表优雅危险，掌握秘密，擅长交易与试探。与{{user}}从利益合作逐渐转为互相偏袒。',
  },
  {
    stage: 'concept',
    kind: 'sim',
    name: '城邦经营',
    conceptMode: '模拟器',
    text: '生成一个边境城邦经营模拟器。核心循环为读取局势、选择政策、分配资源、处理事件、结算变量。',
  },
  {
    stage: 'concept',
    kind: 'sim',
    name: '关系养成',
    conceptMode: '模拟器',
    text: '生成一个男性角色关系养成模拟器。核心循环为日程选择、地点探索、角色互动、关系变化、事件触发。变量包括时间、地点、体力、金钱、亲密度、信任、欲望、事件标记。',
  },
  {
    stage: 'mvuSchema',
    kind: 'schema',
    name: '轻量关系',
    text: '设计轻量 MVU 变量。只追踪当前场景、时间推进、主要角色对{{user}}的关系状态、好感/信任/警惕等少量关系变量，以及最近事件摘要。不要设计复杂资源系统。',
  },
  {
    stage: 'mvuSchema',
    kind: 'schema',
    name: '侦探线索',
    text: '设计侦探向 MVU 变量。重点追踪当前案件、线索、嫌疑人、证词矛盾、地点调查状态、已公开信息与隐藏真相的揭露进度。不要提前剧透真相。',
  },
  {
    stage: 'mvuSchema',
    kind: 'schema',
    name: '经营资源',
    text: '设计经营/城邦/店铺向 MVU 变量。重点追踪日期、地点、资金、物资、治安/口碑/民心、委托或订单、关键 NPC 关系、阶段性事件。',
  },
  {
    stage: 'mvuSchema',
    kind: 'schema',
    name: '角色状态',
    text: '设计角色状态向 MVU 变量。重点追踪{{user}}与主要角色的当前位置、身体/精神状态、公开身份、秘密、关系阶段、边界与近期承诺。',
  },
  {
    stage: 'mvuRules',
    kind: 'rules',
    name: '轻量更新',
    text: '根据已保存变量结构编写轻量更新规则。关系与状态只在对话出现明确行为、承诺、冲突或时间推进时更新；不要为气氛词反复改数值。',
  },
  {
    stage: 'mvuRules',
    kind: 'rules',
    name: '线索推进',
    text: '根据已保存变量结构编写侦探/委托向更新规则。线索、嫌疑、地点调查只按本轮已公开信息推进；隐藏真相不直接写入可见变量，不使用剧透式规则。',
  },
  {
    stage: 'mvuRules',
    kind: 'rules',
    name: '经营结算',
    text: '根据已保存变量结构编写经营/资源向更新规则。资源、民心、治安、订单、任务等只在玩家决策、明确成本收益或回合结算时变化，并保留事件记录。',
  },
  {
    stage: 'initvar',
    kind: 'initvar',
    name: '按设定初始化',
    text: '根据已保存世界观、角色/模拟器、最新版 MVU 变量结构和变量更新规则，生成一份可直接用于 [initvar] 的初始变量。不要新增 schema 中不存在的字段。',
  },
  {
    stage: 'initvar',
    kind: 'initvar',
    name: '关系初始',
    text: '生成偏关系向的初始变量：当前场景放在故事开局，主要角色关系保持低到中等，信任和亲密边界留出成长空间，最近事件只写开局前提。',
  },
  {
    stage: 'initvar',
    kind: 'initvar',
    name: '模拟器初始',
    text: '生成偏模拟器向的初始变量：初始化时间、地点、玩家身份相关状态、初始资源、第一批任务/线索/事件阶段。',
  },
  {
    stage: 'frontend',
    kind: 'ui',
    name: '简洁状态栏',
    text: '生成一个简洁清晰的 MVU 状态栏。显示当前时间地点、主要角色关系、任务/线索状态和最近事件。适合嵌入聊天楼层。只展示变量，不修改变量。',
  },
  {
    stage: 'frontend',
    kind: 'ui',
    name: '角色关系面板',
    text: '生成一个偏角色关系的展示面板。重点显示主要角色对{{user}}的好感、信任、警惕、情绪、当前关系阶段和近期承诺。风格克制、有层次，支持多个角色动态展示。',
  },
  {
    stage: 'frontend',
    kind: 'ui',
    name: '模拟器仪表盘',
    text: '生成一个模拟器仪表盘。重点显示当前回合、地点、资源、任务、线索、势力或经营状态。信息密度适中，适合长期游玩时快速扫读。',
  },
  {
    stage: 'opening',
    kind: 'opening',
    name: '初遇',
    text: '生成初遇开场。需要具体地点、角色第一动作、可见细节、让{{user}}自然接话的最后一句。不要直接解释设定。',
  },
  {
    stage: 'opening',
    kind: 'opening',
    name: '危机求助',
    text: '生成危机求助开场。角色带着麻烦或伤势出现，既推动情节又暴露他的性格弱点，让{{user}}有明确选择。',
  },
  {
    stage: 'opening',
    kind: 'opening',
    name: '日常暧昧',
    text: '生成日常暧昧开场。重点是生活细节、身体距离、未说出口的情绪和轻微试探。',
  },
  {
    stage: 'opening',
    kind: 'opening',
    name: '任务开局',
    text: '生成任务开局。给出明确目标、地点、风险、角色态度和{{user}}可采取的第一步。',
  },
];

function createDefaultState(): SavedState {
  return {
    active_stage: 'world',
    adult_mode: 'SFW',
    concept_mode: '角色',
    worldbook_mode: false,
    drafts: {
      world: { input: '', output: '' },
      concept: { input: '', output: '' },
      mvuSchema: { input: '', output: '' },
      mvuRules: { input: '', output: '' },
      initvar: { input: '', output: '' },
      frontend: { input: '', output: '' },
      opening: { input: '', output: '' },
    },
    world_final: '',
    character_final: '',
    character_finals: [],
    simulator_final: '',
    mvu_schema_final: '',
    mvu_rules_final: '',
    mvu_final: '',
    mvu_schema_script: '',
    mvu_update_rules: '',
    mvu_initvar_final: '',
    mvu_initvar_yaml: '',
    mvu_enabled: false,
    opening_final: '',
    capture_message_id: '',
  };
}

function loadState(): SavedState {
  const variables = getVariables({ type: 'chat' });
  const loaded = _.merge(createDefaultState(), _.get(variables, STORAGE_PATH, {}));
  if (loaded.adult_mode !== 'NSFW') loaded.adult_mode = 'SFW';
  if (!Array.isArray(loaded.character_finals)) loaded.character_finals = [];
  if (loaded.character_final && !loaded.character_finals.length) {
    loaded.character_finals = [createCharacterFinal(loaded.character_final)];
  }
  loaded.drafts = _.merge(createDefaultState().drafts, loaded.drafts || {});
  if ((loaded as { active_stage?: string }).active_stage === 'mvu') loaded.active_stage = 'mvuSchema';
  if (loaded.mvu_final && (!loaded.mvu_schema_script || !loaded.mvu_update_rules)) {
    const legacySchema = captureTagged(loaded.mvu_final, 'mvu_schema_script');
    const legacyRules = captureTagged(loaded.mvu_final, 'mvu_update_rules');
    if (legacySchema && !loaded.mvu_schema_script) loaded.mvu_schema_script = legacySchema;
    if (legacySchema && !loaded.mvu_schema_final) loaded.mvu_schema_final = `<mvu_schema_script>\n${legacySchema}\n</mvu_schema_script>`;
    if (legacyRules && !loaded.mvu_update_rules) loaded.mvu_update_rules = legacyRules;
    if (legacyRules && !loaded.mvu_rules_final) loaded.mvu_rules_final = `<mvu_update_rules>\n${legacyRules}\n</mvu_update_rules>`;
  }
  loaded.mvu_enabled = Boolean(
    loaded.mvu_enabled && loaded.mvu_schema_script && loaded.mvu_update_rules && loaded.mvu_initvar_yaml,
  );
  loaded.character_final = joinCharacterFinals(loaded.character_finals);
  return loaded;
}

function persistState() {
  const variables = getVariables({ type: 'chat' });
  _.set(variables, STORAGE_PATH, JSON.parse(JSON.stringify(state)));
  replaceVariables(variables, { type: 'chat' });
}

const state = reactive<SavedState>(loadState());
const mvuStageKeys: StageKey[] = ['mvuSchema', 'mvuRules', 'initvar'];
const activeStage = computed<StageKey>({
  get: () => state.active_stage,
  set: value => {
    state.active_stage = value;
    persistState();
  },
});
const isGenerating = ref(false);

const currentStage = computed(() => stages.find(stage => stage.key === activeStage.value)!);
const currentDraft = computed(() => state.drafts[activeStage.value as DraftKey]);
const stagePresets = computed(() => presets.filter(preset => preset.stage === activeStage.value));
const characterFinals = computed(() => state.character_finals);
const frontendMissing = computed(() =>
  [
    state.mvu_schema_script ? '' : '变量结构',
    state.mvu_update_rules ? '' : '变量规则',
    state.mvu_initvar_yaml ? '' : '初始变量',
  ].filter(Boolean),
);
const frontendBlocked = computed(() => activeStage.value === 'frontend' && !state.worldbook_mode && frontendMissing.value.length > 0);
const worldbookStageEntries = computed(() => getProjectEntriesForStage(activeStage.value));
const worldbookModeHint = computed(() => {
  if (!worldbookStageEntries.value.length) return '本阶段不需要额外读取项目占位条目；请求只包含当前输入。';
  return `请在 fur 世界书中手动填入并开启这些项目占位条目：${worldbookStageEntries.value.join('、')}。本次请求不会重复携带这些正文。`;
});
const stageTag = computed(() => {
  if (activeStage.value === 'world') return 'fur_world';
  if (activeStage.value === 'mvuSchema') return 'mvu_schema_script';
  if (activeStage.value === 'mvuRules') return 'mvu_update_rules';
  if (activeStage.value === 'initvar') return 'mvu_initvar';
  if (activeStage.value === 'frontend') return 'html';
  if (activeStage.value === 'opening') return 'fur_opening';
  return state.concept_mode === '模拟器' ? 'fur_simulator' : 'fur_character';
});
const requestText = computed(() => buildStagePrompt(activeStage.value));
const missingStages = computed(() => {
  const missing: string[] = [];
  if (!state.world_final) missing.push('世界观');
  if (!characterFinals.value.length && !state.simulator_final) missing.push('角色/模拟器');
  if (!state.opening_final) missing.push('开场白');
  return missing;
});
const combinedPreview = computed(() =>
  [
    state.world_final ? `<fur_world>\n${state.world_final}\n</fur_world>` : '',
    ...characterFinals.value.map(character => `<fur_character>\n${character.content}\n</fur_character>`),
    state.simulator_final ? `<fur_simulator>\n${state.simulator_final}\n</fur_simulator>` : '',
    state.mvu_schema_final ? `<mvu_schema_script>\n${state.mvu_schema_final}\n</mvu_schema_script>` : '',
    state.mvu_rules_final ? `<mvu_update_rules>\n${state.mvu_rules_final}\n</mvu_update_rules>` : '',
    state.mvu_initvar_final ? `<mvu_initvar>\n${state.mvu_initvar_final}\n</mvu_initvar>` : '',
    state.opening_final ? `<fur_opening>\n${state.opening_final}\n</fur_opening>` : '',
  ]
    .filter(Boolean)
    .join('\n\n'),
);

function finalText(stage: StageKey) {
  if (stage === 'world') return state.world_final;
  if (stage === 'opening') return state.opening_final;
  if (stage === 'mvuSchema') return state.mvu_schema_final;
  if (stage === 'mvuRules') return state.mvu_rules_final;
  if (stage === 'initvar') return state.mvu_initvar_final;
  if (stage === 'frontend') return '';
  if (stage === 'concept') return state.concept_mode === '模拟器' ? state.simulator_final : joinCharacterFinals(characterFinals.value);
  return combinedPreview.value;
}

function inferConceptTitle(content: string, fallback = '未命名角色') {
  const matched =
    content.match(/(?:名称|姓名|角色名|名字)[:：]\s*([^\n<]+)/) ??
    content.match(/^#\s*([^\n]+)/m) ??
    content.match(/^([^\n：:]{2,24})[:：]/m);
  return matched?.[1]?.trim().slice(0, 40) || fallback;
}

function createCharacterFinal(content: string, index = 1): CharacterFinal {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: inferConceptTitle(content, `角色 ${index}`),
    content,
  };
}

function joinCharacterFinals(characters: CharacterFinal[]) {
  return characters.map(character => `【${character.title}】\n${character.content}`).join('\n\n');
}

function addCharacterFinal(content: string) {
  const existingIndex = state.character_finals.findIndex(character => character.content.trim() === content.trim());
  if (existingIndex >= 0) {
    state.character_finals[existingIndex] = { ...state.character_finals[existingIndex], title: inferConceptTitle(content), content };
  } else {
    state.character_finals.push(createCharacterFinal(content, state.character_finals.length + 1));
  }
  state.character_final = joinCharacterFinals(state.character_finals);
}

function removeCharacterFinal(id: string) {
  state.character_finals = state.character_finals.filter(character => character.id !== id);
  state.character_final = joinCharacterFinals(state.character_finals);
  persistState();
}

function applyPreset(preset: Preset) {
  if (preset.conceptMode) state.concept_mode = preset.conceptMode;
  state.drafts[preset.stage].input = preset.text;
  persistState();
}

function getActiveRuleEntries(stage: StageKey) {
  const active = new Set<string>(['fur核心准则']);
  if (stage === 'world') active.add('世界观定稿规则');
  if (stage === 'concept') active.add(state.concept_mode === '模拟器' ? '模拟器定稿规则' : '角色定稿规则');
  if (stage === 'mvuSchema') active.add('MVU变量结构设计规则');
  if (stage === 'mvuRules') active.add('MVU变量更新规则');
  if (stage === 'initvar') active.add('MVU初始变量规则');
  if (stage === 'frontend') active.add('前端设计规则');
  if (stage === 'opening') active.add('开场白定稿规则');
  if (state.adult_mode === 'NSFW') active.add('NSFW扩展规则');
  return active;
}

function getProjectEntriesForStage(stage: StageKey) {
  if (!state.worldbook_mode) return [];
  if (stage === 'concept') return ['fur项目世界观定稿'];
  if (stage === 'mvuSchema') return ['fur项目世界观定稿', 'fur项目角色/模拟器定稿'];
  if (stage === 'mvuRules') return ['fur项目世界观定稿', 'fur项目角色/模拟器定稿', 'fur项目变量结构'];
  if (stage === 'initvar') return ['fur项目世界观定稿', 'fur项目角色/模拟器定稿', 'fur项目变量结构', 'fur项目变量更新规则'];
  if (stage === 'frontend') return PROJECT_WORLDBOOK_ENTRIES;
  if (stage === 'opening') return ['fur项目世界观定稿', 'fur项目角色/模拟器定稿'];
  return [];
}

async function findRuleWorldbookName() {
  const bound = getCharWorldbookNames('current');
  const candidates = [bound.primary, ...bound.additional].filter(Boolean) as string[];
  const allNames = getWorldbookNames().filter(name => !candidates.includes(name));
  candidates.push(...allNames);
  for (const name of candidates) {
    try {
      const entries = await getWorldbook(name);
      if (entries.some(entry => RULE_WORLDBOOK_ENTRIES.includes(entry.name))) return name;
    } catch (error) {
      console.warn(`[fur] 读取世界书失败：${name}`, error);
    }
  }
  return null;
}

async function syncRuleWorldbook() {
  const worldbookName = await findRuleWorldbookName();
  if (!worldbookName) throw new Error('没有找到 fur 助手卡绑定的规则世界书。');
  const activeRules = getActiveRuleEntries(activeStage.value);
  await updateWorldbookWith(
    worldbookName,
    worldbook =>
      worldbook.map(entry =>
        RULE_WORLDBOOK_ENTRIES.includes(entry.name)
          ? {
            ...entry,
            enabled: activeRules.has(entry.name),
          }
          : entry,
      ),
    { render: 'debounced' },
  );
}

const isSyncingWorldbook = ref(false);
const shouldSyncWorldbookAgain = ref(false);
const worldbookSyncWarningShown = ref(false);

async function syncWorldbookState({ silent = true } = {}) {
  if (isSyncingWorldbook.value) {
    shouldSyncWorldbookAgain.value = true;
    return;
  }
  isSyncingWorldbook.value = true;
  try {
    await syncRuleWorldbook();
    worldbookSyncWarningShown.value = false;
  } catch (error) {
    console.warn('[fur] 世界书同步失败', error);
    if (!silent || !worldbookSyncWarningShown.value) {
      toastr.warning('世界书条目自动开关失败，请手动检查 fur 助手卡世界书。');
      worldbookSyncWarningShown.value = true;
    }
  } finally {
    isSyncingWorldbook.value = false;
    if (shouldSyncWorldbookAgain.value) {
      shouldSyncWorldbookAgain.value = false;
      void syncWorldbookState({ silent });
    }
  }
}

function setAdultMode(mode: AdultMode) {
  state.adult_mode = mode;
  persistState();
  void syncWorldbookState();
}

function toggleWorldbookMode() {
  persistState();
  void syncWorldbookState({ silent: false });
}

function savedBlock(label: string, content: string, fallback: string) {
  return state.worldbook_mode ? [] : [`${label}：\n${content || fallback}`];
}

function worldbookModeBlock() {
  return state.worldbook_mode
    ? ['世界书模式已开启：请从 fur 世界书中用户手动开启的项目占位条目读取前置定稿；本次请求不再重复粘贴前置正文。']
    : [];
}

watch(
  () => [state.active_stage, state.concept_mode, state.adult_mode, state.worldbook_mode] as const,
  () => {
    persistState();
    void syncWorldbookState();
  },
);

onMounted(() => {
  void syncWorldbookState({ silent: false });
});

function buildStagePrompt(stage: StageKey) {
  if (stage === 'preview') return combinedPreview.value;
  const draft = state.drafts[stage].input.trim() || (state.worldbook_mode ? '请根据当前阶段补全。' : '请根据当前阶段和已有设定补全。');
  const adultRule =
    state.adult_mode === 'NSFW'
      ? '成人向模式已开启,请你在各个设定中加入男同向NSFW描写'
      : '成人向模式未开启，不要加入露骨性描写。';
  if (stage === 'world') {
    return [
      'fur，请与用户协作定稿当前世界观。',
      `用户简述：${draft}`,
      adultRule,
      '如果这是初始想法，请建立可继续修改的基础框架；如果这是修改意见，请基于最新世界观整合增删改。',
      '输出必须只用中文，并包含完整标签：<fur_world>...</fur_world>。',
      '标签内必须是完整的当前版本，不要只输出本次新增片段。',
      '根据用户输入灵活组织：世界核心、时代与地点、势力/族群、社会规则、日常生态、冲突、后续创作约束。',
      '标签外可以简短说明本次改动，并给出2-3个可继续补充的方向。',
    ].join('\n');
  }
  if (stage === 'concept') {
    const tag = state.concept_mode === '模拟器' ? 'fur_simulator' : 'fur_character';
    const conceptLead =
      state.concept_mode === '模拟器'
        ? 'fur，请基于已保存世界观与用户要求，协作定稿当前模拟器设定。'
        : 'fur，请基于已保存世界观与用户要求，协作定稿当前角色档案。';
    const conceptFormat =
      state.concept_mode === '模拟器'
        ? [
          '标签内必须是完整的当前模拟器版本，不要只输出本次新增片段。',
          '如果用户是在修改已有模拟器，请整合增删改，替换冲突设定，不要把新旧版本并列。',
          '标签内请包含：模拟器名称、主题类型、玩家身份、世界观关联、核心体验、主要舞台、玩法循环、事件结构、行动选择、主持规则、推进与失败规则、开场使用建议。',
          '模拟器重点是玩家看见什么、能做什么、AI如何推进、结果如何反馈。',
          '不要把世界观整段重复输出；只写模拟器与世界观有关的舞台、规则和限制。',
          state.adult_mode === 'NSFW'
            ? 'NSFW 已开启时，模拟器可以加入成人向玩法边界、亲密事件类型、男同向关系推进、欲望/暧昧/身体接触相关事件'
            : 'NSFW 未开启时，模拟器不要加入露骨成人玩法'
        ].join('\n')
        : [
          '标签内必须是完整的当前角色版本，不要只输出本次新增片段。',
          '如果用户是在修改已有角色，请整合增删改，替换冲突设定，不要把新旧版本并列。',
          '标签内请包含：基础信息、外貌特征、性格行为、背景经历、语言特征、与{{user}}关系、剧情钩子',
          '性格要用行为和短句呈现；外貌用白描，不要空泛堆形容。',
          '不要把世界观整段重复输出；只写角色与世界观的关键连接。',
          state.adult_mode === 'NSFW'
            ? 'NSFW 已开启时，如需成人向内容，必须把 NSFW附录 放在 <fur_character> 标签内部；必须加入男同向描写。'
            : 'NSFW 未开启时，不要输出露骨成人附录。'
        ].join('\n');

    return [
      conceptLead,
      ...worldbookModeBlock(),
      ...savedBlock('已保存世界观', state.world_final, '尚未保存世界观，请根据用户简述先做兼容性补全。'),
      `用户简述：${draft}`,
      adultRule,
      `输出必须只用中文，并包含完整标签：<${tag}>...</${tag}>。`,
      conceptFormat,
    ].join('\n');
  }
  if (stage === 'mvuSchema') {
    return [
      'fur，请基于已保存世界观与角色/模拟器，协作定稿目标角色卡的可选 MVU 变量结构脚本。',
      ...worldbookModeBlock(),
      ...savedBlock('已保存世界观', state.world_final, '未保存；如果缺少世界观，请提醒用户先定稿世界观。'),
      ...savedBlock('已保存角色', joinCharacterFinals(characterFinals.value), '未保存'),
      ...savedBlock('已保存模拟器', state.simulator_final, '未保存'),
      `用户变量结构偏好：${draft}`,
      '变量结构是 MVU 模块的第一步。',
      '只追踪会在游玩中变化、影响后续叙事、需要长期记忆的状态；不要为了显得复杂而设计过多数值。',
      '变量可按项目选择：当前场景、时间、角色状态、关系、线索、任务、地点、资源、势力、事件标记等。',
      '可直接使用的 MVU 结构：MVU 数据保存在消息楼层变量 stat_data；变量结构用 zod 4 编写，之后会由单独的变量规则阶段编写更新规则。',
      '输出必须只用中文，并包含可捕获标签：<mvu_schema_script>...</mvu_schema_script>。外层可以保留 <fur_mvu_schema>。',
      '当前阶段不要输出 <mvu_update_rules>、<mvu_initvar>、变量列表或变量输出格式。',
      '<mvu_schema_script> 内必须是可直接放入酒馆助手脚本库的完整脚本：导入 registerMvuSchema，定义 export const Schema，并用 $(() => { registerMvuSchema(Schema); }); 注册。',
      'Schema 规则：z 和 _ 默认可用，不要 import zod/lodash；使用 zod 4；不要使用 .default/.min/.max 作为主要约束；数值优先 z.coerce.number().transform(value => _.clamp(value, min, max)).prefault(defaultValue)。',
      '复杂对象用 .prefault({})；动态集合优先 z.record；避免数组下标难维护，最近事件等日志也优先用 z.record(z.string().describe("事件ID"), ...) 并在 transform 中保留最近若干条。',
      '输出必须满足 Schema.parse(Schema.parse(input)) 与 Schema.parse(input) 等价。',
    ].join('\n');
  }
  if (stage === 'mvuRules') {
    return [
      'fur，请基于已保存的 MVU 变量结构脚本，协作定稿目标角色卡的 [mvu_update]变量更新规则。',
      ...worldbookModeBlock(),
      ...savedBlock('已保存世界观', state.world_final, '未保存；如果缺少世界观，请提醒用户先定稿世界观。'),
      ...savedBlock('已保存角色', joinCharacterFinals(characterFinals.value), '未保存'),
      ...savedBlock('已保存模拟器', state.simulator_final, '未保存'),
      ...savedBlock('已保存变量结构脚本', state.mvu_schema_script, '未保存；如果缺少变量结构脚本，请提醒用户先完成变量结构阶段。'),
      `用户变量规则偏好：${draft}`,
      '当前阶段只编写变量更新规则，不重新设计 schema，不写初始变量，不输出变量列表或变量输出格式。',
      '输出必须只用中文，并包含可捕获标签：<mvu_update_rules>...</mvu_update_rules>。外层可以保留 <fur_mvu_rules>。',
      '<mvu_update_rules> 内只写 [mvu_update]变量更新规则 的 YAML 内容；顶层必须是 --- 与 变量更新规则:，并把变量路径作为规则键。',
      '不要写成 update_triggers、path/action、逐条触发器列表或自定义 JSON；规则路径必须与已保存 Schema 字段一致。',
      '同类变量要合并成一条规则；动态 record 用“/字段/{动态键}”或索引签名描述；不要列出字段名以 _ 开头的只读变量。',
      'string 通常可省略 type；number、boolean、object、record 需要写清 type/range/format/check；check 要说明何时更新、何时不更新、依据哪段剧情更新。',
      '规则只追踪游玩中会变化、影响后续叙事或需要长期记忆的状态，不为静态设定写更新规则。',
    ].join('\n');
  }
  if (stage === 'initvar') {
    return [
      'fur，请基于已保存世界观、角色/模拟器、最新版 MVU 变量结构脚本与变量更新规则，协作撰写目标角色卡的 [initvar] 初始变量。',
      ...worldbookModeBlock(),
      ...savedBlock('已保存世界观', state.world_final, '未保存'),
      ...savedBlock('已保存角色', joinCharacterFinals(characterFinals.value), '未保存'),
      ...savedBlock('已保存模拟器', state.simulator_final, '未保存'),
      ...savedBlock('已保存变量结构脚本', state.mvu_schema_script, '未保存；如果缺少变量结构，请提醒用户先完成变量结构阶段。'),
      ...savedBlock('已保存变量更新规则', state.mvu_update_rules, '未保存；如果缺少变量更新规则，请提醒用户先完成变量规则阶段。'),
      `用户初始变量偏好：${draft}`,
      '当前阶段只生成初始变量，不修改 schema，不修改变量更新规则，不重写世界观、角色、模拟器或开场白。',
      '输出必须只用中文，并包含可捕获标签：<mvu_initvar>...</mvu_initvar>。外层可以保留 <fur_initvar>，但工作台只捕获 mvu_initvar。',
      '<mvu_initvar> 内必须是可直接放入 [initvar]变量初始化勿开 的 YAML/JSON 对象正文，不要包含 markdown 代码围栏。',
      '初始变量必须完全符合 <mvu_schema_script> 中 Schema.parse 可接受的输入；不要新增 schema 中不存在的字段。',
      '只初始化 stat_data 的内容本身，不要外包一层 stat_data。',
      '如果 schema 中有 prefault 默认值，可省略不重要字段；但关键开局状态、主要角色关系、当前场景、初始资源/线索/任务应给出明确值。',
      '不要在初始变量中剧透隐藏真相；侦探、关系和模拟器项目只写玩家开局已经知道或系统需要记录的内容。',
    ].join('\n');
  }
  if (stage === 'frontend') {
    return [
      'fur，请基于已保存的 MVU 变量结构、更新规则和初始变量，生成一个只展示变量的前端 HTML。',
      '这是目标角色卡的可选展示前端，不是变量结构、变量规则、初始变量、角色设定或开场白。',
      ...worldbookModeBlock(),
      ...savedBlock('已保存世界观', state.world_final, '未保存'),
      ...savedBlock('已保存角色', joinCharacterFinals(characterFinals.value), '未保存'),
      ...savedBlock('已保存模拟器', state.simulator_final, '未保存'),
      ...savedBlock('已保存变量结构脚本', state.mvu_schema_script, '未保存'),
      ...savedBlock('已保存变量更新规则', state.mvu_update_rules, '未保存'),
      ...savedBlock('已保存初始变量', state.mvu_initvar_yaml, '未保存'),
      `用户前端偏好：${draft}`,
      '只生成前端展示代码，不要输出任何 <fur_...>、<mvu_...> 捕获标签。',
      '输出必须是一个完整的 ```html fenced code block，可直接作为页面局部正则脚本的替换内容。',
      'HTML 用途：展示 MVU 变量，不能修改变量，不能写入变量，不能重新设计变量。',
      '脚本必须使用 const all_variables = getAllVariables(); 读取变量；所有变量路径必须以 stat_data. 开头。',
      "初始化时必须 await waitGlobalInitialized('Mvu')，并用 $(errorCatched(init)) 启动。",
      '必须监听 Mvu.events.VARIABLE_UPDATE_ENDED，并在变量更新后重新刷新展示。',
      '每个需要填充的元素必须有唯一 id，HTML 中的 id 与脚本中的选择器要一一对应。',
      '请根据用户指定的变量与风格自由设计布局；如果用户没有指定，就优先展示时间地点、主要角色关系、任务/线索/资源、最近事件。',
      '正文可以先用极简 NOTE 说明“此前端只展示变量，不修改变量”，然后给出完整 ```html 代码块。',
    ].join('\n');
  }
  return [
    'fur，请基于已保存世界观与角色/模拟器生成开场白定稿。',
    ...worldbookModeBlock(),
    ...savedBlock('已保存世界观', state.world_final, '未保存'),
    ...savedBlock('已保存角色', joinCharacterFinals(characterFinals.value), '未保存'),
    ...savedBlock('已保存模拟器', state.simulator_final, '未保存'),
    `用户简述：${draft}`,
    adultRule,
    '输出必须只用中文，并包含完整标签：<fur_opening>...</fur_opening>。',
    '标签内请包含：开场白正文',
  ].join('\n');
}

async function generateStage() {
  if (activeStage.value === 'preview') return;
  if (frontendBlocked.value) {
    toastr.warning(`请先完成：${frontendMissing.value.join('、')}`);
    return;
  }
  await nextTick();
  persistState();
  isGenerating.value = true;
  try {
    await syncWorldbookState({ silent: false });
    const prompt = buildStagePrompt(activeStage.value);
    await createChatMessages([{ role: 'user', message: prompt }], { refresh: 'affected' });
    const reply = await generate({ user_input: prompt });
    const message = String(reply ?? '').trim();
    if (!message) throw new Error('AI 返回为空，请稍后重试。');
    await createChatMessages([{ role: 'assistant', message }], { refresh: 'affected' });
    persistState();
    toastr.success(
      activeStage.value === 'frontend'
        ? '已发送到聊天栏；满意后请手动复制 AI 生成的 ```html 代码块使用。'
        : '已发送到聊天栏，请在聊天中继续打磨；满意后再从最新 AI 楼层捕获。',
    );
  } catch (error) {
    console.error('[fur] 生成失败', error);
    toastr.error('生成失败，请查看控制台');
  } finally {
    isGenerating.value = false;
  }
}

function saveDraft() {
  persistState();
  toastr.success('草稿已保存到当前聊天');
}

function captureTagged(text: string, tag: string) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`<${escaped}>\\s*([\\s\\S]*?)\\s*<\\/${escaped}>`, 'i'));
  return match?.[1]?.trim() ?? '';
}

function captureSchemaBlock(captured: string) {
  return captureTagged(captured, 'mvu_schema_script');
}

function captureRulesBlock(captured: string) {
  return captureTagged(captured, 'mvu_update_rules');
}

function captureInitvarBlock(captured: string) {
  return captureTagged(captured, 'mvu_initvar');
}

function captureMvuStageOutput(output: string) {
  if (activeStage.value === 'mvuSchema') return captureSchemaBlock(output);
  if (activeStage.value === 'mvuRules') return captureRulesBlock(output);
  if (activeStage.value === 'initvar') return captureInitvarBlock(output);
  return '';
}

function readDisplayedText(messageId: number) {
  const displayed = retrieveDisplayedMessage(messageId);
  return displayed.length ? displayed.text().trim() : '';
}

function readChatMessage(messageId: number) {
  const message = getChatMessages(messageId)[0];
  return message?.message?.trim() ?? '';
}

function getDisplayedMessageIds() {
  return $('#chat > .mes')
    .toArray()
    .map(element => Number($(element).attr('mesid')))
    .filter(Number.isInteger);
}

function getLatestAssistantMessage() {
  const requestedId = Number.parseInt(state.capture_message_id.trim(), 10);
  if (Number.isInteger(requestedId) && requestedId >= 0) {
    return {
      id: requestedId,
      text: readChatMessage(requestedId) || readDisplayedText(requestedId),
    };
  }

  const visibleIds = getDisplayedMessageIds().reverse();
  for (const messageId of visibleIds) {
    const message = getChatMessages(messageId)[0];
    if (message?.role === 'assistant') {
      return {
        id: messageId,
        text: message.message?.trim() || readDisplayedText(messageId) || '',
      };
    }
  }

  const lastMessageId = getLastMessageId();
  for (let messageId = lastMessageId; messageId >= 0; messageId -= 1) {
    const message = getChatMessages(messageId, { hide_state: 'unhidden' })[0];
    if (message?.role === 'assistant') {
      return {
        id: message.message_id,
        text: message.message?.trim() ?? '',
      };
    }
  }
  return { id: -1, text: '' };
}

function captureAndSave() {
  const latest = getLatestAssistantMessage();
  const output = latest.text;
  if (!output) {
    toastr.warning('没有找到可捕获的最新 AI 楼层');
    return;
  }
  const captured = mvuStageKeys.includes(activeStage.value) ? captureMvuStageOutput(output) : captureTagged(output, stageTag.value);
  if (!captured) {
    currentDraft.value.output = output;
    persistState();
    toastr.warning(`最新 AI 楼层 ${latest.id} 没有找到 <${stageTag.value}> 标签，请让 AI 按当前阶段标签重出。`);
    return;
  }
  currentDraft.value.output = captured;
  if (activeStage.value === 'world') state.world_final = captured;
  if (activeStage.value === 'opening') state.opening_final = captured;
  if (activeStage.value === 'concept' && state.concept_mode === '角色') addCharacterFinal(captured);
  if (activeStage.value === 'concept' && state.concept_mode === '模拟器') state.simulator_final = captured;
  if (activeStage.value === 'mvuSchema') {
    state.mvu_schema_final = captured;
    state.mvu_schema_script = captured;
    state.mvu_enabled = Boolean(state.mvu_update_rules && state.mvu_initvar_yaml);
  }
  if (activeStage.value === 'mvuRules') {
    state.mvu_rules_final = captured;
    state.mvu_update_rules = captured;
    state.mvu_enabled = Boolean(state.mvu_schema_script && state.mvu_initvar_yaml);
  }
  if (activeStage.value === 'initvar') {
    state.mvu_initvar_final = captured;
    state.mvu_initvar_yaml = captured;
    state.mvu_enabled = Boolean(state.mvu_schema_script && state.mvu_update_rules);
  }
  persistState();
  toastr.success(activeStage.value === 'concept' && state.concept_mode === '角色' ? '角色定稿已追加保存' : '定稿已保存');
}

async function copyPrompt() {
  await navigator.clipboard.writeText(requestText.value);
  toastr.success('已复制当前阶段请求');
}

async function copyCombined() {
  await navigator.clipboard.writeText(combinedPreview.value);
  toastr.success('已复制组合材料');
}

function inferExportName() {
  const source = characterFinals.value[0]?.content || state.simulator_final || state.world_final || 'fur阶段定稿';
  const matched =
    source.match(/(?:名称|姓名|角色名|模拟器名称)[:：]\s*([^\n<]+)/) ??
    source.match(/^#\s*([^\n]+)/m) ??
    source.match(/^([^\n：:]{2,24})[:：]/m);
  return matched?.[1]?.trim() || 'fur阶段定稿角色卡';
}

function createExportWorldbookEntry(id: number, comment: string, content: string) {
  return {
    id,
    keys: [],
    secondary_keys: [],
    comment,
    content,
    constant: true,
    selective: false,
    insertion_order: 100 + id,
    enabled: true,
    position: 'before_char',
    use_regex: true,
    extensions: {
      position: 0,
      exclude_recursion: true,
      display_index: id,
      probability: 100,
      useProbability: true,
      depth: 4,
      selectiveLogic: 0,
      group: '',
      group_override: false,
      group_weight: 100,
      prevent_recursion: true,
      delay_until_recursion: false,
      match_whole_words: null,
      use_group_scoring: false,
      case_sensitive: null,
      automation_id: '',
      role: 0,
      vectorized: false,
      sticky: null,
      cooldown: null,
      delay: null,
      match_persona_description: false,
      match_character_description: false,
      match_character_personality: false,
      match_character_depth_prompt: false,
      match_scenario: false,
      match_creator_notes: false,
      triggers: [],
      ignore_budget: false,
    },
  };
}

function createInitvarWorldbookEntry(id: number, comment: string, content: string) {
  const entry = createExportWorldbookEntry(id, comment, content);
  entry.enabled = false;
  return entry;
}

function createVariableWorldbookEntry(id: number, comment: string, content: string) {
  const entry = createExportWorldbookEntry(id, comment, content);
  entry.position = 'after_char';
  entry.insertion_order = 14720;
  entry.extensions.display_index = id;
  entry.extensions.position = 4;
  entry.extensions.depth = 0;
  entry.extensions.role = 0;
  entry.extensions.prevent_recursion = true;
  entry.extensions.exclude_recursion = true;
  return entry;
}

const MVU_VARIABLE_LIST = `---\n<status_current_variable>\n{{format_message_variable::stat_data}}\n</status_current_variable>`;

const MVU_OUTPUT_FORMAT = `---\n变量输出格式:\n  rule:\n    - you must output the update analysis and the actual update commands at once in the end of the next reply\n    - the update commands works like the **JSON Patch (RFC 6902)** standard, must be a valid JSON array containing operation objects, but supports the following operations instead:\n      - replace: replace the value of existing paths\n      - delta: update the value of existing number paths by a delta value\n      - insert: insert new items into an object or array (using \`-\` as array index intends appending to the end)\n      - remove\n      - move\n    - don't update field names starts with \`_\` as they are readonly, such as \`_变量\`\n  format: |-\n    <UpdateVariable>\n    <Analysis>$(IN ENGLISH, no more than 80 words)\n    - \${calculate time passed: ...}\n    - \${decide whether dramatic updates are allowed as it's in a special case or the time passed is more than usual: yes/no}\n    - \${analyze every variable based on its corresponding \`check\`, according only to current reply instead of previous plots: ...}\n    </Analysis>\n    <JSONPatch>\n    [\n      { \"op\": \"replace\", \"path\": \"\${/path/to/variable}\", \"value\": \"\${new_value}\" },\n      { \"op\": \"delta\", \"path\": \"\${/path/to/number/variable}\", \"value\": \"\${positive_or_negative_delta}\" },\n      { \"op\": \"insert\", \"path\": \"\${/path/to/object/new_key}\", \"value\": \"\${new_value}\" },\n      { \"op\": \"insert\", \"path\": \"\${/path/to/array/-}\", \"value\": \"\${new_value}\" },\n      { \"op\": \"remove\", \"path\": \"\${/path/to/object/key}\" },\n      { \"op\": \"remove\", \"path\": \"\${/path/to/array/0}\" },\n      { \"op\": \"move\", \"from\": \"\${/path/to/variable}\", \"to\": \"\${/path/to/another/path}\" },\n      ...\n    ]\n    </JSONPatch>\n    </UpdateVariable>`;

function buildExportWorldbook() {
  let entryId = 0;
  const entries = [
    state.world_final ? createExportWorldbookEntry(entryId++, 'fur世界观定稿', `<fur_world>\n${state.world_final}\n</fur_world>`) : null,
    ...characterFinals.value.map(character =>
      createExportWorldbookEntry(entryId++, `fur角色定稿：${character.title}`, `<fur_character>\n${character.content}\n</fur_character>`),
    ),
    state.simulator_final
      ? createExportWorldbookEntry(entryId++, 'fur模拟器定稿', `<fur_simulator>\n${state.simulator_final}\n</fur_simulator>`)
      : null,
  ].filter(Boolean);

  if (state.mvu_enabled && state.mvu_schema_script && state.mvu_update_rules && state.mvu_initvar_yaml) {
    entries.push(
      createInitvarWorldbookEntry(entryId++, '[initvar]变量初始化勿开', state.mvu_initvar_yaml),
      createVariableWorldbookEntry(entryId++, '变量列表', MVU_VARIABLE_LIST),
      createVariableWorldbookEntry(entryId++, '[mvu_update]变量更新规则', state.mvu_update_rules),
      createVariableWorldbookEntry(entryId++, '[mvu_update]变量输出格式', MVU_OUTPUT_FORMAT),
    );
  }

  return entries.length
    ? {
      name: `${inferExportName()}_世界书`,
      entries,
    }
    : undefined;
}

function createMvuRegexScripts() {
  return [
    {
      id: '4d0f69cc-5f4d-4ea1-80ff-050d855bdb2d',
      scriptName: '[不发送]去除变量更新',
      disabled: false,
      runOnEdit: false,
      findRegex: '/<update(?:variable)?>(?:(?!.*<\\/update(?:variable)?>).*$|.*<\\/update(?:variable)?>)/gsi',
      replaceString: '',
      trimStrings: [],
      placement: [1, 2],
      substituteRegex: 0,
      minDepth: null,
      maxDepth: 3,
      markdownOnly: false,
      promptOnly: true,
    },
    {
      id: '57c1e76f-f8c2-4995-ae38-7b548f945178',
      scriptName: '[折叠]变量更新中',
      disabled: false,
      runOnEdit: false,
      findRegex: '/<update(?:variable)?>(?!.*<\\/update(?:variable)?>)\\s*(.*)\\s*$/gsi',
      replaceString: '\n<details>\n<summary>变量更新中{{random::.::..::...}}</summary>\n$1\n</details>',
      trimStrings: [],
      placement: [1, 2],
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null,
      markdownOnly: true,
      promptOnly: false,
    },
    {
      id: '07792d3a-0bd1-4632-9184-bf1a4b0d7a51',
      scriptName: '[折叠]完整变量更新',
      disabled: false,
      runOnEdit: false,
      findRegex: '/<update(?:variable)?>\\s*(.*)\\s*<\\/update(?:variable)?>/gsi',
      replaceString: '\n<details>\n<summary>变量更新情况</summary>\n$1\n</details>',
      trimStrings: [],
      placement: [1, 2],
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null,
      markdownOnly: true,
      promptOnly: false,
    },
  ];
}

function createMvuScripts() {
  return [
    {
      type: 'script',
      enabled: true,
      name: 'MVU',
      id: 'ab3e7fef-0e92-4d22-b8ce-1d0c6a726df5',
      content: "import 'https://testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate/artifact/bundle.js';",
      info: '',
      button: { enabled: true, buttons: [] },
      data: {},
    },
    {
      type: 'script',
      enabled: true,
      name: '变量结构',
      id: 'a15174dc-b4e8-4f3f-953b-08b7248b6bc1',
      content: state.mvu_schema_script,
      info: '',
      button: { enabled: true, buttons: [] },
      data: {},
    },
  ];
}

function exportFinalCard() {
  if (!combinedPreview.value.trim()) {
    toastr.warning('还没有可导出的定稿内容');
    return;
  }
  const name = inferExportName();
  const exportedAt = new Date().toISOString();
  const characterBook = buildExportWorldbook();
  const missingMvuParts = [
    state.mvu_schema_script ? '' : '变量结构',
    state.mvu_update_rules ? '' : '变量规则',
    state.mvu_initvar_yaml ? '' : '初始变量',
  ].filter(Boolean);
  if (state.mvu_enabled && missingMvuParts.length) {
    toastr.warning(`变量模块已启用，但仍缺少：${missingMvuParts.join('、')}。请先补齐后再导出。`);
    return;
  }
  const shouldExportMvu = Boolean(state.mvu_enabled && state.mvu_schema_script && state.mvu_update_rules && state.mvu_initvar_yaml);
  const description = [
    '由 fur 写卡助手分阶段导出的角色卡。',
    characterBook ? '世界观、角色/模拟器设定已保存到内置世界书条目。' : '',
    shouldExportMvu ? '已启用 MVU 变量模块。' : '',
  ]
    .filter(Boolean)
    .join('\n');
  const payload = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    name,
    description,
    personality: '',
    scenario: '',
    first_mes: state.opening_final,
    mes_example: '',
    data: {
      name,
      description,
      personality: '',
      scenario: '',
      first_mes: state.opening_final,
      mes_example: '',
      creator_notes: `由 fur 写卡助手导出于 ${exportedAt}`,
      system_prompt: '',
      post_history_instructions: '',
      alternate_greetings: [],
      tags: ['fur写卡助手'],
      character_book: characterBook,
      extensions: {
        regex_scripts: shouldExportMvu ? createMvuRegexScripts() : [],
        tavern_helper: {
          scripts: shouldExportMvu ? createMvuScripts() : [],
          variables: {},
        },
        fur_card_helper: {
          exported_at: exportedAt,
          world_final: state.world_final,
          character_final: state.character_final,
          character_finals: state.character_finals,
          simulator_final: state.simulator_final,
          mvu_enabled: shouldExportMvu,
          mvu_final: state.mvu_final,
          mvu_schema_final: state.mvu_schema_final,
          mvu_schema_script: state.mvu_schema_script,
          mvu_rules_final: state.mvu_rules_final,
          mvu_update_rules: state.mvu_update_rules,
          mvu_initvar_final: state.mvu_initvar_final,
          mvu_initvar_yaml: state.mvu_initvar_yaml,
          opening_final: state.opening_final,
        },
      },
    },
  };
  const safeName = name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40) || 'fur_export';
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toastr.success('已导出角色卡 JSON');
}

function clearAll() {
  if (!window.confirm('清空当前聊天中的 fur 定稿和草稿？')) return;
  Object.assign(state, createDefaultState());
  persistState();
  toastr.success('已清空');
}
</script>

<style scoped lang="scss">
.fur-workbench {
  box-sizing: border-box;
  width: 100%;
  color: #221f1b;
  font-family: Georgia, 'Times New Roman', serif;
  background:
    linear-gradient(135deg, rgba(245, 239, 225, 0.96), rgba(225, 232, 220, 0.94)),
    repeating-linear-gradient(90deg, rgba(47, 43, 35, 0.05) 0 1px, transparent 1px 18px);
  border: 1px solid rgba(68, 55, 39, 0.22);
  border-radius: 8px;
  padding: 16px;
}

.mast {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(68, 55, 39, 0.18);

  h1 {
    margin: 2px 0 0;
    font-size: 28px;
    line-height: 1.1;
    letter-spacing: 0;
  }
}

.mast-controls {
  display: grid;
  justify-items: end;
  gap: 8px;
}

.kicker {
  margin: 0;
  color: #666c48;
  font: 700 11px/1.2 Verdana, sans-serif;
  letter-spacing: 0;
  text-transform: uppercase;
}

button {
  border-radius: 6px;
  cursor: pointer;
}

.mode-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(54px, 1fr));
  gap: 6px;
}

.worldbook-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #253d34;
  font: 700 12px/1.2 Verdana, sans-serif;

  input {
    width: 15px;
    height: 15px;
    margin: 0;
    accent-color: #253d34;
  }
}

.mode-strip button,
.stage-tabs button,
.preset-shelf button {
  border: 1px solid rgba(58, 48, 34, 0.2);
  background: rgba(255, 255, 255, 0.55);
  color: #4a3c2f;
  font: 700 12px/1 Verdana, sans-serif;
  padding: 10px 8px;
}

.mode-strip .active,
.stage-tabs .active {
  background: #253d34;
  color: #f7f0df;
  border-color: #253d34;
}

.stage-tabs .done:not(.active) {
  border-color: rgba(55, 102, 71, 0.38);
  background: rgba(75, 126, 89, 0.13);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
  gap: 14px;
  padding-top: 14px;
}

.input-panel,
.preview-panel {
  background: rgba(255, 252, 244, 0.64);
  border: 1px solid rgba(68, 55, 39, 0.16);
  border-radius: 8px;
  padding: 13px;
}

.input-panel,
.page-body,
.preview-panel {
  display: grid;
  gap: 12px;
}

.preview-panel {
  align-self: start;
  max-height: min(78vh, 760px);
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.stage-tabs {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  span {
    opacity: 0.65;
    font-size: 10px;
  }
}

.preset-shelf {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  button {
    display: grid;
    gap: 5px;
    min-height: 58px;
    text-align: left;
  }

  span {
    opacity: 0.72;
    font-size: 10px;
    text-transform: uppercase;
  }

  strong {
    font-size: 13px;
    line-height: 1.25;
  }
}

.field-grid,
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  color: #5b4a38;
  font: 700 12px/1.2 Verdana, sans-serif;
}

input,
select,
textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid rgba(61, 50, 36, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.76);
  color: #231f1a;
  font: 14px/1.45 'Trebuchet MS', Verdana, sans-serif;
  padding: 10px 11px;
}

textarea {
  resize: vertical;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.saved-list {
  display: grid;
  gap: 8px;
  border: 1px solid rgba(55, 67, 50, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.46);
  padding: 10px;
}

.saved-list-head,
.saved-list article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.saved-list-head {
  color: #253d34;
  font: 700 12px/1.2 Verdana, sans-serif;

  span {
    color: #6b6f4c;
    font-size: 11px;
  }
}

.saved-list article {
  border-top: 1px solid rgba(58, 48, 34, 0.12);
  padding-top: 8px;

  strong {
    min-width: 0;
    color: #2f2b26;
    font: 700 13px/1.35 Verdana, sans-serif;
    overflow-wrap: anywhere;
  }
}

.primary,
.secondary {
  border-radius: 6px;
  cursor: pointer;
  font: 700 13px/1 Verdana, sans-serif;
  padding: 11px 14px;
}

.primary {
  border: 1px solid #253d34;
  background: #253d34;
  color: #fff9ea;
}

.primary:disabled {
  cursor: wait;
  opacity: 0.55;
}

.secondary {
  border: 1px solid rgba(58, 48, 34, 0.24);
  background: rgba(255, 255, 255, 0.62);
  color: #2f2b26;
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  strong {
    color: #253d34;
    font: 700 13px/1 Verdana, sans-serif;
  }
}

.compact {
  padding: 8px 10px;
  font-size: 12px;
}

.status-grid div,
.missing-list,
.notice {
  border-radius: 8px;
  padding: 10px;
}

.status-grid div {
  display: grid;
  gap: 4px;
  border: 1px solid rgba(55, 67, 50, 0.16);
  background: rgba(255, 255, 255, 0.5);
}

.status-grid span {
  color: #6b6f4c;
  font: 700 10px/1 Verdana, sans-serif;
}

.status-grid strong {
  color: #2f2b26;
  font: 700 12px/1.3 Verdana, sans-serif;
}

pre {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 8px;
  background: #1f2822;
  color: #f4ead6;
  font: 13px/1.55 Consolas, 'Courier New', monospace;
  padding: 14px;
}

.missing-list {
  display: flex;
  gap: 8px;
  background: rgba(128, 88, 52, 0.12);
  color: #684222;
  font: 13px/1.4 Verdana, sans-serif;
}

.notice {
  display: grid;
  gap: 4px;
  font-family: Verdana, sans-serif;

  strong {
    font-size: 13px;
  }

  span {
    font-size: 12px;
    line-height: 1.5;
  }
}

.notice-calm {
  background: rgba(67, 102, 85, 0.12);
  color: #253d34;
}

.notice-hot {
  background: rgba(128, 58, 52, 0.13);
  color: #6c2d29;
}

.notice-worldbook {
  background: rgba(61, 77, 115, 0.12);
  color: #263757;
}

@media (max-width: 860px) {

  .workspace,
  .field-grid,
  .status-grid,
  .preset-shelf {
    grid-template-columns: 1fr;
  }

  .mast {
    display: grid;
    align-items: start;
  }

  .mast-controls {
    justify-items: stretch;
  }

  .stage-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
