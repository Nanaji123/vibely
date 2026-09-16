import { ChatMessage, PulseAnalysis, ResponseOption, BranchingNode, TargetProfile } from '../types';

export interface CoachSceneResponse {
  sceneContext: string;
  advice: string;
  suggestions: { id: string; category: string; replyText: string; toneVariant: string }[];
}

export class AIService {
  /**
   * Generates 3 distinct tailored response options strictly in the selected genre/vibe and target gender
   */
  static generateGenreReplies(
    lastMessage: string,
    desiredVibe: string,
    relationship: string,
    targetName: string,
    targetGender: 'female' | 'male' | 'other' = 'female'
  ): { id: string; category: string; replyText: string; toneVariant: string }[] {
    const raw = (lastMessage || '').trim();
    const text = raw.toLowerCase();
    const name = targetName || 'them';
    const isHer = targetGender === 'female';
    const isHim = targetGender === 'male';

    // Topic detection
    const isGreeting = /^(hey|hi|hello|what'?s up|sup|yo|good morning|gm|good night|gn)\b/i.test(text);
    const isWeekendPlans = text.includes('weekend') || text.includes('plans') || text.includes('doing') || text.includes('free') || text.includes('tonight') || text.includes('tomorrow');
    const isStayingHomeOrBored = text.includes('staying home') || text.includes('bored') || text.includes('lazy') || text.includes('bed') || text.includes('couch') || text.includes('nothing') || text.includes('netflix');
    const isDryOrShort = /^(haha|lol|lmao|k|ok|cool|yeah|nice|hmm|fine|true|sure)\b/i.test(text) || text.length <= 6;
    const isTiredOrBusy = text.includes('tired') || text.includes('exhausted') || text.includes('sleep') || text.includes('work') || text.includes('busy') || text.includes('long day');
    const isComplimentOrFlirt = text.includes('cute') || text.includes('miss') || text.includes('handsome') || text.includes('pretty') || text.includes('sweet') || text.includes('love') || text.includes('smile');
    const isFoodOrCoffee = text.includes('coffee') || text.includes('drink') || text.includes('eat') || text.includes('food') || text.includes('dinner') || text.includes('lunch') || text.includes('hungry');

    switch (desiredVibe.toLowerCase()) {
      case 'flirty':
        if (isStayingHomeOrBored) {
          return [
            {
              id: 'flirt-1',
              category: 'Flirty',
              toneVariant: 'Bold & Direct',
              replyText: isHer
                ? `Staying home? Sounds like you need better company 😏 I know a great spot.`
                : `Bored at home? You definitely need better entertainment 😏`,
            },
            {
              id: 'flirt-2',
              category: 'Flirty',
              toneVariant: 'Playful Tease',
              replyText: isHer
                ? `Couch potato mode? Only if you're saving a spot for me 😉`
                : `Staying in? Only acceptable if you're daydreaming about me 😉`,
            },
            {
              id: 'flirt-3',
              category: 'Flirty',
              toneVariant: 'Smooth & Magnetic',
              replyText: isHer
                ? `Staying in wouldn't be nearly as boring with the right company ❤️`
                : `Let's fix that. Tell me what your favorite cheat meal is right now 🍕`,
            },
          ];
        } else if (isWeekendPlans) {
          return [
            {
              id: 'flirt-1',
              category: 'Flirty',
              toneVariant: 'Forward & Decisive',
              replyText: isHer
                ? `Well, your weekend itinerary just changed: you're getting drinks with me 😏`
                : `Free this weekend? Don't make plans until you hear what I have in mind 😏`,
            },
            {
              id: 'flirt-2',
              category: 'Flirty',
              toneVariant: 'Teasing Friction',
              replyText: isHer
                ? `I was going to invite you out, but I'm not sure if you can handle my banter 😉`
                : `I'd invite you along, but you might distract me too much 😉`,
            },
            {
              id: 'flirt-3',
              category: 'Flirty',
              toneVariant: 'Charming Invite',
              replyText: `Let's make an excuse to see each other this weekend. Drinks or coffee? ☕`,
            },
          ];
        } else if (isDryOrShort) {
          return [
            {
              id: 'flirt-1',
              category: 'Flirty',
              toneVariant: 'Confident Challenge',
              replyText: isHer
                ? `Don't laugh too hard, you haven't seen my best charm yet 😏`
                : `Careful, laughing at all my texts is stage one of catching feelings 😏`,
            },
            {
              id: 'flirt-2',
              category: 'Flirty',
              toneVariant: 'Playful Callout',
              replyText: `That '${raw}' sounds like you're secretly smiling at your phone right now 😉`,
            },
            {
              id: 'flirt-3',
              category: 'Flirty',
              toneVariant: 'Magnetic Reset',
              replyText: `You always know how to keep me intrigued, even with three letters ✨`,
            },
          ];
        } else if (isTiredOrBusy) {
          return [
            {
              id: 'flirt-1',
              category: 'Flirty',
              toneVariant: 'Sweet & Attentive',
              replyText: isHer
                ? `Tired? Sounds like you need someone to bring you coffee and rub your shoulders ✨`
                : `Working hard as always. Don't forget to take a break for the important things (like me) 😉`,
            },
            {
              id: 'flirt-2',
              category: 'Flirty',
              toneVariant: 'Playful Tease',
              replyText: `Exhausted from being on my mind all day? I don't blame you 😏`,
            },
            {
              id: 'flirt-3',
              category: 'Flirty',
              toneVariant: 'Cozy Charm',
              replyText: `Get some rest tonight. You deserve it... and I need you fully recharged for later ❤️`,
            },
          ];
        } else if (isGreeting) {
          return [
            {
              id: 'flirt-1',
              category: 'Flirty',
              toneVariant: 'Bold & Forward',
              replyText: isHer
                ? `Hey stranger 😏 Was just wondering when you'd pop up.`
                : `Hey there 😏 Perfect timing, I was just thinking about you.`,
            },
            {
              id: 'flirt-2',
              category: 'Flirty',
              toneVariant: 'Playful Spark',
              replyText: `Hey! What trouble are we getting into today? 😉`,
            },
            {
              id: 'flirt-3',
              category: 'Flirty',
              toneVariant: 'Charming & Warm',
              replyText: `Seeing your name pop up always makes my phone look better ✨`,
            },
          ];
        } else {
          return [
            {
              id: 'flirt-1',
              category: 'Flirty',
              toneVariant: 'Playful Hint',
              replyText: isHer
                ? `You're dangerously fun to talk to, ${name}. You know that right? 😉`
                : `You're dangerously charming when you want to be, you know that? 😉`,
            },
            {
              id: 'flirt-2',
              category: 'Flirty',
              toneVariant: 'Bold & Confident',
              replyText: `Tell me the truth—did you miss me a little today? 😏`,
            },
            {
              id: 'flirt-3',
              category: 'Flirty',
              toneVariant: 'Intriguing Hook',
              replyText: `Every time you text me, my day instantly gets more interesting ❤️`,
            },
          ];
        }

      case 'witty':
        if (isStayingHomeOrBored) {
          return [
            {
              id: 'witty-1',
              category: 'Witty',
              toneVariant: 'Dry Humor',
              replyText: `Respect. Your weekend itinerary: bed → fridge → couch 🏆`,
            },
            {
              id: 'witty-2',
              category: 'Witty',
              toneVariant: 'Observational Sarcasm',
              replyText: `Olympic-level resting. Don't strain yourself out there in the living room.`,
            },
            {
              id: 'witty-3',
              category: 'Witty',
              toneVariant: 'Clever Banter',
              replyText: `I'd judge you, but my couch and I have an exclusive relationship too.`,
            },
          ];
        } else if (isDryOrShort) {
          return [
            {
              id: 'witty-1',
              category: 'Witty',
              toneVariant: 'Banter Callout',
              replyText: `Careful, don't use up all your vocabulary in one text 😂`,
            },
            {
              id: 'witty-2',
              category: 'Witty',
              toneVariant: 'Comedic Demotion',
              replyText: `I've officially been demoted to single-word status. Tough crowd today! 🎭`,
            },
            {
              id: 'witty-3',
              category: 'Witty',
              toneVariant: 'Playful Challenge',
              replyText: `That response was so brief my phone barely felt the vibration 😂`,
            },
          ];
        } else {
          return [
            {
              id: 'witty-1',
              category: 'Witty',
              toneVariant: 'Clever Banter',
              replyText: `Plot twist of the century. I did not see that coming 🍿`,
            },
            {
              id: 'witty-2',
              category: 'Witty',
              toneVariant: 'Sharp Tease',
              replyText: `Bold statement. Now you have 30 seconds to defend your thesis 😂`,
            },
            {
              id: 'witty-3',
              category: 'Witty',
              toneVariant: 'Humorous Reality Check',
              replyText: `Wait, are you speaking from extensive experience or just winging it like the rest of us?`,
            },
          ];
        }

      case 'confident':
        if (isWeekendPlans || isStayingHomeOrBored) {
          return [
            {
              id: 'conf-1',
              category: 'Confident',
              toneVariant: 'Decisive Plan',
              replyText: isHer
                ? `Not on my watch. Let's get dessert this weekend, my treat 😎`
                : `Say less. Meet me at 8 on Saturday, I'm picking the spot 😎`,
            },
            {
              id: 'conf-2',
              category: 'Confident',
              toneVariant: 'High Status Direct',
              replyText: `I like where this is going. We definitely need to continue this over drinks.`,
            },
            {
              id: 'conf-3',
              category: 'Confident',
              toneVariant: 'Clear & Unapologetic',
              replyText: `You're free, I'm free—let's not overcomplicate it. Saturday it is.`,
            },
          ];
        } else {
          return [
            {
              id: 'conf-1',
              category: 'Confident',
              toneVariant: 'Unshakable Frame',
              replyText: `I like how your mind works. We're definitely on the same wavelength.`,
            },
            {
              id: 'conf-2',
              category: 'Confident',
              toneVariant: 'Decisive Action',
              replyText: `Say less. You just bring yourself, I'll take care of the rest.`,
            },
            {
              id: 'conf-3',
              category: 'Confident',
              toneVariant: 'Charismatic Lead',
              replyText: `You have great taste. No wonder we get along so well 😎`,
            },
          ];
        }

      case 'romantic':
        return [
          {
            id: 'rom-1',
            category: 'Romantic',
            toneVariant: 'Sweet & Warm',
            replyText: `Honestly, talking to you is always the best part of my day ❤️`,
          },
          {
            id: 'rom-2',
            category: 'Romantic',
            toneVariant: 'Gentle Affection',
            replyText: isHer
              ? `Staying home sounds nice, but it'd be ten times cozier with you here.`
              : `Whatever you're doing, I just hope you know how much I appreciate talking to you ✨`,
          },
          {
            id: 'rom-3',
            category: 'Romantic',
            toneVariant: 'Thoughtful Depth',
            replyText: `I always find myself looking forward to your messages more than anyone else's.`,
          },
        ];

      case 'caring':
      case 'warm':
        return [
          {
            id: 'care-1',
            category: 'Warm',
            toneVariant: 'Supportive & Attentive',
            replyText: `Sounds like you deserve some serious relaxation! Make sure you unplug and chill 🫶`,
          },
          {
            id: 'care-2',
            category: 'Warm',
            toneVariant: 'Empathetic Check-in',
            replyText: `Hope your week hasn't been too hectic. Always here if you want to vent or unwind!`,
          },
          {
            id: 'care-3',
            category: 'Warm',
            toneVariant: 'Friendly & Uplifting',
            replyText: `Sending you positive energy! Eat something delicious and get plenty of rest 😊`,
          },
        ];

      case 'playful':
      default:
        if (isStayingHomeOrBored) {
          return [
            {
              id: 'play-1',
              category: 'Playful',
              toneVariant: 'Cheeky Tease',
              replyText: `Professional couch potato mode activated 😂 What's the main event, scrolling or napping?`,
            },
            {
              id: 'play-2',
              category: 'Playful',
              toneVariant: 'Fun Challenge',
              replyText: isHer
                ? `Staying home? I bet I can convince you to get ice cream in under 5 minutes 🍦`
                : `Staying home? Don't make me come drag you out for tacos 🌮`,
            },
            {
              id: 'play-3',
              category: 'Playful',
              toneVariant: 'Curious Banter',
              replyText: `Wait, are we talking sweatpants all day or do you at least put real socks on? 😂`,
            },
          ];
        } else {
          return [
            {
              id: 'play-1',
              category: 'Playful',
              toneVariant: 'Playful Tease',
              replyText: `Wait, are you telling me the truth or just testing my reaction? 😂`,
            },
            {
              id: 'play-2',
              category: 'Playful',
              toneVariant: 'Banter Hook',
              replyText: `Okay that's hilarious. You definitely owe me the full story behind that!`,
            },
            {
              id: 'play-3',
              category: 'Playful',
              toneVariant: 'Cheeky Response',
              replyText: `I'm going to pretend you didn't just say that 😂 What really happened?`,
            },
          ];
        }
    }
  }

  /**
   * Wingman Scene Context & 3 Suggestions Generator
   * Breaks down what the target actually meant in the scene and generates 3 tailored replies
   */
  static generateCoachSceneResponse(
    userPrompt: string,
    desiredVibe: string,
    relationship: string,
    targetName: string,
    targetGender: 'female' | 'male' | 'other' = 'female'
  ): CoachSceneResponse {
    const name = targetName || 'Sarah';
    const isHer = targetGender === 'female';
    const cleanPrompt = userPrompt
      .replace(/^(she|he|they) (said|replied|texted|told me):?/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();
    const text = (cleanPrompt || userPrompt).toLowerCase();

    let sceneContext = '';
    let advice = '';

    if (
      text.includes('staying home') ||
      text.includes('bored') ||
      text.includes('couch') ||
      text.includes('lazy') ||
      text.includes('nothing') ||
      text.includes('bed') ||
      text.includes('netflix')
    ) {
      sceneContext = isHer
        ? `She's signaling her schedule is open, but playing it cool so she doesn't appear too eager. This is your cue to take the lead with a bold or playful move.`
        : `He has downtime and is waiting to see if you have something exciting going on.`;
      advice = `Don't ask "what do you wanna do?". Instead, playfully challenge their lazy mode and set up a fun spark:`;
    } else if (
      text.includes('weekend') ||
      text.includes('plans') ||
      text.includes('doing') ||
      text.includes('free') ||
      text.includes('tonight')
    ) {
      sceneContext = isHer
        ? `She's testing your availability and checking your vibe. If you answer like an interview, attraction drops.`
        : `He's checking if you're free or looking for an excuse to connect.`;
      advice = `Give a high-value teaser that pulls them in:`;
    } else if (/^(haha|lol|lmao|k|ok|cool|yeah|nice|hmm|fine)\b/i.test(text) || text.length <= 6) {
      sceneContext = `Low-effort text alert. If you match it with another boring question, the convo flatlines.`;
      advice = `Flip the script with teasing friction to reboot their interest:`;
    } else if (
      text.includes('tired') ||
      text.includes('exhausted') ||
      text.includes('work') ||
      text.includes('busy') ||
      text.includes('long day')
    ) {
      sceneContext = isHer
        ? `She had a draining day. Demanding long chatter will push her away; warmth or a cheeky tease makes you her favorite distraction.`
        : `He's unwinding after a long shift and needs low-pressure banter.`;
      advice = `Be the stress-relief in their day, not another chore:`;
    } else if (
      text.includes('cute') ||
      text.includes('miss') ||
      text.includes('handsome') ||
      text.includes('pretty') ||
      text.includes('sweet') ||
      text.includes('smile')
    ) {
      sceneContext = `High attraction signal! They gave you a direct opening to tease or escalate.`;
      advice = `Accept the compliment with confident charm—never get needy:`;
    } else if (
      text.includes('coffee') ||
      text.includes('drink') ||
      text.includes('eat') ||
      text.includes('food') ||
      text.includes('dinner')
    ) {
      sceneContext = `Food/drinks talk is the easiest ramp to meeting in person.`;
      advice = `Turn it into an invite or tease their tastes:`;
    } else {
      sceneContext = `They're keeping the door open. The goal right now is keeping tension and curiosity high.`;
      advice = `Here are 3 ${desiredVibe} ways you can reply to ${name}:`;
    }

    const suggestions = this.generateGenreReplies(
      cleanPrompt || userPrompt,
      desiredVibe,
      relationship,
      name,
      targetGender
    );

    return {
      sceneContext,
      advice,
      suggestions,
    };
  }

  /**
   * Generates 3 branching scenarios for "Continue Conversation"
   */
  static generateContinueTree(currentReply: string): BranchingNode[] {
    return [
      {
        id: 'node-1',
        ifTheySay: '"Like what?" / "What do you have in mind?"',
        suggestedReply: '"Glad you asked 😏 How about coffee or boba this Saturday around 4?"',
        intent: 'Direct Invitation (Call to Action)',
        confidence: 95,
      },
      {
        id: 'node-2',
        ifTheySay: '"Haha like staying in bed all day 😂"',
        suggestedReply: '"Professional couch potato! Fine, but only if we order great food 😂"',
        intent: 'Playful Banter Counter',
        confidence: 90,
      },
      {
        id: 'node-3',
        ifTheySay: '"Hmm okay 😂" / Dry response',
        suggestedReply: '"I see how it is! I\'ll stop before I get officially demoted 😜"',
        intent: 'Smooth Recovery & Tease',
        confidence: 86,
      },
    ];
  }

  /**
   * Simulates screenshot OCR extraction for uploaded chat images
   */
  static extractChatFromImage(imageUri: string): { title: string; targetName: string; messages: ChatMessage[] } {
    return {
      title: "Chat screenshot",
      targetName: "Sarah",
      messages: [
        { id: 'msg-1', sender: 'you', text: 'What are you doing this weekend?' },
        { id: 'msg-2', sender: 'them', text: 'Probably just staying home lol' },
      ],
    };
  }

  /**
   * Backward compatible helper
   */
  static generateTailoredReplies(
    messages: ChatMessage[],
    desiredVibe: string,
    relationship: string,
    personalityTraits: string[]
  ): ResponseOption[] {
    const lastMsg = messages[messages.length - 1]?.text || 'Hey';
    const genreReplies = this.generateGenreReplies(lastMsg, desiredVibe, relationship, 'them');
    return genreReplies.map(r => ({
      id: r.id,
      category: r.category as any,
      replyText: r.replyText,
      explanation: r.toneVariant,
      vibe: desiredVibe,
    }));
  }
}
