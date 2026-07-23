export { EmmaProvider, useEmma, type EmmaLessonContext, type EmmaMessage } from "./EmmaContext";
export { EmmaUI } from "./EmmaUI";
export { EmmaButton } from "./EmmaButton";
export { EmmaConversation } from "./EmmaConversation";
export { EmmaQuickActions } from "./EmmaQuickActions";
export { EmmaComposer } from "./EmmaComposer";
export { EmmaLoading } from "./EmmaLoading";
export { EmmaHintCard, useLessonContext } from "./EmmaHintCard";
// Re-export the message component under a distinct name to avoid collision with the
// EmmaMessage type from EmmaContext.
export { EmmaMessage as EmmaMessageBubble } from "./EmmaMessage";
