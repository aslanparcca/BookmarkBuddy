import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAuthenticTextGenerationModels, AIModel } from "@/../../shared/ai-models-authentic";

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  title?: string;
  description?: string;
  compact?: boolean;
}

export default function AIModelSelector({ 
  selectedModel, 
  onModelChange, 
  title = "AI Model Seçimi",
  description = "Kullanmak istediğiniz AI modelini seçin",
  compact = false 
}: AIModelSelectorProps) {
  const aiModels = getAuthenticTextGenerationModels();
  
  const [selectedProvider, setSelectedProvider] = useState(() => {
    const model = aiModels.find((m: AIModel) => m.id === selectedModel);
    return model?.provider || 'OpenAI';
  });

  const providers = Array.from(new Set(aiModels.map((model: AIModel) => model.provider)));
  const availableModels = aiModels.filter((model: AIModel) => model.provider === selectedProvider);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const firstModel = aiModels.find((m: AIModel) => m.provider === provider);
    if (firstModel) {
      onModelChange(firstModel.id);
    }
  };

  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic (Claude)',
      'google': 'Google AI',
      'perplexity': 'Perplexity',
      'elevenlabs': 'ElevenLabs',
      'runware': 'Runware',
      'deepl': 'DeepL',
      'replicate': 'Replicate',
      'stability': 'Stability AI',
      'huggingface': 'Hugging Face'
    };
    return names[provider] || provider;
  };

  const getModelBadgeColor = (provider: string) => {
    const colors: Record<string, string> = {
      'openai': 'bg-green-100 text-green-800',
      'anthropic': 'bg-orange-100 text-orange-800',
      'google': 'bg-blue-100 text-blue-800',
      'perplexity': 'bg-purple-100 text-purple-800',
      'elevenlabs': 'bg-pink-100 text-pink-800',
      'runware': 'bg-yellow-100 text-yellow-800',
      'deepl': 'bg-cyan-100 text-cyan-800',
      'replicate': 'bg-indigo-100 text-indigo-800',
      'stability': 'bg-red-100 text-red-800',
      'huggingface': 'bg-gray-100 text-gray-800'
    };
    return colors[provider] || 'bg-gray-100 text-gray-800';
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ai-provider" className="text-sm font-medium text-slate-700">
              AI Sağlayıcısı
            </Label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sağlayıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {getProviderDisplayName(provider)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="ai-model" className="text-sm font-medium text-slate-700">
              Model
            </Label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Model seçin" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{model.name}</span>
                      <Badge className={`ml-2 text-xs ${getModelBadgeColor(model.provider)}`}>
                        {model.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedModel && (
          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border">
            {aiModels.find((m: AIModel) => m.id === selectedModel)?.description}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-slate-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ai-provider" className="text-sm font-medium text-slate-700">
            AI Sağlayıcısı
          </Label>
          <Select value={selectedProvider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sağlayıcı seçin" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                AI Sağlayıcıları
              </div>
              {providers.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {getProviderDisplayName(provider)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="ai-model" className="text-sm font-medium text-slate-700">
            Model
          </Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Model seçin" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-slate-500 truncate">
                        {model.description}
                      </span>
                    </div>
                    <Badge className={`ml-2 text-xs ${getModelBadgeColor(model.provider)}`}>
                      {model.category}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedModel && (
          <div className="p-3 bg-slate-50 rounded-md border">
            <div className="text-sm font-medium text-slate-700 mb-1">
              Seçili Model: {aiModels.find((m: AIModel) => m.id === selectedModel)?.name}
            </div>
            <div className="text-xs text-slate-500">
              {aiModels.find((m: AIModel) => m.id === selectedModel)?.description}
            </div>
            {aiModels.find((m: AIModel) => m.id === selectedModel)?.releaseDate && (
              <div className="text-xs text-slate-400 mt-1">
                Çıkış Tarihi: {aiModels.find((m: AIModel) => m.id === selectedModel)?.releaseDate}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}