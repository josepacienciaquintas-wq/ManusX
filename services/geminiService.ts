
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MessageType } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAssistantResponse = async (
  prompt: string, 
  history: { role: string; content: string }[],
  mode: MessageType = 'text'
) => {
  const ai = getAIClient();
  
  // Persona de ultra-inteligência e agência autônoma
  let systemInstruction = `Você é o Manus-X, uma inteligência artificial de nível GPT-4o/Gemini 3 Pro, projetada para ser um Agente Autônomo de Propósito Geral.
  Sua capacidade de raciocínio é profunda, lógica e altamente criativa.
  
  PRINCÍPIOS DE RESPOSTA:
  1. Raciocínio de Primeira Classe: Antes de responder, processe todas as variáveis do problema.
  2. Concisão e Relevância: Seja direto quando necessário, mas exaustivo quando a complexidade exigir.
  3. Formatação Profissional: Utilize Markdown avançado, tabelas, diagramas e blocos de código com destaque.
  4. Atitude Proativa: Identifique falhas nas solicitações do usuário e sugira melhorias.`;

  if (mode === 'code') {
    systemInstruction += `\nMODO AGENTE DE ENGENHARIA DE SOFTWARE:
    - Escreva código pronto para produção (clean code, padrões SOLID).
    - Inclua documentação JSDoc/Docstrings.
    - Considere segurança, escalabilidade e performance.`;
  } else if (mode === 'search') {
    systemInstruction += `\nMODO ANALISTA DE PESQUISA AVANÇADA:
    - Cruza dados de múltiplas fontes.
    - Identifica tendências e fornece insights baseados em fatos recentes.
    - Sempre cite as fontes de forma clara.`;
  } else if (mode === 'app') {
    systemInstruction += `\nMODO ARQUITETO DE SISTEMAS (CAPACIDADE TOTAL MANUS AI):
    - Planeje sistemas full-stack (Frontend, Backend, Banco de Dados).
    - Forneça estruturas de arquivos claras e comandos de terminal para configuração.
    - Explique o fluxo de dados entre componentes.
    - Aja como um Lead Engineer orientando um projeto crítico.`;
  }

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      // Budget de pensamento alto para garantir qualidade superior de raciocínio (Chain of Thought)
      thinkingConfig: { thinkingBudget: 24000 } 
    }
  });

  const response = await chat.sendMessage({ message: prompt });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Fonte',
    uri: chunk.web?.uri || '#'
  })) || [];

  return {
    text: response.text,
    sources
  };
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', // Upgrade para o modelo Pro de imagem para maior inteligência visual
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      },
      tools: [{googleSearch: {}}]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Falha ao gerar imagem de alta qualidade");
};

export const generateVideo = async (prompt: string, aspectRatio: string = "16:9") => {
  const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
  if (!hasKey) {
    await (window as any).aistudio?.openSelectKey();
  }

  const ai = getAIClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p', // Upgrade para 1080p
      aspectRatio: aspectRatio as any
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};
