import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function VoiceReader() {
  const [audioText, setAudioText] = useState('');
  const [selectedModel, setSelectedModel] = useState('tts-1');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isLoading, setIsLoading] = useState(false);

  const voices = [
    {
      id: 'alloy',
      name: 'Alloy',
      image: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/alloy.jpeg',
      samples: {
        tr: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/alloy-tr.mp3',
        en: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/alloy-en.wav'
      }
    },
    {
      id: 'echo',
      name: 'Echo',
      image: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/echo.jpeg',
      samples: {
        tr: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/echo-tr.mp3',
        en: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/echo-en.wav'
      }
    },
    {
      id: 'fable',
      name: 'Fable',
      image: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/fable.jpeg',
      samples: {
        tr: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/fable-tr.mp3',
        en: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/fable-en.wav'
      }
    },
    {
      id: 'onyx',
      name: 'Onyx',
      image: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/onyx.jpeg',
      samples: {
        tr: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/onyx-tr.mp3',
        en: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/onyx-en.wav'
      }
    },
    {
      id: 'nova',
      name: 'Nova',
      image: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/nova.jpeg',
      samples: {
        tr: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/nova-tr.mp3',
        en: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/nova-en.wav'
      }
    },
    {
      id: 'shimmer',
      name: 'Shimmer',
      image: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/shimmer.jpeg',
      samples: {
        tr: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/shimmer-tr.mp3',
        en: 'https://contety1.fra1.cdn.digitaloceanspaces.com/web/ai-audio/shimmer-en.wav'
      }
    }
  ];

  const playSample = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
  };

  const handleSubmit = async () => {
    if (!audioText.trim()) return;
    
    setIsLoading(true);
    try {
      // Here you would implement the actual text-to-speech API call
      console.log('Generating audio with:', {
        text: audioText,
        model: selectedModel,
        voice: selectedVoice
      });
      
      // Placeholder for actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 py-3 px-6 flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-microphone text-blue-600"></i>
            <h5 className="text-lg font-medium text-slate-900 mb-0">Yeni Metin Seslendir</h5>
            <i className="fab fa-youtube text-xl text-slate-400 hover:text-red-600 cursor-pointer ml-2" title="Yardım Videosu"></i>
          </div>
          
          <Button variant="outline" size="sm" className="mt-2 md:mt-0">
            <i className="fas fa-info-circle mr-2"></i>
            Yardım
          </Button>
        </div>

        <div className="p-6 mt-4">
          <div className="space-y-6">
            {/* Text Input */}
            <div className="relative">
              <Label htmlFor="audio_text" className="flex items-center space-x-1">
                <span>Metin</span>
              </Label>
              <Textarea
                id="audio_text"
                placeholder="Lütfen seslendirmek istediğiniz metni yazınız. Normal kalite için 1 karakter = 1 kredi ve HD kalite için 1 karakter = 2 kredi şeklinde kredilendirme yapılmaktadır."
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                maxLength={2000}
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-blue-600 cursor-pointer">
                  <i className="fas fa-globe mr-1"></i>
                  Desteklenen diller
                </span>
                <span className="text-sm text-slate-500">
                  {audioText.length} / 2000
                </span>
              </div>
            </div>

            {/* Quality Selection */}
            <div>
              <Label htmlFor="audio_model">Kalite</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Lütfen bir model seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tts-1">
                    <div className="flex justify-between items-center w-full">
                      <span>Normal</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-2">
                        1 karakter = 1 kredi
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tts-1-hd">
                    <div className="flex justify-between items-center w-full">
                      <span>HD</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-2">
                        1 karakter = 2 kredi
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Selection */}
            <div>
              <Label className="text-base font-medium">Ses</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {voices.map((voice) => (
                  <div key={voice.id} className="relative">
                    <input
                      type="radio"
                      id={`voice-${voice.id}`}
                      name="voice"
                      value={voice.id}
                      checked={selectedVoice === voice.id}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`voice-${voice.id}`}
                      className={`block border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                        selectedVoice === voice.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={voice.image}
                            alt={voice.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h6 className="font-semibold text-slate-900 mb-3">{voice.name}</h6>
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.preventDefault();
                                playSample(voice.samples.tr);
                              }}
                            >
                              <i className="fas fa-play-circle mr-2"></i>
                              Türkçe
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.preventDefault();
                                playSample(voice.samples.en);
                              }}
                            >
                              <i className="fas fa-play-circle mr-2"></i>
                              İngilizce
                            </Button>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!audioText.trim() || isLoading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                <span>Seslendir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results will be displayed here */}
      <div id="audio-results" className="mt-6"></div>
    </div>
  );
}