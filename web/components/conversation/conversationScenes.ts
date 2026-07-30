// Conversation simulator scenes (Section 11.2).
// Predefined real-world scenarios with Emma role assignments.

export interface ConversationScene {
  id: string;
  title: string;
  emoji: string;
  role: "waiter" | "shopkeeper" | "friend";
  description: string;
  openingLine: string;
  contextPrompt: string;
}

export const SCENES: ConversationScene[] = [
  {
    id: "ordering-food",
    title: "Ordering Food",
    emoji: "🍽️",
    role: "waiter",
    description: "Practice ordering food at a German restaurant.",
    openingLine: "Guten Abend! Willkommen im Restaurant. Was möchten Sie bestellen?",
    contextPrompt: "You are a friendly waiter at a German restaurant. The learner is a customer. Respond naturally in German, keep responses short (1-2 sentences). After the learner responds, continue the conversation. After every exchange, provide a brief grammar or vocabulary note. End your response with 'Tip:' followed by the improvement tip.",
  },
  {
    id: "buying-ticket",
    title: "Buying a Ticket",
    emoji: "🎫",
    role: "shopkeeper",
    description: "Practice buying a train ticket at the station.",
    openingLine: "Guten Tag! Wohin möchten Sie fahren?",
    contextPrompt: "You are a ticket seller at a German train station. The learner is buying a ticket. Respond naturally in German. Ask about destination, type of ticket (einfach / hin und zurück), and class. After every exchange, give a short grammar or vocabulary tip. End your response with 'Tip:' followed by the improvement tip.",
  },
  {
    id: "introducing-yourself",
    title: "Introducing Yourself",
    emoji: "👋",
    role: "friend",
    description: "Practice introducing yourself in a casual setting.",
    openingLine: "Hallo! Ich bin Emma. Freut mich, dich kennenzulernen! Wie heißt du?",
    contextPrompt: "You are Emma, a friendly German speaker meeting someone new. Be warm and conversational. Ask about their name, where they're from, what they do. After every exchange, point out one grammar or vocabulary improvement. End your response with 'Tip:' followed by the improvement tip.",
  },
  {
    id: "asking-directions",
    title: "Asking for Directions",
    emoji: "🗺️",
    role: "friend",
    description: "Practice asking for and giving directions in German.",
    openingLine: "Hallo! Kann ich dir helfen? Suchst du etwas?",
    contextPrompt: "You are a helpful local in a German city. The learner is a visitor asking for directions. Respond naturally in German with directions. Use phrases like 'links', 'rechts', 'geradeaus'. After every exchange, provide a grammar or vocabulary note. End your response with 'Tip:' followed by the improvement tip.",
  },
  {
    id: "shopping-clothes",
    title: "Shopping for Clothes",
    emoji: "👕",
    role: "shopkeeper",
    description: "Practice buying clothes at a German store.",
    openingLine: "Willkommen! Kann ich Ihnen helfen? Wir haben heute Sonderangebote!",
    contextPrompt: "You are a friendly shopkeeper at a German clothing store. The learner is a customer looking for clothes. Ask about size, color, and style preferences. Use phrases like 'Welche Größe?', 'Welche Farbe?', 'Das steht Ihnen gut!'. After every exchange, provide a brief grammar or vocabulary tip. End your response with 'Tip:' followed by the improvement tip.",
  },
];

export function getScene(id: string): ConversationScene | undefined {
  return SCENES.find((s) => s.id === id);
}
