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
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 w-72">
          <div className="grid grid-cols-8 gap-0.5 max-h-60 overflow-y-auto scrollbar-thin">
            {EMOJIS.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => {
                  onEmojiSelect(emoji);
                  setShowPicker(false);
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-md transition"
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
