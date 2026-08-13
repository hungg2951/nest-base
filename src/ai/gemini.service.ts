import { Injectable } from '@nestjs/common';
import { PromptTemplateService } from '../prompt-template/prompt-template.service.js';

export interface GeneratedProductContent {
  description: string;
  metaDescription: string;
  shortDescription: string;
}

@Injectable()
export class GeminiService {
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private readonly model = process.env.GEMINI_MODEL || 'gemini-flash-latest';

  constructor(private readonly promptTemplateService: PromptTemplateService) {}

  async generateProductContent(
    title: string,
    promptTemplateId?: string,
  ): Promise<GeneratedProductContent> {
    if (!this.apiKey) {
      const msg = 'Missing required environment variable: GEMINI_API_KEY';
      console.error(`[GeminiService] ${msg}`);
      throw new Error(msg);
    }

    const systemPrompt = promptTemplateId
      ? await this.promptTemplateService.getContent(promptTemplateId)
      : '';

    const instructionBlock = systemPrompt ? `${systemPrompt}\n\n---\n\n` : '';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const prompt = `${instructionBlock}Product Title: "${title}"

---

Product Title: "${title}"

Respond with a JSON object with exactly these 3 keys:
- "description": the Long Description (150-210 words, as simple HTML using only <p> tags, no other tags, no markdown).
- "shortDescription": the Short Description — the dynamic 60-90 word intro paragraph, followed by a blank line, followed by the 7 fixed bullet points EXACTLY as specified above (unchanged, one per line, each starting with "- ").
- "metaDescription": the Meta Description (max 160 characters).

Do not include a "Preview" section. Do not include any text, explanation, or analysis outside the JSON object.`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            description: { type: 'STRING' },
            metaDescription: { type: 'STRING' },
            shortDescription: { type: 'STRING' },
          },
          required: ['description', 'metaDescription', 'shortDescription'],
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[GeminiService] Gemini API request failed (HTTP ${response.status}): ${errorText}`,
        );
        throw new Error(
          `Gemini API request failed with HTTP ${response.status}: ${errorText || response.statusText}`,
        );
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.error(
          '[GeminiService] Unexpected Gemini response shape:',
          JSON.stringify(result),
        );
        throw new Error('Gemini API returned an unexpected response shape');
      }

      const parsed = JSON.parse(text);

      if (
        !parsed.description ||
        !parsed.metaDescription ||
        !parsed.shortDescription
      ) {
        console.error(
          '[GeminiService] Gemini response missing required fields:',
          text,
        );
        throw new Error('Gemini API response missing required fields');
      }

      return {
        description: parsed.description,
        metaDescription: parsed.metaDescription,
        shortDescription: parsed.shortDescription,
      };
    } catch (error: any) {
      console.error(
        `[GeminiService] generateProductContent error: ${error.message}`,
      );
      throw error;
    }
  }
}
