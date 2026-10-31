import { useLayoutEffect, useRef } from "react";

let sharedObserver;

function getSharedObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            sharedObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" }
    );
  }

  return sharedObserver;
}

export function useScrollReveal() {
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      !element ||
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      return undefined;
    }

    let observer;
    try {
      observer = getSharedObserver();
      element.classList.add("is-reveal-ready");
      observer.observe(element);
    } catch (error) {
      element.classList.remove("is-reveal-ready");
      console.error("Unable to observe scroll reveal:", error);
    }

    return () => {
      observer?.unobserve(element);
    };
  }, []);

  return elementRef;
}
