import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sparkles, Compass, Coins, Shield, ArrowRight } from 'lucide-react';

interface CustomizationPageProps {
  onComplete: (config: any) => void;
}

const PROFESSION_DATA = {
  '普通': ['普通冒险者'],
  '魔法师体系': ['魔法学徒', '正式法师', '大法师', '传奇法师'],
  '战士体系': ['见习战士', '正式战士', '精英战士', '英雄战士'],
  '神职者体系': ['受感者', '祭司', '大祭司', '神使']
};

const CLERIC_ABILITIES: Record<string, Record<string, string>> = {
  '索利昂': {
    '受感者': '“当虚妄之舌触碰尔之感知，真理之火必将灼烧，令尔如永不熄灭的灯盏般照亮幽暗。”',
    '祭司': '“当尔在吾名下缔结盟誓，背信者必受神力鞭笞，而受祝者之口将再无法吐露半句蒙蔽审判的妄言。”',
    '大祭司': '“凡吾之诚实之域所及，谎言必化作扼喉的枷锁，令不义者的灵魂被打上吾那永世洞察的律法烙印。”',
    '神使': '“吾之双目即为最终之裁定，凡吾所宣判之真实必化作不可撼动的法则，令世间契约皆在吾之圣名下永恒存档。”'
  },
  '诺克萨拉': {
    '受感者': '“于无光之界如履平地，尔必先于凡人感知那暗处的窥视，因阴影乃是吾赐予尔最忠诚的眷顾。”',
    '祭司': '“将禁忌之知封入死寂的顽石，在此方圆之内，纵是最高傲的侦测术式也将迷失在吾编织的感知盲点。”',
    '大祭司': '“令众生遗忘那不应存在的记忆，当吾之黑暗笼罩大地，一切凡俗之火皆将在绝对的虚无面前归于沉寂。”',
    '神使': '“揭开或尘封秘密的时机皆由吾定夺，当吾干预那阴晴圆缺，潮汐与宿命亦将随月相的更迭而剧变。”'
  },
  '瓦尔坎': {
    '受感者': '“嗅探那百步外即将喷薄的暴力之息，在铁与血的洗礼中，尔之躯壳将获得永不枯竭的战意与愈合。”',
    '祭司': '“将吾之斗志播撒于万千铁骑，于决斗的神圣仪式中，胜负双方的魂灵皆将受缚于吾之裁断。”',
    '大祭司': '“凡吾所指之处，千军万马必将陷入狂热或绝望，受吾加持之军在日落前将立于不败之地。”',
    '神使': '“吾即战争的始终，吾之裁定将改写战场的宿命，令一国之兴衰、万民之征战皆止于吾之终极宣判。”'
  },
  '莫尔甘': {
    '受感者': '“预见那生命之烛熄灭的余温，尔之双眼必能穿透生死的隔阂，直视那些徘徊于尘世边缘的凄冷游魂。”',
    '祭司': '“以葬仪之锁锢守不朽的遗蜕，令亵渎者无从染指，并指引彷徨的亡灵在安息的颂歌中归于吾之怀抱。”',
    '大祭司': '“在此城之中，死亡之秩序不容逆转，任何唤醒骸骨的禁术皆将在吾大规模引渡的圣光下消解无踪。”',
    '神使': '“吾乃终结之时刻的守门人，凡违背死亡法则之存在必将被吾强制逐出，因世间生灵的终点皆由吾定。”'
  },
  '艾尔薇恩': {
    '受感者': '“倾听万物生灵的哀鸣与低语，任何针对大地的亵渎与扭曲，皆将在尔之荒野感知中无所遁形。”',
    '祭司': '“唤醒种子的生机并愈合走兽的疮痍，令四时之流转在吾之祝福下，为这片土地降下繁荣或休眠。”',
    '大祭司': '“令破碎的荒原在瞬息间重焕生机，当吾召唤雷雨或寒潮，整片疆域的气候皆将随吾之喜怒而剧变。”',
    '神使': '“裁夺文明对大地的索取边界，凡越界贪婪者，必将领受吾那法则化作的、不可撤销的自然之怒。”'
  },
  '梅萨娜': {
    '受感者': '“触摸那隐匿于空气的玛那脉络，在每一卷尘封的古籍中，尔必能识破虚伪的篡改并寻回失落的真知。”',
    '祭司': '“剥离法术那繁杂的外壳以直视其本源，并在求知者的灵魂刻下烙印，使其真理之光永不随岁月凋零。”',
    '大祭司': '“令领域内的魔网脉络无所遁形，凡吾所禁绝之术式，纵是最高深的法师也无法调动半点元素之息。”',
    '神使': '“吾乃知识传承的守密人，吾将重塑被蹂躏的魔法根源，在万物之基重申那不可违抗的奥法准则。”'
  },
  '图尔克': {
    '受感者': '“指尖所及，金属的瑕疵与根源皆如掌纹般清晰，任何巧言令色的拙劣工艺在尔面前皆无处遁形。”',
    '祭司': '“将神火注入滚烫的炉心，令凡铁承载山岳之重，赋予宏伟的造物足以抗衡千载岁月的结构祝福。”',
    '大祭司': '“令方圆之内的金石皆随吾心而软化或坚韧，凡卑劣偷安之造物，必将在吾之谴责宣判下加速崩解。”',
    '神使': '“吾之裁决乃造物之终极勋章，凡吾册封为神圣之器物，其本质必将超越物质之极限，成就永恒不朽。”'
  }
};

const ABILITY_DESCRIPTIONS: Record<string, string> = {
  '魔法学徒': '能够指动微光或掷出火球，勉力撑起抵御流箭的屏障并干扰敌方感官，却受限于干涸的魔力而无法维系多重术式。',
  '正式法师': '撑起的护盾足以硬抗攻城重弩，能在翱翔天际时随心驾驭室内规模的元素之力，并布下洞悉潜入者的警戒结界。',
  '大法师': '举手投足间操纵方圆里的天象并率队跨域传送，在瞬发低阶法术的同时，还能游刃有余地篡改他人的魔咒。',
  '传奇法师': '能够开辟自定法则的独立半位面，感知笼罩百里疆域并在挥手间禁绝一切敌对魔法，其终极之威足以一击抹除整座要塞。',
  '见习战士': '拥有在高强度战斗中屹立不倒的耐力，能劈裂钢甲并在十步内闪避弩箭，是足以单挑三两名正规士兵的战场新锐。',
  '正式战士': '反应速度超越凡人五倍，能徒手砸裂城墙、以肉眼难辨的残影瞬时突进并拨开乱箭，且拥有极速愈合伤口的超凡体质。',
  '精英战士': '爆发时足以突破音障，凭感官洞悉万物震动并硬抗法师轰击，挥剑而出的真空斩击可隔空百步削断巨木。',
  '英雄战士': '全力一击足以劈开巍峨山岳并正面抗衡禁咒洗礼，能在呼吸间跨越城镇，即便内脏重伤亦能在数小时内自我复原。',
  '普通冒险者': '平凡的起点，却孕育着无限的可能。在这破碎的世界中，你的每一步都将铸就属于自己的传奇。'
};

const GODS = ['无', '索利昂(光明之神)', '诺克萨拉(黑暗之神)', '瓦尔坎(战争之神)', '莫尔甘(死亡之神)', '艾尔薇恩(自然之神)', '梅萨娜(魔法之神)', '图尔克(锻造之神)'];
const LOCATIONS = ['中央翡翠平原', '北方凛冬山脉', '西方永夜森林', '东方赤砂荒漠', '南方枯萎之地', '浮空疆域'];

const CustomizationPage: React.FC<CustomizationPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    profession: '普通冒险者',
    faith: GODS[0],
    location: LOCATIONS[0],
    status: '健康',
    currency: { gold: 10, silver: 0, copper: 0 }
  });

  const getAbilityDescription = (profession: string, faith: string) => {
    // Check if it's a cleric profession
    if (['受感者', '祭司', '大祭司', '神使'].includes(profession)) {
      if (faith === '无') return '你的神明将赐予你独一无二的能力。(请在下一步确立信仰)';
      
      const godName = faith.split('(')[0];
      return CLERIC_ABILITIES[godName]?.[profession] || '你的神明将赐予你独一无二的能力。';
    }
    
    return ABILITY_DESCRIPTIONS[profession] || '探索未知的天职，揭开隐藏的力量。';
  };

  const handleFinish = () => {
    onComplete(config);
  };

  const steps = [
    { title: '确立你的信仰', icon: <Sparkles className="w-8 h-8 text-amber-500" /> },
    { title: '选择你的天职', icon: <User className="w-8 h-8 text-rust-600" /> },
    { title: '选择降临之地', icon: <Compass className="w-8 h-8 text-emerald-600" /> },
    { title: '身心状态与资产', icon: <Coins className="w-8 h-8 text-gold-500" /> }
  ];

  return (
    <div className="min-h-screen bg-parchment-100 py-12 px-4 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full bg-parchment-50 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-ink-500/10 flex flex-col md:flex-row overflow-hidden"
      >
        {/* Left Sidebar - Progress */}
        <div className="w-full md:w-72 bg-ink-500 p-8 text-parchment-50 flex flex-col gap-8">
          <h2 className="text-3xl font-display tracking-widest uppercase border-b border-parchment-100/10 pb-4">
            命运编织
          </h2>
          <div className="flex flex-col gap-6">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${i === step ? 'translate-x-2' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${i === step ? 'bg-rust-600 border-rust-500 text-white' : 'border-parchment-100/30 text-parchment-200'}`}>
                  {i + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-tighter opacity-50">Step {i + 1}</span>
                  <span className="text-sm font-display tracking-wide">{s.title}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto">
             <p className="text-xs font-serif italic opacity-40 leading-relaxed">
               "每一项选择都将深深影响你在终焉之日的结局。"
             </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-10 flex flex-col">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b border-ink-500/10">
            {steps[step].icon}
            <h3 className="text-3xl font-display tracking-widest text-ink-600">{steps[step].title}</h3>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div 
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {GODS.map(g => (
                    <button
                      key={g}
                      onClick={() => setConfig({ ...config, faith: g })}
                      className={`p-6 border rounded-sm transition-all text-left group ${
                        config.faith === g 
                          ? 'bg-amber-50 border-amber-500 shadow-inner' 
                          : 'bg-white/50 border-ink-500/10 hover:border-amber-500/30'
                      }`}
                    >
                      <div className={`font-display tracking-widest text-lg ${config.faith === g ? 'text-amber-700' : 'text-ink-600'}`}>{g}</div>
                      <div className="text-[10px] text-ink-400 mt-1 uppercase font-serif tracking-widest opacity-60">
                        {g === '无' ? '不追求任何神明的指引。' : `确立对${g.split('(')[0]}的信仰。`}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-8"
                >
                  <div className="grid grid-cols-4 gap-6">
                    {Object.entries(PROFESSION_DATA).map(([category, items]) => (
                      <div key={category} className="flex flex-col gap-4">
                        <h4 className="text-center text-xs font-display tracking-[0.2em] text-ink-400 uppercase border-b border-ink-500/5 pb-2">
                          {category === '普通' ? '\u00A0' : category}
                        </h4>
                        <div className="flex flex-col gap-2">
                          {items.map(p => (
                            <button
                              key={p}
                              onClick={() => setConfig({ ...config, profession: p })}
                              className={`p-3 border rounded-sm transition-all text-xs font-display tracking-widest uppercase text-center ${
                                config.profession === p 
                                  ? 'bg-rust-600/10 border-rust-500 text-amber-900 shadow-sm font-bold' 
                                  : 'bg-white/50 border-ink-500/10 text-ink-500 hover:border-rust-500/30'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ability Description */}
                  <div className="mt-4 p-6 bg-ink-500/5 border border-ink-500/10 rounded-sm min-h-[120px] flex flex-col justify-center">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-rust-600 font-bold mb-2">天职能力</div>
                    <p className="text-sm font-serif italic text-ink-600 leading-relaxed">
                      {getAbilityDescription(config.profession, config.faith)}
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 gap-4"
                >
                  {LOCATIONS.map(l => (
                    <button
                      key={l}
                      onClick={() => setConfig({ ...config, location: l })}
                      className={`p-5 border rounded-sm transition-all text-left flex justify-between items-center ${
                        config.location === l 
                          ? 'bg-emerald-50 border-emerald-500 shadow-md translate-x-2' 
                          : 'bg-white/50 border-ink-500/10 hover:bg-emerald-50/30'
                      }`}
                    >
                      <span className={`font-display tracking-widest ${config.location === l ? 'text-emerald-700' : 'text-ink-600'}`}>{l}</span>
                      {config.location === l && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                    </button>
                  ))}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-display tracking-widest uppercase text-ink-500">
                      <Shield size={16} /> 临时状态
                    </label>
                    <input 
                      type="text"
                      value={config.status}
                      onChange={(e) => setConfig({ ...config, status: e.target.value })}
                      className="w-full bg-white border border-ink-500/20 p-4 rounded-sm focus:ring-2 focus:ring-rust-500 outline-none font-serif text-lg italic"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-display tracking-widest uppercase text-ink-500">
                      <Coins size={16} /> 初始资产
                    </label>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">金币</span>
                        <input 
                          type="number"
                          value={config.currency.gold}
                          onChange={(e) => setConfig({ ...config, currency: { ...config.currency, gold: parseInt(e.target.value) || 0 } })}
                          className="bg-white border border-ink-500/20 p-4 rounded-sm font-mono text-center text-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">银币</span>
                        <input 
                          type="number"
                          value={config.currency.silver}
                          onChange={(e) => setConfig({ ...config, currency: { ...config.currency, silver: parseInt(e.target.value) || 0 } })}
                          className="bg-white border border-ink-500/20 p-4 rounded-sm font-mono text-center text-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">铜币</span>
                        <input 
                          type="number"
                          value={config.currency.copper}
                          onChange={(e) => setConfig({ ...config, currency: { ...config.currency, copper: parseInt(e.target.value) || 0 } })}
                          className="bg-white border border-ink-500/20 p-4 rounded-sm font-mono text-center text-xl"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12 flex justify-between items-center">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className={`px-6 py-2 border border-ink-500/20 rounded-sm font-display tracking-widest uppercase transition-all ${
                step === 0 ? 'opacity-0' : 'hover:bg-ink-500/5'
              }`}
            >
              上一步
            </button>
            
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-10 py-3 bg-ink-500 text-parchment-50 rounded-sm font-display tracking-[0.2em] uppercase hover:bg-ink-600 transition-all flex items-center gap-2"
              >
                继续 <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-12 py-4 bg-rust-600 text-parchment-50 rounded-sm font-display tracking-[0.3em] uppercase hover:bg-rust-700 transition-all shadow-xl"
              >
                开启神话旅程
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomizationPage;
