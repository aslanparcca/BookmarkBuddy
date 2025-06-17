// Authentic AI Model Mapping and Management System
import { getAuthenticModelById, mapAuthenticLegacyModel } from "../shared/ai-models-authentic";

export interface ModelConfig {
  geminiModelId: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  description?: string;
}

// Map authentic frontend model IDs to actual Gemini API model IDs
export const AUTHENTIC_MODEL_MAPPING: Record<string, ModelConfig> = {
  // OpenAI Models (mapped to closest available Gemini models)
  'o3-mini': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Fast reasoning model for coding and logic tasks'
  },
  'o3': {
    geminiModelId: 'gemini-exp-1206', 
    temperature: 0.75,
    maxTokens: 8192,
    description: 'Mid-level reasoning for mathematics and scientific analysis'
  },
  'o4-mini': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.8,
    maxTokens: 8192,
    description: 'Optimized performance with enhanced reasoning'
  },
  'o3-pro': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.9,
    maxTokens: 8192,
    description: 'Highest reliability for complex tasks with web search'
  },
  'gpt-4o': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Multimodal capabilities with audio and image processing'
  },
  'gpt-4o-mini': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.6,
    maxTokens: 4096,
    description: 'Cost-performance balanced multimodal model'
  },
  'gpt-4.5': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.8,
    maxTokens: 8192,
    description: 'Largest general-purpose LLM with advanced pattern recognition'
  },
  'gpt-4.1': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Coding and long-context processing specialist'
  },

  // Anthropic Models (mapped to Gemini equivalents)
  'claude-4-opus': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.85,
    maxTokens: 8192,
    description: 'World\'s most powerful coding model for complex projects'
  },
  'claude-4-sonnet': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Balanced efficiency for code review and content generation'
  },
  'claude-3.5-sonnet': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Speed and accuracy balance'
  },
  'claude-3-haiku': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.6,
    maxTokens: 4096,
    description: 'Fast and economical for simple tasks'
  },

  // Google AI / Gemini Models (direct authentic mapping)
  'gemini-2.0-flash': {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Next-gen multimodal with real-time audio and video streaming'
  },
  'gemini-2.5-flash': {
    geminiModelId: 'gemini-2.0-flash-exp', // Use available model until 2.5 is released
    temperature: 0.75,
    maxTokens: 8192,
    description: 'Price-performance balance with "thinking" feature'
  },
  'gemini-2.5-pro': {
    geminiModelId: 'gemini-exp-1206', // Use experimental until 2.5 Pro is available
    temperature: 0.8,
    maxTokens: 8192,
    description: 'Most advanced reasoning model for coding and logical thinking'
  },
  'gemini-1.5-pro': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Long context processing and advanced reasoning'
  },
  'gemini-1.5-flash': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Fast and efficient multimodal processing'
  },
  'gemini-1.0-ultra': {
    geminiModelId: 'gemini-1.5-pro-002', // Use 1.5 Pro as closest available
    temperature: 0.8,
    maxTokens: 8192,
    description: 'Complex problems and high accuracy multimodal processing'
  },
  'gemini-1.0-pro': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Cloud-based general use with coding optimization'
  },
  'gemini-1.0-nano': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.6,
    maxTokens: 4096,
    description: 'On-device mobile optimization with low resource consumption'
  },

  // Perplexity Models (mapped to Gemini equivalents)
  'perplexity-default': {
    geminiModelId: 'gemini-1.5-flash-002',
    temperature: 0.6,
    maxTokens: 4096,
    description: 'Fast web search optimized responses'
  },
  'sonar': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'LLaMA 3.3 based with web integration'
  },
  'sonar-pro': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.8,
    maxTokens: 8192,
    description: 'Deep research with detailed source-rich answers'
  },
  'sonar-reasoning': {
    geminiModelId: 'gemini-1.5-pro-002',
    temperature: 0.75,
    maxTokens: 8192,
    description: 'Fast logical inference and planning'
  },
  'sonar-reasoning-pro': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.8,
    maxTokens: 8192,
    description: 'Advanced multi-step reasoning and web analysis'
  },
  'sonar-deep-research': {
    geminiModelId: 'gemini-exp-1206',
    temperature: 0.85,
    maxTokens: 8192,
    description: 'Deep data collection and reporting for focused topics'
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
  // First try direct mapping with authentic models
  const config = AUTHENTIC_MODEL_MAPPING[modelId];
  if (config) {
    return config;
  }

  // Try legacy mapping
  const mappedModel = mapAuthenticLegacyModel(modelId);
  const mappedConfig = AUTHENTIC_MODEL_MAPPING[mappedModel];
  if (mappedConfig) {
    return mappedConfig;
  }

  // Default fallback to latest Gemini model
  console.log(`Unknown model ID: ${modelId}, falling back to gemini-2.0-flash-exp`);
  return {
    geminiModelId: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192,
    description: 'Default fallback model'
  };
}

export function getModelDisplayName(modelId: string): string {
  const model = getAuthenticModelById(modelId);
  if (model) {
    return `${model.name} (${model.provider})`;
  }

  // Handle legacy model names and direct mappings
  const displayNames: Record<string, string> = {
    'gemini_2.5_flash': 'Gemini 2.5 Flash',
    'gemini_2.5_pro': 'Gemini 2.5 Pro', 
    'gemini_2.0_flash': 'Gemini 2.0 Flash',
    'gemini_1.5_flash': 'Gemini 1.5 Flash',
    'gemini_1.5_pro': 'Gemini 1.5 Pro',
    'o3-mini': 'o3-mini (OpenAI)',
    'o3': 'o3 (OpenAI)',
    'o4-mini': 'o4-mini (OpenAI)',
    'o3-pro': 'o3-pro (OpenAI)',
    'claude-4-opus': 'Claude Opus 4 (Anthropic)',
    'claude-4-sonnet': 'Claude Sonnet 4 (Anthropic)',
    'sonar-pro': 'Sonar Pro (Perplexity)',
    'sonar-reasoning-pro': 'Sonar Reasoning Pro (Perplexity)'
  };

  return displayNames[modelId] || modelId;
}

// Provider-specific API call functions (future expansion)
export interface AIProvider {
  name: string;
  generateContent: (prompt: string, config: any, apiKey: string) => Promise<string>;
}

// For now, all models use Gemini API, but this structure allows for future expansion
export function getProviderForModel(modelId: string): string {
  const model = getAuthenticModelById(modelId);
  if (model) {
    return model.provider;
  }
  
  // All models currently use Gemini API
  return 'gemini';
}

export function logModelUsage(modelId: string, userId: string, tokensUsed: number = 0) {
  const displayName = getModelDisplayName(modelId);
  const config = getGeminiModelConfig(modelId);
  
  console.log(`Model Usage - User: ${userId}, Model: ${displayName}, Gemini Model: ${config.geminiModelId}, Tokens: ${tokensUsed}, Description: ${config.description}`);
}