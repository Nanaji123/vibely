import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const suggestionObject = v.object({
  id: v.string(),
  category: v.string(),
  replyText: v.string(),
  toneVariant: v.string(),
});

// Shape of a chat message as the client sees it (clientId is exposed as `id`)
export const messageObject = v.object({
  id: v.string(),
  sender: v.union(v.literal("you"), v.literal("ai"), v.literal("them")),
  text: v.string(),
  sceneContext: v.optional(v.string()),
  suggestions: v.optional(v.array(suggestionObject)),
  selectedSuggestionId: v.optional(v.string()),
  timestamp: v.optional(v.string()),
});

export const analysisObject = v.object({
  interestScore: v.number(),
  playfulnessScore: v.number(),
  romanceScore: v.number(),
  effortRatio: v.number(),
  currentVibeSummary: v.string(),
  observation: v.string(),
  suggestion: v.string(),
  subtext: v.string(),
  frameScore: v.optional(v.number()),
  detectedIntent: v.optional(v.string()),
  intentExplanation: v.optional(v.string()),
  moments: v.optional(
    v.array(
      v.object({
        theirMessage: v.string(),
        subtext: v.string(),
        recommendedReply: v.string(),
      })
    )
  ),
  doNext: v.optional(v.string()),
  avoid: v.optional(v.string()),
  analyzedMessageCount: v.optional(v.number()),
});

export default defineSchema({
  conversations: defineTable({
    userId: v.string(),
    profileId: v.optional(v.string()),
    title: v.string(),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    // Legacy: messages used to live inline on this document. They are moved
    // into the `messages` table lazily the next time the conversation is written to.
    messages: v.optional(v.array(messageObject)),
    // Last few messages, denormalized so list screens don't need the full thread
    previewMessages: v.optional(v.array(messageObject)),
    currentVibe: v.string(),
    pulseScore: v.optional(v.number()),
    analysis: v.optional(analysisObject),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    seq: v.number(),
    clientId: v.string(),
    sender: v.union(v.literal("you"), v.literal("ai"), v.literal("them")),
    text: v.string(),
    sceneContext: v.optional(v.string()),
    suggestions: v.optional(v.array(suggestionObject)),
    selectedSuggestionId: v.optional(v.string()),
    timestamp: v.optional(v.string()),
  })
    .index("by_conversation_seq", ["conversationId", "seq"])
    .index("by_conversation_clientId", ["conversationId", "clientId"]),

  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    gender: v.union(v.literal("female"), v.literal("male"), v.literal("other")),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    likes: v.array(v.string()),
    thingsToAvoid: v.array(v.string()),
    vibeSummary: v.string(),
    avatarEmoji: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  responses: defineTable({
    conversationId: v.string(),
    vibe: v.string(),
    replyText: v.string(),
    category: v.string(), // "Playful", "Flirty", "Romantic", "Funny", "Confident"
    continueBranches: v.optional(
      v.array(
        v.object({
          ifTheySay: v.string(),
          suggestedReply: v.string(),
          intent: v.string(),
        })
      )
    ),
    createdAt: v.string(),
  }).index("by_conversationId", ["conversationId"]),

  userProfiles: defineTable({
    userId: v.string(),
    displayName: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  userSubscriptions: defineTable({
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")),
    creditsRemaining: v.number(),
    unlimited: v.boolean(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),
});
