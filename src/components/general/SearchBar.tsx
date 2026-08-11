"use client";

import { Search,  Building2, Filter, SortAsc, SortDesc, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState} from "react";
import { Badge } from "../ui/badge";
import { SearchSuggestions } from "./SearchSuggestions";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [companyTerm, setCompanyTerm] = useState(searchParams.get("company") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      
      // Reset to page 1 when searching
      params.set("page", "1");
      
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = () => {
    const queryString = createQueryString({
      search: searchTerm,
      company: companyTerm,
    });
    router.push(`/?${queryString}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string, type: 'search' | 'company' | 'location') => {
    if (type === 'search') {
      setSearchTerm(suggestion);
      const queryString = createQueryString({
        search: suggestion,
        company: companyTerm,
      });
      router.push(`/?${queryString}`);
    } else if (type === 'company') {
      setCompanyTerm(suggestion);
      const queryString = createQueryString({
        search: searchTerm,
        company: suggestion,
      });
      router.push(`/?${queryString}`);
    } else if (type === 'location') {
      const queryString = createQueryString({
        location: suggestion,
      });
      router.push(`/?${queryString}`);
    }
    setShowSuggestions(false);
  };

  const handleSortChange = (sortBy: string) => {
    const queryString = createQueryString({
      sortBy,
      sortOrder: currentSortOrder,
    });
    router.push(`/?${queryString}`);
  };

  const toggleSortOrder = () => {
    const newOrder = currentSortOrder === "desc" ? "asc" : "desc";
    const queryString = createQueryString({
      sortBy: currentSortBy,
      sortOrder: newOrder,
    });
    router.push(`/?${queryString}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCompanyTerm("");
    const queryString = createQueryString({
      search: "",
      company: "",
    });
    router.push(`/?${queryString}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setCompanyTerm("");
    router.push("/");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchParams.get("search")) count++;
    if (searchParams.get("company")) count++;
    if (searchParams.get("jobTypes")) count++;
    if (searchParams.get("location")) count++;
    if (searchParams.get("salaryMin") && Number(searchParams.get("salaryMin")) > 0) count++;
    if (searchParams.get("salaryMax") && Number(searchParams.get("salaryMax")) < 200000) count++;
    if (searchParams.get("datePosted")) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Get sort display name
  const getSortDisplayName = (sortBy: string) => {
    switch (sortBy) {
      case "createdAt": return "Date Posted";
      case "salaryFrom": return "Salary (Low)";
      case "salaryTo": return "Salary (High)";
      case "jobTitle": return "Job Title";
      case "Company.name": return "Company";
      default: return "Date Posted";
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Job Title Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Company Search */}
              <div className="flex-1 relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by company name..."
                  value={companyTerm}
                  onChange={(e) => setCompanyTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-10"
                />
                {companyTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setCompanyTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} className="px-8">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filters and Sort Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Active Filters and Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </Badge>
                )}
                
                <div className="flex gap-2">
                  {(searchTerm || companyTerm) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="text-muted-foreground hover:text-foreground h-8"
                    >
                      Clear search
                    </Button>
                  )}
                  
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground h-8"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>

                {/* Suggestions Toggle */}
                <Collapsible open={showSuggestions} onOpenChange={setShowSuggestions}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8">
                      {showSuggestions ? "Hide" : "Show"} suggestions
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Sort by:{" "}
                  <span className="font-medium text-foreground">
                    {getSortDisplayName(currentSortBy)}
                  </span>
                </span>
                <Select value={currentSortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Posted</SelectItem>
                    <SelectItem value="salaryFrom">Salary (Low)</SelectItem>
                    <SelectItem value="salaryTo">Salary (High)</SelectItem>
                    <SelectItem value="jobTitle">Job Title</SelectItem>
                    <SelectItem value="Company.name">Company</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="p-2"
                  title={`Sort ${currentSortOrder === "desc" ? "ascending" : "descending"}`}
                >
                  {currentSortOrder === "desc" ? (
                    <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Suggestions */}
      <Collapsible open={showSuggestions} onOpenChange={setShowSuggestions}>
        <CollapsibleContent>
          <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}