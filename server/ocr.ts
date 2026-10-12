import { GoogleGenAI } from '@google/genai';

export interface OCRResult {
  nome?: string;
  cpf?: string;
  validade?: string;
  isVencida: boolean;
  status: 'Aprovado_Auto' | 'Analise_Manual';
  rawText?: string;
  observacoes?: string;
}

export async function processCNHImage(base64Data: string, expectedNome?: string, expectedCpf?: string): Promise<OCRResult> {
  const currentDate = new Date('2026-10-10'); // Current system local date

  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  if (process.env.GEMINI_API_KEY && cleanBase64.length > 100) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `Analise esta imagem de CNH (Carteira Nacional de Habilitação do Brasil).
Extraia os seguintes campos estritamente em formato JSON:
{
  "nome": string (Nome completo do condutor),
  "cpf": string (CPF com ou sem pontuação),
  "validade": string (Data de validade no formato DD/MM/AAAA),
  "categoria": string (Ex: B, AB, etc.),
  "isVencida": boolean (Considere que a data atual de referência é 10/10/2026. Se a data de validade for anterior a 10/10/2026, é true. Se for igual ou posterior, é false)
}
Retorne somente o JSON válido.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64
                }
              }
            ]
          }
        ]
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const isVencida = Boolean(parsed.isVencida);
        return {
          nome: parsed.nome || expectedNome,
          cpf: parsed.cpf || expectedCpf,
          validade: parsed.validade,
          isVencida,
          status: isVencida ? 'Analise_Manual' : 'Aprovado_Auto',
          rawText: responseText,
          observacoes: isVencida ? 'CNH detectada como vencida (validade expirada)' : 'CNH válida e regular'
        };
      }
    } catch (e) {
      console.error('Gemini OCR error, proceeding with heuristic parser:', e);
    }
  }

  // Fallback: If image is provided or simulation-free manual entry
  // Awaiting manual review or valid auto
  return {
    nome: expectedNome || '',
    cpf: expectedCpf || '',
    validade: '',
    isVencida: false,
    status: 'Analise_Manual',
    rawText: 'Arquivo de CNH recebido no banco de dados para conferência manual ou processamento via Google Drive OCR.',
    observacoes: 'Submetido para conferência'
  };
}
