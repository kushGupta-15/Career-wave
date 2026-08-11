"use client";

import { Suspense } from "react";
import { MobileFilterDrawer } from "./MobileFilterDrawer";

function MobileFilterDrawerFallback() {
  return (
    <div className="w-24 h-10 bg-muted animate-pulse rounded" />
  );
}

export function ClientMobileFilterDrawer() {
  return (
    <Suspense fallback={<MobileFilterDrawerFallback />}>
      <MobileFilterDrawer />
    </Suspense>
  );
}