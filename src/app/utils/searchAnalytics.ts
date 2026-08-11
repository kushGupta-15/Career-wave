// Search analytics utilities for tracking popular searches and improving suggestions

export interface SearchAnalytics {
  query: string;
  count: number;
  lastSearched: Date;
}

export interface LocationAnalytics {
  location: string;
  count: number;
  lastSearched: Date;
}

export interface CompanyAnalytics {
  company: string;
  count: number;
  lastSearched: Date;
}

// In a real application, these would be stored in a database
// For now, we'll use in-memory storage (resets on server restart)
let searchAnalytics: SearchAnalytics[] = [];
let locationAnalytics: LocationAnalytics[] = [];
let companyAnalytics: CompanyAnalytics[] = [];

export function trackSearch(query: string) {
  if (!query.trim()) return;
  
  const existing = searchAnalytics.find(s => s.query.toLowerCase() === query.toLowerCase());
  if (existing) {
    existing.count++;
    existing.lastSearched = new Date();
  } else {
    searchAnalytics.push({
      query: query.trim(),
      count: 1,
      lastSearched: new Date(),
    });
  }
  
  // Keep only top 100 searches
  searchAnalytics = searchAnalytics
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);
}

export function trackLocationSearch(location: string) {
  if (!location.trim()) return;
  
  const existing = locationAnalytics.find(l => l.location.toLowerCase() === location.toLowerCase());
  if (existing) {
    existing.count++;
    existing.lastSearched = new Date();
  } else {
    locationAnalytics.push({
      location: location.trim(),
      count: 1,
      lastSearched: new Date(),
    });
  }
  
  // Keep only top 50 locations
  locationAnalytics = locationAnalytics
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

export function trackCompanySearch(company: string) {
  if (!company.trim()) return;
  
  const existing = companyAnalytics.find(c => c.company.toLowerCase() === company.toLowerCase());
  if (existing) {
    existing.count++;
    existing.lastSearched = new Date();
  } else {
    companyAnalytics.push({
      company: company.trim(),
      count: 1,
      lastSearched: new Date(),
    });
  }
  
  // Keep only top 50 companies
  companyAnalytics = companyAnalytics
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

export function getPopularSearches(limit: number = 10): string[] {
  return searchAnalytics
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(s => s.query);
}

export function getPopularLocations(limit: number = 10): string[] {
  return locationAnalytics
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(l => l.location);
}

export function getPopularCompanies(limit: number = 10): string[] {
  return companyAnalytics
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(c => c.company);
}

export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return searchAnalytics
    .filter(s => s.query.toLowerCase().includes(lowerQuery))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(s => s.query);
}

export function getCompanySuggestions(query: string, limit: number = 5): string[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return companyAnalytics
    .filter(c => c.company.toLowerCase().includes(lowerQuery))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(c => c.company);
}