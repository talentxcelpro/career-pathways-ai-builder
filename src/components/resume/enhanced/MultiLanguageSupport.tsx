import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Languages, 
  Download, 
  Sparkles,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface MultiLanguageSupportProps {
  resumeData: any;
  onLanguageChange?: (language: string, translatedData: any) => void;
}

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' }
];

export const MultiLanguageSupport: React.FC<MultiLanguageSupportProps> = ({
  resumeData,
  onLanguageChange
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translationProgress, setTranslationProgress] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const { invokeAITool } = useAIService();

  const handleTranslate = async (targetLanguage: string) => {
    if (!resumeData?.sections?.length) {
      toast.error('No resume content to translate');
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await invokeAITool({
        toolSlug: 'resume-translator',
        inputData: {
          resumeContent: resumeData,
          targetLanguage,
          preserveFormatting: true,
          culturalAdaptation: true
        },
        category: 'translation'
      });

      clearInterval(progressInterval);
      setTranslationProgress(100);

      if (result.success) {
        const translatedData = result.data;
        setTranslations(prev => ({
          ...prev,
          [targetLanguage]: translatedData
        }));
        
        onLanguageChange?.(targetLanguage, translatedData);
        toast.success(`Resume translated to ${supportedLanguages.find(l => l.code === targetLanguage)?.name}`);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
      setTimeout(() => setTranslationProgress(0), 1000);
    }
  };

  const getLanguageSpecificFormatting = (languageCode: string) => {
    const formatTips: Record<string, string[]> = {
      'de': [
        'Include detailed education sections',
        'List languages with proficiency levels',
        'Use formal tone throughout'
      ],
      'fr': [
        'Emphasize international experience',
        'Include language certifications',
        'Follow French CV formatting standards'
      ],
      'ja': [
        'Include photo in header',
        'List skills in order of proficiency',
        'Use respectful language forms'
      ],
      'zh': [
        'Include educational achievements',
        'Emphasize team collaboration',
        'List certifications prominently'
      ],
      'ar': [
        'Right-to-left text formatting',
        'Include family status if relevant',
        'Emphasize educational credentials'
      ]
    };

    return formatTips[languageCode] || ['Standard international formatting applies'];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Multi-Language Support
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Translate Resume To:
            </label>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isTranslating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Translating resume...</span>
              </div>
              <Progress value={translationProgress} className="w-full" />
            </div>
          )}

          <Button
            onClick={() => handleTranslate(selectedLanguage)}
            disabled={isTranslating || selectedLanguage === 'en'}
            className="w-full"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Translate with AI
              </>
            )}
          </Button>
        </div>

        {/* Available Translations */}
        {Object.keys(translations).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Available Translations</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(translations).map((langCode) => {
                const language = supportedLanguages.find(l => l.code === langCode);
                return (
                  <div
                    key={langCode}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span>{language?.flag}</span>
                      <span className="text-sm">{language?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Language-Specific Tips */}
        {selectedLanguage !== 'en' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Cultural Guidelines for {supportedLanguages.find(l => l.code === selectedLanguage)?.name}
            </h3>
            <div className="space-y-2">
              {getLanguageSpecificFormatting(selectedLanguage).map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Features Notice */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-blue-900">Premium Feature</p>
              <p className="text-xs text-blue-700">
                AI-powered translation with cultural adaptation ensures your resume 
                meets local expectations and formatting standards.
              </p>
            </div>
          </div>
        </div>

        {/* Language Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold">{supportedLanguages.length}</div>
            <div className="text-xs text-muted-foreground">Languages</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{Object.keys(translations).length}</div>
            <div className="text-xs text-muted-foreground">Translations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">98%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};