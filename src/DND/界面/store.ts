import { defineMvuDataStore } from '@util/mvu';
import { SchemaObject } from '../schema';

export const useDataStore = defineMvuDataStore(SchemaObject, {
  type: 'message',
  message_id: getCurrentMessageId(),
});
