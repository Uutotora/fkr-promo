import React from "react";
import { Img, staticFile } from "remotion";
import { C, FONT, glow } from "../theme";
import { EXPO, tw, useSec } from "../lib";
import { ISearch, IChevron, IX, SbIcon } from "./Icons";

export const WIN_W = 1600;
export const WIN_H = 1000;
export const SIDEBAR = 248;
export const TABBAR = 56;

export type Nav = "dashboard" | "objects" | "contracts" | "tmc" | "market" | "approvals";
export type Tab = { id: string; label: string; icon?: string; from?: number; active?: boolean };

const NAV: { id: Nav; label: string; icon: string; badge?: number }[] = [
  { id: "dashboard", label: "Дашборд", icon: "dashboard" },
  { id: "objects", label: "Объекты ремонта", icon: "building" },
  { id: "contracts", label: "Договоры подряда", icon: "files" },
  { id: "tmc", label: "Учет ТМЦ", icon: "package" },
  { id: "market", label: "Маркетплейс", icon: "store" },
  { id: "approvals", label: "Общие согласования", icon: "approval", badge: 6 },
];

export const Sidebar: React.FC<{ active: Nav; tmcSub?: string; role?: string; roleSub?: string }> = ({
  active,
  tmcSub,
  role = "ФКР / ГАУ",
  roleSub = "Фонд капитального ремонта",
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: SIDEBAR,
      background: C.surface,
      display: "flex",
      flexDirection: "column",
      padding: "22px 14px 18px",
      boxSizing: "border-box",
    }}
  >
    <Img src={staticFile("img/fkr-logo.png")} style={{ width: 118, marginLeft: 4, marginTop: -6 }} />
    <div
      style={{
        marginTop: 14,
        height: 42,
        borderRadius: 11,
        background: C.surface2,
        border: `1px solid ${C.line}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        color: C.faint,
        fontSize: 15,
      }}
    >
      <ISearch size={17} color={C.muted} /> Поиск
    </div>
    <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 4 }}>
      {NAV.map((n) => {
        const on = n.id === active;
        return (
          <React.Fragment key={n.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                height: 44,
                padding: "0 12px",
                borderRadius: 11,
                fontSize: 16,
                fontWeight: on ? 700 : 500,
                color: on ? C.ink : C.ink2,
              }}
            >
              <span style={{ color: on ? C.blue : "#9a9cb2", display: "flex" }}>
                <SbIcon name={n.icon} size={22} />
              </span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.id === "tmc" && <IChevron size={16} color={C.faint} />}
              {n.badge ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.orange,
                    background: C.orange50,
                    borderRadius: 99,
                    minWidth: 22,
                    height: 22,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {n.badge}
                </span>
              ) : null}
            </div>
            {n.id === "tmc" && active === "tmc" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "2px 0 4px" }}>
                {["Согласование", "Заявки и поставки", "Отчет"].map((s) => (
                  <div
                    key={s}
                    style={{
                      height: 38,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 47,
                      borderRadius: 11,
                      fontSize: 14.5,
                      fontWeight: s === tmcSub ? 650 : 450,
                      color: s === tmcSub ? C.ink : C.muted,
                      background: s === tmcSub ? glow : "transparent",
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 13, height: 44, padding: "0 12px", fontSize: 15.5, color: C.ink2, fontWeight: 500 }}>
      <span style={{ color: "#9a9cb2", display: "flex" }}>
        <SbIcon name="bell" size={21} />
      </span>
      <span style={{ flex: 1 }}>Уведомления</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, background: C.orange50, borderRadius: 99, width: 22, height: 22, display: "grid", placeItems: "center" }}>6</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 8px 0" }}>
      <div style={{ width: 38, height: 38, borderRadius: 99, background: C.blue50, color: C.blue700, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>
        {role.slice(0, 2).toUpperCase()}
      </div>
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{role}</div>
        <div style={{ fontSize: 12.5, color: C.muted }}>{roleSub}</div>
      </div>
    </div>
  </div>
);

export const TabBar: React.FC<{ tabs: Tab[] }> = ({ tabs }) => {
  const s = useSec();
  return (
    <div
      style={{
        position: "absolute",
        left: SIDEBAR,
        right: 0,
        top: 0,
        height: TABBAR,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 18px",
        background: C.surface,
      }}
    >
      {tabs.map((t) => {
        const appear = t.from === undefined ? 1 : tw(s, [t.from, t.from + 0.45], [0, 1], EXPO);
        if (appear <= 0) return null;
        return (
          <div
            key={t.id}
            style={{
              height: 38,
              maxWidth: appear * 340,
              overflow: "hidden",
              opacity: appear,
              translate: `0 ${(1 - appear) * 10}px`,
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "0 14px",
              borderRadius: 10,
              fontSize: 14.5,
              whiteSpace: "nowrap",
              fontWeight: t.active ? 650 : 500,
              color: t.active ? C.ink : C.muted,
              background: t.active ? glow : "transparent",
            }}
          >
            <span style={{ color: t.active ? C.blue : C.faint, display: "flex" }}>
              <SbIcon name={t.icon ?? "building"} size={17} />
            </span>
            {t.label}
            {t.active && <IX size={14} color={C.faint} />}
          </div>
        );
      })}
    </div>
  );
};

/** The app frame: sidebar + browser-like tabs + content area (WIN_W × WIN_H). */
export const AppWindow: React.FC<{
  nav: Nav;
  tmcSub?: string;
  tabs: Tab[];
  role?: string;
  roleSub?: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ nav, tmcSub, tabs, role, roleSub, children, overlay }) => (
  <div
    style={{
      position: "absolute",
      width: WIN_W,
      height: WIN_H,
      borderRadius: 26,
      overflow: "hidden",
      background: C.bg,
      fontFamily: FONT,
      color: C.ink,
      boxShadow: "0 60px 120px -30px rgba(0,2,48,0.35), 0 24px 48px -24px rgba(0,2,48,0.25), 0 0 0 1px rgba(0,2,48,0.06)",
    }}
  >
    <Sidebar active={nav} tmcSub={tmcSub} role={role} roleSub={roleSub} />
    <TabBar tabs={tabs} />
    <div style={{ position: "absolute", left: SIDEBAR, top: TABBAR, right: 0, bottom: 0, overflow: "hidden" }}>{children}</div>
    {overlay}
  </div>
);

export type Pose = { x: number; y: number; s: number; rx: number; ry: number; rz?: number; o?: number; blur?: number };

/** Interpolate poses over keyframes. x/y = screen position of the window centre. */
export const poseAt = (sec: number, keys: [number, Pose][], easing = (t: number) => t) => {
  if (sec <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i];
    const [t1, b] = keys[i + 1];
    if (sec <= t1) {
      const k = easing((sec - t0) / (t1 - t0));
      const m = (p: number, q: number) => p + (q - p) * k;
      return {
        x: m(a.x, b.x),
        y: m(a.y, b.y),
        s: m(a.s, b.s),
        rx: m(a.rx, b.rx),
        ry: m(a.ry, b.ry),
        rz: m(a.rz ?? 0, b.rz ?? 0),
        o: m(a.o ?? 1, b.o ?? 1),
        blur: m(a.blur ?? 0, b.blur ?? 0),
      } as Pose;
    }
  }
  return keys[keys.length - 1][1];
};

/** Home pose: window to the right, headline column on the left. */
export const HOME: Pose = { x: 1240, y: 590, s: 0.66, rx: 6, ry: -10 };
/** Pose that centres UI point (ux, uy) on screen at scale s. */
export const focus = (ux: number, uy: number, s: number, extra: Partial<Pose> = {}): Pose => ({
  x: 960 - (ux - WIN_W / 2) * s,
  y: 540 - (uy - WIN_H / 2) * s,
  s,
  rx: 0,
  ry: 0,
  ...extra,
});

export const Stage3D: React.FC<{ pose: Pose; children: React.ReactNode; persp?: number }> = ({ pose, children, persp = 2600 }) => (
  <div style={{ position: "absolute", inset: 0, perspective: persp, perspectiveOrigin: "50% 50%" }}>
    <div
      style={{
        position: "absolute",
        left: pose.x - WIN_W / 2,
        top: pose.y - WIN_H / 2,
        width: WIN_W,
        height: WIN_H,
        transform: `scale(${pose.s}) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) rotateZ(${pose.rz ?? 0}deg)`,
        transformStyle: "preserve-3d",
        opacity: pose.o ?? 1,
        filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
      }}
    >
      {children}
    </div>
  </div>
);
