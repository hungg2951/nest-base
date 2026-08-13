// prompt-template.table.ts
import { defineTable } from '../database/schema/define-table.js';

export const promptTemplateTable = defineTable({
  name: 'prompt_templates',
  columns: {
    id: { type: 'uuid', primary: true },
    name: { type: 'varchar', required: true },
    content: { type: 'text', required: true },
    created_at: { type: 'timestamp', default: 'now()' },
    updated_at: { type: 'timestamp', default: 'now()' },
  },
});
