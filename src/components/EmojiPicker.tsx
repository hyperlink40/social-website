import { useState } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙁', '😌',
  '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
  '🤮', '🤧', '🤬', '🤯', '😱', '😨', '😰', '😥',
  '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩',
  '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
  '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
  '👾', '🤖', '😻', '😸', '😹', '😺', '😻', '😼',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘',
  '🚀', '⭐', '✨', '🌟', '💫', '🎉', '🎊', '🎈',
  '🎁', '🎀', '💝', '🔥', '⚡', '💯', '👍', '👏',
  '🙌', '🤝', '🤲', '🤲', '💪', '🦾', '🦿', '🦵',
];

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 text-gray-600 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition"
        title="Add emoji"
      >
        <Smile size={20} />
      </button>

      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 w-80">
          <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onEmojiSelect(emoji);
                  setShowPicker(false);
                }}
                className="p-2 text-xl hover:bg-gray-100 rounded transition text-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
