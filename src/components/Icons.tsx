import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const L: React.FC<P & { d: string | string[] }> = ({ d, size = 18, color = "currentColor", stroke = 2, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

export const ISearch = (p: P) => <L {...p} d={["M21 21l-4.3-4.3", "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"]} />;
export const IChevron = (p: P) => <L {...p} d="M6 9l6 6 6-6" />;
export const ICheck = (p: P) => <L {...p} d="M20 6L9 17l-5-5" />;
export const IX = (p: P) => <L {...p} d={["M18 6L6 18", "M6 6l12 12"]} />;
export const IPlus = (p: P) => <L {...p} d={["M12 5v14", "M5 12h14"]} />;
export const IAlert = (p: P) => <L {...p} d={["M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z", "M12 9v4", "M12 17h.01"]} />;
export const IPin = (p: P) => <L {...p} d={["M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]} />;
export const ICalendar = (p: P) => <L {...p} d={["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"]} />;
export const IGauge = (p: P) => <L {...p} d={["M12 14l4-4", "M3.3 19a10 10 0 1 1 17.4 0"]} />;
export const IHouse = (p: P) => <L {...p} d={["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z", "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", "M10 6h4", "M10 10h4", "M10 14h4", "M10 18h4"]} />;
export const ISign = (p: P) => <L {...p} d={["M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5", "M14 2v6h6", "M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4z"]} />;
export const IShield = (p: P) => <L {...p} d={["M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z", "M9 12l2 2 4-4"]} />;
export const ITrend = (p: P) => <L {...p} d={["M22 7l-8.5 8.5-5-5L2 17", "M16 7h6v6"]} />;
export const IDownload = (p: P) => <L {...p} d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]} />;
export const IFilter = (p: P) => <L {...p} d="M22 3H2l8 9.5V19l4 2v-8.5z" />;
export const IPencil = (p: P) => <L {...p} d={["M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"]} />;
export const IArrowR = (p: P) => <L {...p} d={["M5 12h14", "M12 5l7 7-7 7"]} />;
export const IBox = (p: P) => <L {...p} d={["M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z", "M3.3 7L12 12l8.7-5", "M12 22V12"]} />;
export const ILayers = (p: P) => <L {...p} d={["M12 2L2 7l10 5 10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"]} />;
export const IUsers = (p: P) => <L {...p} d={["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M22 21v-2a4 4 0 0 0-3-3.9", "M16 3.1a4 4 0 0 1 0 7.8"]} />;
export const IFile = (p: P) => <L {...p} d={["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", "M14 2v4a2 2 0 0 0 2 2h4", "M10 9H8", "M16 13H8", "M16 17H8"]} />;
export const ITable = (p: P) => <L {...p} d={["M3 3h18v18H3z", "M3 9h18", "M3 15h18", "M9 3v18"]} />;
export const IMail = (p: P) => <L {...p} d={["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M22 6l-10 7L2 6"]} />;
export const IDb = (p: P) => <L {...p} d={["M12 8c5 0 9-1.3 9-3s-4-3-9-3-9 1.3-9 3 4 3 9 3z", "M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5", "M3 12c0 1.7 4 3 9 3s9-1.3 9-3"]} />;
export const IClock = (p: P) => <L {...p} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"]} />;
export const IBell = (p: P) => <L {...p} d={["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.9 1.9 0 0 0 3.4 0"]} />;

/** Filled sidebar silhouettes from the prototype. */
const SB: Record<string, string> = {
  dashboard: "M3 2h18a1 1 0 0 1 1 1v15H14v2h4v2H6v-2h4v-2H2V3a1 1 0 0 1 1-1Zm3 10v3h2v-3H6Zm5-5v8h2V7h-2Zm5-3v11h2V4h-2Z",
  building: "M3 3h12v4h6v15h-8v-5H9v5H3V3Zm3 3v2h2V6H6Zm5 0v2h2V6h-2ZM6 11v2h2v-2H6Zm5 0v2h2v-2h-2Zm6-1v2h2v-2h-2Zm0 5v2h2v-2h-2Z",
  files: "M8 2h8l5 5v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm7 2v5h5l-5-5Zm-5 8v2h8v-2h-8Zm0 4v2h6v-2h-6ZM3 6h2v15h12v2H4a1 1 0 0 1-1-1V6Z",
  package: "m12 1 10 5v12l-10 5-10-5V6l10-5Zm-9 5.6v1.8l8 4v8.8l1 .5 1-.5v-8.8l8-4V6.6l-9 4.5-9-4.5Z",
  approval: "M9 1h6v3h4a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4V1Zm-2 5v2h10V6H7Zm10.7 6.7-1.4-1.4-5.3 5.3-3.3-3.3-1.4 1.4L11 19.4l6.7-6.7Z",
  bell: "M11 1h2v2.1A7 7 0 0 1 19 10v5l2 3v1H3v-1l2-3v-5a7 7 0 0 1 6-6.9V1Zm-2 20h6a3 3 0 0 1-6 0Z",
  store: "M7 7V6a5 5 0 0 1 10 0v1h3.2l-1 14.1a1 1 0 0 1-1 .9H5.8a1 1 0 0 1-1-.9L3.8 7H7Zm2 0h6V6a3 3 0 0 0-6 0v1Zm-1 4a4 4 0 0 0 8 0h-2a2 2 0 0 1-4 0H8Z",
  spark: "M12 1l2.4 6.6L21 10l-6.6 2.4L12 19l-2.4-6.6L3 10l6.6-2.4L12 1Zm7 13 1 2.6 2.6 1-2.6 1L19 21l-1-2.4-2.6-1 2.6-1L19 14Z",
};
export const SbIcon: React.FC<{ name: keyof typeof SB | string; size?: number; color?: string }> = ({ name, size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path fillRule="evenodd" clipRule="evenodd" d={SB[name]} />
  </svg>
);
