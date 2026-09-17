import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    userId: v.string(),
    profileId: v.optional(v.string()),
    title: v.string(),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    messages: v.array(
      v.object({
        id: v.string(),
        sender: v.union(v.literal("you"), v.literal("ai"), v.literal("them")),
        text: v.string(),
        sceneContext: v.optional(v.string()),
        suggestions: v.optional(
          v.array(
            v.object({
              id: v.string(),
              category: v.string(),
              replyText: v.string(),
              toneVariant: v.string(),
            })
          )
        ),
        selectedSuggestionId: v.optional(v.string()),
        timestamp: v.optional(v.string()),
      })
    ),
    currentVibe: v.string(),
    pulseScore: v.optional(v.number()),
    analysis: v.optional(
      v.object({
        interestScore: v.number(),
        playfulnessScore: v.number(),
        romanceScore: v.number(),
        effortRatio: v.number(),
        currentVibeSummary: v.string(),
        observation: v.string(),
        suggestion: v.string(),
        subtext: v.string(),
      })
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

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

  userSubscriptions: defineTable({
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")),
    creditsRemaining: v.number(),
    unlimited: v.boolean(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),
});
