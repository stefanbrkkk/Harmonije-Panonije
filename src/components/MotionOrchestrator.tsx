"use client";

import { useLayoutEffect } from "react";

// Single controlled reveal system. Product cards are excluded: the catalog
// owns its own 250-450ms transition and must not double-animate.
const selector = [
  ".section-heading",
  ".catalog-toolbar",
  ".catalog-panel__intro",
  ".catalog-ritual",
  ".story-copy > *",
  ".story-art",
  ".ingredients-head",
  ".ingredients-plate",
  ".ingredients-index li",
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
      // Read every position first, then write: interleaving a class write
      // with a layout read per node forced one full layout per node.
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((node) => !observed.has(node));
      const visible = nodes.map((node) => reduced.matches || inViewport(node));
      nodes.forEach((node, index) => {
        observed.add(node);
        node.classList.add("reveal-target");
        // Local semantic order: position within the nearest section, never
        // the global document index, capped so cascades stay tight.
        // Role base keeps the editorial hierarchy: headings lead, lead copy
        // follows, media complements, metadata closes.
        const scope = node.closest("section, footer") ?? document.body;
        const localIndex = scopeCounts.get(scope) ?? 0;
        scopeCounts.set(scope, localIndex + 1);
        const roleBase = node.matches(".section-heading, .ingredients-head")
          ? 0
          : node.matches(".catalog-panel__intro, .proof-intro, .catalog-toolbar")
            ? 40
            : node.matches(".story-art, .delivery-map, .ingredients-plate, .ingredients-index li")
              ? 100
              : node.matches(".proof-press")
                ? 150
                : 70;
        node.style.setProperty("--reveal-delay", `${Math.min(200, roleBase + localIndex * 20)}ms`);
        if (visible[index]) {
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

    // Decorative infinite loops (hero floats, the journey bee's wings) pause
    // while their section is off-screen, so an idle page does no per-frame
    // style work for art nobody can see.
    const sleepers = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
      },
      { rootMargin: "100px 0px" },
    );
    document.querySelectorAll(".hero-section, #put-pcele").forEach((node) => sleepers.observe(node));

    return () => {
      observer?.disconnect();
      sleepers.disconnect();
      mutations.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
