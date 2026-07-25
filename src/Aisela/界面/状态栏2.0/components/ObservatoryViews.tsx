import {
  Archive,
  BookMarked,
  ChevronUp,
  CircleDot,
  Coins,
  Compass,
  Crown,
  Gem,
  MapPin,
  Orbit,
  ScrollText,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

import type { SchemaType } from '../../../schema';
import { EQUIPMENT_ICON_URLS, ROMAN } from '../../主界面/data/worldData';
import { CORE_NPC_LORE, LOCATIONS_BY_REGION } from '../data/loreData';
import { loreExcerpt, loreField } from '../data/loreUtils';
import type { CoreNpcLore, LocationLore, RegionLore } from '../types';
import { LoreText } from './LoreText';

const qualityLabel = {
  common: '凡品',
  rare: '珍稀',
  epic: '史诗',
  legendary: '传世',
};

const unifiedEraRecords = [
  {
    mark: '00',
    phase: '统一纪元 000 · 双誓丘',
    title: '罗兰盟约起誓',
    detail:
      '人类与兽人代表在双誓丘共同立下根本法：皇位以最强者为准，不以种族为限。盟约并未消弭旧日仇怨，只规定了争执必须先被写进法与誓言。',
  },
  {
    mark: '04',
    phase: '统一纪元 004 · 圣河河湾',
    title: '圣罗兰定都',
    detail:
      '新都沿圣河而起。皇宫、教堂与市场被刻意安排在彼此可望见的位置，提醒每一位后来者：王冠、神权与民生从未真正分开。',
  },
  {
    mark: '17',
    phase: '统一纪元 017 · 宫门受印',
    title: '四家受印',
    detail:
      '塞西莉亚、福尔哈德、波顿与亚里斯四家获准分掌魔法、军务、财货与监察。制度让帝国避免了单一王权的暴烈，也使每一次继承都成为无声的角力。',
  },
  {
    mark: '31',
    phase: '统一纪元 031 · 石桥议决',
    title: '七桥法典',
    detail:
      '圣河七桥之间的市民争端被汇编成最早的成文裁判条目。法典首次承认兽人部族习惯与人类城市律法并列有效，前提是两者都不违背盟约。',
  },
  {
    mark: '67',
    phase: '统一纪元 067 · 北境雪线',
    title: '北境锻路开通',
    detail:
      '穿越山麓的护送道路与符文驿站连通凛冬山脉。矮人的炉钢、帝国的粮秣与边境的佣兵自此沿同一条路南北流动，北境要塞群开始有了持久的补给。',
  },
  {
    mark: '109',
    phase: '统一纪元 109 · 南海潮汐',
    title: '银潮开港',
    detail:
      '波顿家族主持扩建南部港湾，海关、货栈与航标一并立起。来自矮人、精灵与远海岛屿的货物在此交换，帝国第一次学会将繁荣寄托于海风而非麦田。',
  },
  {
    mark: '152',
    phase: '统一纪元 152 · 语石群岛',
    title: '语石约章',
    detail:
      '帝国与星语协会就法师认证、危险文献与浮空岛航道达成约章。学术不再只属于塔内的长袍，也从这一刻起被纳入王冠可以征税、教会可以质询的秩序。',
  },
  {
    mark: '214',
    phase: '统一纪元 214 · 东境烽台',
    title: '第一次守墙令',
    detail:
      '东部边境被划为常备防线，烽台与驻军不再因和平而撤除。后世的绝境长城正是在这些相隔一昼夜的火点上不断加高、加厚。',
  },
  {
    mark: '277',
    phase: '统一纪元 277 · 无钟之夜',
    title: '晨钟停摆',
    detail:
      '圣罗兰城所有报时钟在同一夜失去声音，翌日清晨又无故复鸣。宫廷将其归为以太共振事故，星语协会则将当夜的观测记录封入限阅柜。',
  },
  {
    mark: '301',
    phase: '统一纪元 301 · 灰旗动员',
    title: '长战时代开端',
    detail:
      '暗影裂谷的军势越过旧边界，帝国以灰旗召集领主与自由民。临时动员逐渐固化为三百年的战争体制，统一纪元从扩张的年代进入守望的年代。',
  },
] as const;

const epicEvents = [
  {
    mark: '00',
    era: '旧世界终章',
    title: '诸神黄昏',
    detail: '旧世界崩溃后，未被完全清算的力量残余成为七大灭世要素；新的七柱神系在废墟上重建世界的法则。',
  },
  {
    mark: '01',
    era: '新神纪元',
    title: '沉默誓约',
    detail: '七位现行神祇约定不主动干涉凡间因果，只回应信徒主动的祈祷。神明由此沉默，凡人开始自行书写秩序。',
  },
  {
    mark: '02',
    era: '凡人纪元中期',
    title: '七塔点灯',
    detail:
      '七位传奇法师为整理诸神黄昏后散落的魔法知识结成学术同盟。语石群岛上升起第一批浮空塔，星语协会的原型由此形成。',
  },
  {
    mark: '03',
    era: '百族复苏期',
    title: '祖炉不熄',
    detail:
      '凛冬山脉深处的祖炉在一次持续九日的地热暴走后仍未熄灭。矮人将它视为锻造之神留下的试炼，并据此重开地下城最深处的工坊。',
  },
  {
    mark: '04',
    era: '百族复苏期',
    title: '月井回潮',
    detail:
      '永夜森林的月亮井重现潮汐，枯萎的树冠重新发芽。精灵议会因此结束长久的封闭期，第一次向外部世界派出带着种子的使者。',
  },
  {
    mark: '05',
    era: '统一纪元初期',
    title: '天际港首航',
    detail:
      '远古浮空岩体被重新锚定，第一座可移动的高空港口完成绕陆航行。此后，远方行歌的雏形将冒险者、邮驿与失落坐标带往所有国境之外。',
  },
  {
    mark: '06',
    era: '暗影纪元之前',
    title: '魔王崛起与魔国建立',
    detail: '约三百年前，魔王于暗影裂谷建立魔国；暗影同化与长期魔潮自此成为文明世界最直接的军事威胁。',
  },
  {
    mark: '07',
    era: '暗影纪元 001',
    title: '绝境长城奠基',
    detail:
      '旧烽台被连成巨型城墙，符文在每一次夜雨中被重新刻写。它不是为了保证胜利而建，而是为了让后方仍有时间收割、教学、相爱与告别。',
  },
  {
    mark: '08',
    era: '暗影纪元 017',
    title: '十二日魔潮',
    detail:
      '黑雾连续十二日冲击东线，防线数度只余一层符文薄光。幸存者以“第十三日的日出”命名重建仪式，之后每座前线营地都保留了一盏不熄的晨灯。',
  },
  {
    mark: '09',
    era: '暗影纪元 089',
    title: '灰烬神谕初现',
    detail:
      '一批彼此陌生的异端者在不同城邦说出了相同的梦话，话语在记录后自行化灰。灭世教派的先知由此第一次被写入观测者的密档。',
  },
  {
    mark: '10',
    era: '预言活跃期',
    title: '无名荒芜北侵',
    detail: '南方枯萎之地的法则失效从边缘向中心扩散；存在被缓慢抹消，观测者将其列为持续监测的前线。',
  },
] as const;

const prophecies = [
  {
    mark: 'I',
    name: '魔王',
    state: '活跃',
    domain: '意志 · 黑暗之神',
    verse: '从诸神的倒影中站起，以阴影加冕，将万物纳入永恒的阴影。',
  },
  {
    mark: 'II',
    name: '奥法之灾',
    state: '觉醒阶段',
    domain: '魔力 · 魔法之神',
    verse: '脆弱的容器承载着群星的愤怒，一次呼吸便能焚毁真理的根基。',
  },
  {
    mark: 'III',
    name: '噬根之蛇',
    state: '沉睡',
    domain: '因果 · 自然之神',
    verse: '它在万物的根基之下游走，以时间为食。当它终于咬住自己的尾巴，因果将忘记自己从何处开始。',
  },
  {
    mark: 'IV',
    name: '寂静圣画',
    state: '遗失',
    domain: '变化 · 锻造之神',
    verse: '完美的艺术是不动的，它邀请所有灵魂进入那永恒不灭的美梦。',
  },
  {
    mark: 'V',
    name: '无名荒芜',
    state: '扩散中',
    domain: '存在 · 死亡之神',
    verse: '终结意味着曾经有过开始。它只是让一切从未发生过。',
  },
  {
    mark: 'VI',
    name: '盲目之光',
    state: '未生成',
    domain: '意识 · 光明之神',
    verse: '当光明不再有边界，一切轮廓都将在白昼中溶解，直到世间只剩一个声音、一个念头、一个“我们”。',
  },
  {
    mark: 'VII',
    name: '钢铁神子',
    state: '封印／待机',
    domain: '秩序 · 战争之神',
    verse: '它的铭文里没有宽恕，它的使命里没有终止。当它睁开眼睛，生命将按名单被逐一清算。',
  },
] as const;

function entriesOf<T>(record: Record<string, T> | undefined) {
  return Object.entries(record ?? {});
}

function ratio(value: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function StatusArc({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const percent = ratio(value, max);
  return (
    <div className="status-arc" style={{ '--arc-percent': `${percent}%`, '--arc-tone': tone } as React.CSSProperties}>
      <div>
        <strong>{value}</strong>
        <span>/ {max}</span>
        <small>{label}</small>
      </div>
    </div>
  );
}

export function CoreView({ data, displayName }: { data: SchemaType; displayName: string }) {
  const player = data.主角;
  const world = data.世界;
  const effects = entriesOf(player.临时状态);

  return (
    <div className="view-plane core-plane">
      <header className="plane-title">
        <span>VITAL OBSERVATION · 生命观测</span>
        <h2>{displayName}</h2>
        <p>
          {player.称号} · {player.职业} · {player.信仰 === '无' ? '未立神誓' : `${player.信仰}的信徒`}
        </p>
      </header>

      <section className="vital-rings" aria-label="角色核心状态">
        <StatusArc label="生命" max={player.生命上限} tone="#d77f75" value={player.生命} />
        <StatusArc label="法力" max={player.法力上限} tone="#70badd" value={player.法力} />
        <StatusArc label="灾变觉醒" max={player.奥法之灾觉醒度上限} tone="#76d8ad" value={player.奥法之灾觉醒度} />
      </section>

      <div className="inscription-columns">
        <section className="inscription-column">
          <div className="column-mark">
            <Orbit />
          </div>
          <span>宿主相位</span>
          <h3>{player.宿主档案.阶段称谓}</h3>
          <p>{player.宿主档案.异象前兆}</p>
          <dl>
            <div>
              <dt>阶段</dt>
              <dd>
                {player.宿主档案.阶段代码} · {player.宿主档案.阶段名称}
              </dd>
            </div>
            <div>
              <dt>风险</dt>
              <dd>{player.宿主档案.风险提示}</dd>
            </div>
            <div>
              <dt>下一阈值</dt>
              <dd>{player.宿主档案.下一阈值}</dd>
            </div>
          </dl>
        </section>

        <section className="inscription-column">
          <div className="column-mark">
            <Compass />
          </div>
          <span>当前位置</span>
          <h3>{player.当前地点}</h3>
          <p>{world.区域态势.主导危机}</p>
          <dl>
            <div>
              <dt>推荐关注</dt>
              <dd>{world.区域态势.推荐关注}</dd>
            </div>
            <div>
              <dt>典型异象</dt>
              <dd>{world.区域态势.典型异象}</dd>
            </div>
          </dl>
        </section>

        <section className="inscription-column">
          <div className="column-mark">
            <Sparkles />
          </div>
          <span>状态与征兆</span>
          <h3>{player.状态}</h3>
          {effects.length ? (
            <ul className="effect-lines">
              {effects.map(([name, effect]) => (
                <li className={effect.类型 === 'debuff' ? 'is-danger' : ''} key={name}>
                  <strong>{name}</strong>
                  <span>{effect.描述 || effect.类型}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="quiet-line">目前没有额外状态在星图上留下痕迹。</p>
          )}
          <dl>
            <div>
              <dt>神学回声</dt>
              <dd>{world.神学回声}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export function AtlasView({
  region,
  location,
  currentLocation,
  onSelectLocation,
}: {
  region: RegionLore;
  location?: LocationLore;
  currentLocation: string;
  onSelectLocation: (location: LocationLore) => void;
}) {
  const locations = LOCATIONS_BY_REGION.get(region.name) ?? [];
  const selected = location && location.region === region.name ? location : locations[0];

  return (
    <div className="view-plane atlas-plane" style={{ '--region-accent': region.accent } as React.CSSProperties}>
      <header className="plane-title atlas-heading">
        <span>ATLAS ARCANA · 奥法地志</span>
        <h2>{region.name}</h2>
        <p>
          {region.shortName} · {locations.length} 个可观测坐标 · 全卷开放
        </p>
      </header>

      <nav className="location-ribbon" aria-label={`${region.name}地点列表`}>
        {locations.map(item => {
          const isCurrent = currentLocation.includes(item.name) || item.name.includes(currentLocation);
          return (
            <button
              className={item.id === selected?.id ? 'is-selected' : ''}
              key={item.id}
              onClick={() => onSelectLocation(item)}
              type="button"
            >
              <i aria-hidden="true" />
              <span>{item.name}</span>
              {isCurrent && <small>当前</small>}
            </button>
          );
        })}
      </nav>

      <div className="atlas-reading">
        <section className="location-engraving">
          <div className="engraving-index">
            <MapPin />
            <span>{String((selected ? locations.indexOf(selected) : 0) + 1).padStart(2, '0')}</span>
          </div>
          <span>SELECTED COORDINATE</span>
          <h3>{selected?.name ?? '未知坐标'}</h3>
          {selected ? <LoreText content={selected.content} /> : <p>该区域尚无可读取的地点卷宗。</p>}
        </section>

        <details className="region-folio">
          <summary>
            <BookMarked /> 展开区域总卷 <span>{region.name}</span>
          </summary>
          <LoreText content={region.content} />
          <div className="region-folio-collapse">
            <button
              onClick={event => {
                const details = event.currentTarget.closest('details');
                const summary = details?.querySelector('summary');
                details?.removeAttribute('open');
                summary?.scrollIntoView({ block: 'nearest' });
              }}
              type="button"
            >
              <ChevronUp /> 收起区域总卷
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}

export function FiguresView({
  data,
  selectedNpc,
  onSelectNpc,
}: {
  data: SchemaType;
  selectedNpc: CoreNpcLore;
  onSelectNpc: (npc: CoreNpcLore) => void;
}) {
  const relationships = entriesOf(data.人际关系);
  const identity = loreField(selectedNpc.content, '身份') || '传奇人物';

  return (
    <div className="view-plane figures-plane">
      <header className="plane-title">
        <span>CONSTELLATION OF PERSONS · 命运群像</span>
        <h2>传奇人物星环</h2>
        <p>八位核心人物仅公开基本信息与外貌识别；旅途中形成的关系另列于邂逅记录。</p>
      </header>

      <div className="figure-constellation" aria-label="核心人物">
        {CORE_NPC_LORE.map((npc, index) => (
          <button
            className={npc.id === selectedNpc.id ? 'is-selected' : ''}
            key={npc.id}
            onClick={() => onSelectNpc(npc)}
            style={{ '--figure-index': index } as React.CSSProperties}
            type="button"
          >
            <i>{npc.name.slice(0, 1)}</i>
            <span>{npc.name}</span>
            <small>{loreField(npc.content, '身份') || '传奇人物'}</small>
          </button>
        ))}
      </div>

      <section className="figure-reading">
        <div className="figure-seal">
          <Crown />
          <span>{selectedNpc.name.slice(0, 1)}</span>
        </div>
        <div className="figure-copy">
          <span>LEGENDARY DOSSIER</span>
          <h3>{selectedNpc.name}</h3>
          <p className="figure-identity">{identity}</p>
          <LoreText content={selectedNpc.content} sections={['基本信息', '外貌识别', '外貌']} />
        </div>
      </section>

      <div className="social-ledgers">
        <section>
          <div className="ledger-title">
            <Users />
            <span>已邂逅群星</span>
          </div>
          {relationships.length ? (
            relationships.map(([name, relation]) => (
              <div className="ledger-line" key={name}>
                <strong>{name}</strong>
                <span>{relation.关系 || relation.态度温度}</span>
                <small>{relation.好感度} / 100</small>
              </div>
            ))
          ) : (
            <p className="quiet-line">尚无任何人物被写入你的关系星图。</p>
          )}
        </section>
        <section>
          <div className="ledger-title">
            <Shield />
            <span>势力声望</span>
          </div>
          {entriesOf(data.势力).map(([name, faction]) => (
            <div className="ledger-line" key={name}>
              <strong>{name}</strong>
              <span>{faction.描述}</span>
              <small>{faction.声望}</small>
            </div>
          ))}
        </section>
        <section>
          <div className="ledger-title">
            <CircleDot />
            <span>同行者</span>
          </div>
          {entriesOf(data.小队).length ? (
            entriesOf(data.小队).map(([name, member]) => (
              <div className="ledger-line" key={name}>
                <strong>{name}</strong>
                <span>
                  {member.职业} · {member.状态}
                </span>
                <small>
                  {member.生命}/{member.生命上限}
                </small>
              </div>
            ))
          ) : (
            <p className="quiet-line">你的轨道上暂时没有同行者。</p>
          )}
        </section>
      </div>
    </div>
  );
}

export function HistoryView() {
  return (
    <div className="view-plane history-plane">
      <header className="plane-title">
        <span>ARCHIVE OF THE UNITED AGE · 统一纪元档案</span>
        <h2>王冠与盟约</h2>
        <p>
          此卷收录统一纪元的十段政治史与十一则世界史诗。远古卷宗没有绝对统一的年号，故以现行编年院采用的纪元与相对先后存档。
        </p>
      </header>

      <section className="unified-era" aria-label="统一纪元">
        <div className="section-heading">
          <BookMarked />
          <span>统一纪元 · 盟约卷</span>
          <small>十段存档</small>
        </div>
        <div className="unified-era-spine">
          {unifiedEraRecords.map(record => (
            <article key={record.mark}>
              <i>{record.mark}</i>
              <div>
                <span>{record.phase}</span>
                <h3>{record.title}</h3>
                <p>{record.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="archive-colophon">
        <i>“</i>
        <p>统一从来不是让所有人说同一种语言，而是让不同的语言在同一张桌上留下可被追责的誓言。</p>
        <span>——编年院《双誓丘旁注》</span>
      </aside>

      <section className="epic-archive" aria-label="史诗事件">
        <div className="section-heading">
          <ScrollText />
          <span>史诗事件</span>
          <small>十一则存档</small>
        </div>
        <div className="epic-archive-grid">
          {epicEvents.map(event => (
            <article key={event.mark}>
              <div className="epic-marker">
                <i>{event.mark}</i>
                <span>{event.era}</span>
              </div>
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProphecyView({ data }: { data: SchemaType }) {
  const world = data.世界;

  return (
    <div className="view-plane prophecy-plane">
      <header className="plane-title">
        <span>BOOK OF LAST THINGS · 末日预言书</span>
        <h2>七大灭世要素</h2>
        <p>它们被视为诸神黄昏未被清算的遗产。任何一个要素完全觉醒，都足以摧毁世界存续的一个根本维度。</p>
      </header>

      <section className="prophecy-observatory" aria-label="当前末日观测">
        <div className="prophecy-sigil">
          <span>DOOM</span>
          <strong>{world.末日时钟刻度}</strong>
          <small>/ XII</small>
        </div>
        <div>
          <span>观测者当前聚焦</span>
          <h3>{world.当前聚焦预言}</h3>
          <p>{world.当前聚焦说明}</p>
        </div>
        <blockquote>{world.神学回声}</blockquote>
      </section>

      <section className="prophecy-folio" aria-label="七页预言">
        {prophecies.map(prophecy => {
          const isCurrent = prophecy.name === world.当前聚焦预言;
          return (
            <article className={isCurrent ? 'is-current' : ''} key={prophecy.name}>
              <i>{prophecy.mark}</i>
              <div className="prophecy-leaf-heading">
                <span>{prophecy.state}</span>
                <small>{prophecy.domain}</small>
              </div>
              <h3>{prophecy.name}</h3>
              <blockquote>“{prophecy.verse}”</blockquote>
            </article>
          );
        })}
      </section>

      <p className="prophecy-caveat">镜像关系为观测者学会的学术推论，并非任何神谕确认的事实。</p>
    </div>
  );
}

export function ChronicleView({ data }: { data: SchemaType }) {
  const world = data.世界;
  const quests = entriesOf(data.委托列表).sort(([, a], [, b]) => b.排序权重 - a.排序权重);
  return (
    <div className="view-plane chronicle-plane">
      <header className="plane-title">
        <span>CHRONICLE OF THE LAST AGE · 末世纪事</span>
        <h2>
          {world.纪元} · {world.月}月{world.日}日
        </h2>
        <p>
          {world.时段} · 委托认证 {world.委托等级} · 当前聚焦“{world.当前聚焦预言}”
        </p>
      </header>

      <section className="doom-dial">
        <div className="doom-face">
          {ROMAN.slice(0, 12).map((roman, index) => (
            <i
              className={index + 1 <= world.末日时钟刻度 ? 'is-lit' : ''}
              key={roman}
              style={{ '--tick': index } as React.CSSProperties}
            >
              {roman}
            </i>
          ))}
          <div>
            <span>末日时钟</span>
            <strong>{world.末日时钟刻度}</strong>
            <small>/ XII</small>
          </div>
        </div>
        <div className="doom-copy">
          <span>CURRENT PROPHECY</span>
          <h3>{world.当前聚焦预言}</h3>
          <p>{world.当前聚焦说明}</p>
          <blockquote>{world.神学回声}</blockquote>
        </div>
      </section>

      <section className="chronicle-lines">
        <div>
          <span>本幕纪要</span>
          <p>{world.本幕纪要 || '当前幕尚未形成可归档的纪要。'}</p>
        </div>
        <div>
          <span>地点变化</span>
          <p>{world.情报流.地点变化}</p>
        </div>
        <div>
          <span>势力动作</span>
          <p>{world.情报流.势力动作}</p>
        </div>
        <div>
          <span>宿主异常</span>
          <p>{world.情报流.宿主异常}</p>
        </div>
        <div>
          <span>任务情报</span>
          <p>{world.情报流.当前任务}</p>
        </div>
      </section>

      <section className="quest-chronicle">
        <div className="section-heading">
          <ScrollText />
          <span>委托轨迹</span>
          <small>{quests.length} 条</small>
        </div>
        {quests.length ? (
          quests.map(([name, quest], index) => (
            <article key={name}>
              <i>{String(index + 1).padStart(2, '0')}</i>
              <div>
                <span>
                  {quest.类型} · {quest.状态}
                </span>
                <h3>{name}</h3>
                <p>{quest.说明}</p>
                <dl>
                  <div>
                    <dt>目标</dt>
                    <dd>{quest.目标}</dd>
                  </div>
                  <div>
                    <dt>奖励</dt>
                    <dd>{quest.奖励 || '未记载'}</dd>
                  </div>
                  {quest.危机关联 && (
                    <div>
                      <dt>关联</dt>
                      <dd>{quest.危机关联}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </article>
          ))
        ) : (
          <p className="quiet-line">目前没有委托写入编年史。</p>
        )}
      </section>
    </div>
  );
}

export function VaultView({ data }: { data: SchemaType }) {
  const player = data.主角;
  const equipment = entriesOf(player.装备栏);
  const inventory = entriesOf(player.物品栏);
  return (
    <div className="view-plane vault-plane">
      <header className="plane-title">
        <span>RELIQUARY OF THE WAYFARER · 旅者圣匣</span>
        <h2>武装与行囊</h2>
        <p>每一件被携带的物品，都是这条世界线留下的物质证词。</p>
      </header>

      <section className="currency-astrolabe">
        <Coins />
        {[
          ['金狮', player.货币.金狮, 'AU'],
          ['银辉币', player.货币.银辉币, 'AG'],
          ['铜叶币', player.货币.铜叶币, 'CU'],
          ['以太结晶', player.货币.以太结晶, 'AE'],
        ].map(([name, value, mark]) => (
          <div key={String(name)}>
            <i>{mark}</i>
            <strong>{Number(value).toLocaleString()}</strong>
            <span>{name}</span>
          </div>
        ))}
      </section>

      <section className="equipment-orbit">
        <div className="section-heading">
          <Shield />
          <span>装备轨道</span>
          <small>四方位</small>
        </div>
        <div className="equipment-slots">
          {equipment.map(([slot, item]) => (
            <article data-quality={item.品质} key={slot}>
              <img alt="" src={EQUIPMENT_ICON_URLS[slot as keyof typeof EQUIPMENT_ICON_URLS]} />
              <span>{slot}</span>
              <h3>{item.装备名}</h3>
              <small>{qualityLabel[item.品质]}</small>
              <p>{item.描述 || '这个方位尚未留下装备铭文。'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inventory-ledger">
        <div className="section-heading">
          <Archive />
          <span>行囊清册</span>
          <small>{inventory.length} 类</small>
        </div>
        {inventory.length ? (
          <div className="inventory-lines">
            {inventory.map(([name, item], index) => (
              <article data-quality={item.品质} key={name}>
                <i>{String(index + 1).padStart(2, '0')}</i>
                <div>
                  <span>{qualityLabel[item.品质]}</span>
                  <h3>{name}</h3>
                  <p>{item.描述 || '没有附加描述。'}</p>
                </div>
                <strong>×{item.数量}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="quiet-line">圣匣空空如也，尚未收纳任何物品。</p>
        )}
      </section>

      <section className="risk-testament">
        <Gem />
        <div>
          <span>宿主可能代价</span>
          <p>{player.宿主档案.可能代价}</p>
        </div>
      </section>
    </div>
  );
}

export function RegionPreview({ region }: { region: RegionLore }) {
  return <p>{loreExcerpt(region.content, 92)}</p>;
}
