export interface SelectOption {
  id: string;
  label: string;
  emoji: string;
  desc?: string;
  color?: string;
}

export const RELATIONSHIPS: SelectOption[] = [
  { id: 'crush', label: 'Crush', emoji: '✦', desc: 'Romantic interest' },
  { id: 'dating', label: 'Dating', emoji: '◆', desc: 'Developing relationship' },
  { id: 'partner', label: 'Partner', emoji: '◈', desc: 'Long-term partner' },
  { id: 'friend', label: 'Friend', emoji: '●', desc: 'Casual social chat' },
  { id: 'bro', label: 'Peer / Buddy', emoji: '▲', desc: 'Banter & casual talk' },
  { id: 'colleague', label: 'Professional', emoji: '◼', desc: 'Workplace & networking' },
  { id: 'family', label: 'Family', emoji: '♥', desc: 'Relatives' },
  { id: 'ex', label: 'Reconnecting', emoji: '↺', desc: 'Delicate dialogue' },
];

export const PERSONALITY_TRAITS: SelectOption[] = [
  { id: 'reserved', label: 'Reserved', emoji: '▪' },
  { id: 'humorous', label: 'Witty', emoji: '▪' },
  { id: 'dry_texter', label: 'Concise Texter', emoji: '▪' },
  { id: 'flirty', label: 'Playful', emoji: '▪' },
  { id: 'sarcastic', label: 'Sarcastic', emoji: '▪' },
  { id: 'romantic', label: 'Expressive', emoji: '▪' },
  { id: 'talkative', label: 'Talkative', emoji: '▪' },
  { id: 'direct', label: 'Direct', emoji: '▪' },
];

export const VIBES: SelectOption[] = [
  { id: 'playful', label: 'Playful', emoji: '✦', color: '#18181b' },
  { id: 'witty', label: 'Witty', emoji: '✦', color: '#4f46e5' },
  { id: 'flirty', label: 'Flirty', emoji: '✦', color: '#e11d48' },
  { id: 'romantic', label: 'Warm & Sweet', emoji: '✦', color: '#db2777' },
  { id: 'confident', label: 'Confident', emoji: '✦', color: '#0284c7' },
  { id: 'caring', label: 'Empathetic', emoji: '✦', color: '#059669' },
  { id: 'spicy', label: 'Bold', emoji: '✦', color: '#ea580c' },
  { id: 'bro_affection', label: 'Casual Banter', emoji: '✦', color: '#4b5563' },
];

export const INTENTS: SelectOption[] = [
  { id: 'keep_going', label: 'Maintain Conversation Flow', emoji: '→' },
  { id: 'start_chat', label: 'Initiate Conversation', emoji: '→' },
  { id: 'make_laugh', label: 'Introduce Humor', emoji: '→' },
  { id: 'flirt', label: 'Test Interest / Flirt', emoji: '→' },
  { id: 'ask_out', label: 'Propose Meetup / Date', emoji: '→' },
  { id: 'apologize', label: 'Smooth Apology', emoji: '→' },
  { id: 'change_topic', label: 'Transition Topic', emoji: '→' },
  { id: 'recover_awkward', label: 'Recover Awkward Turn', emoji: '→' },
];
