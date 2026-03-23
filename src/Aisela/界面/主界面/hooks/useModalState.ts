import { useEffect, useState } from 'react';

import type { ModalType } from '../types';
import { loadVaultSettings, type UiTheme } from '../utils/vaultSettings';

export function useModalState(currentLocation: string) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [readingModeOpen, setReadingModeOpen] = useState(false);
  const [saveListOpen, setSaveListOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [socialTab, setSocialTab] = useState<'squad' | 'npcs'>('squad');
  const [squadCommandMemberIndex, setSquadCommandMemberIndex] = useState<number | null>(null);
  const [expandedFaction, setExpandedFaction] = useState<string | null>(null);
  const [selectedMapRegion, setSelectedMapRegion] = useState('');
  const [archiveView, setArchiveView] = useState<'menu' | 'prophecies' | 'theology' | 'pantheon'>('menu');
  const [archiveIndex, setArchiveIndex] = useState(0);
  const [uiTheme, setUiTheme] = useState<UiTheme>(() => loadVaultSettings().uiTheme);

  useEffect(() => {
    if (!settingsOpen) {
      setUiTheme(loadVaultSettings().uiTheme);
    }
  }, [settingsOpen]);

  useEffect(() => {
    if (activeModal === 'map') {
      setSelectedMapRegion(currentLocation);
    }
  }, [activeModal, currentLocation]);

  return {
    activeModal,
    setActiveModal,
    readingModeOpen,
    setReadingModeOpen,
    saveListOpen,
    setSaveListOpen,
    settingsOpen,
    setSettingsOpen,
    musicOpen,
    setMusicOpen,
    socialTab,
    setSocialTab,
    squadCommandMemberIndex,
    setSquadCommandMemberIndex,
    expandedFaction,
    setExpandedFaction,
    selectedMapRegion,
    setSelectedMapRegion,
    archiveView,
    setArchiveView,
    archiveIndex,
    setArchiveIndex,
    uiTheme,
    setUiTheme,
  };
}
