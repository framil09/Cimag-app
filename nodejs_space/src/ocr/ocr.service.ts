import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly configService: ConfigService) {}

  async extractOdometerReading(imageBase64: string): Promise<{
    reading: number | null;
    confidence: string;
    rawText: string;
  }> {
    const apiKey = this.configService.get<string>('ABACUSAI_API_KEY');

    // Ensure base64 has proper data URI prefix
    let imageData = imageBase64;
    if (!imageData.startsWith('data:')) {
      imageData = `data:image/jpeg;base64,${imageData}`;
    }

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageData },
              },
              {
                type: 'text',
                text: `Analise esta imagem de um odômetro de veículo. Extraia a leitura numérica do hodômetro/odômetro.

Responda em formato JSON com a seguinte estrutura:
{
  "reading": <número extraído ou null se ilegível>,
  "confidence": "high" | "medium" | "low",
  "rawText": "<texto bruto identificado na imagem>"
}

Se não conseguir ler o odômetro, retorne reading como null e confidence como "low".
Responda apenas com o JSON, sem markdown ou formatação adicional.`,
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Erro na API LLM: ${response.status} - ${errorText}`);
      throw new Error(`Falha ao processar imagem com OCR: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      this.logger.error('Resposta vazia da API LLM');
      throw new Error('Resposta vazia do serviço de OCR');
    }

    try {
      const parsed = JSON.parse(content);
      this.logger.log(`OCR resultado: leitura=${parsed.reading}, confiança=${parsed.confidence}`);
      return {
        reading: parsed.reading !== null && parsed.reading !== undefined ? Number(parsed.reading) : null,
        confidence: parsed.confidence || 'low',
        rawText: parsed.rawText || '',
      };
    } catch {
      this.logger.error(`Falha ao parsear resposta JSON: ${content}`);
      return { reading: null, confidence: 'low', rawText: content };
    }
  }
}
