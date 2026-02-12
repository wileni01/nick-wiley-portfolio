import type { Metadata } from "next";
import { ChatInterface } from "@/components/chat/chat-interface";

export const metadata: Metadata = {
  title: "Chat with Nick's AI",
  description:
    "Ask Nick Wiley's AI assistant about his professional experience, skills, and projects. Powered by GPT-4o and Claude with RAG.",
};

export default function ChatPage() {
  return <ChatInterface />;
}
