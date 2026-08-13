// prompt-template.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../database/postgres.client.js';
import type {
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from './prompt-template.dto.js';

@Injectable()
export class PromptTemplateService {
  async findAll(): Promise<any[]> {
    const result = await pool.query(
      `SELECT * FROM "prompt_templates" ORDER BY "created_at" DESC`,
    );
    return result.rows;
  }

  async findOne(id: string): Promise<any> {
    const result = await pool.query(
      `SELECT * FROM "prompt_templates" WHERE "id" = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Prompt template with id "${id}" not found`);
    }

    return result.rows[0];
  }

  /**
   * Lấy content thô để đưa vào GeminiService.
   * Ném lỗi rõ ràng nếu FE gửi id không tồn tại (tránh generate với prompt rỗng âm thầm).
   */
  async getContent(id: string): Promise<string> {
    const result = await pool.query(
      `SELECT "content" FROM "prompt_templates" WHERE "id" = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Prompt template with id "${id}" not found`);
    }

    return result.rows[0].content;
  }

  async create(dto: CreatePromptTemplateDto): Promise<any> {
    const result = await pool.query(
      `INSERT INTO "prompt_templates" ("name", "content")
       VALUES ($1, $2)
       RETURNING *`,
      [dto.name, dto.content],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdatePromptTemplateDto): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined) continue;
      fields.push(`"${key}" = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    fields.push(`"updated_at" = now()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE "prompt_templates"
       SET ${fields.join(', ')}
       WHERE "id" = $${paramIndex}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Prompt template with id "${id}" not found`);
    }

    return result.rows[0];
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    const result = await pool.query(
      `DELETE FROM "prompt_templates" WHERE "id" = $1 RETURNING "id"`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Prompt template with id "${id}" not found`);
    }

    return { id, deleted: true };
  }
}
