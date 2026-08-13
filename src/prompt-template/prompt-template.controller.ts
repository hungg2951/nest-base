// prompt-template.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PromptTemplateService } from './prompt-template.service.js';
import type {
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from './prompt-template.dto.js';

@Controller('prompt-templates')
export class PromptTemplateController {
  constructor(private readonly promptTemplateService: PromptTemplateService) {}

  @Get()
  async findAll() {
    return this.promptTemplateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.promptTemplateService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreatePromptTemplateDto) {
    return this.promptTemplateService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePromptTemplateDto) {
    return this.promptTemplateService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.promptTemplateService.remove(id);
  }
}
