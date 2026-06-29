<template>
  <body class="bg-surface text-on-surface font-body-md h-[34.375rem] overflow-hidden flex flex-col">
    <!-- 顶栏 -->
    <header class="flex-shrink-0 w-full flex justify-between items-center px-container-padding h-16 bg-surface-container shadow-md border-b-2 border-outline-variant">
      <h1 class="font-display-lg-mobile text-display-lg-mobile text-primary italic">{{ d.酒馆.当前酒馆 }}</h1>
    </header>

    <!-- 侧栏导航（桌面） -->
    <nav class="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-surface-container-high border-r border-outline-variant shadow-xl z-40">
      <div class="px-4 py-6 mb-4 flex flex-col items-center">
        <label
          class="group relative w-20 h-20 rounded-full border-2 border-primary overflow-hidden mb-3 shadow-lg flex items-center justify-center cursor-pointer bg-surface-container"
          title="点击上传头像"
        >
          <img v-if="avatar" alt="头像" class="w-full h-full object-cover" :src="avatar" />
          <span v-else class="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
          <span class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white">
            <span class="material-symbols-outlined">add_a_photo</span>
          </span>
          <input type="file" accept="image/*" class="hidden" @change="onAvatarUpload" />
        </label>
        <button v-if="avatar" class="mb-2 font-label-sm text-on-surface-variant hover:text-error transition-colors" @click="clearAvatar">移除头像</button>
        <h2 class="font-headline-md text-headline-md text-primary">{{ userName }}</h2>
        <p class="font-body-md text-on-surface-variant">酒馆招待</p>
      </div>
      <div class="space-y-2">
        <button
          :class="activeTab === 'tavern'
            ? 'w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 mx-2 rounded-lg bg-primary-container text-on-primary-container shadow-[inset_0px_1px_2px_rgba(255,255,255,0.1)] transition-all active:scale-95'
            : 'w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all active:scale-95'"
          @click="switchTab('tavern')"
        >
          <span class="material-symbols-outlined">sports_bar</span>
          <span class="font-body-md">酒馆信息</span>
        </button>
        <button
          :class="activeTab === 'social'
            ? 'w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 mx-2 rounded-lg bg-primary-container text-on-primary-container shadow-[inset_0px_1px_2px_rgba(255,255,255,0.1)] transition-all active:scale-95'
            : 'w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all active:scale-95'"
          @click="switchTab('social')"
        >
          <span class="material-symbols-outlined">group</span>
          <span class="font-body-md">熟客</span>
        </button>
        <button
          :class="activeTab === 'personal'
            ? 'w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 mx-2 rounded-lg bg-primary-container text-on-primary-container shadow-[inset_0px_1px_2px_rgba(255,255,255,0.1)] transition-all active:scale-95'
            : 'w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all active:scale-95'"
          @click="switchTab('personal')"
        >
          <span class="material-symbols-outlined">receipt_long</span>
          <span class="font-body-md">服务日志</span>
        </button>
      </div>
    </nav>

    <!-- 移动端标签栏 -->
    <nav class="flex md:hidden flex-shrink-0 justify-around gap-1 px-2 py-2 bg-surface-container border-b border-outline-variant">
      <button
        v-for="t in tabs"
        :key="t.id"
        @click="switchTab(t.id)"
        class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all active:scale-95"
        :class="activeTab === t.id
          ? 'bg-primary-container text-on-primary-container shadow-[inset_0px_1px_2px_rgba(255,255,255,0.1)]'
          : 'text-on-surface-variant hover:bg-surface-variant'"
      >
        <span class="material-symbols-outlined" :style="{ fontSize: '20px' }">{{ t.icon }}</span>
        <span class="font-label-sm">{{ t.label }}</span>
      </button>
    </nav>

    <!-- 主内容（右侧滚动区） -->
    <main class="hearth-scroll flex-1 min-h-0 overflow-y-auto md:ml-64 p-container-padding">
      <div class="max-w-5xl mx-auto">
      <!-- 标签 1：酒馆信息 -->
      <section class="tab-content active-tab" v-show="activeTab === 'tavern'">
        <div class="wooden-panel flicker-hearth bg-surface-container-high rounded-xl p-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 class="font-headline-md text-headline-md text-primary mb-1">当前所在酒馆</h3>
              <div class="flex items-center gap-2 text-on-surface-variant">
                <span class="material-symbols-outlined">location_on</span>
                <span class="font-body-lg">{{ d.酒馆.当前酒馆 }} • {{ d.系统.当前区域 }}</span>
              </div>
            </div>
            <div class="bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant text-right">
              <p class="font-label-sm text-primary tracking-widest">当前时辰</p>
              <p class="font-headline-md text-on-surface">{{ d.系统.时间段 }} • {{ d.系统.日期 }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <!-- 啤酒杯：忙碌度 -->
            <div class="wooden-panel bg-surface-container p-6 rounded-lg text-center">
              <div class="flex justify-between items-end mb-4">
                <h4 class="font-headline-md text-on-surface text-left">客流拥挤度</h4>
                <span class="font-label-sm text-primary">{{ busyHint }}</span>
              </div>
              <div class="relative h-40 w-24 mx-auto mug-container">
                <div class="absolute inset-0 border-4 border-outline-variant rounded-b-xl rounded-t-sm bg-surface-container-lowest overflow-hidden">
                  <div class="absolute left-0 w-full h-8 bg-white opacity-90 blur-sm z-10 mug-liquid" :style="{ bottom: busyPct + '%' }"></div>
                  <div class="absolute bottom-0 left-0 w-full bg-primary-container mug-liquid transition-all duration-1000 ease-out shadow-[inset_0_0_20px_rgba(255,185,90,0.6)]" :style="{ height: busyPct + '%' }"></div>
                </div>
                <div class="absolute -right-4 top-1/4 w-6 h-20 border-4 border-outline-variant rounded-r-2xl"></div>
              </div>
              <p class="mt-4 font-label-sm text-on-surface-variant">{{ Math.round(d.酒馆.忙碌度) }}% 容量</p>
            </div>
            <!-- 经营指标 -->
            <div class="space-y-gutter">
              <div class="wooden-panel stat-card bg-surface-container p-4 rounded-lg flex items-center justify-between cursor-default">
                <div class="flex items-center gap-4">
                  <div class="wax-seal w-12 h-12 rounded-full flex items-center justify-center text-on-error">
                    <span class="material-symbols-outlined fill">workspace_premium</span>
                  </div>
                  <div>
                    <p class="font-label-sm text-on-surface-variant">老板满意度</p>
                    <p class="font-headline-md text-on-surface">{{ satisfactionLabel }}</p>
                  </div>
                </div>
                <span class="font-display-lg text-primary">{{ Math.round(d.酒馆.老板满意度) }}%</span>
              </div>
              <div class="wooden-panel stat-card bg-surface-container p-4 rounded-lg flex items-center justify-between cursor-default">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span class="material-symbols-outlined fill">favorite</span>
                  </div>
                  <div>
                    <p class="font-label-sm text-on-surface-variant">老板好感度</p>
                    <p class="font-headline-md text-on-surface">{{ favorLabel }}</p>
                  </div>
                </div>
                <span class="font-display-lg text-secondary">{{ Math.round(d.人际关系.老板好感度) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="d.酒馆.今日主题事件" class="wooden-panel bg-surface-container-high rounded-xl p-6 flicker-hearth mt-panel-gap">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-primary">fireplace</span>
            <h3 class="font-headline-md text-headline-md text-primary">今日主题事件</h3>
          </div>
          <p class="font-body-lg text-on-surface italic">{{ d.酒馆.今日主题事件 }}</p>
        </div>
      </section>

      <!-- 标签 2：熟客名册 -->
      <section class="tab-content active-tab" v-show="activeTab === 'social'">
        <div class="parchment-texture p-8 rounded-xl shadow-2xl relative border-8 border-double border-[#4A2C2A] flicker-hearth">
          <div class="flex items-center gap-4 mb-8 border-b-2 border-[#4A2C2A]/20 pb-4">
            <span class="material-symbols-outlined text-4xl">school</span>
            <h3 class="font-display-lg text-display-lg-mobile text-[#2e1413]">熟客名册</h3>
          </div>
          <div v-if="regularCount" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="(v, name) in d.人际关系.熟客关系网" :key="name" class="flex gap-4 items-start p-4 border-b border-[#4A2C2A]/10 hover:bg-[#4A2C2A]/5 rounded-lg transition-all group hover:translate-x-2">
              <label
                class="group/avatar relative w-16 h-16 rounded-full border-2 border-[#4A2C2A] overflow-hidden flex-shrink-0 bg-white/50 shadow-md flex items-center justify-center cursor-pointer"
                :title="'上传' + (v.姓名 || name) + '的头像'"
              >
                <img v-if="regularAvatar(String(name))" alt="头像" class="w-full h-full object-cover" :src="regularAvatar(String(name))" />
                <img v-else-if="defaultAvatar(String(v.性别), Number(v.年龄), String(name))" alt="默认头像" class="w-full h-full object-cover" :src="defaultAvatar(String(v.性别), Number(v.年龄), String(name))" />
                <span v-else class="material-symbols-outlined text-3xl text-[#4A2C2A]/70">person</span>
                <span class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white">
                  <span class="material-symbols-outlined text-2xl">add_a_photo</span>
                </span>
                <input type="file" accept="image/*" class="hidden" @change="(e: Event) => onRegularUpload(String(name), e)" />
              </label>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-headline-md text-[#2e1413]">{{ v.姓名 || name }}</h4>
                  <span v-if="v.性别" class="font-label-sm text-[#504629] bg-[#4A2C2A]/10 px-1.5 py-0.5 rounded">{{ v.性别 }}</span>
                  <span v-if="v.年龄" class="font-label-sm text-[#504629] bg-[#4A2C2A]/10 px-1.5 py-0.5 rounded">{{ v.年龄 }}岁</span>
                  <button v-if="regularAvatar(String(name))" class="font-label-sm text-[#93000a]/70 hover:text-[#93000a] ml-auto" @click="clearRegularAvatar(String(name))">移除</button>
                </div>
                <p v-if="v.评语" class="font-body-md text-[#504629] italic mb-1.5 leading-tight">{{ v.评语 }}</p>
                <div class="flex gap-1">
                  <span v-for="i in 3" :key="i" class="material-symbols-outlined text-sm text-[#93000a]" :class="{ fill: i <= regularStars(Number(v.好感度)) }">favorite</span>
                  <span class="font-label-sm text-[#93000a]/70 ml-1">{{ Math.round(Number(v.好感度)) }}</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="font-display-lg text-display-lg-mobile italic text-[#504629] text-center py-12">尚无熟客造访……</p>
          <div class="absolute bottom-4 right-8 opacity-20 pointer-events-none">
            <span class="material-symbols-outlined text-8xl text-[#2e1413]">ink_pen</span>
          </div>
        </div>
      </section>

      <!-- 标签 3：服务日志 -->
      <section class="tab-content active-tab" v-show="activeTab === 'personal'">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div class="lg:col-span-1 space-y-gutter">
            <div class="wooden-panel bg-surface-container-high p-6 rounded-xl text-center flicker-hearth">
              <p class="font-label-sm text-primary mb-2">当前阶段</p>
              <h3 class="font-display-lg text-display-lg-mobile text-on-surface mb-4">{{ nsfwStageLabel }}</h3>
              <div class="w-32 h-32 mx-auto rounded-full bg-surface-container flex items-center justify-center border-2 border-outline-variant relative overflow-hidden shadow-lg">
                <span class="material-symbols-outlined text-5xl text-primary glow-amber">{{ nsfwIcon }}</span>
              </div>
            </div>
            <div class="wooden-panel bg-surface-container-high p-6 rounded-xl flicker-hearth">
              <p class="font-label-sm text-primary mb-4">当前指定服装</p>
              <div class="bg-surface-container p-4 rounded-lg border border-outline-variant flex items-center gap-4">
                <span class="material-symbols-outlined text-3xl">checkroom</span>
                <div>
                  <p class="font-body-lg text-on-surface">{{ d.NSFW.当前指定服装 || '—' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-2 space-y-gutter">
            <div class="wooden-panel bg-surface-container-high p-6 rounded-xl flicker-hearth">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-headline-md text-primary">当日服务次数</h3>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined fill text-primary-container">monetization_on</span>
                  <span class="font-headline-md text-on-surface">{{ d.NSFW.当日服务次数 }} 次服务</span>
                </div>
              </div>
              <div class="space-y-8">
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="font-label-sm text-on-surface-variant">疲劳度</label>
                    <span class="font-label-sm text-primary">{{ fatigueHint }}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex-1 h-6 bg-surface-container-lowest rounded-full border border-outline-variant overflow-hidden relative">
                      <div class="h-full bg-gradient-to-r from-orange-600 to-yellow-400 shadow-[0_0_10px_rgba(255,185,90,0.5)] transition-all duration-1000 ease-out" :style="{ width: fatiguePct + '%' }"></div>
                      <div class="absolute right-0 top-0 h-full w-2 bg-red-900/50"></div>
                    </div>
                    <div class="relative flex items-center justify-center">
                      <span class="material-symbols-outlined text-orange-400">candle</span>
                      <span class="material-symbols-outlined fill absolute -top-1.5 text-xs text-orange-300 candle-flicker pointer-events-none">local_fire_department</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="font-label-sm text-on-surface-variant">敏感度</label>
                    <span class="font-label-sm text-secondary">{{ sensitivityHint }}</span>
                  </div>
                  <div class="h-10 bg-surface-container-lowest rounded-lg border border-outline-variant relative overflow-hidden flex items-center px-4">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-pulse"></div>
                    <div class="w-full flex justify-between relative z-10">
                      <span class="material-symbols-outlined text-secondary/40">flare</span>
                      <div class="flex gap-1">
                        <span v-for="i in 5" :key="i" class="w-2 h-6 rounded-full" :class="i <= sensitivityBars ? 'bg-secondary shadow-[0_0_15px_#ffdad7]' : 'bg-secondary/10'"></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="font-label-sm text-on-surface-variant block mb-3">客户满意度</label>
                  <div class="flex gap-3 justify-center md:justify-start">
                    <span v-for="i in 5" :key="i" class="material-symbols-outlined fill text-4xl glow-amber" :class="i <= satisfactionStars ? 'text-primary-container' : 'text-on-surface-variant/20'">monetization_on</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  </body>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from './store';

const store = useDataStore();

// 玩家名（{{user}} 宏）与头像（用户上传，存聊天变量）
const userName = ref(substitudeMacros('{{user}}'));
const avatar = ref<string>(String(_.get(getVariables({ type: 'chat' }), '头像', '') || ''));

function onAvatarUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toastr.error('头像过大（>2MB），请选小图');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = String(reader.result || '');
    avatar.value = dataUrl;
    updateVariablesWith(vars => _.set(vars, '头像', dataUrl), { type: 'chat' });
    toastr.success('头像已更新');
  };
  reader.readAsDataURL(file);
}

function clearAvatar() {
  avatar.value = '';
  updateVariablesWith(vars => _.unset(vars, '头像'), { type: 'chat' });
}

// 熟客头像：用户上传优先，否则按性别+年龄取默认头像
const regularAvatars = ref<Record<string, string>>(_.get(getVariables({ type: 'chat' }), '熟客头像', {}) || {});

function regularAvatar(name: string): string {
  return regularAvatars.value[name] || '';
}

function onRegularUpload(name: string, e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toastr.error('头像过大（>2MB），请选小图');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = String(reader.result || '');
    regularAvatars.value = { ...regularAvatars.value, [name]: dataUrl };
    updateVariablesWith(vars => _.set(vars, `熟客头像.${name}`, dataUrl), { type: 'chat' });
    toastr.success((d.value.人际关系.熟客关系网[name]?.姓名 || name) + ' 的头像已更新');
  };
  reader.readAsDataURL(file);
}

function clearRegularAvatar(name: string) {
  regularAvatars.value = { ...regularAvatars.value };
  delete regularAvatars.value[name];
  updateVariablesWith(vars => _.unset(vars, `熟客头像.${name}`), { type: 'chat' });
}

// 默认头像：性别+年龄 → my-assets 类别 → 文件名
const ASSETS_BASE = 'https://raw.githubusercontent.com/mususuplus/my-assets/main/人物/';
const CATEGORY_FILES: Record<string, string[]> = {
  少女: ['少女1.jpg', '少女2.jpg'],
  青年女: ['青年女1.jpg', '青年女2.jpg'],
  大妈: ['大妈1.jpg', '大妈2.jpg', '大妈3.jpg'],
  老人女: ['老人女.jpg'],
  青年男: ['青年男1.jpg', '青年男2.jpg', '青年男3.jpg'],
  大叔: ['大叔1.jpg', '大叔2.jpg', '大叔3.jpg'],
  老人男: ['老人男.jpg'],
};

function categoryFor(性别: string, 年龄: number): string {
  if (性别 === '女') {
    if (年龄 <= 17) return '少女';
    if (年龄 <= 35) return '青年女';
    if (年龄 <= 55) return '大妈';
    return '老人女';
  }
  if (年龄 <= 30) return '青年男';
  if (年龄 <= 55) return '大叔';
  return '老人男';
}

// 基于名字的稳定 hash，保证同一熟客每次渲染选同一张默认图
function hashIndex(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}

function defaultAvatar(性别: string, 年龄: number, name: string): string {
  const cat = categoryFor(性别, 年龄);
  const files = CATEGORY_FILES[cat];
  if (!files || !files.length) return '';
  const file = files[hashIndex(name, files.length)];
  return ASSETS_BASE + file;
}

type TabId = 'tavern' | 'social' | 'personal';
const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'tavern', label: '酒馆', icon: 'sports_bar' },
  { id: 'social', label: '熟客', icon: 'group' },
  { id: 'personal', label: '服务', icon: 'receipt_long' },
];
const activeTab = ref<TabId>('tavern');
function switchTab(id: TabId) {
  activeTab.value = id;
}

const fallback = {
  系统: { 日期: '—', 时间段: '清晨' as const, 当前区域: '—' },
  酒馆: { 当前酒馆: '—', 今日主题事件: '', 忙碌度: 0, 老板满意度: 0 },
  人际关系: {
    老板好感度: 0,
    熟客关系网: {} as Record<string, { 姓名: string; 性别: '男' | '女'; 年龄: number; 好感度: number; 评语: string }>,
  },
  NSFW: {
    当前阶段: 'idle' as const,
    当前指定服装: '',
    当日服务次数: 0,
    身体状态: { 疲劳度: 0, 敏感度: 0 },
    客户满意度: 0,
  },
};

const d = computed(() => {
  const raw = store.data ?? ({} as Record<string, unknown>);
  return {
    系统: { ...fallback.系统, ...(raw.系统 as object) },
    酒馆: { ...fallback.酒馆, ...(raw.酒馆 as object) },
    人际关系: { ...fallback.人际关系, ...(raw.人际关系 as object) },
    NSFW: { ...fallback.NSFW, ...(raw.NSFW as object) },
  };
});

const regularCount = computed(() => Object.keys(d.value.人际关系.熟客关系网).length);

const busyPct = computed(() => Math.max(0, Math.min(100, Number(d.value.酒馆.忙碌度))));
const busyHint = computed(() => {
  const v = busyPct.value;
  if (v >= 80) return '爆满';
  if (v >= 50) return '繁忙';
  if (v >= 25) return '适中';
  return '清闲';
});

function band(v: number, labels: [string, string, string, string], t = [20, 50, 75]) {
  if (v < t[0]) return labels[0];
  if (v < t[1]) return labels[1];
  if (v < t[2]) return labels[2];
  return labels[3];
}
const satisfactionLabel = computed(() => band(Number(d.value.酒馆.老板满意度), ['堪堪过关', '尚可', '满意', '出色']));
const favorLabel = computed(() => band(Number(d.value.人际关系.老板好感度), ['将信将疑', '面熟', '得力', '心腹']));
const fatigueHint = computed(() => band(Number(d.value.NSFW.身体状态.疲劳度), ['精力充沛', '略显疲态', '逐渐枯竭', '濒临极限']));
const sensitivityHint = computed(() => band(Number(d.value.NSFW.身体状态.敏感度), ['沉静', '渐入佳境', '高度敏感', '敏感至极']));

const fatiguePct = computed(() => Math.max(0, Math.min(100, Number(d.value.NSFW.身体状态.疲劳度))));
const sensitivityBars = computed(() => Math.round((Number(d.value.NSFW.身体状态.敏感度) / 100) * 5));
const satisfactionStars = computed(() => Math.round((Number(d.value.NSFW.客户满意度) / 100) * 5));

function regularStars(v: number) {
  const r = Number(v) / 100;
  if (r >= 0.66) return 3;
  if (r >= 0.33) return 2;
  if (r > 0) return 1;
  return 0;
}

const nsfwMap: Record<string, { label: string; icon: string }> = {
  idle: { label: '闲歇', icon: 'hourglass_empty' },
  preparation: { label: '准备', icon: 'local_fire_department' },
  service: { label: '服务中', icon: 'favorite' },
  aftercare: { label: '事后', icon: 'spa' },
};
const nsfwStageLabel = computed(() => nsfwMap[d.value.NSFW.当前阶段]?.label ?? d.value.NSFW.当前阶段);
const nsfwIcon = computed(() => nsfwMap[d.value.NSFW.当前阶段]?.icon ?? '');
</script>
