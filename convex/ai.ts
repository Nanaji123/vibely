"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o-mini";

const LANGUAGE_RULE =
  "LANGUAGE: Write every reply the user could send in the SAME language and script the chat itself uses. If the chat is Telugu in Telugu script, reply in Telugu script. If it is Telugu typed in English letters (Tenglish), reply the same way. Same for Hindi, Tamil, Hinglish, etc. Match their slang, tone and message length. Never translate the replies into English. Only the coaching explanation fields may be in English.";

const clamp = (n: unknown, fallback = 50) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

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
  handler: async (_ctx, args) => {
    const { lastMessage, desiredVibe, relationship, targetName, personalityTraits, conversationHistory } = args;

    // Coach messages are English advice; leaving them in would bias replies toward English
    const historyText = conversationHistory
      .filter((m) => m.sender !== "ai")
      .slice(-12)
      .map((m) => `${m.sender === "them" ? "THEM" : "USER"}: ${m.text}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a witty, emotionally intelligent texting/dating coach. Given the conversation so far, break down what the target's message signals (sceneContext), give a one-sentence coaching lead-in (advice), then generate 5 distinct reply options the user could send next, one for each category: Playful, Flirty, Romantic, Funny, Confident. Each reply must fit the requested vibe/relationship and never sound robotic. " +
            LANGUAGE_RULE +
            " sceneContext, advice and explanation (a short reason under 80 characters) are written in English. Respond ONLY with JSON matching: " +
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

// The user talking to the wingman ABOUT their chat. The message is an instruction/question to the coach,
// never something the other person said (unless the user explicitly relays it).
export const coachChat = action({
  args: {
    message: v.string(),
    thread: v.array(v.object({ role: v.string(), text: v.string() })),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    desiredVibe: v.string(),
  },
  handler: async (_ctx, args) => {
    const thread = [...args.thread];
    const tail = thread[thread.length - 1];
    if (tail && tail.role === "user" && tail.text === args.message) thread.pop();

    const label: Record<string, string> = {
      them: "THEM",
      you_to_them: "YOU_TO_THEM",
      user: "USER_TO_COACH",
      coach: "COACH",
    };
    const threadText = thread
      .slice(-30)
      .map((m) => `${label[m.role] ?? "USER_TO_COACH"}: ${m.text.slice(0, 400)}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Vibely, a sharp, friendly texting wingman. The USER is privately chatting with YOU about their conversation with another person. " +
            "Their message to you is an instruction or question for YOU. It is NOT a message to the other person and NOT something the other person said, unless the user explicitly relays it (e.g. 'she said ...'). " +
            "Thread labels: THEM = what the other person sent; YOU_TO_THEM = what the user already sent to them; USER_TO_COACH = the user talking to you earlier; COACH = your earlier answers. " +
            "Decide what the user wants: " +
            "(a) Reply options ('give me a normal reply', 'something confident', 'how do I respond', 'shorter', 'make it funnier') -> write exactly 3 different messages the user can send to the other person, answering their latest THEM message and using the chat context. Any style the user asks for (normal, casual, short, apologetic, direct...) beats the default vibe; otherwise use the selected vibe as the tone. 'Normal' means natural and everyday, not over-the-top. " +
            "(b) A question or analysis ('what does she mean', 'is she interested', 'should I text now') -> answer it in advice using the real chat; responses = []. " +
            "(c) The user relays a new message from the other person -> treat it as their newest THEM message and give 3 reply options. " +
            "If they ask for replies but there is no chat context at all, say in advice that they should tell you what the other person said or upload a screenshot; responses = []. " +
            "advice is a short, conversational answer to the user (1-3 sentences, English). sceneContext is a one-sentence read of the situation (English, may be empty). " +
            LANGUAGE_RULE +
            " Respond ONLY with JSON: " +
            '{"advice":string,"sceneContext":string,"responses":[{"category":string (1-2 words like Normal, Confident, Playful),"replyText":string,"explanation":string (under 80 chars, English)}]} (0 or 3 responses).',
        },
        {
          role: "user",
          content: `Other person: ${args.targetName} (${args.relationship}). Their personality: ${args.personalityTraits.join(", ") || "unknown"}. Selected vibe: ${args.desiredVibe}.\n\nThread so far:\n${threadText || "(empty)"}\n\nUSER_TO_COACH (now): ${args.message}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const responses = Array.isArray(parsed.responses)
      ? parsed.responses
          .filter((r: any) => r && typeof r.replyText === "string" && r.replyText.trim())
          .slice(0, 3)
          .map((r: any) => ({
            category: String(r.category ?? args.desiredVibe),
            replyText: String(r.replyText).trim(),
            explanation: String(r.explanation ?? ""),
          }))
      : [];

    return {
      advice: String(parsed.advice ?? ""),
      sceneContext: String(parsed.sceneContext ?? ""),
      responses,
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
    relationship: v.optional(v.string()),
    personalityTraits: v.optional(v.array(v.string())),
  },
  handler: async (_ctx, args) => {
    const transcript = args.messages
      .filter((m) => m.sender !== "ai")
      .slice(-30)
      .map((m) => `${m.sender === "them" ? "THEM" : "USER"}: ${m.text}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a dating/texting chemistry analyst. Base EVERYTHING on the transcript; never invent messages that are not in it. USER lines are what the user sent (or notes they typed such as 'She said: ...'); THEM lines are what the target sent. Quote the target's messages in their original language and script. Write recommendedReply in the chat's own language and script (e.g. Telugu, Tenglish), other fields in English. Respond ONLY with JSON: " +
            '{"interestScore":0-100,"playfulnessScore":0-100,"romanceScore":0-100,"frameScore":0-100,"effortRatio":0-100,' +
            '"currentVibeSummary":string,"detectedIntent":string,"intentExplanation":string,"observation":string,"suggestion":string,"subtext":string,' +
            '"moments":[{"theirMessage":string,"subtext":string,"recommendedReply":string}],"doNext":string,"avoid":string}. ' +
            "effortRatio is the percentage of conversational effort coming from the user. frameScore is how well the user is holding confident, high-value balance. moments has 1-2 items quoting the target's real messages from the transcript. Keep every string under 220 characters.",
        },
        {
          role: "user",
          content: `Target: ${args.targetName}${args.relationship ? ` (${args.relationship})` : ""}. Traits: ${(args.personalityTraits ?? []).join(", ") || "unknown"}.\nTranscript:\n${transcript}\n\nAnalyze this conversation now.`,
        },
      ],
    });

    const p = JSON.parse(completion.choices[0].message.content ?? "{}");
    const moments = Array.isArray(p.moments)
      ? p.moments
          .filter((m: any) => m && typeof m.theirMessage === "string")
          .slice(0, 2)
          .map((m: any) => ({
            theirMessage: String(m.theirMessage),
            subtext: String(m.subtext ?? ""),
            recommendedReply: String(m.recommendedReply ?? ""),
          }))
      : [];

    return {
      interestScore: clamp(p.interestScore),
      playfulnessScore: clamp(p.playfulnessScore),
      romanceScore: clamp(p.romanceScore),
      frameScore: clamp(p.frameScore),
      effortRatio: clamp(p.effortRatio),
      currentVibeSummary: String(p.currentVibeSummary ?? ""),
      detectedIntent: String(p.detectedIntent ?? ""),
      intentExplanation: String(p.intentExplanation ?? ""),
      observation: String(p.observation ?? ""),
      suggestion: String(p.suggestion ?? ""),
      subtext: String(p.subtext ?? ""),
      moments,
      doNext: String(p.doNext ?? ""),
      avoid: String(p.avoid ?? ""),
      analyzedMessageCount: args.messages.length,
    };
  },
});

// Reads chat screenshots with a vision model and returns the transcript it can actually see
export const extractChatFromImages = action({
  args: {
    images: v.array(v.string()), // data URLs (data:image/jpeg;base64,...)
    targetName: v.string(),
  },
  handler: async (_ctx, args) => {
    if (args.images.length === 0) throw new Error("No screenshots provided");
    const images = args.images.slice(0, 4);

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You read chat screenshots. Transcribe ONLY the text messages you can actually see, in order, oldest first. Decide the sender by which SIDE of the screen the bubble is aligned to: bubbles aligned to the RIGHT edge are the phone owner's own sent messages (sender \"you\", usually the coloured bubbles); bubbles aligned to the LEFT edge are received from the other person (sender \"them\"). Do not decide by the contact name in the header. Keep every message in its ORIGINAL language and script (Telugu, Hindi, Tenglish, emoji, etc.); never translate or romanize. Skip timestamps, dates and system notices. Never invent or guess text. If there is no readable chat, return an empty messages array. Respond ONLY with JSON: " +
            '{"messages":[{"sender":"you"|"them","text":string}]}',
        },
        {
          role: "user",
          content: [
            { type: "text", text: `These screenshots are a chat with ${args.targetName}. Transcribe them.` },
            ...images.map((url) => ({ type: "image_url" as const, image_url: { url, detail: "low" as const } })),
          ],
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const messages: { sender: "you" | "them"; text: string }[] = Array.isArray(parsed.messages)
      ? parsed.messages
          .filter((m: any) => m && typeof m.text === "string" && m.text.trim())
          .map((m: any) => ({ sender: m.sender === "you" ? "you" : "them", text: String(m.text).trim() }))
      : [];
    return { messages };
  },
});

// "If they reply X, say Y" previews for one suggested reply
export const generateBranches = action({
  args: {
    suggestedReply: v.string(),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a texting coach. The user is about to send a message. Predict 3 distinct ways the other person is likely to respond, and the best follow-up for each. Write ifTheySay and suggestedReply in the SAME language and script as the message the user is about to send (e.g. Telugu stays Telugu, Tenglish stays Tenglish); intent is in English. Respond ONLY with JSON: " +
            '{"nodes":[{"ifTheySay":string,"suggestedReply":string,"intent":string,"confidence":0-100}]} (exactly 3 nodes). Keep every string under 160 characters.',
        },
        {
          role: "user",
          content: `Other person: ${args.targetName} (${args.relationship}). Traits: ${args.personalityTraits.join(", ") || "unknown"}.${args.context ? `\nContext: ${args.context}` : ""}\nThe user is about to send: "${args.suggestedReply}"`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const nodes = Array.isArray(parsed.nodes) ? parsed.nodes.slice(0, 3) : [];
    return {
      nodes: nodes.map((n: any, i: number) => ({
        id: `node-${Date.now()}-${i}`,
        ifTheySay: String(n?.ifTheySay ?? ""),
        suggestedReply: String(n?.suggestedReply ?? ""),
        intent: String(n?.intent ?? ""),
        confidence: clamp(n?.confidence, 70),
      })),
    };
  },
});
