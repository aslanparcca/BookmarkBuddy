// AI Model Mapping and Management System
import { getModelById, mapLegacyModel } from "../shared/ai-models";

export interface ModelConfig {
  geminiModelId: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

// Map frontend model IDs to actual Gemini model IDs
export const MODEL_MAPPING: Record<string, ModelConfig> = {
  // OpenAI Models (mapped to closest Gemini equivalents)
  'o3-mini': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192
  },
  'o3': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.7,
    maxTokens: 8192
  },
  'o4-mini': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.8,
    maxTokens: 8192
  },
  'o3-pro': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.9,
    maxTokens: 8192
  },
  'gpt-4.5': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.7,
    maxTokens: 8192
  },

  // Anthropic Models (mapped to Gemini equivalents)
  'claude-4-opus': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.8,
    maxTokens: 8192
  },
  'claude-4-sonnet': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.7,
    maxTokens: 8192
  },
  'claude-3.5-sonnet': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192
  },
  'claude-3-haiku': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.6,
    maxTokens: 4096
  },

  // Google AI / Gemini Models (direct mapping)
  'gemini-2.5-flash': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192
  },
  'gemini-ultra': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.8,
    maxTokens: 8192
  },
  'gemini-pro': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192
  },
  'gemini-nano': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.6,
    maxTokens: 4096
  },
  'gemma-2': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.7,
    maxTokens: 4096
  },

  // Perplexity Models (mapped to Gemini equivalents)
  'sonar-huge': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.8,
    maxTokens: 8192
  },
  'sonar-large': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192
  },
  'sonar-small': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.6,
    maxTokens: 4096
  },

  // Legacy model mappings for backward compatibility
  'gemini_2.5_flash': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192
  },
  'gemini_2.5_pro': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.8,
    maxTokens: 8192
  },
  'gemini_2.0_flash': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192
  },
  'gemini_1.5_flash': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.7,
    maxTokens: 8192
  },
  'gemini_1.5_pro': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192
  }
};

export function getGeminiModelConfig(modelId: string): ModelConfig {
  // First try direct mapping
  const config = MODEL_MAPPING[modelId];
  if (config) {
    return config;
  }

  // Try legacy mapping
  const mappedModel = mapLegacyModel(modelId);
  const mappedConfig = MODEL_MAPPING[mappedModel];
  if (mappedConfig) {
    return mappedConfig;
  }

  // Default fallback to latest Gemini model
  console.log(`Unknown model ID: ${modelId}, falling back to gemini-2.0-flash-exp`);
  return {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192
  };
}

export function getModelDisplayName(modelId: string): string {
  const model = getModelById(modelId);
  if (model) {
    return `${model.name} (${model.provider})`;
  }

  // Handle legacy model names
  const legacyNames: Record<string, string> = {
    'gemini_2.5_flash': 'Gemini 2.5 Flash',
    'gemini_2.5_pro': 'Gemini 2.5 Pro',
    'gemini_2.0_flash': 'Gemini 2.0 Flash',
    'gemini_1.5_flash': 'Gemini 1.5 Flash',
    'gemini_1.5_pro': 'Gemini 1.5 Pro'
  };

  return legacyNames[modelId] || modelId;
}

// Provider-specific API call functions (future expansion)
export interface AIProvider {
  name: string;
  generateContent: (prompt: string, config: any, apiKey: string) => Promise<string>;
}

// For now, all models use Gemini API, but this structure allows for future expansion
export function getProviderForModel(modelId: string): string {
  const model = getModelById(modelId);
  if (model) {
    return model.provider;
  }
  
  // All models currently use Gemini API
  return 'gemini';
}

export function logModelUsage(modelId: string, userId: string, tokensUsed: number = 0) {
  const displayName = getModelDisplayName(modelId);
  const config = getGeminiModelConfig(modelId);
  
  console.log(`Model Usage - User: ${userId}, Model: ${displayName}, Gemini Model: ${config.geminiModelId}, Tokens: ${tokensUsed}`);
}