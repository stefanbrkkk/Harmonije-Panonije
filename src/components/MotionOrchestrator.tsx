"use client";

import { useLayoutEffect } from "react";

// Single controlled reveal system. Product cards are excluded: the catalog
// owns its own 250-450ms transition and must not double-animate.
const selector = [
  ".section-heading",
  ".catalog-toolbar",
  ".catalog-panel__intro",
  ".story-copy > *",
  ".story-art",
  ".ingredient-card",
  ".delivery-copy > *",
  ".delivery-map",
  ".proof-intro",
  ".proof-quotes article",
  ".proof-press",
  ".final-cta__inner > *",
].join(",");

function inViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
}

export function MotionOrchestrator() {
  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new WeakSet<Element>();
    const scopeCounts = new Map<Element, number>();
    let observer: IntersectionObserver | null = null;

    const prepare = (root: ParentNode = document) => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
      nodes.forEach((node) => {
        if (observed.has(node)) return;
        observed.add(node);
        node.classList.add("reveal-target");
        // Local semantic order: position within the nearest section, never
        // the global document index, capped so cascades stay tight.
        const scope = node.closest("section, footer") ?? document.body;
        const localIndex = scopeCounts.get(scope) ?? 0;
        scopeCounts.set(scope, localIndex + 1);
        node.style.setProperty("--reveal-delay", `${Math.min(180, localIndex * 60)}ms`);
        if (reduced.matches || inViewport(node)) {
          // Above-the-fold content becomes visible in the same pre-paint
          // frame: never visible -> hidden -> visible.
          node.classList.add("is-inview", "is-initial");
        } else {
          observer?.observe(node);
        }
      });
    };

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-inview");
          observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" },
    );

    // Added synchronously in useLayoutEffect (pre-paint): hero entrance and
    // reveals gate on this class without a flash of unstyled content.
    document.documentElement.classList.add("motion-ready");
    prepare();
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) prepare(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
