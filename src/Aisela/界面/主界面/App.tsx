import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import CustomizationPage from './components/CustomizationPage';
import {
  ActionInputPanel,
  CharacterPanel,
  MainHeader,
  StoryPanel,
  WorldSidebar,
} from './components/layoutSections';
import {
  ArchivesModal,
  EditMessageModal,
  FullClockOverlay,
  InventoryModal,
  MapModal,
  MusicModal,
  QuestsModal,
  ReadingModal,
  SaveListModal,
  SocialModal,
  StoryContextMenu,
} from './components/modalSections';
import SettingsModal from './components/SettingsModal';
import StartPage from './components/StartPage';
import { FullscreenScrollWrap as GameFullscreenScrollWrap } from './components/gamePrimitives';
import {
  EQUIPMENT_ICON_URLS,
  FAITH_TO_GOD_KEY,
  GOD_LORE,
  GOD_TAB_LABELS,
  GODS,
  PANTHEON_KEYS,
  PLAYLIST,
  PROPHECIES,
  ROMAN,
  THEOLOGY_PAIRS,
  WORLD_REGIONS,
  buildChronicleTickerItems,
  emblems,
  getAwakeningData,
  getDoomPressureData,
  getFocusedProphecyName,
  getFocusedProphecyReason,
  getHostPhaseData,
  getLocationThemePreset,
  getTheologyEcho,
  harpIcon,
  normalizeReputation,
} from './data/worldData';
import { useFullscreenAudio } from './hooks/useFullscreenAudio';
import { useMessageActions } from './hooks/useMessageActions';
import { useModalState } from './hooks/useModalState';
import { useStageBootstrap } from './hooks/useStageBootstrap';
import { useStoryFlow } from './hooks/useStoryFlow';
import { useMvu } from './MvuContext';
import { createOpeningStoryMessage, initializeGameVariables, type OpeningFormConfig } from './utils/gameInitializer';
import { loadAllFloorsForReading, loadAllFloorsForSaves } from './utils/messageParser';
import { loadVaultSettings } from './utils/vaultSettings';

function useTeammatesFromData(team: Record<string, { 职业: string; 生命: number; 生命上限: number; 状态: string }>) {
  return _(team)
    .entries()
    .map(([name, value]) => ({
      name,
      profession: value.职业,
      hp: value.生命,
      maxHp: value.生命上限,
      status: value.状态,
    }))
    .value();
}

function useNpcsFromData(
  npcs: Record<string, { 好感度: number; 关系: string; 描述: string; 态度温度: string; 立场: string; 阵营牵引: string }>,
) {
  return _(npcs)
    .entries()
    .map(([name, value]) => ({
      name,
      affinity: value.好感度,
      relation: value.关系,
      description: value.描述,
      temperature: value.态度温度,
      stance: value.立场,
      factionPull: value.阵营牵引,
    }))
    .value();
}

function useInventoryFromData(
  items: Record<string, { 描述: string; 数量: number; 品质: 'common' | 'rare' | 'epic' | 'legendary' }>,
) {
  return _(items)
    .entries()
    .map(([name, value]) => ({
      name,
      quantity: value.数量,
      description: value.描述,
      quality: value.品质,
    }))
    .value();
}

const themeClassName = {
  classic: '',
  evernight_forest: 'theme-evernight-forest',
  cyberpunk: 'theme-cyberpunk',
} as const;

export default function App() {
  const { data, setData } = useMvu();
  const { gameStage, setGameStage } = useStageBootstrap();
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  const [readingFloors, setReadingFloors] = useState<Array<{ messageId: number; maintext: string; summaryMeta: ReturnType<typeof loadAllFloorsForReading>[number]['summaryMeta'] }>>([]);
  const [saveListFloors, setSaveListFloors] = useState<Array<{ messageId: number; sum: string; summaryMeta: ReturnType<typeof loadAllFloorsForSaves>[number]['summaryMeta'] }>>([]);

  const player = data.主角;
  const world = data.世界;

  const modalState = useModalState(player.当前地点);
  const storyFlow = useStoryFlow(gameStage);
  const mediaState = useFullscreenAudio(PLAYLIST);
  const messageActions = useMessageActions({
    mainText: storyFlow.mainText,
    currentMessageInfo: storyFlow.currentMessageInfo,
    refreshMaintext: storyFlow.refreshMaintext,
    setDisplayMessages: storyFlow.setDisplayMessages,
    onBranchCreateDone: () => modalState.setSaveListOpen(false),
  });

  useEffect(() => {
    if (modalState.readingModeOpen) setReadingFloors(loadAllFloorsForReading());
  }, [modalState.readingModeOpen]);

  useEffect(() => {
    if (modalState.saveListOpen) setSaveListFloors(loadAllFloorsForSaves());
  }, [modalState.saveListOpen]);

  const displayName =
    typeof SillyTavern !== 'undefined' && SillyTavern.name1 ? SillyTavern.name1 : '艾瑟兰旅人';

  const teammates = useTeammatesFromData(data.小队);
  const npcs = useNpcsFromData(data.人际关系);
  const factions = _(data.势力)
    .entries()
    .map(([name, value]) => ({
      name,
      reputation: normalizeReputation(value.声望),
      description: value.描述,
    }))
    .value();
  const inventoryItems = useInventoryFromData(player.物品栏);
  const actSummaryTags = storyFlow.latestSummaryMeta?.worldTags ?? storyFlow.latestSummaryMeta?.tags ?? [];

  const currentRegion = WORLD_REGIONS.find(region => region.name === player.当前地点) ?? WORLD_REGIONS[0]!;
  const selectedRegion =
    WORLD_REGIONS.find(region => region.name === (modalState.selectedMapRegion || player.当前地点)) ?? currentRegion;

  const doomPressure = getDoomPressureData(world.末日时钟刻度);
  const awakeningState = getAwakeningData(player.奥法之灾觉醒度);
  const derivedHostPhase = getHostPhaseData(player.奥法之灾觉醒度);
  const focusedProphecyName = getFocusedProphecyName(
    player.当前地点,
    world.末日时钟刻度,
    player.奥法之灾觉醒度,
    player.信仰,
  );
  const focusedProphecy = PROPHECIES.find(item => item.name === world.当前聚焦预言) ??
    PROPHECIES.find(item => item.name === focusedProphecyName) ??
    PROPHECIES[0]!;
  const focusedProphecyIndex = Math.max(0, PROPHECIES.findIndex(item => item.name === focusedProphecy.name));
  const focusedProphecyReason = world.当前聚焦说明 ||
    getFocusedProphecyReason(player.当前地点, world.末日时钟刻度, player.奥法之灾觉醒度, player.信仰);
  const focusedTheology = THEOLOGY_PAIRS.find(item => item.element === focusedProphecy.name) ?? null;
  const theologyEcho = world.神学回声 ||
    getTheologyEcho(player.当前地点, focusedProphecy.name, player.信仰, player.奥法之灾觉醒度);
  const hostPhase = {
    ...derivedHostPhase,
    code: player.宿主档案.阶段代码,
    name: player.宿主档案.阶段名称,
    label: player.宿主档案.阶段称谓,
    omen: player.宿主档案.异象前兆,
    risk: player.宿主档案.风险提示,
    nextTrigger: player.宿主档案.下一阈值,
    cost: player.宿主档案.可能代价,
  };
  const currentFaithKey = FAITH_TO_GOD_KEY[player.信仰];
  const currentFaithIndex = currentFaithKey ? Math.max(PANTHEON_KEYS.indexOf(currentFaithKey), 0) : 0;
  const currentFaithLabel = currentFaithKey ? GOD_TAB_LABELS[currentFaithKey] : '无信仰锚点';

  const worldTheme = getLocationThemePreset(
    player.当前地点,
    world.末日时钟刻度,
    player.奥法之灾觉醒度,
    player.信仰,
  );
  const worldThemeStyle = {
    ['--world-accent' as string]: worldTheme.accent,
    ['--world-accent-soft' as string]: worldTheme.accentSoft,
    ['--world-accent-strong' as string]: worldTheme.accentStrong,
    ['--world-glow' as string]: worldTheme.glow,
    ['--world-overlay' as string]: worldTheme.overlay,
    ['--world-alert' as string]: worldTheme.alert,
    ['--world-arcane' as string]: worldTheme.arcane,
    ['--world-background' as string]: worldTheme.background,
    ['--world-background-glow' as string]: worldTheme.backgroundGlow,
    ['--world-background-texture' as string]: worldTheme.backgroundTexture,
  } as CSSProperties;

  const selectedRegionFactions = selectedRegion.dominantFactions.map(name => {
    const faction = factions.find(item => item.name === name);
    return {
      name,
      reputation: faction?.reputation ?? '中立',
      description: faction?.description ?? '该势力暂未录入更多档案。',
    };
  });

  const clockRoman = ROMAN[Math.min(Math.max(world.末日时钟刻度, 1), 12) - 1] ?? 'III';
  const equipmentSlots = (['主手', '副手', '服饰', '饰品'] as const).map(slot => {
    const current = player.装备栏[slot];
    return {
      slot,
      name: current?.装备名,
      desc: current?.描述,
      quality: current?.品质,
    };
  });

  const questEntries = _(data.委托列表)
    .entries()
    .filter(([, quest]) => Boolean(quest && (quest.说明 || quest.目标 || quest.奖励 || quest.惩罚 || quest.状态)))
    .sortBy(([, quest]) => -(quest?.排序权重 ?? 0))
    .value();
  const questSummaries = questEntries.map(([name, quest]) => ({
    name,
    description: quest?.说明,
    status: quest?.状态,
  }));
  const questDetails = questEntries.map(([name, quest]) => ({
    name,
    description: quest?.说明,
    target: quest?.目标,
    reward: quest?.奖励,
    penalty: quest?.惩罚,
    status: quest?.状态,
  }));

  const showRollVariableAction = loadVaultSettings().apiMode === 'multi';

  const derivedTickerItems = buildChronicleTickerItems(storyFlow.latestSummaryMeta, {
    region: currentRegion,
    prophecy: focusedProphecy.name,
    hostPhase,
    questNames: questSummaries.map(item => item.name),
  });
  const tickerItems = [
    { category: '地点变化' as const, text: world.情报流.地点变化 || derivedTickerItems[0]?.text || '' },
    { category: '势力动作' as const, text: world.情报流.势力动作 || derivedTickerItems[1]?.text || '' },
    { category: '宿主异常' as const, text: world.情报流.宿主异常 || derivedTickerItems[2]?.text || '' },
    { category: '当前任务' as const, text: world.情报流.当前任务 || derivedTickerItems[3]?.text || '' },
  ].filter(item => item.text);

  useEffect(() => {
    const nextFocusedReason = getFocusedProphecyReason(
      player.当前地点,
      world.末日时钟刻度,
      player.奥法之灾觉醒度,
      player.信仰,
    );
    const nextTheologyEcho = getTheologyEcho(
      player.当前地点,
      focusedProphecyName,
      player.信仰,
      player.奥法之灾觉醒度,
    );
    const nextHost = getHostPhaseData(player.奥法之灾觉醒度);
    const nextRegion = WORLD_REGIONS.find(region => region.name === player.当前地点) ?? WORLD_REGIONS[0]!;
    const nextNpcData = _(data.人际关系)
      .mapValues(value => ({
        ...value,
        态度温度:
          value.好感度 >= 80
            ? '高热信任'
            : value.好感度 >= 60
              ? '明显亲近'
              : value.好感度 >= 40
                ? '谨慎观望'
                : value.好感度 >= 20
                  ? '低温戒备'
                  : '危险疏离',
        立场: /帝国|骑士|军/.test(value.关系)
          ? '帝国侧'
          : /观测|学会|协会/.test(value.关系 + value.描述)
            ? '观测侧'
            : /教派|异端/.test(value.关系 + value.描述)
              ? '异端侧'
              : /队友|同伴|行歌/.test(value.关系 + value.描述)
                ? '同行侧'
                : '地方侧',
        阵营牵引: value.阵营牵引 && value.阵营牵引 !== '暂无明确阵营拉扯情报。'
          ? value.阵营牵引
          : value.描述 || value.关系 || '暂无明确阵营拉扯情报。',
      }))
      .value();
    const nextQuestData = _(data.委托列表)
      .mapValues((quest, name) => {
        let priority = 0;
        if (quest.类型 === '主线') priority += 30;
        if (quest.说明?.includes(player.当前地点) || name.includes(player.当前地点)) priority += 15;
        if (
          [focusedProphecyName, nextRegion.linkedProphecy, nextRegion.linkedGod]
            .some(keyword => name.includes(keyword) || quest.说明?.includes(keyword) || quest.目标?.includes(keyword))
        ) {
          priority += 12;
        }
        if (quest.状态 === '进行中') priority += 10;
        return {
          ...quest,
          排序权重: priority,
          危机关联:
            quest.危机关联 ||
            [focusedProphecyName, nextRegion.linkedProphecy]
              .find(keyword => name.includes(keyword) || quest.说明?.includes(keyword) || quest.目标?.includes(keyword)) ||
            '',
        };
      })
      .value();
    const nextTicker = buildChronicleTickerItems(storyFlow.latestSummaryMeta, {
      region: nextRegion,
      prophecy: focusedProphecyName,
      hostPhase: nextHost,
      questNames: _(nextQuestData)
        .entries()
        .sortBy(([, quest]) => -(quest?.排序权重 ?? 0))
        .map(([name]) => name)
        .take(3)
        .value(),
    });

    const shouldUpdate =
      !_.isEqual(player.宿主档案, {
        阶段代码: nextHost.code,
        阶段名称: nextHost.name,
        阶段称谓: nextHost.label,
        异象前兆: nextHost.omen,
        风险提示: nextHost.risk,
        下一阈值: nextHost.nextTrigger,
        可能代价: nextHost.cost,
      }) ||
      world.当前聚焦预言 !== focusedProphecyName ||
      world.当前聚焦说明 !== nextFocusedReason ||
      world.神学回声 !== nextTheologyEcho ||
      world.本幕纪要 !== (storyFlow.latestSummaryMeta?.event || '') ||
      !_.isEqual(world.区域态势, {
        主导危机: nextRegion.dominantCrisis,
        推荐关注: nextRegion.recommendedFocus,
        典型异象: nextRegion.signatureAnomaly,
        势力拉扯: nextRegion.factionTension,
      }) ||
      !_.isEqual(world.情报流, {
        地点变化: nextTicker[0]?.text || '',
        势力动作: nextTicker[1]?.text || '',
        宿主异常: nextTicker[2]?.text || '',
        当前任务: nextTicker[3]?.text || '',
      }) ||
      !_.isEqual(data.人际关系, nextNpcData) ||
      !_.isEqual(data.委托列表, nextQuestData);

    if (!shouldUpdate) return;

    setData(prev => ({
      ...prev,
      主角: {
        ...prev.主角,
        宿主档案: {
          阶段代码: nextHost.code,
          阶段名称: nextHost.name,
          阶段称谓: nextHost.label,
          异象前兆: nextHost.omen,
          风险提示: nextHost.risk,
          下一阈值: nextHost.nextTrigger,
          可能代价: nextHost.cost,
        },
      },
      世界: {
        ...prev.世界,
        当前聚焦预言: focusedProphecyName,
        当前聚焦说明: nextFocusedReason,
        神学回声: nextTheologyEcho,
        本幕纪要: storyFlow.latestSummaryMeta?.event || '',
        区域态势: {
          主导危机: nextRegion.dominantCrisis,
          推荐关注: nextRegion.recommendedFocus,
          典型异象: nextRegion.signatureAnomaly,
          势力拉扯: nextRegion.factionTension,
        },
        情报流: {
          地点变化: nextTicker[0]?.text || '',
          势力动作: nextTicker[1]?.text || '',
          宿主异常: nextTicker[2]?.text || '',
          当前任务: nextTicker[3]?.text || '',
        },
      },
      人际关系: nextNpcData,
      委托列表: nextQuestData,
    }));
  }, [
    data.人际关系,
    data.委托列表,
    focusedProphecyName,
    player.信仰,
    player.当前地点,
    player.奥法之灾觉醒度,
    player.宿主档案,
    setData,
    storyFlow.latestSummaryMeta,
    world.当前聚焦说明,
    world.当前聚焦预言,
    world.情报流,
    world.区域态势,
    world.末日时钟刻度,
    world.本幕纪要,
    world.神学回声,
  ]);

  if (gameStage === 'CLICK_TO_START' || gameStage === 'TITLE') {
    return <StartPage onStart={() => setGameStage('OPENING')} />;
  }

  if (gameStage === 'LOADING') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ink-500/85 backdrop-blur-md">
        <div className="text-parchment-100 font-display text-xl tracking-[0.4em]">正在创建开局...</div>
      </div>
    );
  }

  if (gameStage === 'OPENING') {
    return (
      <CustomizationPage
        onComplete={async (config: OpeningFormConfig) => {
          setGameStage('LOADING');
          try {
            await initializeGameVariables(config);
            await createOpeningStoryMessage(config);
            setData(prev => ({
              ...prev,
              主角: {
                ...prev.主角,
                职业: config.profession,
                信仰: config.faith === '无' ? '无' : config.faith.split('(')[0],
                当前地点: config.location,
                状态: config.status,
                货币: {
                  ...prev.主角.货币,
                  金狮: config.currency.gold,
                  银辉币: config.currency.silver,
                  铜叶币: config.currency.copper,
                },
              },
            }));
            setGameStage('GAME');
          } catch (error) {
            console.error('[Aisela] 开局提交失败:', error);
            setGameStage('OPENING');
          }
        }}
      />
    );
  }

  return (
    <GameFullscreenScrollWrap isFullscreen={mediaState.isFullscreen}>
      <div
        ref={mediaState.mainContainerRef}
        className={`world-reactive-root relative mx-auto flex min-h-dvh w-full max-w-[1920px] flex-col gap-4 overflow-x-hidden px-3 py-3 sm:gap-6 sm:px-4 sm:py-4 lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:px-8 lg:py-8 ${themeClassName[modalState.uiTheme]}`}
        style={worldThemeStyle}
      >
        <audio ref={mediaState.audioRef} onEnded={() => mediaState.setIsMusicPlaying(false)} className="sr-only" aria-hidden />

        <MainHeader
          world={world}
          currentLocation={player.当前地点}
          clockRoman={clockRoman}
          tickerItems={tickerItems}
          actSummary={world.本幕纪要}
          actSummaryTags={actSummaryTags}
          harpIcon={harpIcon}
          isFullscreen={mediaState.isFullscreen}
          onOpenSettings={() => modalState.setSettingsOpen(true)}
          onOpenMusic={() => modalState.setMusicOpen(true)}
          onOpenReading={() => modalState.setReadingModeOpen(true)}
          onOpenSaveList={() => modalState.setSaveListOpen(true)}
          onToggleFullscreen={mediaState.toggleFullscreen}
          onOpenClock={() => mediaState.setShowFullClock(true)}
        />

        <main className="grid flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:overflow-hidden">
          <aside className="min-h-0 lg:col-span-3 lg:overflow-hidden">
            <CharacterPanel
              player={player}
              displayName={displayName}
              hostPhase={hostPhase}
              equipmentIconUrls={EQUIPMENT_ICON_URLS}
              onOpenInventory={() => modalState.setActiveModal('inventory')}
            />
          </aside>

          <section className="min-h-0 flex flex-col gap-4 lg:col-span-6 lg:overflow-hidden">
            <StoryPanel
              displayMessages={storyFlow.displayMessages}
              logs={messageActions.logs}
              options={storyFlow.options}
              optionsExpanded={optionsExpanded}
              actSummary={world.本幕纪要}
              actSummaryTags={actSummaryTags}
              onToggleOptions={() => setOptionsExpanded(prev => !prev)}
              currentMessageInfo={storyFlow.currentMessageInfo}
              contextMenu={messageActions.contextMenu}
              onLongPressStart={messageActions.handleLongPressStart}
              onLongPressEnd={messageActions.handleLongPressEnd}
              onSelectOption={messageActions.setInput}
            />
            <ActionInputPanel
              input={messageActions.input}
              isSending={messageActions.isSending}
              onInputChange={messageActions.setInput}
              onSend={messageActions.handleSend}
            />
          </section>

          <aside className="min-h-0 lg:col-span-3 lg:overflow-hidden">
            <WorldSidebar
              world={world}
              questSummaries={questSummaries}
              currentRegion={{
                ...currentRegion,
                dominantCrisis: world.区域态势.主导危机,
                recommendedFocus: world.区域态势.推荐关注,
                signatureAnomaly: world.区域态势.典型异象,
                factionTension: world.区域态势.势力拉扯,
              }}
              hostPhase={hostPhase}
              focusedProphecy={focusedProphecy}
              theologyEcho={theologyEcho}
              onOpenMap={() => modalState.setActiveModal('map')}
              onOpenQuests={() => modalState.setActiveModal('quests')}
              onOpenSocial={() => modalState.setActiveModal('social')}
              onOpenArchives={() => modalState.setActiveModal('archives')}
            />
          </aside>
        </main>

        <ReadingModal
          isOpen={modalState.readingModeOpen}
          onClose={() => modalState.setReadingModeOpen(false)}
          readingFloors={readingFloors}
        />
        <SaveListModal
          isOpen={modalState.saveListOpen}
          onClose={() => modalState.setSaveListOpen(false)}
          saveListFloors={saveListFloors}
          onBranchCreate={messageActions.handleBranchCreate}
        />
        <SettingsModal
          isOpen={modalState.settingsOpen}
          onClose={() => modalState.setSettingsOpen(false)}
          onThemeChange={modalState.setUiTheme}
        />
        <MusicModal
          isOpen={modalState.musicOpen}
          onClose={() => modalState.setMusicOpen(false)}
          playlist={PLAYLIST}
          currentTrackIndex={mediaState.currentTrackIndex}
          isMusicPlaying={mediaState.isMusicPlaying}
          onTrackClick={mediaState.handleTrackClick}
        />
        <SocialModal
          isOpen={modalState.activeModal === 'social'}
          onClose={() => {
            modalState.setActiveModal(null);
            modalState.setSquadCommandMemberIndex(null);
          }}
          socialTab={modalState.socialTab}
          onSocialTabChange={modalState.setSocialTab}
          teammates={teammates}
          npcs={npcs}
          focusedProphecyName={focusedProphecy.name}
          squadCommandMemberIndex={modalState.squadCommandMemberIndex}
          onSquadCommandToggle={index => modalState.setSquadCommandMemberIndex(prev => (prev === index ? null : index))}
          appendToInput={messageActions.appendToInput}
          clearSquadCommand={() => modalState.setSquadCommandMemberIndex(null)}
        />
        <MapModal
          isOpen={modalState.activeModal === 'map'}
          onClose={() => modalState.setActiveModal(null)}
          emblems={emblems}
          worldRegions={WORLD_REGIONS}
          player={player}
          currentRegion={{
            ...currentRegion,
            dominantCrisis: world.区域态势.主导危机,
            recommendedFocus: world.区域态势.推荐关注,
            signatureAnomaly: world.区域态势.典型异象,
            factionTension: world.区域态势.势力拉扯,
          }}
          selectedRegion={selectedRegion}
          selectedRegionFactions={selectedRegionFactions}
          doomPressure={doomPressure}
          awakeningState={awakeningState}
          theologyEcho={theologyEcho}
          appendToInput={messageActions.appendToInput}
          setSelectedMapRegion={modalState.setSelectedMapRegion}
        />
        <ArchivesModal
          isOpen={modalState.activeModal === 'archives'}
          onClose={() => modalState.setActiveModal(null)}
          archiveView={modalState.archiveView}
          setArchiveView={modalState.setArchiveView}
          archiveIndex={modalState.archiveIndex}
          setArchiveIndex={modalState.setArchiveIndex}
          player={player}
          currentRegion={{
            ...currentRegion,
            dominantCrisis: world.区域态势.主导危机,
            recommendedFocus: world.区域态势.推荐关注,
            signatureAnomaly: world.区域态势.典型异象,
            factionTension: world.区域态势.势力拉扯,
          }}
          focusedProphecy={focusedProphecy}
          focusedProphecyIndex={focusedProphecyIndex}
          focusedProphecyReason={focusedProphecyReason}
          focusedTheology={focusedTheology}
          doomPressure={doomPressure}
          awakeningState={awakeningState}
          hostPhase={hostPhase}
          theologyEcho={theologyEcho}
          theologyPairs={THEOLOGY_PAIRS}
          prophecies={PROPHECIES}
          pantheonKeys={PANTHEON_KEYS}
          gods={GODS}
          godLore={GOD_LORE}
          godTabLabels={GOD_TAB_LABELS}
          currentFaithIndex={currentFaithIndex}
          currentFaithLabel={currentFaithLabel}
        />
        <InventoryModal
          isOpen={modalState.activeModal === 'inventory'}
          onClose={() => modalState.setActiveModal(null)}
          equipmentSlots={equipmentSlots}
          equipmentIconUrls={EQUIPMENT_ICON_URLS}
          inventoryItems={inventoryItems}
          appendToInput={messageActions.appendToInput}
        />
        <QuestsModal
          isOpen={modalState.activeModal === 'quests'}
          onClose={() => modalState.setActiveModal(null)}
          level={world.委托等级}
          currentRegion={{
            ...currentRegion,
            dominantCrisis: world.区域态势.主导危机,
            recommendedFocus: world.区域态势.推荐关注,
            signatureAnomaly: world.区域态势.典型异象,
            factionTension: world.区域态势.势力拉扯,
          }}
          focusedProphecyName={focusedProphecy.name}
          quests={questDetails}
        />
        <StoryContextMenu
          contextMenu={messageActions.contextMenu}
          isSending={messageActions.isSending}
          showRollVariableAction={showRollVariableAction}
          onClose={() => messageActions.setContextMenu(null)}
          onRegenerate={messageActions.handleRegenerate}
          onRollVariable={messageActions.handleRollVariable}
          onEdit={messageActions.handleEdit}
        />
        <EditMessageModal
          editingMessage={messageActions.editingMessage}
          setEditingMessage={messageActions.setEditingMessage}
          onSave={messageActions.handleSaveEdit}
        />
        <FullClockOverlay
          isOpen={mediaState.showFullClock}
          onClose={() => mediaState.setShowFullClock(false)}
          clockRoman={clockRoman}
          doomValue={world.末日时钟刻度}
        />
      </div>
    </GameFullscreenScrollWrap>
  );
}
