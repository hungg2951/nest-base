import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service.js';
import { PromptTemplateModule } from '../prompt-template/prompt-template.module.js';

@Module({
  imports: [PromptTemplateModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class AiModule {}
