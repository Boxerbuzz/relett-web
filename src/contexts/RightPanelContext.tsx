"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RightPanelContextType {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  open: (content: ReactNode, title?: string) => void;
  close: () => void;
  toggle: () => void;
}

const RightPanelContext = createContext<RightPanelContextType | undefined>(undefined);

interface RightPanelProviderProps {
  children: ReactNode;
}

export function RightPanelProvider({ children }: RightPanelProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState("");

  const open = (newContent: ReactNode, newTitle: string = "") => {
    setContent(newContent);
    setTitle(newTitle);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    // Clear content after animation completes
    setTimeout(() => {
      setContent(null);
      setTitle("");
    }, 300);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else if (content) {
      setIsOpen(true);
    }
  };

  return (
    <RightPanelContext.Provider
      value={{
        isOpen,
        content,
        title,
        open,
        close,
        toggle,
      }}
    >
      {children}
    </RightPanelContext.Provider>
  );
}

export function useRightPanel() {
  const context = useContext(RightPanelContext);
  if (context === undefined) {
    throw new Error("useRightPanel must be used within a RightPanelProvider");
  }
  return context;
}