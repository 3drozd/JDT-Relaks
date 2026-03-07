"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [highlight, setHighlight] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;
    setHighlight(true);
    setDisplayValue(value);
    prevValue.current = value;
    const timeout = setTimeout(() => setHighlight(false), 1500);
    return () => clearTimeout(timeout);
  }, [value]);

  const digits = String(displayValue).split("");
  const prevDigits = String(prevValue.current).split("");

  return (
    <span
      className={`inline-flex rounded px-0.5 transition-colors duration-500 ${
        highlight ? "bg-green-100 text-green-700" : ""
      } ${className ?? ""}`}
    >
      {digits.map((digit, i) => (
        <DrumDigit key={i} target={parseInt(digit)} delay={i * 60} />
      ))}
    </span>
  );
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DrumDigit({ target, delay }: { target: number; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevTarget = useRef(target);
  const [current, setCurrent] = useState(target);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (target === prevTarget.current) return;

    const from = prevTarget.current;
    prevTarget.current = target;

    // Calculate steps to roll (going down means numbers decrease)
    let steps: number;
    if (target < from) {
      // e.g. 8 → 7: roll down by 1
      steps = from - target;
    } else {
      // e.g. 9 → 2: roll through 0 (wrap around)
      steps = 10 - target + from;
    }

    // Start from current position, animate to target
    setCurrent(from);
    setOffset(0);
    setAnimate(false);

    // Trigger animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
        setOffset(-steps); // negative = scroll up (numbers decrease)
      });
    });

    // After animation, snap to target
    const duration = 400 + steps * 80 + delay;
    const timeout = setTimeout(() => {
      setAnimate(false);
      setCurrent(target);
      setOffset(0);
    }, duration);

    return () => clearTimeout(timeout);
  }, [target, delay]);

  // Build the drum strip: current digit + all digits we roll through
  const stripDigits: number[] = [];
  if (offset !== 0) {
    const steps = Math.abs(offset);
    for (let i = 0; i <= steps; i++) {
      stripDigits.push((current - i + 10) % 10);
    }
  } else {
    stripDigits.push(current);
  }

  return (
    <span
      className="inline-block overflow-hidden text-center"
      style={{
        height: "1.2em",
        lineHeight: "1.2em",
        width: "0.65em",
      }}
    >
      <span
        ref={ref}
        className="inline-flex flex-col"
        style={{
          transition: animate
            ? `transform ${300 + Math.abs(offset) * 60}ms cubic-bezier(0.2, 0, 0.1, 1) ${delay}ms`
            : "none",
          transform: animate
            ? `translateY(${offset * 1.2}em)`
            : "translateY(0)",
        }}
      >
        {stripDigits.map((d, i) => (
          <span key={i} className="block" style={{ height: "1.2em" }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}
