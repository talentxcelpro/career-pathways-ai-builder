import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smile, Search } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

const emojiCategories = {
  'Smileys & People': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
    '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑',
    '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
    '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
    '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '👶', '👧', '🧒', '👦', '👩',
    '🧑', '👨', '👵', '🧓', '👴', '👲', '👳', '👮', '👷', '💂', '🕵', '👩‍⚕️', '👨‍⚕️'
  ],
  'Animals & Nature': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
    '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥',
    '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
    '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑',
    '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆'
  ],
  'Food & Drink': [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍',
    '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅',
    '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇',
    '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯',
    '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙'
  ],
  'Activities': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
    '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋',
    '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋', '🤼', '🤸', '⛹',
    '🤺', '🤾', '🏌', '🏇', '🧘', '🏄', '🏊', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇'
  ],
  'Travel & Places': [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛',
    '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🚁', '🛸', '✈️', '🛩', '🛫', '🛬', '🪂',
    '💺', '🚀', '🛰', '🚊', '🚝', '🚄', '🚅', '🚈', '🚞', '🚋', '🚃', '🚟', '🚠',
    '🚡', '⛴', '🛥', '🚤', '⛵', '🛶', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🗺',
    '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '⛱', '🏖', '🏝'
  ],
  'Objects': [
    '⌚', '📱', '📲', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾',
    '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠',
    '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡',
    '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷',
    '💰', '💳', '💎', '⚖', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩', '⚙', '🧱'
  ],
  'Symbols': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞',
    '💓', '💗', '💖', '💘', '💝', '💟', '☮', '✝️', '☪', '🕉', '☸', '✡️', '🔯',
    '🕎', '☯', '☦', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛', '🉑', '☢', '☣', '📴', '📳', '🈶', '🈚', '🈸',
    '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲'
  ]
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Smileys & People');

  const allEmojis = Object.values(emojiCategories).flat();
  
  const filteredEmojis = searchTerm
    ? allEmojis.filter(emoji => {
        // Simple emoji search - in real implementation, you'd use emoji names/keywords
        return true; // For simplicity, showing all emojis when searching
      })
    : emojiCategories[selectedCategory as keyof typeof emojiCategories] || [];

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {!searchTerm && (
          <div className="flex flex-wrap gap-1 p-2 border-b">
            {Object.keys(emojiCategories).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedCategory(category)}
              >
                {category.split(' ')[0]}
              </Button>
            ))}
          </div>
        )}

        <ScrollArea className="h-64">
          <div className="grid grid-cols-8 gap-2 p-4">
            {filteredEmojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-8 w-8 text-lg hover:bg-muted"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Click an emoji to add it to your post
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};