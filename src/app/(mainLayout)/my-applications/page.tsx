import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireuser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Building2, Calendar, MapPin, DollarSign } from "lucide-react";

async function getApplicationsForJobSeeker(userId: string) {
  try {
    // First check if user is a job seeker
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!jobSeeker) {
      return redirect("/");
    }

    // Try to get applications using raw query as fallback
    let applications = [];
    let stats = [];

    try {
      // Try the normal Prisma query first
      applications = await prisma.jobApplication.findMany({
        where: {
          userId: userId,
        },
        include: {
          JobPost: {
            select: {
              id: true,
              jobTitle: true,
              location: true,
              salaryFrom: true,
              salaryTo: true,
              employmentType: true,
              createdAt: true,
              Company: {
                select: {
                  name: true,
                  Logo: true,
                  location: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const groupByResult = await prisma.jobApplication.groupBy({
        by: ["status"],
        where: {
          userId: userId,
        },
        _count: {
          status: true,
        },
      });
      stats = groupByResult;
    } catch  {
      console.log("Prisma model not available yet, using empty data");
      // Return empty data if model is not available
      applications = [];
      stats = [];
    }

    return {
      applications,
      stats,
      jobSeeker,
    };
  } catch (error) {
    console.error("Error fetching applications:", error);
    return {
      applications: [],
      stats: [],
      jobSeeker: { id: "temp", name: "User" },
    };
  }
}

export default async function MyApplicationsPage() {
  const session = await requireUser();
  const { applications, stats, jobSeeker } = await getApplicationsForJobSeeker(session.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "INTERVIEWED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "HIRED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalApplications = stats.reduce((sum: number, stat: { status: string; _count: { status: number } }) => sum + stat._count.status, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>

        {stats.map((stat: { status: string; _count: { status: number } }) => (
          <Card key={stat.status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.status.charAt(0) + stat.status.slice(1).toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat._count.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((application: {
            id: string;
            status: string;
            coverLetter?: string;
            companyNotes?: string;
            createdAt: Date;
            JobPost: {
              id: string;
              jobTitle: string;
              location: string;
              salaryFrom: number;
              salaryTo: number;
              employmentType: string;
              Company: {
                name: string;
                Logo: string;
              };
            };
          }) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <Image
                      src={application.JobPost.Company.Logo}
                      alt={application.JobPost.Company.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-lg object-cover border"
                    />
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/job/${application.JobPost.id}`}
                          className="block hover:text-primary transition-colors"
                        >
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {application.JobPost.jobTitle}
                          </h3>
                          <p>{jobSeeker.name}&apos;s Application</p>
                        </Link>
                        
                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-base font-medium text-muted-foreground truncate">
                            {application.JobPost.Company.name}
                          </span>
                        </div>

                        {/* Job Meta Information */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{application.JobPost.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-green-600">
                              {formatCurrency(application.JobPost.salaryFrom)} - {formatCurrency(application.JobPost.salaryTo)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Applied {formatRelativeTime(application.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Employment Type */}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="capitalize">
                            {application.JobPost.employmentType.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      {/* Application Status */}
                      <div className="flex-shrink-0">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0) + application.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    {application.coverLetter && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground font-medium mb-1">Your Cover Letter:</p>
                        <p className="text-sm line-clamp-2">{application.coverLetter}</p>
                      </div>
                    )}

                    {/* Company Notes (if any) */}
                    {application.companyNotes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium mb-1">Company Feedback:</p>
                        <p className="text-sm text-blue-700">{application.companyNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                You haven&apos;t applied to any jobs yet
              </p>
              <p className="text-muted-foreground mb-6">
                Start browsing jobs and apply to positions that match your skills and interests.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Browse Jobs
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}