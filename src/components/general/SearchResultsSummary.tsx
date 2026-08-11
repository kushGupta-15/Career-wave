"use client";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { X, Filter, MapPin, Building2, Calendar, DollarSign, Briefcase } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/app/utils/formatCurrency";

interface SearchResultsSummaryProps {
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export function SearchResultsSummary({ 
  totalCount, 
  currentPage, 
  totalPages 
}: SearchResultsSummaryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const company = searchParams.get("company") || "";
  const location = searchParams.get("location") || "";
  const jobTypes = searchParams.get("jobTypes")?.split(",") || [];
  const datePosted = searchParams.get("datePosted") || "";
  const salaryMin = Number(searchParams.get("salaryMin")) || 0;
  const salaryMax = Number(searchParams.get("salaryMax")) || 200000;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const removeFilter = (filterType: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    switch (filterType) {
      case "search":
        params.delete("search");
        break;
      case "company":
        params.delete("company");
        break;
      case "location":
        params.delete("location");
        break;
      case "jobType":
        if (value) {
          const currentTypes = jobTypes.filter(type => type !== value);
          if (currentTypes.length > 0) {
            params.set("jobTypes", currentTypes.join(","));
          } else {
            params.delete("jobTypes");
          }
        }
        break;
      case "datePosted":
        params.delete("datePosted");
        break;
      case "salary":
        params.delete("salaryMin");
        params.delete("salaryMax");
        break;
      case "all":
        // Clear all filters but keep sorting
        params.delete("search");
        params.delete("company");
        params.delete("location");
        params.delete("jobTypes");
        params.delete("datePosted");
        params.delete("salaryMin");
        params.delete("salaryMax");
        break;
    }
    
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  const getDatePostedLabel = (days: string) => {
    switch (days) {
      case "1": return "Last 24 hours";
      case "3": return "Last 3 days";
      case "7": return "Last week";
      case "14": return "Last 2 weeks";
      case "30": return "Last month";
      default: return `Last ${days} days`;
    }
  };

  const getSortLabel = () => {
    const direction = sortOrder === "desc" ? "↓" : "↑";
    switch (sortBy) {
      case "createdAt": return `Date Posted ${direction}`;
      case "salaryFrom": return `Salary (Low) ${direction}`;
      case "salaryTo": return `Salary (High) ${direction}`;
      case "jobTitle": return `Job Title ${direction}`;
      case "Company.name": return `Company ${direction}`;
      default: return `Date Posted ${direction}`;
    }
  };

  const hasActiveFilters = search || company || location || jobTypes.length > 0 || 
    datePosted || salaryMin > 0 || salaryMax < 200000;

  const hasActiveSorting = sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Results Count and Pagination Info */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {totalCount.toLocaleString()}
              </span>{" "}
              job{totalCount !== 1 ? 's' : ''} found
              {totalPages > 1 && (
                <span className="ml-2">
                  • Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            
            {hasActiveSorting && (
              <div className="text-sm text-muted-foreground">
                Sorted by: <span className="font-medium">{getSortLabel()}</span>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Filters:</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter("all")}
                  className="text-muted-foreground hover:text-foreground h-8"
                >
                  Clear all
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Search: &quot;{search}&quot;
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter("search")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {company && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Company: &quot;{company}&quot;
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter("company")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location === "worldwide" ? "🌍 Worldwide" : location}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter("location")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {jobTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1 capitalize">
                    {type.replace("-", " ")}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter("jobType", type)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {datePosted && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {getDatePostedLabel(datePosted)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter("datePosted")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {(salaryMin > 0 || salaryMax < 200000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(salaryMin)} - {formatCurrency(salaryMax)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter("salary")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}