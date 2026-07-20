"use client";

import { createContext, useContext, type ReactNode } from "react";

const SendMessageContext = createContext<((text: string) => void) | null>(null);

export function SendMessageProvider({
  sendMessage,
  children,
}: {
  sendMessage: (text: string) => void;
  children: ReactNode;
}) {
  return <SendMessageContext.Provider value={sendMessage}>{children}</SendMessageContext.Provider>;
}

export function useSendMessage(): (text: string) => void {
  const sendMessage = useContext(SendMessageContext);
  if (!sendMessage) {
    throw new Error("useSendMessage must be called from within a GenerativeChat (or other chat widget) tree.");
  }
  return sendMessage;
}
