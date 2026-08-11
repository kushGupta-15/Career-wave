"use client";

import { Suspense } from "react";
import { SearchBar } from "./SearchBar";

function SearchBarFallback() {
  return (
    <div className="flex gap-2 w-full max-w-4xl">
      <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg" />
      <div className="w-32 h-12 bg-muted animate-pulse rounded-lg" />
      <div className="w-24 h-12 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}

export function ClientSearchBar() {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBar />
    </Suspense>
  );
}