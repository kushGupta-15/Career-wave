"use client";

import { XIcon, Calendar, DollarSign } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { countryList } from "@/app/utils/countriesList";
import { formatCurrency } from "@/app/utils/formatCurrency";

const jobTypes = ["full-time", "part-time", "contract", "internship"];

const datePostedOptions = [
  { value: "1", label: "Last 24 hours" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last week" },
  { value: "14", label: "Last 2 weeks" },
  { value: "30", label: "Last month" },
];

export function JobFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentJobTypes = searchParams.get("jobTypes")?.split(",") || [];
  const currentLocation = searchParams.get("location") || "";
  const currentDatePosted = searchParams.get("datePosted") || "";
  const currentSalaryMin = Number(searchParams.get("salaryMin")) || 0;
  const currentSalaryMax = Number(searchParams.get("salaryMax")) || 200000;

  const [salaryRange, setSalaryRange] = useState<[number, number]>([
    currentSalaryMin,
    currentSalaryMax,
  ]);

  useEffect(() => {
    setSalaryRange([currentSalaryMin, currentSalaryMax]);
  }, [currentSalaryMin, currentSalaryMax]);

  function clearAllFilter() {
    router.push("/jobs");
  }

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      params.set("page", "1");
      return params.toString();
    },
    [searchParams]
  );

  function handleJobTypeChange(jobType: string, checked: boolean) {
    const set = new Set(currentJobTypes);
    checked ? set.add(jobType) : set.delete(jobType);

    router.push(
      `?${createQueryString({ jobTypes: Array.from(set).join(",") })}`
    );
  }

  function handleLocationChange(location: string) {
    router.push(`?${createQueryString({ location })}`);
  }

  function handleDatePostedChange(value: string) {
    router.push(
      `?${createQueryString({
        datePosted: value === "any" ? "" : value,
      })}`
    );
  }

  function applySalaryFilter() {
    router.push(
      `?${createQueryString({
        salaryMin: salaryRange[0].toString(),
        salaryMax: salaryRange[1].toString(),
      })}`
    );
  }

  const hasUnappliedSalaryChanges =
    salaryRange[0] !== currentSalaryMin ||
    salaryRange[1] !== currentSalaryMax;

  const activeFiltersCount =
    currentJobTypes.length +
    (currentLocation ? 1 : 0) +
    (currentDatePosted ? 1 : 0) +
    (currentSalaryMin > 0 || currentSalaryMax < 200000 ? 1 : 0);

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl">Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={clearAllFilter}
          className="gap-1"
        >
          Clear
          <XIcon className="h-4 w-4" />
        </Button>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6">
        {/* Job Type */}
        <div className="space-y-3">
          <Label className="text-primary text-lg">Job Type</Label>
          {jobTypes.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                checked={currentJobTypes.includes(type)}
                onCheckedChange={(checked) =>
                  handleJobTypeChange(type, checked as boolean)
                }
              />
              <span className="capitalize">
                {type.replace("-", " ")}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-primary text-lg">Location</Label>
          <Select value={currentLocation} onValueChange={handleLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Worldwide</SelectLabel>
                <SelectItem value="worldwide">🌍 Remote</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Countries</SelectLabel>
                {countryList.map((c) => (
                  <SelectItem key={c.code} value={c.name}>
                    {c.flagEmoji} {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Posted */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-primary text-lg">
            <Calendar className="h-4 w-4" />
            Date Posted
          </Label>
          <Select
            value={currentDatePosted || "any"}
            onValueChange={handleDatePostedChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              {datePostedOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Salary */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-primary text-lg">
            <DollarSign className="h-4 w-4" />
            Salary Range
          </Label>

          <Slider
            value={salaryRange}
            onValueChange={(value) => setSalaryRange(value as [number, number])}
            min={0}
            max={200000}
            step={5000}
          />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(salaryRange[0])}</span>
            <span>{formatCurrency(salaryRange[1])}</span>
          </div>

          {hasUnappliedSalaryChanges && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={applySalaryFilter}
            >
              Apply Salary Filter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
