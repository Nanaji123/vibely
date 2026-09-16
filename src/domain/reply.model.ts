export type ReplyCategory =
  | 'Playful'
  | 'Witty'
  | 'Flirty'
  | 'Romantic'
  | 'Confident'
  | 'Empathetic'
  | 'Bold'
  | 'Casual';

export interface AIReplyModel {
  id: string;
  category: ReplyCategory;
  replyText: string;
  explanation: string;
  vibe: string;
}

export interface DialogTreeNodeModel {
  id: string;
  ifTheySay: string;
  suggestedReply: string;
  intent: string;
  confidence: number;
}
