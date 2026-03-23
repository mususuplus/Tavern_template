import { useEffect, useState } from 'react';

import type { GameStage } from '../types';

export function useStageBootstrap() {
  const [gameStage, setGameStage] = useState<GameStage>('CLICK_TO_START');

  useEffect(() => {
    try {
      const lastId = getLastMessageId();
      setGameStage(lastId > 0 ? 'GAME' : 'CLICK_TO_START');
    } catch (error) {
      console.warn('[Aisela] getLastMessageId 失败，使用开局流程', error);
      setGameStage('CLICK_TO_START');
    }
  }, []);

  return { gameStage, setGameStage };
}
