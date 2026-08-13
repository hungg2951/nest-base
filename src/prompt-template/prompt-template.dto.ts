// prompt-template.dto.ts
export interface CreatePromptTemplateDto {
  name: string;
  content: string;
}

export interface UpdatePromptTemplateDto {
  name?: string;
  content?: string;
}
