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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[currentTextIndex];

    // If paused, wait before starting to delete
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, delayBetween);
      return () => clearTimeout(pauseTimeout);
    }

    // Typing phase
    if (!isDeleting && displayedText.length < currentText.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(typingTimeout);
    }

    // Finished typing, pause before deleting
    if (!isDeleting && displayedText.length === currentText.length) {
      setIsPaused(true);
      return;
    }

    // Deleting phase
    if (isDeleting && displayedText.length > 0) {
      const deletingTimeout = setTimeout(() => {
        setDisplayedText(displayedText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(deletingTimeout);
    }

    // Finished deleting, move to next text
    if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }
  }, [
    displayedText,
    currentTextIndex,
    isDeleting,
    isPaused,
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
