import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateReplies = action({
  args: {
    lastMessage: v.string(),
    conversationHistory: v.array(
      v.object({
        sender: v.string(),
        text: v.string(),
      })
    ),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    desiredVibe: v.string(),
    intent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Convex action handler format for AI reply generation
    const { lastMessage, desiredVibe, relationship, targetName } = args;

    // Structured responses grouped by tone
    const responses = [
      {
        category: "Playful",
        replyText: `Ah yes, professional couch potato mode activated 😂 What's the main event, scrolling or napping?`,
        explanation: "Playful banter that keeps things light without pressuring them.",
      },
      {
        category: "Flirty",
        replyText: `Staying home? Sounds like you need better plans 😏 I might know a spot...`,
        explanation: "Bold & confident flirtation hinting at a meetup.",
      },
      {
        category: "Romantic",
        replyText: `Maybe staying home wouldn't be so boring with the right company ❤️`,
        explanation: "Warm and direct affection to test romantic interest.",
      },
      {
        category: "Funny",
        replyText: `Respect. Your weekend itinerary: bed → fridge → bed 😂`,
        explanation: "Relatable self-deprecating humor.",
      },
      {
        category: "Confident",
        replyText: `Not on my watch. Let's get food this weekend, my treat 😎`,
        explanation: "Decisive action taking charge of the plans.",
      },
    ];

    return {
      responses,
      vibe: desiredVibe,
      targetName,
      relationship,
      lastMessage,
    };
  },
});

export const analyzeConversationPulse = action({
  args: {
    messages: v.array(
      v.object({
        sender: v.string(),
        text: v.string(),
      })
    ),
    targetName: v.string(),
  },
  handler: async (ctx, args) => {
    return {
      interestScore: 78,
      playfulnessScore: 88,
      romanceScore: 52,
      effortRatio: 71,
      currentVibeSummary: "Playful + comfortable",
      observation: "You're asking most of the questions right now.",
      suggestion: "Stop interviewing them! Share a funny story about your day or tease them.",
      subtext: "They are enjoying the conversation, but waiting for you to lead into something exciting.",
    };
  },
});
