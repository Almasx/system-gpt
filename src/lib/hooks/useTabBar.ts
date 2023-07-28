import { useCallback, useEffect, useRef, useState } from "react";

export const useTabBar = <T extends HTMLElement, U extends HTMLElement>(
  initialTab: string,
  offset?: boolean
) => {
  const [activeValue, setActiveValue] = useState<string>(initialTab);
  const indicatorRef = useRef<U | null>(null);
  const tabBarRef = useRef<Map<string, T | null>>(new Map());

  const setActive = useCallback((value: string) => setActiveValue(value), []);
  const setRef = useCallback(
    (value: string, ref: T) => tabBarRef.current.set(value, ref),
    []
  );

  useEffect(() => {
    const width = tabBarRef.current.get(activeValue)?.offsetWidth;
    const left = tabBarRef.current.get(activeValue)?.offsetLeft;
    indicatorRef.current!.style.width = `${
      width! - (offset === true || offset === undefined ? 4 : 0)
    }px`;
    indicatorRef.current!.style.left = `${
      left! + (offset === true || offset === undefined ? 2 : 0)
    }px`;
  }, [activeValue, offset]);

  return { indicatorRef, setRef, setActive, activeValue };
};
