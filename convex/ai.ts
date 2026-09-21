"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import OpenAI from "openai";

// Created on first use so the module can be pushed before OPENAI_API_KEY is set on the deployment
let client: OpenAI | undefined;
const openai = () => (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

// gpt-4o-mini reads subtext poorly and ignores tone instructions; 4.1 is a big step up for the same prompts.
// Override per deployment with `npx convex env set OPENAI_MODEL ...`.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1";
const VISION_MODEL = process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini";

// Reasoning models (gpt-5*, o*) reject the temperature parameter
const sampling = (model: string, temperature: number) =>
  /^(gpt-5|o\d)/.test(model) ? {} : { temperature };

const LANGUAGE_RULE =
  "LANGUAGE: Write every reply the user could send in exactly the language and script the OTHER PERSON uses in the chat. If they write in English, reply in English. If they write a regional language in Latin letters (romanized), reply the same way. If they use a native script, reply in that script. Never switch language, never translate, never add a language the chat does not use. Coaching fields (sceneContext, advice, explanation, intent) are always English.";

// Names the chat's script explicitly so the model cannot guess. Latin text could be English or a
// romanized language, so that case tells it to mirror the words rather than assume.
const detectChatLanguage = (texts: string[]) => {
  const sample = texts.join("\n");
  if (/[\u0C00-\u0C7F]/.test(sample)) return "Telugu script";
  if (/[\u0900-\u097F]/.test(sample)) return "Devanagari script (Hindi/Marathi)";
  if (/[\u0B80-\u0BFF]/.test(sample)) return "Tamil script";
  if (/[\u0C80-\u0CFF]/.test(sample)) return "Kannada script";
  if (/[\u0D00-\u0D7F]/.test(sample)) return "Malayalam script";
  if (/[\u0980-\u09FF]/.test(sample)) return "Bengali script";
  if (/[\u0A80-\u0AFF]/.test(sample)) return "Gujarati script";
  if (/[\u0A00-\u0A7F]/.test(sample)) return "Gurmukhi script (Punjabi)";
  if (/[\u0600-\u06FF]/.test(sample)) return "Arabic script (Urdu/Arabic)";
  return "Latin letters: if their messages read as plain English, reply in plain English; only use a romanized regional language if their own messages are written that way";
};

// How a real person texts. Without this the model writes like a customer-support bot.
const TEXTING_RULES =
  "HOW TO WRITE REPLIES: Sound like a real, socially skilled person typing on their phone, not an assistant. " +
  "Mirror the chat's length, casing, punctuation and emoji habits (if the chat has no emojis, use none). " +
  "Reference specific things they actually said instead of generic lines. Never just answer their question; keep a thread alive or open a new one. " +
  "Do not end every reply with a question. No exclamation-mark spam, no 'haha' filler, no pickup lines, no compliments about eyes or smiles, no dashes as punctuation, nothing that could be sent to anyone. " +
  "Each reply must be clearly different from the others in angle, not just wording.";

const VIBE_GUIDE: Record<string, string> = {
  flirty: "Flirty: light tension and teasing, a hint of interest, leaves them wanting more. Never thirsty or explicit.",
  witty: "Witty: a clever observation, callback or wordplay. Dry, quick, effortless. Humour comes from being sharp, not silly.",
  playful: "Playful: teasing, silly, fun energy. Low stakes, easy to respond to.",
  confident: "Confident: direct, self-assured, leads the conversation. Short. States rather than asks. Zero approval-seeking.",
  romantic: "Romantic: warm, sincere, a little vulnerable. Specific to them, never greeting-card cheesy.",
  warm: "Warm: kind and caring, makes them feel seen and comfortable.",
  caring: "Empathetic: acknowledges how they feel first, supportive, no fixing or lecturing.",
  spicy: "Bold: daring, escalates the tension, takes a charming risk. Still classy.",
  bro_affection: "Casual banter: relaxed friend energy, light roasting, inside-joke feel.",
};

const RELATIONSHIP_GUIDE: Record<string, string> = {
  crush: "a crush (romantic interest, not yet dating; build attraction without overcommitting)",
  dating: "someone they are dating (attraction is established; keep momentum and plan real things)",
  partner: "their long-term partner (intimacy and affection; skip pickup dynamics)",
  friend: "a friend (casual, no romantic pressure unless the vibe asks for it)",
  bro: "a buddy (banter, roasting, casual talk)",
  colleague: "a professional contact (friendly but appropriate; no flirting even if the vibe is flirty; treat 'flirty' as 'charming')",
  family: "a family member (warm and appropriate; no romance)",
  ex: "an ex they are reconnecting with (delicate; calm, no neediness, no reopening old fights)",
};

const TRAIT_GUIDE: Record<string, string> = {
  reserved: "reserved (does not overshare; do not overwhelm them)",
  humorous: "witty (they enjoy clever humour and will notice weak jokes)",
  dry_texter: "a concise texter (sends short messages; long replies will feel needy)",
  flirty: "playful (comfortable with teasing and flirting)",
  sarcastic: "sarcastic (enjoys banter and light roasting)",
  romantic: "expressive (openly warm and emotional)",
  talkative: "talkative (sends a lot; you can match their length)",
  direct: "direct (prefers straightforward messages over games)",
};

const describeVibe = (vibe: string) => VIBE_GUIDE[vibe.toLowerCase()] ?? `${vibe} (interpret naturally)`;

// The app passes relationships as "crush (refer to them as she/her)"; keep the pronoun hint
const describeRelationship = (relationship: string) => {
  const id = relationship.split(/[\s(]/)[0].toLowerCase();
  const guide = RELATIONSHIP_GUIDE[id];
  const hint = relationship.match(/\((.*)\)/)?.[1];
  return `${guide ?? relationship}${hint ? `; ${hint}` : ""}`;
};

const describeTraits = (traits: string[]) =>
  traits.length ? traits.map((t) => TRAIT_GUIDE[t] ?? t.replace(/_/g, " ")).join("; ") : "unknown";

const profileArgs = {
  targetName: v.string(),
  relationship: v.string(),
  personalityTraits: v.array(v.string()),
  likes: v.optional(v.array(v.string())),
  thingsToAvoid: v.optional(v.array(v.string())),
  vibeSummary: v.optional(v.string()),
};

type ProfileArgs = {
  targetName: string;
  relationship: string;
  personalityTraits: string[];
  likes?: string[];
  thingsToAvoid?: string[];
  vibeSummary?: string;
};

const profileBlock = (p: ProfileArgs) => {
  const lines = [
    `Name: ${p.targetName}`,
    `Who they are to the user: ${describeRelationship(p.relationship)}`,
    `Personality: ${describeTraits(p.personalityTraits)}`,
  ];
  if (p.likes?.length) lines.push(`Things they like (use for callbacks and hooks): ${p.likes.join(", ")}`);
  if (p.thingsToAvoid?.length) lines.push(`Things to AVOID mentioning: ${p.thingsToAvoid.join(", ")}`);
  if (p.vibeSummary?.trim()) lines.push(`User's notes about them: ${p.vibeSummary.trim()}`);
  return lines.join("\n");
};

// Free-tier metering. Checked before the model call (so an exhausted user costs nothing) and
// charged after it succeeds (so a failed call is not billed). The client opens the paywall on this error.
const PAYWALL_ERROR = { code: "PAYWALL", message: "You've used all your free wingman replies." };
const assertCanGenerate = async (ctx: { runQuery: any }) => {
  const allowed = await ctx.runQuery(api.subscriptions.canGenerate, {});
  if (!allowed) throw new ConvexError(PAYWALL_ERROR);
};
const chargeCredit = (ctx: { runMutation: any }) => ctx.runMutation(api.subscriptions.useCredit, {});

const clamp = (n: unknown, fallback = 50) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const str = (x: unknown, fallback = "") => (typeof x === "string" ? x.trim() : fallback);

const parseReplies = (raw: unknown, max: number, fallbackCategory: string) =>
  Array.isArray(raw)
    ? raw
        .filter((r: any) => r && typeof r.replyText === "string" && r.replyText.trim())
        .slice(0, max)
        .map((r: any) => ({
          category: str(r.category, fallbackCategory) || fallbackCategory,
          replyText: str(r.replyText),
          explanation: str(r.explanation),
        }))
    : [];

export const generateReplies = action({
  args: {
    lastMessage: v.string(),
    conversationHistory: v.array(
      v.object({
        sender: v.string(),
        text: v.string(),
      })
    ),
    ...profileArgs,
    desiredVibe: v.string(),
    intent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertCanGenerate(ctx);
    const { lastMessage, desiredVibe, targetName, conversationHistory } = args;

    // Coach messages are English advice; leaving them in would bias replies toward English
    const chatHistory = conversationHistory.filter((m) => m.sender !== "ai").slice(-16);
    const historyText = chatHistory.map((m) => `${m.sender === "them" ? "THEM" : "USER"}: ${m.text}`).join("\n");
    const theirTexts = chatHistory.filter((m) => m.sender === "them").map((m) => m.text);

    const completion = await openai().chat.completions.create({
      model: MODEL,
      ...sampling(MODEL, 0.85),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Vibely, a sharp, emotionally intelligent texting wingman. The user shows you a chat and you (1) read the signals in the other person's latest message, (2) tell the user the move, (3) write 3 replies they can send.\n\n" +
            "SIGNALS (sceneContext): 2-3 short sentences read from THEIR actual words, not generic. Cover: tone (dry, eager, teasing, distant...), how much effort/interest they are showing (questions asked, length, emojis, speed of topic changes), what they are inviting, testing or hinting at, and the one thing NOT to do here. Quote or point to the specific words that gave it away. Never say 'they seem interested' without the evidence. Under 300 characters.\n\n" +
            "ADVICE: one sentence naming the exact move for right now (e.g. 'She dropped a hook about Goa, bite on that instead of answering the work question.'). No filler like 'Here are some options'.\n\n" +
            "REPLIES: exactly 3, ALL in the requested vibe, each taking a different angle (for example: tease, curiosity, callback, directness, misdirection). category is a 1-2 word label for the angle (e.g. 'Tease', 'Callback', 'Direct'), NOT the vibe name. explanation is under 80 characters, English, saying why that angle works on this person.\n\n" +
            TEXTING_RULES + "\n\n" +
            LANGUAGE_RULE + " sceneContext, advice and explanation are English.\n\n" +
            "Respond ONLY with JSON matching: " +
            '{"sceneContext":string,"advice":string,"responses":[{"category":string,"replyText":string,"explanation":string}]} (exactly 3 responses).',
        },
        {
          role: "user",
          content:
            `ABOUT ${targetName.toUpperCase()}:\n${profileBlock(args)}\n\n` +
            `REQUESTED VIBE: ${describeVibe(desiredVibe)}\n` +
            (args.intent ? `USER'S GOAL RIGHT NOW: ${args.intent.replace(/_/g, " ")}\n` : "") +
            `\nRECENT CHAT (oldest first):\n${historyText || "(no earlier messages)"}\n\n` +
            `THEIR LATEST MESSAGE: "${lastMessage}"\n\n` +
            `CHAT LANGUAGE: ${detectChatLanguage([...theirTexts, lastMessage])}\n\n` +
            "Read the signals, name the move, write the 3 replies.",
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    await chargeCredit(ctx);

    return {
      sceneContext: str(parsed.sceneContext),
      advice: str(parsed.advice) || `Here are a few ${desiredVibe} ways you can reply to ${targetName}:`,
      responses: parseReplies(parsed.responses, 3, desiredVibe),
      vibe: desiredVibe,
      targetName,
      relationship: args.relationship,
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
    ...profileArgs,
    desiredVibe: v.string(),
  },
  handler: async (ctx, args) => {
    await assertCanGenerate(ctx);
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

    const completion = await openai().chat.completions.create({
      model: MODEL,
      ...sampling(MODEL, 0.8),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Vibely, a sharp, friendly texting wingman. The USER is privately chatting with YOU about their conversation with another person. " +
            "Their message to you is an instruction or question for YOU. It is NOT a message to the other person and NOT something the other person said, unless the user explicitly relays it (e.g. 'she said ...'). " +
            "Thread labels: THEM = what the other person sent; YOU_TO_THEM = what the user already sent to them; USER_TO_COACH = the user talking to you earlier; COACH = your earlier answers.\n\n" +
            "Decide what the user wants:\n" +
            "(a) Reply options ('give me a normal reply', 'something confident', 'how do I respond', 'shorter', 'make it funnier') -> write exactly 3 different messages the user can send to the other person, answering their latest THEM message and using the chat context. Any style the user asks for (normal, casual, short, apologetic, direct...) beats the selected vibe; otherwise use the selected vibe as the tone. 'Normal' means natural and everyday, not over-the-top. category is a 1-2 word angle label.\n" +
            "(b) A question or analysis ('what does she mean', 'is she interested', 'should I text now') -> answer it in advice using evidence from the real chat (quote their words); responses = []. Be honest, including when the signals are bad; do not flatter the user.\n" +
            "(c) The user relays a new message from the other person -> treat it as their newest THEM message and give 3 reply options.\n" +
            "If they ask for replies but there is no chat context at all, say in advice that they should tell you what the other person said or upload a screenshot; responses = [].\n\n" +
            "advice is a short, conversational answer to the user (1-3 sentences, English, specific, no filler). sceneContext is a one-sentence read of the situation grounded in their actual words (English, may be empty).\n\n" +
            TEXTING_RULES + "\n\n" +
            LANGUAGE_RULE + "\n\n" +
            "Respond ONLY with JSON: " +
            '{"advice":string,"sceneContext":string,"responses":[{"category":string,"replyText":string,"explanation":string (under 80 chars, English)}]} (0 or 3 responses).',
        },
        {
          role: "user",
          content:
            `ABOUT ${args.targetName.toUpperCase()}:\n${profileBlock(args)}\n\n` +
            `SELECTED VIBE: ${describeVibe(args.desiredVibe)}\n\n` +
            `THREAD SO FAR:\n${threadText || "(empty)"}\n\n` +
            `CHAT LANGUAGE (for any replies): ${detectChatLanguage(thread.filter((m) => m.role === "them" || m.role === "you_to_them").map((m) => m.text))}\n\n` +
            `USER_TO_COACH (now): ${args.message}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    await chargeCredit(ctx);

    return {
      advice: str(parsed.advice),
      sceneContext: str(parsed.sceneContext),
      responses: parseReplies(parsed.responses, 3, args.desiredVibe),
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
  handler: async (ctx, args) => {
    await assertCanGenerate(ctx);
    const transcript = args.messages
      .filter((m) => m.sender !== "ai")
      .slice(-30)
      .map((m) => `${m.sender === "them" ? "THEM" : "USER"}: ${m.text}`)
      .join("\n");

    const completion = await openai().chat.completions.create({
      model: MODEL,
      ...sampling(MODEL, 0.3),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a dating/texting chemistry analyst. Base EVERYTHING on the transcript; never invent messages that are not in it. USER lines are what the user sent (or notes they typed such as 'She said: ...'); THEM lines are what the target sent. Quote the target's messages in their original language and script. Write recommendedReply in exactly the language and script the target's own messages use (English if they write English); all other fields in English. Be honest: a lukewarm chat gets lukewarm scores. Do not inflate to be nice.\n\n" +
            "SCORING RUBRIC (use the full 0-100 range):\n" +
            "interestScore: 0-30 = short/late/one-word replies, no questions back, closes topics; 31-55 = polite but passive, answers without adding; 56-75 = asks questions, adds details, matches or exceeds the user's length; 76-100 = initiates, teases, references earlier things, makes plans or hints at meeting, double-texts.\n" +
            "playfulnessScore: how much teasing, jokes, banter and emojis THEY contribute (not the user).\n" +
            "romanceScore: warmth, compliments, pet names, future talk, vulnerability from THEM. Stay under 40 unless there is explicit romantic language.\n" +
            "frameScore: how well the USER is holding a confident, non-needy balance. Deduct for double-texting, over-apologising, over-explaining, chasing, or matching every message with a longer one.\n" +
            "effortRatio: percentage of total conversational effort (message count, length, questions asked) coming from the USER. 50 is balanced; above 65 means the user is carrying it.\n" +
            "If the transcript has fewer than 4 messages from THEM, keep all scores between 35 and 60 and say in observation that there is not enough data yet.\n\n" +
            "Respond ONLY with JSON: " +
            '{"interestScore":0-100,"playfulnessScore":0-100,"romanceScore":0-100,"frameScore":0-100,"effortRatio":0-100,' +
            '"currentVibeSummary":string,"detectedIntent":string,"intentExplanation":string,"observation":string,"suggestion":string,"subtext":string,' +
            '"moments":[{"theirMessage":string,"subtext":string,"recommendedReply":string}],"doNext":string,"avoid":string}. ' +
            "detectedIntent is 2-4 words naming what THEY seem to want (e.g. 'Keeping it casual', 'Testing your interest', 'Wants to meet', 'Politely distant'). intentExplanation cites the evidence. moments has 1-2 items quoting the target's real messages from the transcript. doNext is one concrete next move; avoid is the one mistake most likely here. Keep every string under 220 characters.",
        },
        {
          role: "user",
          content:
            `Target: ${args.targetName}${args.relationship ? ` (${describeRelationship(args.relationship)})` : ""}. Personality: ${describeTraits(args.personalityTraits ?? [])}.\n` +
            `Transcript:\n${transcript}\n\nCHAT LANGUAGE: ${detectChatLanguage(args.messages.filter((m) => m.sender === "them").map((m) => m.text))}\n\nAnalyze this conversation now.`,
        },
      ],
    });

    const p = JSON.parse(completion.choices[0].message.content ?? "{}");
    await chargeCredit(ctx);
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

    const completion = await openai().chat.completions.create({
      model: VISION_MODEL,
      ...sampling(VISION_MODEL, 0),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You read chat screenshots. Transcribe ONLY the text messages you can actually see, in order, oldest first. Decide the sender by which SIDE of the screen the bubble is aligned to: bubbles aligned to the RIGHT edge are the phone owner's own sent messages (sender \"you\", usually the coloured bubbles); bubbles aligned to the LEFT edge are received from the other person (sender \"them\"). Do not decide by the contact name in the header. Keep every message in its ORIGINAL language and script exactly as shown (including emoji); never translate, romanize or change script. Skip timestamps, dates and system notices. Never invent or guess text. If there is no readable chat, return an empty messages array. Respond ONLY with JSON: " +
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
    const completion = await openai().chat.completions.create({
      model: MODEL,
      ...sampling(MODEL, 0.7),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a texting coach. The user is about to send a message. Predict 3 distinct, realistic ways the other person is likely to respond (one warm, one neutral or testing, one cold or deflecting) and the best follow-up for each, in character for this specific person. Write ifTheySay and suggestedReply in exactly the same language and script as the message the user is about to send (English stays English, a native script stays that script); intent is in English. " +
            TEXTING_RULES + " Respond ONLY with JSON: " +
            '{"nodes":[{"ifTheySay":string,"suggestedReply":string,"intent":string,"confidence":0-100}]} (exactly 3 nodes). Keep every string under 160 characters.',
        },
        {
          role: "user",
          content: `Other person: ${args.targetName} (${describeRelationship(args.relationship)}). Personality: ${describeTraits(args.personalityTraits)}.${args.context ? `\nContext: ${args.context}` : ""}\nThe user is about to send: "${args.suggestedReply}"\nCHAT LANGUAGE: ${detectChatLanguage([args.suggestedReply])}`,
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
