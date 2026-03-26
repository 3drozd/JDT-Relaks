"use client";

import dynamic from "next/dynamic";

const DevPanel = dynamic(
  () => import("@/components/dev/dev-panel").then((m) => m.DevPanel),
  { ssr: false }
);

export function DevPanelLoader() {
  if (process.env.NODE_ENV !== "development") return null;
  return <DevPanel />;
}
