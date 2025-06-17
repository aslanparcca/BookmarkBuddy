// AI Model Definitions and Configuration
// Updated with latest models as of January 2025

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: 'text' | 'image' | 'video' | 'audio' | 'multimodal';
  releaseDate: string;
  capabilities: string[];
  contextWindow?: number;
  isDefault?: boolean;
  isPro?: boolean;
}

export const AI_MODELS: Record<string, AIModel[]> = {
  openai: [
    {
      id: 'o3-mini',
      name: 'o3-mini',
      provider: 'openai',
      category: 'text',
      releaseDate: '2025-01-31',
      capabilities: ['text-generation', 'reasoning', 'coding'],
      contextWindow: 128000,
      isDefault: true
    },
    {
      id: 'o3',
      name: 'o3',
      provider: 'openai',
      category: 'multimodal',
      releaseDate: '2025-04-16',
      capabilities: ['text-generation', 'reasoning', 'vision', 'coding'],
      contextWindow: 200000
    },
    {
      id: 'o4-mini',
      name: 'o4-mini',
      provider: 'openai',
      category: 'multimodal',
      releaseDate: '2025-04-16',
      capabilities: ['text-generation', 'reasoning', 'vision', 'coding'],
      contextWindow: 128000
    },
    {
      id: 'o3-pro',
      name: 'o3-pro',
      provider: 'openai',
      category: 'multimodal',
      releaseDate: '2025-06-10',
      capabilities: ['text-generation', 'reasoning', 'vision', 'coding', 'complex-analysis'],
      contextWindow: 300000,
      isPro: true
    },
    {
      id: 'gpt-4.5',
      name: 'GPT-4.5',
      provider: 'openai',
      category: 'multimodal',
      releaseDate: '2025-01-01',
      capabilities: ['text-generation', 'vision', 'coding'],
      contextWindow: 128000
    },
    {
      id: 'sora',
      name: 'Sora',
      provider: 'openai',
      category: 'video',
      releaseDate: '2024-12-01',
      capabilities: ['video-generation', 'text-to-video']
    },
    {
      id: 'whisper-v3',
      name: 'Whisper v3',
      provider: 'openai',
      category: 'audio',
      releaseDate: '2024-11-01',
      capabilities: ['speech-to-text', 'transcription', 'translation']
    },
    {
      id: 'dall-e-4',
      name: 'DALL-E 4 (GPT Image 1)',
      provider: 'openai',
      category: 'image',
      releaseDate: '2025-01-01',
      capabilities: ['image-generation', 'text-to-image']
    }
  ],
  anthropic: [
    {
      id: 'claude-4-opus',
      name: 'Claude 4 Opus',
      provider: 'anthropic',
      category: 'multimodal',
      releaseDate: '2025-05-22',
      capabilities: ['text-generation', 'reasoning', 'vision', 'coding', 'analysis'],
      contextWindow: 200000,
      isPro: true
    },
    {
      id: 'claude-4-sonnet',
      name: 'Claude 4 Sonnet',
      provider: 'anthropic',
      category: 'multimodal',
      releaseDate: '2025-05-22',
      capabilities: ['text-generation', 'reasoning', 'vision', 'coding'],
      contextWindow: 200000,
      isDefault: true
    },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      category: 'multimodal',
      releaseDate: '2024-06-20',
      capabilities: ['text-generation', 'reasoning', 'vision', 'coding'],
      contextWindow: 200000
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      category: 'text',
      releaseDate: '2024-03-07',
      capabilities: ['text-generation', 'fast-responses'],
      contextWindow: 200000
    }
  ],
  gemini: [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      category: 'multimodal',
      releaseDate: '2024-12-01',
      capabilities: ['text-generation', 'vision', 'fast-responses'],
      contextWindow: 1000000,
      isDefault: true
    },
    {
      id: 'gemini-ultra',
      name: 'Gemini Ultra',
      provider: 'gemini',
      category: 'multimodal',
      releaseDate: '2023-12-01',
      capabilities: ['text-generation', 'reasoning', 'vision', 'coding'],
      contextWindow: 1000000,
      isPro: true
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'gemini',
      category: 'multimodal',
      releaseDate: '2023-12-06',
      capabilities: ['text-generation', 'vision', 'coding'],
      contextWindow: 1000000
    },
    {
      id: 'gemini-nano',
      name: 'Gemini Nano',
      provider: 'gemini',
      category: 'text',
      releaseDate: '2023-12-06',
      capabilities: ['text-generation', 'on-device', 'lightweight'],
      contextWindow: 32000
    },
    {
      id: 'gemma-2',
      name: 'Gemma 2',
      provider: 'gemini',
      category: 'text',
      releaseDate: '2024-06-01',
      capabilities: ['text-generation', 'open-source'],
      contextWindow: 128000
    },
    {
      id: 'veo',
      name: 'Veo',
      provider: 'gemini',
      category: 'video',
      releaseDate: '2024-05-14',
      capabilities: ['video-generation', 'text-to-video']
    }
  ],
  perplexity: [
    {
      id: 'sonar-huge',
      name: 'Sonar Huge',
      provider: 'perplexity',
      category: 'text',
      releaseDate: '2024-11-01',
      capabilities: ['search', 'real-time-info', 'reasoning'],
      contextWindow: 128000,
      isPro: true
    },
    {
      id: 'sonar-large',
      name: 'Sonar Large',
      provider: 'perplexity',
      category: 'text',
      releaseDate: '2024-09-01',
      capabilities: ['search', 'real-time-info'],
      contextWindow: 128000,
      isDefault: true
    },
    {
      id: 'sonar-small',
      name: 'Sonar Small',
      provider: 'perplexity',
      category: 'text',
      releaseDate: '2024-08-01',
      capabilities: ['search', 'real-time-info', 'fast-responses'],
      contextWindow: 64000
    }
  ],
  elevenlabs: [
    {
      id: 'eleven-v3-alpha',
      name: 'Eleven v3 (Alpha)',
      provider: 'elevenlabs',
      category: 'audio',
      releaseDate: '2025-06-08',
      capabilities: ['text-to-speech', 'voice-synthesis', 'multilingual'],
      isDefault: true
    },
    {
      id: 'ivc',
      name: 'Instant Voice Cloning (IVC)',
      provider: 'elevenlabs',
      category: 'audio',
      releaseDate: '2024-10-01',
      capabilities: ['voice-cloning', 'instant-cloning']
    },
    {
      id: 'pvc',
      name: 'Professional Voice Cloning (PVC)',
      provider: 'elevenlabs',
      category: 'audio',
      releaseDate: '2024-08-01',
      capabilities: ['voice-cloning', 'professional-quality'],
      isPro: true
    }
  ],
  runware: [
    {
      id: 'gen-4',
      name: 'Gen-4',
      provider: 'runware',
      category: 'video',
      releaseDate: '2025-03-31',
      capabilities: ['video-generation', 'text-to-video', 'high-quality'],
      isDefault: true
    },
    {
      id: 'gen-4-turbo',
      name: 'Gen-4 Turbo',
      provider: 'runware',
      category: 'video',
      releaseDate: '2025-04-01',
      capabilities: ['video-generation', 'text-to-video', 'fast-generation'],
      isPro: true
    },
    {
      id: 'gen-3-alpha',
      name: 'Gen-3 Alpha',
      provider: 'runware',
      category: 'video',
      releaseDate: '2024-12-01',
      capabilities: ['video-generation', 'text-to-video']
    }
  ],
  deepl: [
    {
      id: 'deepl-next-gen',
      name: 'Next-generation LLM',
      provider: 'deepl',
      category: 'text',
      releaseDate: '2024-11-01',
      capabilities: ['translation', 'advanced-context', 'enterprise'],
      isPro: true,
      isDefault: true
    },
    {
      id: 'deepl-classic',
      name: 'Classic Model',
      provider: 'deepl',
      category: 'text',
      releaseDate: '2020-01-01',
      capabilities: ['translation', 'standard-quality']
    }
  ],
  replicate: [
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'replicate',
      category: 'text',
      releaseDate: '2024-09-01',
      capabilities: ['text-generation', 'open-source'],
      isDefault: true
    },
    {
      id: 'flux-kontext-max',
      name: 'Flux Kontext Max',
      provider: 'replicate',
      category: 'image',
      releaseDate: '2024-11-01',
      capabilities: ['image-generation', 'high-context']
    },
    {
      id: 'flux-pro',
      name: 'Flux Pro',
      provider: 'replicate',
      category: 'image',
      releaseDate: '2024-10-01',
      capabilities: ['image-generation', 'professional-quality'],
      isPro: true
    },
    {
      id: 'imagen-4',
      name: 'Imagen 4',
      provider: 'replicate',
      category: 'image',
      releaseDate: '2024-12-01',
      capabilities: ['image-generation', 'photorealistic']
    },
    {
      id: 'wan-2.1',
      name: 'Wan 2.1',
      provider: 'replicate',
      category: 'multimodal',
      releaseDate: '2024-11-15',
      capabilities: ['multimodal', 'reasoning']
    }
  ],
  stability_ai: [
    {
      id: 'stable-diffusion-3.5-large',
      name: 'Stable Diffusion 3.5 Large',
      provider: 'stability_ai',
      category: 'image',
      releaseDate: '2024-10-29',
      capabilities: ['image-generation', 'high-quality', 'detailed'],
      isPro: true
    },
    {
      id: 'stable-diffusion-3.5-large-turbo',
      name: 'Stable Diffusion 3.5 Large Turbo',
      provider: 'stability_ai',
      category: 'image',
      releaseDate: '2024-10-29',
      capabilities: ['image-generation', 'fast-generation', 'high-quality'],
      isDefault: true
    },
    {
      id: 'stable-diffusion-3.5-medium',
      name: 'Stable Diffusion 3.5 Medium',
      provider: 'stability_ai',
      category: 'image',
      releaseDate: '2024-10-29',
      capabilities: ['image-generation', 'balanced-quality']
    }
  ],
  hugging_face: [
    {
      id: 'community-models',
      name: 'Community Models',
      provider: 'hugging_face',
      category: 'multimodal',
      releaseDate: '2024-01-01',
      capabilities: ['text-generation', 'image-generation', 'open-source', 'community-driven'],
      isDefault: true
    }
  ]
};

// Helper functions
export function getModelsByProvider(provider: string): AIModel[] {
  return AI_MODELS[provider] || [];
}

export function getModelById(modelId: string): AIModel | undefined {
  for (const models of Object.values(AI_MODELS)) {
    const model = models.find(m => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function getDefaultModelForProvider(provider: string): AIModel | undefined {
  const models = getModelsByProvider(provider);
  return models.find(m => m.isDefault) || models[0];
}

export function getTextGenerationModels(): AIModel[] {
  const textModels: AIModel[] = [];
  for (const models of Object.values(AI_MODELS)) {
    textModels.push(...models.filter(m => 
      m.category === 'text' || 
      (m.category === 'multimodal' && m.capabilities.includes('text-generation'))
    ));
  }
  return textModels;
}

export function getImageGenerationModels(): AIModel[] {
  const imageModels: AIModel[] = [];
  for (const models of Object.values(AI_MODELS)) {
    imageModels.push(...models.filter(m => 
      m.category === 'image' || 
      (m.category === 'multimodal' && m.capabilities.includes('image-generation'))
    ));
  }
  return imageModels;
}

// Model mapping for backward compatibility
export const MODEL_MAPPING: Record<string, string> = {
  'gemini-1.5-flash': 'gemini-2.5-flash',
  'gemini-1.5-pro': 'gemini-pro',
  'gpt-4': 'o3',
  'gpt-4-turbo': 'o4-mini',
  'claude-3-sonnet': 'claude-4-sonnet',
  'claude-3.5-sonnet': 'claude-4-sonnet'
};

export function mapLegacyModel(modelId: string): string {
  return MODEL_MAPPING[modelId] || modelId;
}