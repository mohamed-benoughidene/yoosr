import React from "react";

/**
 * DashboardPageSkeleton
 * A skeleton loader for standard dashboard pages with a header, stats grid, and content block.
 */
export function DashboardPageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 p-6">
      {/* Row 1: Header */}
      <div className="flex justify-between items-center">
        <div className="w-48 h-6 bg-muted rounded-md animate-pulse" />
        <div className="w-24 h-9 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Row 2: Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="h-28 rounded-lg border bg-muted animate-pulse" />
        <div className="h-28 rounded-lg border bg-muted animate-pulse" />
        <div className="h-28 rounded-lg border bg-muted animate-pulse" />
      </div>

      {/* Row 3: Content Block */}
      <div className="w-full h-96 rounded-lg border bg-muted animate-pulse" />
    </div>
  );
}

/**
 * ThreePanelSkeleton
 * A skeleton loader for three-panel layouts (e.g., chat, inbox, or detail views).
 */
export function ThreePanelSkeleton() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left col: Sidebar/List */}
      <div className="w-80 border-r flex flex-col gap-2 p-3">
        <div className="h-16 rounded-md bg-muted animate-pulse" />
        <div className="h-16 rounded-md bg-muted animate-pulse" />
        <div className="h-16 rounded-md bg-muted animate-pulse" />
        <div className="h-16 rounded-md bg-muted animate-pulse" />
        <div className="h-16 rounded-md bg-muted animate-pulse" />
        <div className="h-16 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Center col: Main Content */}
      <div className="flex-1 bg-muted animate-pulse" />

      {/* Right col: Details/Inspect Panel */}
      <div className="w-72 border-l flex flex-col gap-3 p-3">
        <div className="h-12 rounded-md bg-muted animate-pulse" />
        <div className="h-12 rounded-md bg-muted animate-pulse" />
        <div className="h-12 rounded-md bg-muted animate-pulse" />
        <div className="h-12 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}

/**
 * CanvasSkeleton
 * A skeleton loader for canvas-based interfaces (e.g., flow builders, designers).
 */
export function CanvasSkeleton() {
  return (
    <div className="w-full h-full relative bg-muted/30">
      {/* Top toolbar bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-muted animate-pulse" />

      {/* Left panel */}
      <div className="absolute top-12 left-0 bottom-0 w-56 border-r bg-muted/50 animate-pulse" />

      {/* Center canvas */}
      <div className="absolute top-12 left-56 right-64 bottom-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-40 h-16 rounded-lg border bg-muted animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-16 rounded-lg border bg-muted animate-pulse" />
        <div className="absolute top-1/3 left-2/3 w-40 h-16 rounded-lg border bg-muted animate-pulse" />
      </div>

      {/* Right panel */}
      <div className="absolute top-12 right-0 bottom-0 w-64 border-l bg-muted/50 animate-pulse" />
    </div>
  );
}
