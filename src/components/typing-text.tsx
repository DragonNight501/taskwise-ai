"use client";

import { useEffect, useState } from "react";

type TypingTextProps = {
  text: string;
  speed?: number;
  delay?: number;
};

/**
 * Types `text` out once. Screen readers get the full text immediately; the
 * animated copy is hidden from them. Remount with a new `key` to replay.
 */
export default function TypingText({ text, speed = 14, delay = 0 }: TypingTextProps) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setLength((current) => {
          if (current >= text.length) {
            clearInterval(intervalId);
            return current;
          }
          return current + 1;
        });
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, length)}
        {length < text.length ? <span className="caret" /> : null}
      </span>
    </>
  );
}
