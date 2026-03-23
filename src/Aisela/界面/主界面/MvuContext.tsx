import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Schema, type SchemaType } from '../../schema';
import { AISELA_ASSISTANT_READY } from './utils/messageParser';

/** 始终读写最新楼层的 stat_data，使当前页正文与变量展示一致 */
function getVariableOption() {
  return { type: 'message' as const, message_id: getLastMessageId() };
}

function readMvuData(): SchemaType {
  const raw = _.get(getVariables(getVariableOption()), 'stat_data', {});
  const result = Schema.safeParse(raw);
  return result.success ? result.data : Schema.parse({});
}

export const MvuContext = createContext<{
  data: SchemaType;
  setData: (updater: (prev: SchemaType) => SchemaType) => void;
} | null>(null);

export function MvuProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<SchemaType>(readMvuData);

  const setData = useCallback((updater: (prev: SchemaType) => SchemaType) => {
    setDataState(prev => {
      const next = updater(prev);
      const parsed = Schema.safeParse(next);
      if (!parsed.success) return prev;
      updateVariablesWith(
        variables => _.set(variables, 'stat_data', klona(parsed.data)),
        getVariableOption(),
      );
      return parsed.data;
    });
  }, []);

  useEffect(() => {
    const onAssistantReady = () => setDataState(readMvuData());
    window.addEventListener(AISELA_ASSISTANT_READY, onAssistantReady);
    return () => window.removeEventListener(AISELA_ASSISTANT_READY, onAssistantReady);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const next = readMvuData();
      setDataState(prev => (_.isEqual(prev, next) ? prev : next));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <MvuContext.Provider value={{ data, setData }}>
      {children}
    </MvuContext.Provider>
  );
}

export function useMvu() {
  const ctx = useContext(MvuContext);
  if (!ctx) throw new Error('useMvu must be used within MvuProvider');
  return ctx;
}
