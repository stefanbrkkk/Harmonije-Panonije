"use client";

import { useLayoutEffect } from "react";

const selector = [
  ".section-heading",
  ".catalog-toolbar",
  ".catalog-panel__intro",
  ".product-card",
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

export function MotionOrchestrator() {
  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new WeakSet<Element>();
    let observer: IntersectionObserver | null = null;

    const prepare = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((node, index) => {
        if (observed.has(node)) return;
        observed.add(node);
        node.classList.add("reveal-target");
        node.style.setProperty("--reveal-delay", `${Math.min(250, (index % 6) * 45)}ms`);
        if (reduced.matches) node.classList.add("is-inview");
        else observer?.observe(node);
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
