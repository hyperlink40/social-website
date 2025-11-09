import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EmojiPicker from './EmojiPicker';

interface EmojiReactionsProps {
  postId: string;
}

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export default function EmojiReactions({ postId }: EmojiReactionsProps) {
  const [reactions, setReactions] = useState<Map<string, Reaction>>(new Map());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReactions();

    const channel = supabase
      .channel(`post_reactions:${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_reactions', filter: `post_id=eq.${postId}` },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchReactions = async () => {
    const { data } = await supabase
      .from('post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);

    if (data) {
      const reactionMap = new Map<string, Reaction>();
      data.forEach((reaction) => {
        const existing = reactionMap.get(reaction.emoji) || { emoji: reaction.emoji, count: 0, hasReacted: false };
        existing.count += 1;
        if (reaction.user_id === user?.id) {
          existing.hasReacted = true;
        }
        reactionMap.set(reaction.emoji, existing);
      });
      setReactions(reactionMap);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (loading || !user?.id) return;
    setLoading(true);

    try {
      const reaction = reactions.get(emoji);
      if (reaction?.hasReacted) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
      } else {
        await supabase.from('post_reactions').insert({
          post_id: postId,
          user_id: user.id,
          emoji,
        });
      }
      fetchReactions();
    } catch (err) {
      console.error('Error adding reaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {Array.from(reactions.values()).map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReaction(reaction.emoji)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
            reaction.hasReacted
              ? 'bg-blue-100 border border-blue-300'
              : 'bg-gray-100 border border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-lg">{reaction.emoji}</span>
          <span className="text-xs font-medium text-gray-600">{reaction.count}</span>
        </button>
      ))}
      <EmojiPicker onEmojiSelect={handleReaction} />
    </div>
  );
}
