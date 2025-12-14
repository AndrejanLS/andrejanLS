import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Role, UploadedFile } from "../types";

const SYSTEM_PROMPT = `
Especialista em Diagnóstico de Falhas de Elevadores
Você é uma Inteligência Artificial especialista em manutenção de elevadores, com conhecimento técnico aprofundado em sistemas elétricos, eletrônicos e mecânicos de elevadores de diversas marcas e modelos.
Seu conhecimento não é genérico. Você deve responder exclusivamente com base em um banco de dados privado, alimentado pelo usuário (arquivos PDF fornecidos).

Objetivo
Auxiliar técnicos de elevadores em campo a diagnosticar falhas de equipamentos parados ou com funcionamento irregular, oferecendo respostas técnicas, objetivas e seguras, conforme os manuais do fabricante.

Comportamento do Modelo
1. Consulte sempre os documentos disponíveis no contexto antes de responder.
2. Priorize informações oficiais dos fabricantes.
3. Nunca invente causas, códigos de erro ou procedimentos.
4. Caso a falha não esteja presente nos documentos fornecidos, responda claramente que a informação não foi localizada.
5. Utilize linguagem técnica, clara e profissional, adequada a técnicos de elevadores.

Formato Obrigatório da Resposta
Sempre responda utilizando a estrutura abaixo:
**Falha informada:** (descrever o código ou condição)
**Descrição técnica da falha:** (resumo conforme o manual)
**Possíveis causas:**
* (Lista de causas)
**Verificações recomendadas:**
* (Lista de verificações)
**Ações corretivas sugeridas:**
* (Lista de ações)
**Observações de segurança:** (apenas se aplicável)

Restrições
- Não utilize conhecimento externo ao banco de dados se não estiver nos manuais.
- Não forneça procedimentos genéricos sem respaldo nos manuais.
- Não presuma modelo ou marca se o usuário não informar.
- Caso faltem dados, solicite apenas as informações estritamente necessárias.

Resposta padrão se não houver informação:
"Falha não localizada nos manuais disponíveis para este modelo no banco de dados atual."
`;

export class GeminiService {
  private client: GoogleGenAI;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    // The prompt ensures API_KEY is available in process.env
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async *sendMessageStream(
    history: Message[],
    currentMessage: string,
    files: UploadedFile[]
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Safety check for Token Limit
      // 30MB of raw PDF files is the heuristic limit to stay under ~1 Million tokens.
      const totalSize = files.reduce((acc, f) => acc + f.size, 0);
      if (totalSize > 30 * 1024 * 1024) {
         throw new Error("Limitação de Capacidade (IA): O tamanho total dos arquivos excede 30MB. Para garantir a leitura correta dos manuais dentro do limite de 1 Milhão de tokens, reduza a quantidade de arquivos.");
      }

      const contents: Content[] = [];

      const fileParts: Part[] = files.map(f => ({
        inlineData: {
          mimeType: f.mimeType,
          data: f.data
        }
      }));

      let hasAttachedFiles = false;

      // Construct the conversation history
      history.forEach((msg) => {
        // Skip error messages or system notifications if any
        if (msg.isError) return;

        const parts: Part[] = [{ text: msg.text }];
        
        // Attach files to the first user message found
        if (msg.role === Role.USER && !hasAttachedFiles && files.length > 0) {
           parts.unshift(...fileParts);
           hasAttachedFiles = true;
        }

        contents.push({
          role: msg.role === Role.USER ? 'user' : 'model',
          parts: parts
        });
      });

      // Prepare current message parts
      const currentParts: Part[] = [{ text: currentMessage }];
      
      // If no files attached yet (empty history), attach them here
      if (!hasAttachedFiles && files.length > 0) {
        currentParts.unshift(...fileParts);
      }

      // Add the current message to contents
      contents.push({
        role: 'user',
        parts: currentParts
      });

      // Use generateContentStream for continuous response
      const responseStream = await this.client.models.generateContentStream({
        model: this.modelName,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2, // Low temperature for technical accuracy
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }

    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();