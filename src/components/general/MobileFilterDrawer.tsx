"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Filter } from "lucide-react";
import { JobFilter } from "./Jobfilter";
import { Badge } from "../ui/badge";
import { useSearchParams } from "next/navigation";

export function MobileFilterDrawer() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchParams.get("jobTypes")) count++;
    if (searchParams.get("location")) count++;
    if (searchParams.get("datePosted")) count++;
    const salaryMin = Number(searchParams.get("salaryMin")) || 0;
    const salaryMax = Number(searchParams.get("salaryMax")) || 200000;
    if (salaryMin > 0 || salaryMax < 200000) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Filter Jobs</SheetTitle>
          </SheetHeader>
          <div className="p-6 pt-0">
            <JobFilter />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}