import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireuser";
import { CopyLinkMenuItem } from "@/components/general/CopyLink";
import { EmptyState } from "@/components/general/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Bookmark,
  MoreHorizontal,
  PenBoxIcon,
  XCircle,
  PlusCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PayJobButton } from "@/components/general/PayJobButton";
import { jobListingDurationPricing } from "@/app/utils/jobListingDurationPricing";

async function getJobs(userId: string) {
  const data = await prisma.jobPost.findMany({
    where: {
      Company: {
        userId: userId,
      },
    },
    select: {
      id: true,
      jobTitle: true,
      status: true,
      createdAt: true,
      listingDuration: true,
      Company: {
        select: {
          name: true,
          Logo: true,
        },
      },
      _count: {
        select: {
          JobApplication: true,
          SavedJobPost: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
}

export default async function MyJobsPage() {
  const session = await requireUser();
  const data = await getJobs(session.id as string);

  const totalJobs = data.length;
  const activeJobs = data.filter((j) => j.status === "ACTIVE").length;
  const draftJobs = data.filter((j) => j.status === "DRAFT").length;
  const totalApplicants = data.reduce(
    (acc, j) => acc + j._count.JobApplication,
    0
  );
  const totalSaved = data.reduce((acc, j) => acc + j._count.SavedJobPost, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Monitor listing analytics, applicant counts, and payment status.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/post-job">
            <PlusCircle className="size-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Listings</span>
            <Briefcase className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{activeJobs} active • {draftJobs} draft</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Jobs</span>
            <CheckCircle2 className="size-4 text-green-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-green-600">{activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Live on job board</p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Applicants</span>
            <Users className="size-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-600">{totalApplicants}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <Link href="/applications" className="hover:underline text-primary">
                Review applications →
              </Link>
            </p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Candidate Saves</span>
            <Bookmark className="size-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-600">{totalSaved}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Bookmarked by seekers</p>
          </div>
        </Card>
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="No job posts found"
          description="You do not have any job posts yet. Post your first listing to start hiring!"
          buttonText="Create a job post now"
          href="/post-job"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Your Job Postings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Manage your active listings, view candidate pipelines, or complete payment for drafts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((listing) => {
                  const durationConfig = jobListingDurationPricing.find(
                    (p) => p.days === listing.listingDuration
                  );

                  return (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <Image
                          src={listing.Company.Logo}
                          alt="Logo of company"
                          width={40}
                          height={40}
                          className="rounded-md size-10 object-cover border"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{listing.jobTitle}</div>
                        <div className="text-xs text-muted-foreground">{listing.Company.name}</div>
                      </TableCell>
                      <TableCell>
                        {listing.status === "ACTIVE" && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-400">
                            Active
                          </Badge>
                        )}
                        {listing.status === "DRAFT" && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400">
                              Draft
                            </Badge>
                            <PayJobButton
                              jobId={listing.id}
                              price={durationConfig?.price}
                              size="sm"
                              className="h-7 text-xs px-2.5"
                            />
                          </div>
                        )}
                        {listing.status === "EXPIRED" && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href="/applications"
                          className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
                        >
                          <FileText className="size-3.5 text-muted-foreground" />
                          <span>{listing._count.JobApplication} candidates</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {listing.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {listing.status === "DRAFT" && (
                              <DropdownMenuItem asChild>
                                <div className="p-0">
                                  <PayJobButton
                                    jobId={listing.id}
                                    price={durationConfig?.price}
                                    variant="ghost"
                                    className="w-full justify-start font-normal h-8 px-2"
                                  />
                                </div>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link href={`/my-jobs/${listing.id}/edit`}>
                                <PenBoxIcon className="size-4 mr-2" />
                                Edit Job
                              </Link>
                            </DropdownMenuItem>
                            <CopyLinkMenuItem
                              jobUrl={`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/job/${listing.id}`}
                            />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/my-jobs/${listing.id}/delete`}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="size-4 mr-2" />
                                Delete Job
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
