"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useTransientState<T>(initialState: T, resetMs: number) {
  const [state, setState] = useState(initialState);
  const timeoutRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (timeoutRef.current === null) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const setTransientState = useCallback(
    (nextState: T) => {
      clearResetTimer();
      setState(nextState);
      if (Object.is(nextState, initialState)) return;
      timeoutRef.current = window.setTimeout(() => {
        setState(initialState);
        timeoutRef.current = null;
      }, resetMs);
    },
    [clearResetTimer, initialState, resetMs]
  );

  useEffect(() => {
    return () => {
      clearResetTimer();
    };
  }, [clearResetTimer]);

  return [state, setTransientState] as const;
}
