"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetween?: number;
  className?: string;
}

export function Typewriter({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetween = 2000,
  className = "",
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentTextIndex];

    if (!isDeleting) {
      // Typing phase
      if (displayedText.length < currentText.length) {
        const typingTimeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(typingTimeout);
      }

      // Finished typing, pause before deleting
      const pauseTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetween);
      return () => clearTimeout(pauseTimeout);
    }

    // Deleting phase, then move to next text once empty
    const deletingTimeout = setTimeout(() => {
      const nextText = displayedText.slice(0, -1);
      setDisplayedText(nextText);
      if (nextText.length === 0) {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      }
    }, deletingSpeed);
    return () => clearTimeout(deletingTimeout);
  }, [
    displayedText,
    currentTextIndex,
    isDeleting,
    texts,
    typingSpeed,
    deletingSpeed,
    delayBetween,
  ]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse inline-block w-0.5 h-[1em] bg-current ml-1 align-middle" />
    </span>
  );
}
