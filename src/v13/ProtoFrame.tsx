import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender, IFrame, staticFile, useCurrentFrame } from "remotion";

/** A real prototype screen: markup and stylesheet captured from the running
    prototype (tools/proto_snap.mjs), rendered in an isolated iframe at its own
    logical size. `edit` runs every frame against the iframe document so typing,
    hover, highlights and tab switches stay deterministic per frame. */

type Snap = { css: string; html: string; bodyClass: string; rootClass: string; width: number; height: number; body?: boolean };

const cache = new Map<string, Promise<string>>();

const fontFaces = () =>
  ["onest-latin-wght-normal.woff2", "onest-latin-ext-wght-normal.woff2", "onest-cyrillic-wght-normal.woff2"]
    .map((f) => `@font-face{font-family:"Onest Variable";font-weight:100 900;src:url("${new URL(staticFile("fonts/" + f), window.location.href).href}") format("woff2");}`)
    .join("");

const loadDoc = (name: string) => {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(staticFile(`v13/snaps/${name}.json`))
        .then((r) => r.json())
        .then((s: Snap) => {
          const css = s.css.replace(/@font-face\s*{[^}]*}/g, "");
          return `<!doctype html><html class="${s.rootClass}"><head><meta charset="utf-8"><style>${fontFaces()}</style><style>${css}</style>
<style>html,body{overflow:hidden!important;scrollbar-width:none}*{transition:none!important;animation:none!important;caret-color:transparent}</style></head>
<body class="${s.bodyClass}">${s.body ? s.html : `<div id="root">${s.html}</div>`}</body></html>`;
        }),
    );
  }
  return cache.get(name)!;
};

export type Edit = (doc: Document, frame: number) => void;

export const ProtoFrame: React.FC<{
  snap: string;
  w: number;
  h: number;
  edit?: Edit;
  offset?: number; // the enclosing Sequence's start, so edits see film frames
  style?: React.CSSProperties;
}> = ({ snap, w, h, edit, offset = 0, style }) => {
  const frame = useCurrentFrame() + offset;
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  const [handle] = useState(() => delayRender(`snap ${snap}`));

  useEffect(() => {
    loadDoc(snap).then(setSrc).catch((e) => cancelRender(e));
  }, [snap]);

  useLayoutEffect(() => {
    const doc = ref.current?.contentDocument;
    if (ready && doc && edit) edit(doc, frame);
  }, [frame, ready, edit]);

  if (!src) return null;
  return (
    <IFrame
      ref={ref}
      srcDoc={src}
      style={{ width: w, height: h, border: 0, display: "block", background: "#f3f3f3", ...style }}
      onLoad={() => {
        const doc = ref.current?.contentDocument;
        const done = () => {
          // Apply this frame's edit before the frame is captured.
          if (doc && edit) edit(doc, frame);
          setReady(true);
          requestAnimationFrame(() => continueRender(handle));
        };
        if (doc?.fonts) doc.fonts.ready.then(() => requestAnimationFrame(done));
        else done();
      }}
    />
  );
};

/** Helpers for frame-driven edits inside a snapshot. */
export const q = (doc: Document, sel: string) => doc.querySelector(sel) as HTMLElement | null;
export const qa = (doc: Document, sel: string) => Array.from(doc.querySelectorAll(sel)) as HTMLElement[];
/** Find the first element whose own text matches. */
export const byText = (doc: Document, sel: string, text: string | RegExp) =>
  qa(doc, sel).find((e) => (typeof text === "string" ? e.textContent?.trim() === text : text.test(e.textContent ?? ""))) ?? null;
