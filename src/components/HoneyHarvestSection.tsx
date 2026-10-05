"use client";

import { useEffect, useRef } from "react";
import { createSceneLoop } from "@/src/lib/scene";
import { bindShortWords } from "@/src/lib/typography";

export function HoneyHarvestSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const framesRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const copyARef = useRef<HTMLDivElement>(null);
  const copyBRef = useRef<HTMLDivElement>(null);
  const copyCRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 800px), (pointer: coarse)");
    const chapters = [copyARef.current, copyBRef.current, copyCRef.current];
    let targetTime = 0;
    let seeking = false;
    let disposed = false;
    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      return Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
    };
    // One outstanding seek at a time. The newest scroll position replaces
    // the pending target, so rapid scrolling never queues obsolete frames.
    const seek = () => {
      if (disposed || mobile.matches || reduced.matches || seeking || video.readyState < 2 || !Number.isFinite(video.duration)) return;
      if (Math.abs(video.currentTime - targetTime) < 1 / 48) return;
      seeking = true;
      video.currentTime = targetTime;
    };
    const paint = (progress: number) => {
      targetTime = progress * Math.max(0, (video.duration || 0) - 1 / 24);
      seek();
      // A single predecoded atlas avoids iOS paused-video/seek restrictions.
      // 97 frames sampled directly from the supplied video at 16 fps.
      const frame = Math.min(96, Math.round(progress * 96));
      if (framesRef.current) {
        framesRef.current.style.backgroundPosition = `${(frame % 10) * 100 / 9}% ${Math.floor(frame / 10) * 100 / 9}%`;
        framesRef.current.dataset.frame = String(frame);
      }
      // Keep one chapter fully legible even at the exact handoff boundaries.
      const active = progress < 0.46 ? 0 : progress < 0.78 ? 1 : 2;
      chapters.forEach((node, index) => {
        if (node) {
          node.style.opacity = index === active ? "1" : "0";
          node.style.transform = "none";
        }
      });
    };
    const paintStatic = () => {
      video.pause();
      chapters.forEach((node) => {
        if (node) { node.style.opacity = "1"; node.style.transform = "none"; }
      });
    };
    const onSeeked = () => { seeking = false; seek(); };
    const onReady = () => { seeking = false; if (!reduced.matches) paint(readProgress()); };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadeddata", onReady);
    mobile.addEventListener("change", onReady);
    section.classList.add("is-live");
    if (reduced.matches) paintStatic(); else paint(readProgress());
    const stopLoop = createSceneLoop(section, reduced, {
      paint,
      readTarget: readProgress,
      advance: (_current, target) => target,
      paintStatic,
    }, 1);
    return () => {
      disposed = true;
      stopLoop();
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadeddata", onReady);
      mobile.removeEventListener("change", onReady);
      section.classList.remove("is-live");
    };
  }, []);

  return (
    <section ref={sectionRef} className="honey-harvest honey-harvest--video section-honey" aria-labelledby="honey-harvest-title" data-page-bee="hide">
      <div className="honey-harvest__sticky">
        <div className="honey-harvest__copy shell">
          <div ref={copyARef} className="honey-harvest__chapter honey-harvest__chapter--a">
            <p className="eyebrow"><span />Priča jednog sastojka</p>
            <h2 id="honey-harvest-title">Od cveta do{"\u00a0"}<em>meda.</em></h2>
            <p>{bindShortWords("Pčela sleće na cvet, uzima nektar i nosi ga dalje. Taj prirodni put vodi do livadskog meda — osnove svakog našeg sirupa.")}</p>
          </div>
          <div ref={copyBRef} className="honey-harvest__chapter honey-harvest__chapter--b">
            <p className="eyebrow"><span />Sakupljanje</p>
            <h2>Nektar postaje <em>zlatna osnova.</em></h2>
            <p>{bindShortWords("U košnici pčele nektar pretvaraju u med. Kod nas livadski med čini trećinu svake boce sirupa.")}</p>
          </div>
          <div ref={copyCRef} className="honey-harvest__chapter honey-harvest__chapter--c">
            <p className="eyebrow"><span />Harmonija</p>
            <h2>{"Med\u00a0+ limun\u00a0+"} <em>karakter ukusa.</em></h2>
            <p>{bindShortWords("Na toj osnovi grade se različite kombinacije voća, bobica, bilja, povrća i đumbira — svaki ukus sa sopstvenim karakterom.")}</p>
          </div>
        </div>

        <div className="honey-harvest__scene" aria-hidden="true">
          <div ref={framesRef} className="honey-harvest__frames" data-frame="0" />
          <video
            ref={videoRef}
            className="honey-harvest__video"
            src="/videos/bee-nectar-scroll.mp4"
            poster="/videos/bee-nectar-poster.jpg"
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            tabIndex={-1}
          />
        </div>
      </div>
    </section>
  );
}
