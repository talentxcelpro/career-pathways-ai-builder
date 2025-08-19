import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Palette, 
  Type, 
  Send,
  Sparkles,
  Quote
} from 'lucide-react';

interface TextStoryCreatorProps {
  onClose: () => void;
  onStoryCreated: (storyData: any) => void;
}

const backgroundGradients = [
  'bg-gradient-to-br from-blue-500 to-purple-600',
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-green-500 to-emerald-500',
  'bg-gradient-to-br from-orange-500 to-red-500',
  'bg-gradient-to-br from-indigo-500 to-blue-500',
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-yellow-400 to-orange-500',
  'bg-gradient-to-br from-teal-500 to-cyan-500',
];

const fontStyles = [
  { name: 'Modern', class: 'font-sans' },
  { name: 'Elegant', class: 'font-serif' },
  { name: 'Bold', class: 'font-bold' },
  { name: 'Playful', class: 'font-mono' },
];

export const TextStoryCreator: React.FC<TextStoryCreatorProps> = ({ 
  onClose, 
  onStoryCreated 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(backgroundGradients[0]);
  const [selectedFont, setSelectedFont] = useState(fontStyles[0]);
  const [textSize, setTextSize] = useState('text-2xl');

  const handlePublishStory = async () => {
    if (!text.trim()) {
      toast({
        title: "Enter some text",
        description: "Please add some text for your story.",
        variant: "destructive",
      });
      return;
    }

    try {
      const storyData = {
        id: Date.now().toString(),
        type: 'text',
        content: text,
        background: selectedGradient,
        font: selectedFont.class,
        fontSize: textSize,
        userId: user?.id,
        createdAt: new Date().toISOString(),
      };

      // In a real app, you would save this to your backend
      console.log('Publishing text story:', storyData);
      
      onStoryCreated(storyData);
      
      toast({
        title: "Story published!",
        description: "Your text story has been shared successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error publishing story:', error);
      toast({
        title: "Failed to publish",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Create Text Story</h1>
        <Button 
          onClick={handlePublishStory}
          disabled={!text.trim()}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Story Preview */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className={`w-full max-w-sm aspect-[9/16] ${selectedGradient} border-0 shadow-xl relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className={`text-center text-white ${selectedFont.class} ${textSize} leading-relaxed`}>
              {text || "Start typing your story..."}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-white/30">
            <Quote className="h-8 w-8" />
          </div>
          <div className="absolute bottom-4 right-4 text-white/20">
            <Sparkles className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Text Input */}
      <div className="p-4 bg-gray-900">
        <Textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none min-h-[80px]"
          maxLength={200}
        />
        <div className="text-xs text-gray-400 mt-1 text-right">
          {text.length}/200
        </div>
      </div>

      {/* Customization Tools */}
      <div className="bg-gray-900 border-t border-gray-700">
        {/* Background Colors */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Background</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {backgroundGradients.map((gradient, index) => (
              <button
                key={index}
                onClick={() => setSelectedGradient(gradient)}
                className={`w-8 h-8 rounded-full ${gradient} border-2 ${
                  selectedGradient === gradient ? 'border-white' : 'border-transparent'
                } shrink-0`}
              />
            ))}
          </div>
        </div>

        {/* Font Styles */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Type className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Font Style</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {fontStyles.map((font) => (
              <Button
                key={font.name}
                variant={selectedFont.name === font.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFont(font)}
                className="shrink-0"
              >
                <span className={font.class}>{font.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Text Size */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white text-sm font-medium">Text Size</span>
          </div>
          <div className="flex gap-2">
            {['text-lg', 'text-xl', 'text-2xl', 'text-3xl'].map((size) => (
              <Button
                key={size}
                variant={textSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setTextSize(size)}
                className="shrink-0"
              >
                {size.replace('text-', '').toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};