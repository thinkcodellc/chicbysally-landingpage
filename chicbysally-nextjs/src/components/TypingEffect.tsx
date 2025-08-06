"use client";

import { useEffect, useRef } from 'react';
import TypeIt from "typeit";

export default function TypingEffect({ 
  texts, 
  elementId,
  className = '',
  loop = false,
  speed = 100,
  deleteSpeed = 50
}: { 
  texts: string[]; 
  elementId: string;
  className?: string;
  loop?: boolean;
  speed?: number;
  deleteSpeed?: number;
}) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let typeitInstance: { destroy: () => void } | null = null;

    if (typeof window !== 'undefined' && elementRef.current) {
      typeitInstance = new TypeIt(elementRef.current, {
        strings: texts,
        speed: speed,
        deleteSpeed: deleteSpeed,
        loop: loop,
        cursor: false,
      }).go();
    }

    return () => {
      if (typeitInstance) {
        typeitInstance.destroy();
      }
    };
  }, [texts, loop, speed, deleteSpeed]);

  return <span id={elementId} ref={elementRef} className={className}></span>;
}
