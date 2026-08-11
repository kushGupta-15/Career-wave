"use client";

import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, MapPin, Building2 } from "lucide-react";

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string, type: 'search' | 'company' | 'location') => void;
}

export function SearchSuggestions({ onSuggestionClick }: SearchSuggestionsProps) {

  // Popular search terms (in a real app, these would come from analytics)
  const popularSearches = [
    "React Developer",
    "Full Stack Engineer",
    "Product Manager",
    "Data Scientist",
    "UX Designer",
    "DevOps Engineer",
    "Frontend Developer",
    "Backend Developer",
  ];

  const popularLocations = [
    "United States",
    "United Kingdom",
    "Canada",
    "Germany",
    "Australia",
    "worldwide",
  ];

  const popularCompanies = [
    "Google",
    "Microsoft",
    "Apple",
    "Amazon",
    "Meta",
    "Netflix",
    "Spotify",
    "Airbnb",
  ];

  const handleSuggestionClick = (suggestion: string, type: 'search' | 'company' | 'location') => {
    onSuggestionClick(suggestion, type);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Popular Searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Popular Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Badge
                  key={search}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSuggestionClick(search, 'search')}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>

          {/* Popular Locations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Popular Locations</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularLocations.map((location) => (
                <Badge
                  key={location}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSuggestionClick(location, 'location')}
                >
                  {location === "worldwide" ? "🌍 Worldwide" : location}
                </Badge>
              ))}
            </div>
          </div>

          {/* Popular Companies */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Popular Companies</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularCompanies.map((company) => (
                <Badge
                  key={company}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSuggestionClick(company, 'company')}
                >
                  {company}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}