import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BellRing,
  BookOpen,
  Coins,
  Compass,
  Flame,
  FlaskConical,
  Hammer,
  LoaderCircle,
  ScrollText,
  Sparkles,
  Sword,
} from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';

import { FAITH_TO_GOD_KEY, GODS } from '../../主界面/data/worldData';
import { LOCATION_LORE, REGION_LORE } from '../data/loreData';
import {
  DEFAULT_OPENING_CONFIG,
  OPENING_ORIGINS,
  OPENING_STEPS,
  PROFESSION_GROUPS,
  STARTING_LOCATIONS,
} from '../data/openingData';
import { faithName, generateGoldenFingerDraft, startStatusOpening } from '../opening';
import type { OpeningConfig, OpeningOriginMode, OpeningStep } from '../types';

const OPENING_ART_BASE =
  'https://raw.githubusercontent.com/mususuplus/my-assets/b4d85dde4e165b3c73329088a2a3251195bd9085/aisela/status-bar-2.0/opening';
const prologueArt = `${OPENING_ART_BASE}/prologue-gods-silence.png`;
const stageArt = `${OPENING_ART_BASE}/stage-nameless.png`;
const prophecyArt = `${OPENING_ART_BASE}/finale-sevenfold-rift.png`;
const ashPaperTexture = `${OPENING_ART_BASE}/ash-paper-texture.png`;

type RitualScene = 'prologue' | OpeningStep | 'finale';

const FAITH_ORACLES: Record<string, string> = {
  无: '没有神会替你举灯。你仍要自己决定向哪一处黑暗迈步。',
  索利昂: '让真相先于安慰抵达；誓言的价值，正在于它会要求代价。',
  诺克萨拉: '并非所有火都该被点亮。为秘密留下一道能呼吸的边界。',
  瓦尔坎: '不要为胜利而拔剑；只在退路已被交给身后之人时出手。',
  莫尔甘: '终结不是遗忘。替无人送行者记住名字，再继续向前。',
  艾尔薇恩: '万物皆会回环。你今天留下的伤口，也会在另一处生根。',
  梅萨娜: '先问力量会留下什么，再问你是否有能力握住它。',
  图尔克: '让双手先做出承诺。真正的答案，应当经得起锤火与时间。',
};

const STAGE_LIGHTS = [
  {
    id: 'solion',
    faith: '索利昂(光明之神)',
    name: '索利昂',
    color: '#d9b85d',
    x: 10,
    y: 33,
    beamX: 100,
    beamY: 116,
    tilt: 18,
  },
  {
    id: 'noxala',
    faith: '诺克萨拉(黑暗之神)',
    name: '诺克萨拉',
    color: '#9472bd',
    x: 24,
    y: 17,
    beamX: 240,
    beamY: 62,
    tilt: 12,
  },
  {
    id: 'valkan',
    faith: '瓦尔坎(战争之神)',
    name: '瓦尔坎',
    color: '#a85651',
    x: 38,
    y: 7,
    beamX: 380,
    beamY: 28,
    tilt: 6,
  },
  {
    id: 'morgan',
    faith: '莫尔甘(死亡之神)',
    name: '莫尔甘',
    color: '#aeb0aa',
    x: 50,
    y: 2,
    beamX: 500,
    beamY: 12,
    tilt: 0,
  },
  {
    id: 'elvyn',
    faith: '艾尔薇恩(自然之神)',
    name: '艾尔薇恩',
    color: '#749b72',
    x: 62,
    y: 7,
    beamX: 620,
    beamY: 28,
    tilt: -6,
  },
  {
    id: 'mesana',
    faith: '梅萨娜(魔法之神)',
    name: '梅萨娜',
    color: '#6694bc',
    x: 76,
    y: 17,
    beamX: 760,
    beamY: 62,
    tilt: -12,
  },
  {
    id: 'turk',
    faith: '图尔克(锻造之神)',
    name: '图尔克',
    color: '#c37b43',
    x: 90,
    y: 33,
    beamX: 900,
    beamY: 116,
    tilt: -18,
  },
] as const;

const PROFESSION_APPROACHES = {
  普通: { title: '凭脚程与判断', detail: '地图、火种与一双仍肯前行的靴子。', icon: Compass },
  魔法师体系: { title: '以知识穿过迷雾', detail: '法典摊开，先定义异常，再直视它。', icon: BookOpen },
  战士体系: { title: '让兵刃承担重量', detail: '并非为了证明强大，而是替来不及退后的人守住一步。', icon: Sword },
  神职者体系: { title: '把祈愿带进尘世', detail: '药瓶、祷词与未被遗弃的守望。', icon: FlaskConical },
} as const;

const REGION_OPENINGS: Record<string, { scene: string; cue: string }> = {
  中央翡翠平原: { scene: '圣河晨雾', cue: '晨雾吞没了本应准时抵港的补给船，岸边只剩一串逆流而上的湿脚印。' },
  北方凛冬山脉: { scene: '凛冬炉火', cue: '铁门关的炉火在熄灭前猛地跃高，像有什么东西正在山腹里敲门。' },
  西方永夜森林: { scene: '永夜树冠', cue: '树冠下的月光忽然转暗，一条本该通往林缘的藤桥开始朝未知方向生长。' },
  东方赤砂荒漠: { scene: '赤砂夜市', cue: '沙暴刚停，烛沙驿的住客名册比昨夜多出一个从未走进门的人。' },
  南方枯萎之地: { scene: '褪色前线', cue: '前线的路标正在失去名字，而一封写给你的军令刚从空白处递来。' },
  浮空疆域: { scene: '云海断桥', cue: '云层下传来失速的钟鸣，一座本不该靠近航道的浮岛正缓缓转向你。' },
};

function FaithSigil({ faith }: { faith: string }) {
  const key = FAITH_TO_GOD_KEY[faithName(faith)];
  if (!key) return <span className="faith-null">∅</span>;
  return <img alt="" src={GODS[key].icon} />;
}

function resolveWelcome(text: string) {
  try {
    return substitudeMacros(text);
  } catch {
    return text;
  }
}

function TheatreLightRig({
  activeLight,
  disabled,
  onToggle,
}: {
  activeLight: (typeof STAGE_LIGHTS)[number] | undefined;
  disabled: boolean;
  onToggle: (faith: string) => void;
}) {
  const activeGod = activeLight ? GODS[FAITH_TO_GOD_KEY[activeLight.name]] : undefined;
  const activeOracle = activeLight ? FAITH_ORACLES[activeLight.name] : FAITH_ORACLES.无;

  return (
    <section className="theatre-light-rig" aria-label="七神舞台聚光灯">
      <svg aria-hidden="true" className="theatre-beam-field" preserveAspectRatio="none" viewBox="0 0 1000 340">
        <defs>
          {STAGE_LIGHTS.map(light => (
            <linearGradient id={`theatre-beam-${light.id}`} key={light.id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={light.color} stopOpacity="0.08" />
              <stop offset="52%" stopColor={light.color} stopOpacity="0.38" />
              <stop offset="100%" stopColor={light.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {STAGE_LIGHTS.map(light => {
          const isActive = activeLight?.id === light.id;
          const beamPath = `M ${light.beamX} ${light.beamY} L 463 314 L 537 314 Z`;
          return (
            <g className={isActive ? 'is-active' : ''} key={light.id}>
              <path className="theatre-beam-haze" d={beamPath} fill={`url(#theatre-beam-${light.id})`} />
              <path className="theatre-beam-core" d={beamPath} fill={`url(#theatre-beam-${light.id})`} />
            </g>
          );
        })}
        <circle className={`theatre-focus-halo${activeLight ? ' is-active' : ''}`} cx="500" cy="314" r="27" />
        <circle className={`theatre-focus-core${activeLight ? ' is-active' : ''}`} cx="500" cy="314" r="4" />
      </svg>
      <span className="theatre-dust" aria-hidden="true" />

      <div className="theatre-light-controls" role="group" aria-label="选择一盏神祇聚光灯">
        {STAGE_LIGHTS.map(light => {
          const isActive = activeLight?.id === light.id;
          return (
            <button
              aria-label={`${isActive ? '熄灭' : '点亮'} ${light.name}的聚光灯`}
              aria-pressed={isActive}
              className={`theatre-spotlight${isActive ? ' is-active' : ''}`}
              disabled={disabled}
              key={light.id}
              onClick={() => onToggle(light.faith)}
              style={
                {
                  '--light-color': light.color,
                  '--light-x': `${light.x}%`,
                  '--light-y': `${light.y}%`,
                  '--light-tilt': `${light.tilt}deg`,
                } as CSSProperties
              }
              type="button"
            >
              <span className="spotlight-yoke" aria-hidden="true" />
              <span className="spotlight-housing" aria-hidden="true">
                <i />
                <b />
              </span>
              <strong>{light.name}</strong>
            </button>
          );
        })}
      </div>

      <div
        className={`theatre-focus-copy${activeLight ? ' is-active' : ''}`}
        id="theatre-stage-focus"
        aria-live="polite"
      >
        {activeLight ? (
          <>
            <span>STAGE SIGNAL · {activeLight.name}</span>
            <div>
              <FaithSigil faith={activeLight.faith} />
              <strong>{activeGod?.role ?? activeLight.name}</strong>
            </div>
            <p>{activeOracle}</p>
          </>
        ) : (
          <>
            <span>THE STAGE WAITS</span>
            <strong>无誓者</strong>
            <strong>你没有信仰，依靠的只有自己</strong>
            <p>{activeOracle}</p>
          </>
        )}
      </div>
    </section>
  );
}

export function OpeningRitual({
  isTransitioning,
  onComplete,
  requestPageChange,
}: {
  isTransitioning: boolean;
  onComplete: () => boolean;
  requestPageChange: (commitPage: () => void) => boolean;
}) {
  const [scene, setScene] = useState<RitualScene>('prologue');
  const [config, setConfig] = useState<OpeningConfig>(() => ({
    ...DEFAULT_OPENING_CONFIG,
    currency: { ...DEFAULT_OPENING_CONFIG.currency },
  }));
  const [submitting, setSubmitting] = useState(false);
  const [isGoldenFingerGenerating, setIsGoldenFingerGenerating] = useState(false);
  const [error, setError] = useState('');
  const submissionRef = useRef(false);
  const stepIndex = OPENING_STEPS.findIndex(step => step.key === scene);
  const activeStep = stepIndex >= 0 ? OPENING_STEPS[stepIndex] : undefined;
  const selectedRegion = REGION_LORE.find(region => region.name === config.location) ?? REGION_LORE[0];
  const regionOpening = REGION_OPENINGS[selectedRegion.name] ?? REGION_OPENINGS['中央翡翠平原'];
  const selectedFaithName = faithName(config.faith);
  const activeStageLight = STAGE_LIGHTS.find(light => light.faith === config.faith);
  const smallLocations = LOCATION_LORE.filter(location => location.region === config.location);
  const selectedSmallLocation = smallLocations.find(location => location.name === config.subLocation);
  const customOpening = config.openingStory.trim();
  const openingDirection = customOpening || '尚待你写下第一声台词。';
  const openingTitle = customOpening ? '你写下的开场' : '等待落笔';
  const activeOrigin = OPENING_ORIGINS.find(origin => origin.id === config.originMode) ?? OPENING_ORIGINS[0];
  const goldenFinger = config.goldenFinger.trim();

  const stageArtForScene = scene === 'prologue' ? prologueArt : scene === 'finale' ? prophecyArt : stageArt;
  const stageStyle = {
    '--region-accent': selectedRegion.accent,
    '--stage-light': activeStageLight?.color ?? '#8e816b',
  } as CSSProperties;

  const updateMoney = (key: keyof OpeningConfig['currency'], value: number) => {
    setConfig(current => ({ ...current, currency: { ...current.currency, [key]: value } }));
  };

  const toggleStageLight = (faith: string) => {
    setConfig(current => ({ ...current, faith: current.faith === faith ? '无' : faith }));
  };

  const selectOrigin = (originMode: OpeningOriginMode) => {
    setConfig(current => ({ ...current, originMode }));
  };

  const draftGoldenFinger = async () => {
    if (isGoldenFingerGenerating || isTransitioning) return;
    setError('');
    setIsGoldenFingerGenerating(true);
    try {
      const goldenFinger = await generateGoldenFingerDraft();
      setConfig(current => ({ ...current, goldenFinger }));
    } catch (reason) {
      console.error('[Aisela status 2.0] 金手指生成失败', reason);
      setError('金手指生成未能完成。请检查当前模型连接，或直接手写一则条目。');
    } finally {
      setIsGoldenFingerGenerating(false);
    }
  };

  const finish = async () => {
    if (submissionRef.current || isGoldenFingerGenerating) return;
    if (config.originMode === 'transmigrator' && !goldenFinger) {
      setError('请先写下一则金手指，或让 AI 为你起草。');
      return;
    }
    submissionRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      await new Promise<void>(resolve => window.setTimeout(resolve, 700));
      await startStatusOpening(config);
      onComplete();
    } catch (reason) {
      console.error('[Aisela status 2.0] 开局仪式失败', reason);
      submissionRef.current = false;
      setSubmitting(false);
      setError('星轨未能写入当前世界线。请确认酒馆助手与 MVU 已启用后重试。');
    }
  };

  const moveScene = (next: RitualScene) => {
    if (next === scene || submitting || isTransitioning || isGoldenFingerGenerating) return;
    setError('');
    requestPageChange(() => setScene(next));
  };

  const nextScene = () => {
    if (scene === 'prologue') return moveScene('faith');
    if (scene === 'finale') return;
    const index = OPENING_STEPS.findIndex(step => step.key === scene);
    moveScene(index === OPENING_STEPS.length - 1 ? 'finale' : OPENING_STEPS[index + 1].key);
  };

  const previousScene = () => {
    if (scene === 'prologue') return;
    if (scene === 'finale') return moveScene('assets');
    const index = OPENING_STEPS.findIndex(step => step.key === scene);
    moveScene(index === 0 ? 'prologue' : OPENING_STEPS[index - 1].key);
  };

  return (
    <main className={`opening-ritual opening-scene-${scene}${submitting ? ' is-sealing' : ''}`} style={stageStyle}>
      <img alt="" aria-hidden="true" className="ritual-scene-art" decoding="async" src={stageArtForScene} />
      <div className="ritual-scene-veil" aria-hidden="true" />
      <img alt="" aria-hidden="true" className="ritual-paper" decoding="async" src={ashPaperTexture} />

      {scene === 'prologue' ? (
        <section className="prologue-stage" aria-labelledby="prologue-title">
          <div className="prologue-clock" aria-label="末日时钟三刻">
            <span>末日时钟</span>
            <strong>
              III <i>/</i> XII
            </strong>
            <small>钟声 · 一响</small>
          </div>
          <div className="prologue-beam" aria-hidden="true" />
          <div className="prologue-copy">
            <span>PROLOGUE · 序幕</span>
            <h1 id="prologue-title">诸神沉默</h1>
            <p>天穹没有回答祈祷。灰烬仍在落下，而钟摆已经越过了第三刻。</p>
            <blockquote>“在暗影纪元第三百年的初春，轮到你被世界看见。”</blockquote>
            <section className="origin-call" aria-label="选择入场身份">
              <header>
                <span>CASTING · 入场身份</span>
                <strong>决定是谁走入第一幕</strong>
              </header>
              <div className="origin-mode-options" role="group" aria-label="开局身份模式">
                {OPENING_ORIGINS.map(origin => {
                  const selected = config.originMode === origin.id;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`origin-mode-option${selected ? ' is-selected' : ''}`}
                      disabled={isTransitioning}
                      key={origin.id}
                      onClick={() => selectOrigin(origin.id)}
                      type="button"
                    >
                      <i>{origin.numeral}</i>
                      <span>{origin.eyebrow}</span>
                      <strong>{origin.title}</strong>
                      <small>{origin.detail}</small>
                    </button>
                  );
                })}
              </div>
              <aside className={`origin-welcome is-${config.originMode}`} aria-live="polite">
                <span>{activeOrigin.eyebrow}</span>
                <p>{resolveWelcome(activeOrigin.welcome)}</p>
                {config.originMode !== 'wanderer' && (
                  <div className="origin-controller-notice" role="note">
                    <AlertTriangle aria-hidden="true" />
                    <span>使用此模式前，请在酒馆世界书中关闭「多阶段控制器」条目。</span>
                  </div>
                )}
                {config.originMode === 'transmigrator' && (
                  <label className="golden-finger-draft">
                    <span>GOLDEN FINGER · 写下一则例外</span>
                    <textarea
                      disabled={isTransitioning || isGoldenFingerGenerating}
                      maxLength={360}
                      onChange={event => setConfig(current => ({ ...current, goldenFinger: event.target.value }))}
                      placeholder="写下金手指的名称、核心权能与可主动触发的玩法；也可以让下方按钮为你起草一则。"
                      value={config.goldenFinger}
                    />
                    <div>
                      <small>开幕时会写入当前世界书的常驻条目，不会写入 MVU。</small>
                      <button
                        disabled={isTransitioning || isGoldenFingerGenerating}
                        onClick={draftGoldenFinger}
                        type="button"
                      >
                        {isGoldenFingerGenerating ? <LoaderCircle className="is-spinning" /> : <Sparkles />}
                        {isGoldenFingerGenerating ? '正在请 AI 起草' : '请 AI 起草一则条目'}
                      </button>
                    </div>
                  </label>
                )}
              </aside>
            </section>
            <button className="curtain-call" disabled={isTransitioning} onClick={nextScene} type="button">
              {config.originMode === 'arcane_disaster' ? '以灾厄之名入场' : '听见钟声'} <ArrowRight />
            </button>
          </div>
        </section>
      ) : (
        <>
          <header className="opening-playbill">
            <div>
              <span>THE THEATRE OF AISELA · 艾瑟兰启幕仪</span>
              <h1>{scene === 'finale' ? '终幕 · 第一声台词' : `${activeStep?.hint} · ${activeStep?.label}`}</h1>
            </div>
            <BellRing aria-hidden="true" />
          </header>

          <nav className="ritual-playbill" aria-label="开局剧幕">
            <button
              className={scene === 'prologue' ? 'is-active' : ''}
              disabled={isTransitioning}
              onClick={() => moveScene('prologue')}
              type="button"
            >
              <i>序</i>
              <span>诸神沉默</span>
            </button>
            {OPENING_STEPS.map((item, index) => (
              <button
                aria-current={item.key === scene ? 'step' : undefined}
                className={
                  item.key === scene ? 'is-active' : stepIndex > index || scene === 'finale' ? 'is-passed' : ''
                }
                key={item.key}
                onClick={() => moveScene(item.key)}
                disabled={isTransitioning}
                type="button"
              >
                <i>{String(index + 1).padStart(2, '0')}</i>
                <span>{item.label}</span>
              </button>
            ))}
            <button
              className={scene === 'finale' ? 'is-active' : ''}
              disabled={isTransitioning}
              onClick={() => moveScene('finale')}
              type="button"
            >
              <i>终</i>
              <span>第一声台词</span>
            </button>
          </nav>

          <section
            className={`ritual-stage${scene === 'faith' ? ` theatre-act theatre-act-faith${activeStageLight ? ' is-stage-lit' : ''}` : ''}`}
            key={scene}
          >
            {scene === 'faith' && (
              <>
                <div className="act-heading">
                  <span>ACT I · ABOVE THE STAGE</span>
                  <h2>未立的誓言</h2>
                  <p>穹顶灯架仍在待机。只有你亲手点亮一盏灯，誓言才会落入舞台中央。</p>
                </div>
                <TheatreLightRig
                  activeLight={activeStageLight}
                  disabled={isTransitioning}
                  onToggle={toggleStageLight}
                />
              </>
            )}

            {scene === 'profession' && (
              <>
                <div className="act-heading">
                  <span>ACT II · THE PROPS ARE SET</span>
                  <h2>你将如何出手</h2>
                  <p>灾厄不会先询问你的称号。它只会看见你拿起什么、舍弃什么。</p>
                </div>
                <div className="profession-stage">
                  {Object.entries(PROFESSION_GROUPS).map(([group, professions]) => {
                    const approach = PROFESSION_APPROACHES[group as keyof typeof PROFESSION_APPROACHES];
                    const Icon = approach.icon;
                    const selected = professions.includes(config.profession);
                    return (
                      <article className={`stage-prop${selected ? ' is-selected' : ''}`} key={group}>
                        <div className="prop-icon">
                          <Icon aria-hidden="true" />
                        </div>
                        <div className="prop-copy">
                          <span>{group}</span>
                          <h3>{approach.title}</h3>
                          <p>{approach.detail}</p>
                        </div>
                        <div className="prop-choices" aria-label={`${group}职业`}>
                          {professions.map(profession => (
                            <button
                              aria-pressed={config.profession === profession}
                              className={config.profession === profession ? 'is-selected' : ''}
                              key={profession}
                              onClick={() => setConfig(current => ({ ...current, profession }))}
                              type="button"
                            >
                              {profession}
                            </button>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
                <p className="chosen-line">
                  <Sparkles /> 你决定以<strong>{config.profession}</strong>的方式，面对即将降临的事。
                </p>
              </>
            )}

            {scene === 'location' && (
              <>
                <div className="act-heading">
                  <span>ACT III · THE BACKDROP DESCENDS</span>
                  <h2>幕景降临</h2>
                  <p>星图向你选择的区域缓慢推进；远方不再只是设定，而是一处正等待你行动的现场。</p>
                </div>
                <div className="location-stage" data-region={selectedRegion.sculpture}>
                  <div className="constellation-route" aria-hidden="true">
                    <span />
                    <i />
                    <b />
                  </div>
                  <div className="location-choices">
                    {REGION_LORE.filter(region => STARTING_LOCATIONS.includes(region.name)).map(region => (
                      <button
                        aria-pressed={config.location === region.name}
                        className={config.location === region.name ? 'is-selected' : ''}
                        key={region.id}
                        onClick={() => setConfig(current => ({ ...current, location: region.name, subLocation: '' }))}
                        style={{ '--region-accent': region.accent } as CSSProperties}
                        type="button"
                      >
                        <i aria-hidden="true" />
                        <span>{region.shortName}</span>
                        <strong>{region.name}</strong>
                      </button>
                    ))}
                  </div>
                  <aside className="location-forecast">
                    <span>CURTAIN RISES · {regionOpening.scene}</span>
                    <h3>{selectedSmallLocation?.name ?? selectedRegion.name}</h3>
                    <p>
                      {selectedSmallLocation
                        ? `开场提示：${selectedSmallLocation.aliases.slice(0, 3).join(' · ')}`
                        : regionOpening.cue}
                    </p>
                  </aside>
                  <section className="location-subchoices" aria-label={`${selectedRegion.name}小地点提示`}>
                    <header>
                      <span>SMALL STAGE · 可留白</span>
                      <strong>从已记录地点中选择第一幕的落点</strong>
                    </header>
                    <div>
                      <button
                        aria-pressed={!config.subLocation}
                        className={!config.subLocation ? 'is-selected' : ''}
                        disabled={isTransitioning}
                        onClick={() => setConfig(current => ({ ...current, subLocation: '' }))}
                        type="button"
                      >
                        <i>∅</i>
                        <span>仅写大地点</span>
                        <small>不指定小地点，只以 {selectedRegion.name} 展开。</small>
                      </button>
                      {smallLocations.map(location => (
                        <button
                          aria-pressed={config.subLocation === location.name}
                          className={config.subLocation === location.name ? 'is-selected' : ''}
                          disabled={isTransitioning}
                          key={location.id}
                          onClick={() => setConfig(current => ({ ...current, subLocation: location.name }))}
                          type="button"
                        >
                          <i>{String(location.uid).padStart(2, '0')}</i>
                          <span>{location.name}</span>
                          <small>{location.aliases.slice(0, 3).join(' · ')}</small>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}

            {scene === 'assets' && (
              <>
                <div className="act-heading">
                  <span>ACT IV · THE PROPERTY TABLE</span>
                  <h2>演员携带之物</h2>
                  <p>台前只留下真正会被带上路的东西。其余的，交给行囊之外的未知。</p>
                </div>
                <div className="property-table">
                  <div className="property-tabletop" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <article>
                    <ScrollText aria-hidden="true" />
                    <strong>旅行外衣</strong>
                    <small>足以遮风，却挡不住命运的注视。</small>
                  </article>
                  <article>
                    <Flame aria-hidden="true" />
                    <strong>火折子</strong>
                    <small>潮湿夜路里仍能点亮的一点火。</small>
                  </article>
                  <article>
                    <Hammer aria-hidden="true" />
                    <strong>干粮</strong>
                    <small>三日份口粮，为一次犹豫争取时间。</small>
                  </article>
                  <article className="property-purse">
                    <Coins aria-hidden="true" />
                    <strong>钱袋</strong>
                    <small>不要把旅程误当成账本，但账本也会决定下一扇门。</small>
                  </article>
                </div>
                <div className="travel-inscription">
                  <label>
                    <span>此刻，你以怎样的状态站在灯下？</span>
                    <input
                      maxLength={24}
                      onChange={event => setConfig(current => ({ ...current, status: event.target.value }))}
                      value={config.status}
                    />
                  </label>
                  <div className="purse-ledger">
                    {(
                      [
                        ['gold', '金狮', 'AU'],
                        ['silver', '银辉币', 'AG'],
                        ['copper', '铜叶币', 'CU'],
                      ] as const
                    ).map(([key, label, mark]) => (
                      <label key={key}>
                        <i>{mark}</i>
                        <span>{label}</span>
                        <input
                          min={0}
                          onChange={event => updateMoney(key, Number(event.target.value))}
                          type="number"
                          value={config.currency[key]}
                        />
                      </label>
                    ))}
                  </div>
                  <label className="carried-items-ledger">
                    <span>行囊里另有何物？</span>
                    <textarea
                      disabled={isTransitioning || submitting}
                      maxLength={480}
                      onChange={event => setConfig(current => ({ ...current, customItems: event.target.value }))}
                      placeholder={'每行一件；可写作「物品：简短描述」。\n例如：旧银钥匙：从失踪导师处留下'}
                      value={config.customItems}
                    />
                    <small>至多记入十件，它们会写入初始物品栏。</small>
                  </label>
                </div>
              </>
            )}

            {scene === 'finale' && (
              <>
                <div className="act-heading finale-heading">
                  <span>FINAL ACT · THE FIRST LINE</span>
                  <h2>第一声台词</h2>
                  <p>由你亲自写下这一幕的开场；文字会作为本幕既定事实交给叙事。</p>
                </div>
                <div className="finale-stage">
                  <article className="fate-ticket">
                    <span>命运签 · {selectedRegion.shortName}</span>
                    <h3>{openingTitle}</h3>
                    <p>{openingDirection}</p>
                    <dl>
                      <div>
                        <dt>誓言</dt>
                        <dd>{selectedFaithName}</dd>
                      </div>
                      <div>
                        <dt>行事</dt>
                        <dd>{config.profession}</dd>
                      </div>
                      <div>
                        <dt>身份</dt>
                        <dd>{activeOrigin.title}</dd>
                      </div>
                      <div>
                        <dt>幕景</dt>
                        <dd>{config.location}</dd>
                      </div>
                      <div>
                        <dt>落点提示</dt>
                        <dd>{config.subLocation || '仅写大地点'}</dd>
                      </div>
                      {config.originMode === 'transmigrator' && (
                        <div className="fate-golden-finger">
                          <dt>金手指</dt>
                          <dd>{goldenFinger || '尚未题写'}</dd>
                        </div>
                      )}
                    </dl>
                    <i className="fate-seal" aria-hidden="true">
                      III
                    </i>
                  </article>
                  <label className="custom-opening-script">
                    <span>由你写下这一幕</span>
                    <textarea
                      disabled={isTransitioning || submitting}
                      maxLength={900}
                      onChange={event => setConfig(current => ({ ...current, openingStory: event.target.value }))}
                      placeholder="写下你希望已经发生、正在发生，或必须在第一幕登场的剧情。它会作为本幕既定事实交给叙事。"
                      value={config.openingStory}
                    />
                    <small>留空时，叙事会仅根据你已选择的身份、地点与行囊自然起幕。</small>
                  </label>
                </div>
              </>
            )}
          </section>
        </>
      )}

      {error && (
        <p className="ritual-error" role="alert">
          <AlertTriangle /> {error}
        </p>
      )}

      {scene !== 'prologue' && (
        <footer className="ritual-actions">
          <button disabled={submitting || isTransitioning} onClick={previousScene} type="button">
            <ArrowLeft /> 回望上一幕
          </button>
          {scene !== 'finale' ? (
            <button className="ritual-primary" disabled={isTransitioning} onClick={nextScene} type="button">
              进入下一幕 <ArrowRight />
            </button>
          ) : (
            <button
              className="ritual-primary opening-button"
              disabled={submitting || isTransitioning}
              onClick={finish}
              type="button"
            >
              {submitting ? <LoaderCircle className="is-spinning" /> : <Sparkles />}
              {submitting ? '印章正在落下' : '开幕'}
            </button>
          )}
        </footer>
      )}
    </main>
  );
}
