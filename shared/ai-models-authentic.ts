// Authentic AI Model Definitions Based on Official Provider Documentation
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
  description: string;
}

export const AUTHENTIC_AI_MODELS: Record<string, AIModel[]> = {
  openai: [
    {
      id: 'o3-mini',
      name: 'o3-mini',
      provider: 'OpenAI',
      category: 'text',
      releaseDate: '2025-01-31',
      capabilities: ['reasoning', 'coding', 'fast-responses'],
      contextWindow: 128000,
      isDefault: true,
      description: 'Küçük reasoning modeli; daha hızlı yanıtlar verir, kodlama ve mantık içeren işlemler için hafif kullanım'
    },
    {
      id: 'o3',
      name: 'o3',
      provider: 'OpenAI',
      category: 'multimodal',
      releaseDate: '2025-04-16',
      capabilities: ['reasoning', 'mathematics', 'scientific-analysis', 'image-processing', 'file-processing'],
      contextWindow: 128000,
      description: 'Orta seviye reasoning; matematik, bilimsel analiz, görsel ve dosya işleme için güçlü ve esnek'
    },
    {
      id: 'o4-mini',
      name: 'o4-mini',
      provider: 'OpenAI',
      category: 'text',
      releaseDate: '2025-04-16',
      capabilities: ['advanced-reasoning', 'optimization', 'fast-performance'],
      contextWindow: 128000,
      description: 'o3\'ün daha optimize edilmiş, daha güçlü ve daha iyi performanslı versiyonu; hızlı ve güçlü reasoning'
    },
    {
      id: 'o3-pro',
      name: 'o3-pro',
      provider: 'OpenAI',
      category: 'multimodal',
      releaseDate: '2025-06-10',
      capabilities: ['web-search', 'file-analysis', 'image-analysis', 'python-execution', 'long-thinking'],
      contextWindow: 200000,
      isPro: true,
      description: 'En yüksek güvenilirlik isteyen görevler için; web arama, dosya/görsel analiz, Python kodu çalıştırma, uzun düşünme süreçleri'
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      category: 'multimodal',
      releaseDate: '2024-05-13',
      capabilities: ['text-generation', 'audio-input-output', 'image-input-output', 'live-translation'],
      contextWindow: 128000,
      description: '"Omni" multimodal model; metin, ses ve görsel girdi–çıktı; canlı çeviri, resim ve ses üretimi'
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      provider: 'OpenAI',
      category: 'multimodal',
      releaseDate: '2024-07-18',
      capabilities: ['cost-performance-balance', 'multimodal-processing'],
      contextWindow: 128000,
      description: 'GPT-4o\'nun hafifletilmiş versiyonu; maliyet/performans dengesi için ideal'
    },
    {
      id: 'gpt-image-1',
      name: 'GPT Image 1',
      provider: 'OpenAI',
      category: 'image',
      releaseDate: '2025-03-25',
      capabilities: ['fast-image-generation', 'high-quality-visuals'],
      contextWindow: 8192,
      description: 'DALL·E 3 yerine geçen resim üretim modeli; hızlı, yüksek kaliteli görsel üretimi'
    },
    {
      id: 'gpt-4.5',
      name: 'GPT-4.5 (Orion)',
      provider: 'OpenAI',
      category: 'text',
      releaseDate: '2025-02-27',
      capabilities: ['advanced-pattern-recognition', 'creative-text-generation'],
      contextWindow: 200000,
      description: 'En büyük genel amaçlı LLM; gelişmiş pattern tanıma ve yaratıcı metin üretimi'
    },
    {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      provider: 'OpenAI',
      category: 'text',
      releaseDate: '2025-04-14',
      capabilities: ['coding', 'logical-analysis', 'long-context-processing'],
      contextWindow: 200000,
      description: 'Kodlama, mantıksal çözümleme ve uzun bağlam için güçlü; mini/nano versiyonları daha hızlı ve ekonomik'
    },
    {
      id: 'whisper-large-v3',
      name: 'Whisper Large V3',
      provider: 'OpenAI',
      category: 'audio',
      releaseDate: '2023-11-01',
      capabilities: ['speech-recognition', 'transcription', 'multi-language', 'accent-recognition'],
      contextWindow: 8192,
      description: 'Çok dilli konuşma tanıma ve transkripsiyon; çeşitli aksanlarda güçlü performans'
    },
    {
      id: 'codex-o3',
      name: 'Codex (o3-tabanlı)',
      provider: 'OpenAI',
      category: 'text',
      releaseDate: '2025-05-01',
      capabilities: ['code-generation', 'natural-language-to-code', 'programming-assistant'],
      contextWindow: 128000,
      description: 'Kodlama asistanı; doğal dil ifadelerini Python gibi kodlara dönüştürmede güçlü'
    }
  ],

  anthropic: [
    {
      id: 'claude-4-opus',
      name: 'Claude Opus 4',
      provider: 'Anthropic',
      category: 'text',
      releaseDate: '2025-05-22',
      capabilities: ['advanced-coding', 'multi-step-projects', 'research', 'long-form-content', 'agentic-tasks', 'extended-thinking', 'tool-use'],
      contextWindow: 200000,
      isPro: true,
      description: 'Dünyanın en güçlü kodlama modeli: uzun süreli, çok adımlı yazılım projelerini bağımsız yürütebilir. Karmaşık araştırma, uzun formlu içerik üretimi, ileri düzey akıl yürütme ve AI ajan görevlerinde kullanılabilir'
    },
    {
      id: 'claude-4-sonnet',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      category: 'multimodal',
      releaseDate: '2025-05-22',
      capabilities: ['balanced-performance', 'code-review', 'bug-fixing', 'customer-support', 'data-analysis', 'content-generation', 'image-analysis', 'extended-thinking'],
      contextWindow: 200000,
      isDefault: true,
      description: 'Dengeli ve verimli; yüksek hız ve uygun maliyet dengesi. Kod inceleme, hata düzeltme, müşteri destek ajanları, veri analizi ve içerik üretimi için ideal'
    },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      category: 'text',
      releaseDate: '2024-06-20',
      capabilities: ['text-generation', 'coding', 'analysis', 'reasoning'],
      contextWindow: 200000,
      description: 'Denge: hız, doğruluk ve dil becerilerinde yüksek performans'
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      category: 'text',
      releaseDate: '2024-03-07',
      capabilities: ['fast-responses', 'cost-efficient', 'simple-tasks'],
      contextWindow: 200000,
      description: 'Hızlı ve ekonomik; basit görevler için optimize edilmiş hafif model'
    }
  ],

  google: [
    {
      id: 'gemini-1.0-nano',
      name: 'Gemini 1.0 Nano',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2023-12-06',
      capabilities: ['on-device', 'mobile-optimization', 'low-resource', 'text-processing', 'image-processing', 'audio-processing'],
      contextWindow: 32000,
      description: 'On-device mobil kullanım: düşük kaynak tüketimiyle metin, görsel ve ses işleme'
    },
    {
      id: 'gemini-1.0-pro',
      name: 'Gemini 1.0 Pro',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2023-12-06',
      capabilities: ['cloud-based', 'coding', 'text-generation', 'multimodal-tasks'],
      contextWindow: 128000,
      description: 'Bulut tabanlı, geniş kullanım; kodlama, metin üretimi, multimodal görevler için optimize edilmiş'
    },
    {
      id: 'gemini-1.0-ultra',
      name: 'Gemini 1.0 Ultra',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2023-12-06',
      capabilities: ['complex-problems', 'high-accuracy', 'multimodal-processing', 'advanced-reasoning'],
      contextWindow: 200000,
      isPro: true,
      description: 'En gelişmiş model (Ultra); karmaşık problemler, yüksek doğruluk ve çoklu modalite işleme için tasarlandı'
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2024-02-15',
      capabilities: ['fast-processing', 'efficient', 'multimodal-improvements', 'high-speed'],
      contextWindow: 1000000,
      description: 'Daha hızlı ve verimli flash modeli; multimodal yeteneklerde gelişme ve daha yüksek hız'
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2024-02-15',
      capabilities: ['long-context', 'coding', 'logical-reasoning', 'high-token-limit'],
      contextWindow: 2000000,
      description: 'Pro seviyesinde gelişmiş versiyon; uzun bağlam, kodlama, mantıksal çözümleme ve daha yüksek token limiti'
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2024-12-12',
      capabilities: ['real-time-audio', 'video-streaming', 'multimodal-output', 'text-audio-image-generation'],
      contextWindow: 1000000,
      isDefault: true,
      description: 'Next-gen Flash: gerçek zamanlı ses, video akışı, multimodal çıkış (metin+ses+görsel)'
    },
    {
      id: 'gemini-2.0-flash-lite',
      name: 'Gemini 2.0 Flash-Lite',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2024-12-12',
      capabilities: ['cost-efficient', 'low-latency', 'multimodal-processing'],
      contextWindow: 500000,
      description: 'Aynı multimodal yapı, daha uygun maliyet ve düşük gecikmeli kullanım'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash (Preview)',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2025-03-25',
      capabilities: ['price-performance-balance', 'thinking-feature', 'enhanced-reasoning'],
      contextWindow: 1000000,
      description: 'Fiyat-performans dengesi: "thinking" özelliğiyle gelişmiş akıl yürütme'
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro (Preview)',
      provider: 'Google',
      category: 'multimodal',
      releaseDate: '2025-03-25',
      capabilities: ['advanced-reasoning', 'coding', 'logical-thinking', 'audio-generation', 'image-generation'],
      contextWindow: 2000000,
      isPro: true,
      description: 'En gelişmiş reasoning modeli: kodlama, mantıksal düşünme, ses/görüntü üretiminde en üst seviye'
    }
  ],

  perplexity: [
    {
      id: 'perplexity-default',
      name: 'Default (Perplexity Default)',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2024-01-01',
      capabilities: ['web-search', 'fast-responses', 'optimized-search'],
      contextWindow: 128000,
      isDefault: true,
      description: 'Hızlı ve doğru web taraması için optimize edilmiş, hızlı yanıt sağlayan temel model'
    },
    {
      id: 'gpt-4-omni-perplexity',
      name: 'GPT-4 Omni',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-01-01',
      capabilities: ['advanced-reasoning', 'nlp', 'academic-tasks', 'professional-tasks'],
      contextWindow: 128000,
      description: 'Güçlü reasoning ve NLP; akademik/profesyonel görevlerde çok yönlü kullanım'
    },
    {
      id: 'claude-3.5-sonnet-perplexity',
      name: 'Claude 3.5 Sonnet & Haiku',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2024-06-20',
      capabilities: ['balanced-performance', 'speed', 'accuracy', 'language-skills'],
      contextWindow: 200000,
      description: 'Denge: hız, doğruluk ve dil becerilerinde yüksek performans'
    },
    {
      id: 'sonar',
      name: 'Sonar',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-02-11',
      capabilities: ['llama-3.3-based', 'fast-responses', 'accuracy-focused', 'web-integration'],
      contextWindow: 128000,
      description: 'LLaMA 3.3 tabanlı, hızlı yanıt ve doğruluk odaklı; web taramasıyla entegre'
    },
    {
      id: 'sonar-pro',
      name: 'Sonar Pro',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-02-01',
      capabilities: ['deep-research', 'wide-context', 'detailed-answers', 'source-rich'],
      contextWindow: 200000,
      isPro: true,
      description: 'Derin araştırma, geniş bağlam, bol kaynaklı detaylı cevaplar üretir'
    },
    {
      id: 'sonar-reasoning',
      name: 'Sonar Reasoning',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-02-01',
      capabilities: ['planning', 'logical-inference', 'fast-reasoning', 'output-focused'],
      contextWindow: 128000,
      description: 'Planlama ve mantıksal çıkarımlarda hızlı ve çıkış odaklı'
    },
    {
      id: 'sonar-reasoning-pro',
      name: 'Sonar Reasoning Pro',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-02-01',
      capabilities: ['advanced-reasoning', 'multi-step-analysis', 'web-based-reasoning'],
      contextWindow: 200000,
      isPro: true,
      description: 'Gelişmiş reasoning; çok adımlı analizler ve web üzerine çalışır'
    },
    {
      id: 'sonar-deep-research',
      name: 'Sonar Deep Research',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-02-01',
      capabilities: ['focused-research', 'deep-data-collection', 'reporting'],
      contextWindow: 200000,
      description: 'Dar konu araştırmalarında derin veri toplama ve raporlama yeteneği'
    },
    {
      id: 'r1-1776',
      name: 'R1 1776',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-02-01',
      capabilities: ['deepseek-r1-based', 'unbiased', 'accurate-information'],
      contextWindow: 128000,
      description: 'DerinSeek R1 tabanlı; tarafsız, doğru bilgi sağlama odaklı'
    },
    {
      id: 'grok-2',
      name: 'Grok-2',
      provider: 'Perplexity',
      category: 'text',
      releaseDate: '2025-01-01',
      capabilities: ['mathematics', 'science', 'coding', 'reasoning'],
      contextWindow: 128000,
      description: 'xAI tarafından; matematik, bilim ve kodlama odaklı reasoning modeli'
    }
  ]
};

// Provider-specific model categories
export const MODEL_CATEGORIES = {
  openai: {
    reasoning: ['o3-mini', 'o3', 'o4-mini', 'o3-pro'],
    multimodal: ['gpt-4o', 'gpt-4o-mini', 'o3', 'o3-pro'],
    coding: ['gpt-4.1', 'codex-o3', 'o3-mini', 'o3'],
    creative: ['gpt-4.5', 'gpt-image-1'],
    audio: ['whisper-large-v3']
  },
  anthropic: {
    coding: ['claude-4-opus'],
    balanced: ['claude-4-sonnet', 'claude-3.5-sonnet'],
    efficient: ['claude-3-haiku']
  },
  google: {
    mobile: ['gemini-1.0-nano'],
    standard: ['gemini-1.0-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
    advanced: ['gemini-1.0-ultra', 'gemini-1.5-pro', 'gemini-2.5-pro'],
    preview: ['gemini-2.5-flash', 'gemini-2.5-pro']
  },
  perplexity: {
    search: ['perplexity-default', 'sonar'],
    research: ['sonar-pro', 'sonar-deep-research'],
    reasoning: ['sonar-reasoning', 'sonar-reasoning-pro'],
    specialized: ['r1-1776', 'grok-2']
  }
};

// Utility functions for authentic model handling
export function getAuthenticModelById(modelId: string): AIModel | undefined {
  for (const provider of Object.values(AUTHENTIC_AI_MODELS)) {
    const model = provider.find(m => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function getAuthenticModelsByProvider(provider: string): AIModel[] {
  return AUTHENTIC_AI_MODELS[provider.toLowerCase()] || [];
}

export function getAuthenticDefaultModelForProvider(provider: string): AIModel | undefined {
  const models = getAuthenticModelsByProvider(provider);
  return models.find(m => m.isDefault) || models[0];
}

export function getAuthenticTextGenerationModels(): AIModel[] {
  const allModels: AIModel[] = [];
  Object.values(AUTHENTIC_AI_MODELS).forEach(providerModels => {
    allModels.push(...providerModels.filter(m => m.category === 'text' || m.category === 'multimodal'));
  });
  return allModels;
}

export function getAuthenticImageGenerationModels(): AIModel[] {
  const allModels: AIModel[] = [];
  Object.values(AUTHENTIC_AI_MODELS).forEach(providerModels => {
    allModels.push(...providerModels.filter(m => m.category === 'image'));
  });
  return allModels;
}

// Legacy model mapping for backward compatibility
export const AUTHENTIC_MODEL_MAPPING: Record<string, string> = {
  // Legacy Gemini mappings
  'gemini_2.5_flash': 'gemini-2.5-flash',
  'gemini_2.5_pro': 'gemini-2.5-pro',
  'gemini_2.0_flash': 'gemini-2.0-flash',
  'gemini_1.5_flash': 'gemini-1.5-flash',
  'gemini_1.5_pro': 'gemini-1.5-pro',
  
  // Direct mappings (keep existing IDs)
  'o3-mini': 'o3-mini',
  'o3': 'o3',
  'o4-mini': 'o4-mini',
  'o3-pro': 'o3-pro',
  'claude-4-opus': 'claude-4-opus',
  'claude-4-sonnet': 'claude-4-sonnet',
  'sonar-huge': 'sonar-pro',
  'sonar-large': 'sonar',
  'sonar-small': 'perplexity-default'
};

export function mapAuthenticLegacyModel(modelId: string): string {
  return AUTHENTIC_MODEL_MAPPING[modelId] || modelId;
}