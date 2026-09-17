"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o-mini";

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
    const { lastMessage, desiredVibe, relationship, targetName, personalityTraits, conversationHistory } = args;

    const historyText = conversationHistory
      .slice(-8)
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a witty, emotionally intelligent texting/dating coach. Given the conversation so far, break down what the target's message signals (sceneContext), give a one-sentence coaching lead-in (advice), then generate 5 distinct reply options the user could send next, one for each category: Playful, Flirty, Romantic, Funny, Confident. Each reply must fit the requested vibe/relationship and never sound robotic. Respond ONLY with JSON matching: " +
            '{"sceneContext":string,"advice":string,"responses":[{"category":"Playful"|"Flirty"|"Romantic"|"Funny"|"Confident","replyText":string,"explanation":string}]} (exactly 5 responses).',
        },
        {
          role: "user",
          content: `Target: ${targetName} (${relationship}). Their personality: ${personalityTraits.join(", ") || "unknown"}. Desired vibe: ${desiredVibe}.\nRecent conversation:\n${historyText}\nTheir most recent message: "${lastMessage}"\n\nGenerate the breakdown and 5 reply options now.`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");

    return {
      sceneContext: parsed.sceneContext ?? "",
      advice: parsed.advice ?? `Here are a few ${desiredVibe} ways you can reply to ${targetName}:`,
      responses: parsed.responses ?? [],
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
    const transcript = args.messages
      .slice(-20)
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a dating/texting chemistry analyst. Read the transcript and score it. Respond ONLY with JSON matching: " +
            '{"interestScore":0-100,"playfulnessScore":0-100,"romanceScore":0-100,"effortRatio":0-100,"currentVibeSummary":string,"observation":string,"suggestion":string,"subtext":string}. effortRatio is the percentage of conversational effort coming from the user (the "you" sender) vs the target.',
        },
        {
          role: "user",
          content: `Target name: ${args.targetName}.\nTranscript:\n${transcript}\n\nAnalyze this conversation now.`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");

    return {
      interestScore: parsed.interestScore ?? 50,
      playfulnessScore: parsed.playfulnessScore ?? 50,
      romanceScore: parsed.romanceScore ?? 50,
      effortRatio: parsed.effortRatio ?? 50,
      currentVibeSummary: parsed.currentVibeSummary ?? "Neutral",
      observation: parsed.observation ?? "",
      suggestion: parsed.suggestion ?? "",
      subtext: parsed.subtext ?? "",
    };
  },
});
