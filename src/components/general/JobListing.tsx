import { prisma } from "@/app/utils/db";
import { JobpostStatus } from "@prisma/client";

import { EmptyState } from "./EmptyState";
import { Jobcard } from "./Jobcard";
import { MainPagination } from "./MainPagination";
import { SearchResultsSummary } from "./SearchResultsSummary";

interface GetDataArgs {
  page: number;
  pageSize: number;
  jobTypes: string[];
  location: string;
  search: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  datePosted: string;
  sortBy: string;
  sortOrder: string;
}

async function getData({
  page,
  pageSize,
  jobTypes,
  location,
  search,
  company,
  salaryMin,
  salaryMax,
  datePosted,
  sortBy,
  sortOrder,
}: GetDataArgs) {
  const skip = (page - 1) * pageSize;

  /* ---------------- Date Filter ---------------- */
  let dateFilter: { createdAt?: { gte: Date } } = {};
  if (datePosted) {
    const daysAgo = parseInt(datePosted);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
    dateFilter = {
      createdAt: {
        gte: dateThreshold,
      },
    };
  }

  /* ---------------- Search Filters ---------------- */
  const searchFilters: Array<{
    jobTitle?: { contains: string; mode: "insensitive" };
    jobDescription?: { contains: string; mode: "insensitive" };
    benefits?: { hasSome: string[] };
  }> = [];
  if (search) {
    searchFilters.push(
      {
        jobTitle: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        jobDescription: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        benefits: {
          hasSome: [search],
        },
      }
    );
  }

  /* ---------------- Company Filter ---------------- */
  const companyFilter = company
    ? {
        Company: {
          name: {
            contains: company,
            mode: "insensitive" as const,
          },
        },
      }
    : {};

  /* ---------------- WHERE Clause ---------------- */
  const where: {
    status: JobpostStatus;
    employmentType?: { in: string[] };
    location?: string;
    AND?: Array<{ salaryFrom?: { gte: number }; salaryTo?: { lte: number } }>;
    createdAt?: { gte: Date };
    Company?: {
      name: {
        contains: string;
        mode: "insensitive";
      };
    };
    OR?: Array<{
      jobTitle?: { contains: string; mode: "insensitive" };
      jobDescription?: { contains: string; mode: "insensitive" };
      benefits?: { hasSome: string[] };
    }>;
  } = {
    status: JobpostStatus.ACTIVE,

    ...(jobTypes.length > 0 && {
      employmentType: { in: jobTypes },
    }),

    ...(location && location !== "worldwide" && {
      location,
    }),

    ...(salaryMin > 0 || salaryMax < 200000
      ? {
          AND: [
            ...(salaryMin > 0 ? [{ salaryFrom: { gte: salaryMin } }] : []),
            ...(salaryMax < 200000 ? [{ salaryTo: { lte: salaryMax } }] : []),
          ],
        }
      : {}),

    ...dateFilter,
    ...companyFilter,

    ...(searchFilters.length > 0 && {
      OR: searchFilters,
    }),
  };

  /* ---------------- ORDER BY ---------------- */
  let orderBy: 
    | { createdAt: "desc" | "asc" }
    | { salaryFrom: "desc" | "asc" }
    | { salaryTo: "desc" | "asc" }
    | { jobTitle: "desc" | "asc" }
    | { Company: { name: "desc" | "asc" } } = { createdAt: "desc" };

  if (sortBy === "salaryFrom") {
    orderBy = { salaryFrom: sortOrder as "desc" | "asc" };
  } else if (sortBy === "salaryTo") {
    orderBy = { salaryTo: sortOrder as "desc" | "asc" };
  } else if (sortBy === "jobTitle") {
    orderBy = { jobTitle: sortOrder as "desc" | "asc" };
  } else if (sortBy === "Company.name") {
    orderBy = { Company: { name: sortOrder as "desc" | "asc" } };
  }

  const [jobs, totalCount] = await Promise.all([
    prisma.jobPost.findMany({
      where,
      take: pageSize,
      skip,
      orderBy,
      select: {
        id: true,
        jobTitle: true,
        salaryFrom: true,
        salaryTo: true,
        employmentType: true,
        location: true,
        createdAt: true,
        benefits: true,
        Company: {
          select: {
            name: true,
            Logo: true,
            location: true,
            about: true,
          },
        },
      },
    }),
    prisma.jobPost.count({ where }),
  ]);

  return {
    jobs,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/* ================= JOB LISTING COMPONENT ================= */

interface JobListingProps {
  currentPage: number;
  jobTypes: string[];
  location: string;
  search: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  datePosted: string;
  sortBy: string;
  sortOrder: string;
}

export async function JobListing({
  currentPage,
  jobTypes,
  location,
  search,
  company,
  salaryMin,
  salaryMax,
  datePosted,
  sortBy,
  sortOrder,
}: JobListingProps) {
  const { jobs, totalPages, totalCount } = await getData({
    page: currentPage,
    pageSize: 6,
    jobTypes,
    location,
    search,
    company,
    salaryMin,
    salaryMax,
    datePosted,
    sortBy,
    sortOrder,
  });

  return (
    <div className="space-y-6">
      <SearchResultsSummary
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {jobs.length > 0 ? (
        <div className="flex flex-col gap-6">
          {jobs.map((job) => (
            <Jobcard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No jobs found"
          description={
            search ||
            company ||
            jobTypes.length > 0 ||
            location ||
            datePosted ||
            salaryMin > 0 ||
            salaryMax < 200000
              ? "No job posts found matching your criteria. Try adjusting filters."
              : "No job posts available at the moment."
          }
          buttonText="Clear All Filters"
          href="/jobs"
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <MainPagination
            totalPages={totalPages}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}
