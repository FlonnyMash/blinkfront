"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

export type ScanLayoutSnapshot = {
  input: DOMRect;
  copy?: DOMRect;
};

type FlipStyles = {
  input?: CSSProperties;
  panel?: CSSProperties;
};

const TRANSITION_MS = 720;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function emptyStyles(): FlipStyles {
  return {};
}

export function useScanLayoutFlip(
  active: boolean,
  snapshot: ScanLayoutSnapshot | null,
  inputRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  onComplete?: () => void,
) {
  const [flipStyles, setFlipStyles] = useState<FlipStyles>(emptyStyles);
  const [isAnimating, setIsAnimating] = useState(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useLayoutEffect(() => {
    if (!active || !snapshot) {
      return;
    }

    const inputEl = inputRef.current;
    if (!inputEl) {
      return;
    }

    if (prefersReducedMotion()) {
      onCompleteRef.current?.();
      return;
    }

    let rafMeasure = 0;
    let raf1 = 0;
    let raf2 = 0;
    let attempts = 0;

    const runFlip = () => {
      const panelEl = panelRef.current;
      if (panelEl && panelEl.offsetHeight < 48 && attempts < 8) {
        attempts += 1;
        rafMeasure = window.requestAnimationFrame(runFlip);
        return;
      }

      const inputFinal = inputEl.getBoundingClientRect();
      const dx = snapshot.input.left - inputFinal.left;
      const dy = snapshot.input.top - inputFinal.top;

      let panelFrom: CSSProperties | undefined;
      if (panelEl) {
        panelFrom = {
          transform: "translate3d(0, calc(100% + 1.5rem), 0)",
          transformOrigin: "top center",
          opacity: 0,
          transition: "none",
        };
      }

      setFlipStyles({
        input: {
          transform: `translate3d(${dx}px, ${dy}px, 0)`,
          transition: "none",
        },
        panel: panelFrom,
      });
      setIsAnimating(false);

      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setIsAnimating(true);
          setFlipStyles({
            input: {
              transform: "translate3d(0, 0, 0)",
              transition: `transform ${TRANSITION_MS}ms ${EASING}`,
            },
            panel: panelEl
              ? {
                  transform: "translate3d(0, 0, 0)",
                  transformOrigin: "top center",
                  opacity: 1,
                  transition: `transform ${TRANSITION_MS}ms ${EASING}, opacity 560ms ease-out`,
                }
              : undefined,
          });
        });
      });
    };

    runFlip();

    return () => {
      window.cancelAnimationFrame(rafMeasure);
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [active, snapshot, inputRef, panelRef]);

  useEffect(() => {
    if (!snapshot || !isAnimating) {
      return;
    }

    const inputEl = inputRef.current;
    if (!inputEl) {
      return;
    }

    let cleared = false;
    const clear = () => {
      if (cleared) {
        return;
      }
      cleared = true;
      setFlipStyles(emptyStyles());
      setIsAnimating(false);
      onCompleteRef.current?.();
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== inputEl || event.propertyName !== "transform") {
        return;
      }
      clear();
    };

    inputEl.addEventListener("transitionend", onTransitionEnd);
    const timeoutId = window.setTimeout(clear, TRANSITION_MS + 120);

    return () => {
      inputEl.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timeoutId);
    };
  }, [snapshot, isAnimating, inputRef]);

  const resetFlip = () => {
    setFlipStyles(emptyStyles());
    setIsAnimating(false);
  };

  return {
    flipStyles,
    isAnimating,
    resetFlip,
    transitionMs: TRANSITION_MS,
  };
}
