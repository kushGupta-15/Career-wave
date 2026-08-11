import { JobListing } from "@/components/general/JobListing";
import { JobListingLoading } from "@/components/general/JobListingsLoading";
import { ClientSearchBar } from "@/components/general/ClientSearchBar";
import { ClientJobFilter } from "@/components/general/ClientJobFilter";
import { ClientMobileFilterDrawer } from "@/components/general/ClientMobileFilterDrawer";
import { Suspense } from "react";

type SearchParams = {
  searchParams: Promise<{ 
    page?: string; 
    jobTypes?: string; 
    location?: string;
    search?: string;
    company?: string;
    salaryMin?: string;
    salaryMax?: string;
    datePosted?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function Home({ searchParams }: SearchParams) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const jobTypes = params.jobTypes?.split(",") || [];
  const location = params.location || "";
  const search = params.search || "";
  const company = params.company || "";
  const salaryMin = Number(params.salaryMin) || 0;
  const salaryMax = Number(params.salaryMax) || 200000;
  const datePosted = params.datePosted || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  const filterKey = `page=${currentPage};types=${jobTypes.join(",")};location=${location};search=${search};company=${company};salaryMin=${salaryMin};salaryMax=${salaryMax};datePosted=${datePosted};sortBy=${sortBy};sortOrder=${sortOrder}`;
  
  return (
    <div className="space-y-6 pt-20">
      <ClientSearchBar />
      
      {/* Mobile Filter Button */}
      <div className="flex justify-between items-center md:hidden">
        <ClientMobileFilterDrawer />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Desktop Filters */}
        <div className="hidden md:block">
          <ClientJobFilter />
        </div>

        {/* Job Listings */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Suspense fallback={<JobListingLoading />} key={filterKey}>
            <JobListing
              currentPage={currentPage}
              jobTypes={jobTypes}
              location={location}
              search={search}
              company={company}
              salaryMin={salaryMin}
              salaryMax={salaryMax}
              datePosted={datePosted}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
