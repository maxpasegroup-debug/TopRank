export type ChatMessage = {
  speaker: "student" | "tara";
  text: string;
};

export type QuickAction = {
  title: string;
  detail: string;
  href: string;
};

export type Mood = {
  label: string;
  feeling: string;
  href: string;
};

export type Conversation = {
  title: string;
  time: string;
  href: string;
};

export const quickActions: QuickAction[] = [
  { title: "Help Me Study", detail: "Turn confusion into one topic.", href: "/tara/chat/study" },
  { title: "Motivate Me", detail: "A calm push for today.", href: "/tara/chat/motivate" },
  { title: "Plan My Day", detail: "Make the day feel doable.", href: "/tara/chat/plan" },
  { title: "Revise With Me", detail: "Pick one revision block.", href: "/tara/chat/revise" },
  { title: "Explain a Concept", detail: "Preview future explanations.", href: "/tara/chat/concept" },
];

export const moods: Mood[] = [
  { label: "Great", feeling: "Ready and steady", href: "/tara/mood/great" },
  { label: "Okay", feeling: "Need a simple start", href: "/tara/mood/okay" },
  { label: "Stressed", feeling: "Need calm guidance", href: "/tara/mood/stressed" },
  { label: "Tired", feeling: "Need a light plan", href: "/tara/mood/tired" },
];

export const conversations: Record<string, ChatMessage[]> = {
  study: [
    { speaker: "student", text: "I'm finding Physics difficult." },
    { speaker: "tara", text: "That's okay. Difficulty means your brain is meeting something new." },
    { speaker: "tara", text: "Let's focus on one chapter today: Motion. Start with displacement, then do 10 simple questions." },
  ],
  motivate: [
    { speaker: "student", text: "I don't feel confident today." },
    { speaker: "tara", text: "Confidence usually comes after action, not before it." },
    { speaker: "tara", text: "Do one small practice set now. Let effort be the win today." },
  ],
  plan: [
    { speaker: "student", text: "Can you plan my day?" },
    { speaker: "tara", text: "Yes. Keep it light and clear: Physics, then practice, then revision." },
    { speaker: "tara", text: "Finish Motion basics first. After that, answer 30 questions." },
  ],
  revise: [
    { speaker: "student", text: "I need to revise quickly." },
    { speaker: "tara", text: "Good. Revision works best when it is small and repeatable." },
    { speaker: "tara", text: "Open Biology highlights and revise Cell Biology for 20 minutes." },
  ],
  concept: [
    { speaker: "student", text: "Explain displacement." },
    { speaker: "tara", text: "In this prototype, I can only show scripted guidance." },
    { speaker: "tara", text: "When AI is connected, I will explain concepts step by step. For now, continue the Motion lesson." },
  ],
  ask: [
    { speaker: "student", text: "Can you help with my doubt?" },
    { speaker: "tara", text: "I'll be able to answer this once AI is connected." },
    { speaker: "tara", text: "For now, continue Physics and finish one Motion practice set." },
  ],
};

export const moodResponses: Record<string, ChatMessage[]> = {
  great: [
    { speaker: "student", text: "I'm feeling great today." },
    { speaker: "tara", text: "Beautiful. Use that energy for the topic that matters most." },
    { speaker: "tara", text: "Start today's Physics practice while your mind is fresh." },
  ],
  okay: [
    { speaker: "student", text: "I'm okay today." },
    { speaker: "tara", text: "Okay is enough. You do not need a perfect mood to make progress." },
    { speaker: "tara", text: "Begin with 20 minutes of Motion revision." },
  ],
  stressed: [
    { speaker: "student", text: "I'm feeling stressed." },
    { speaker: "tara", text: "Pause for a minute. You are not behind forever; you only need the next step." },
    { speaker: "tara", text: "Do 10 easy Physics questions. Small wins calm the mind." },
  ],
  tired: [
    { speaker: "student", text: "I'm tired today." },
    { speaker: "tara", text: "Then we keep the mission gentle. Showing up still counts." },
    { speaker: "tara", text: "Revise Biology highlights for 15 minutes, then stop." },
  ],
};

export const historyItems: Conversation[] = [
  { title: "Yesterday", time: "Motion doubt support", href: "/tara/chat/study" },
  { title: "Last Week", time: "Study routine planning", href: "/tara/chat/plan" },
  { title: "Exam Strategy", time: "Mock test confidence", href: "/tara/chat/motivate" },
  { title: "Physics Help", time: "Displacement basics", href: "/tara/chat/concept" },
];

export const plannerItems = ["Physics - Motion", "30 Questions", "Revision - Cell Biology"];
