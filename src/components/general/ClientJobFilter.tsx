"use client";

import { Suspense } from "react";
import { JobFilter } from "./Jobfilter";

function JobFilterFallback() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export function ClientJobFilter() {
  return (
    <Suspense fallback={<JobFilterFallback />}>
      <JobFilter />
    </Suspense>
  );
}