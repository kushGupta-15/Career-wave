import { saveJobPost, unSaveJobPost } from "@/app/action";
import arcjet, { detectBot, tokenBucket } from "@/app/utils/arcjet";
import { auth } from "@/app/utils/auth";
import { prisma } from "@/app/utils/db";
import { benefits } from "@/app/utils/listOfBenefits";
import { JsonToHtml } from "@/components/general/JsonToHtml";
import { SaveJobButton } from "@/components/general/submitButton";
import { ApplyJobButton } from "@/components/general/ApplyJobButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { request } from "@arcjet/next";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const aj = arcjet.withRule(
  detectBot({
    mode: "LIVE",
    allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
  })
);

function getClient(session: boolean) {
  if (session) {
    return aj.withRule(
      tokenBucket({
        mode: "LIVE",
        capacity: 100,
        interval: 60,
        refillRate: 30,
      })
    );
  } else {
    return aj.withRule(
      tokenBucket({
        mode: "LIVE",
        capacity: 100,
        interval: 60,
        refillRate: 30,
      })
    );
  }
}

async function getjob(jobId: string, userId?: string) {
  try {
    const [jobData, savedJob, existingApplication, jobSeeker] = await Promise.all([
      await prisma.jobPost.findUnique({
        where: {
          status: "ACTIVE",
          id: jobId,
        },
        select: {
          id: true,
          jobTitle: true,
          jobDescription: true,
          location: true,
          employmentType: true,
          benefits: true,
          createdAt: true,
          listingDuration: true,
          Company: {
            select: {
              name: true,
              location: true,
              Logo: true,
              about: true,
              userId: true,
            },
          },
        },
      }),
      userId
        ? prisma.savedJobPost.findUnique({
            where: {
              userId_jobPostId: {
                userId: userId,
                jobPostId: jobId,
              },
            },
            select: {
              id: true,
            },
          })
        : null,
      userId
        ? (async () => {
            try {
              return await prisma.jobApplication.findUnique({
                where: {
                  userId_jobPostId: {
                    userId: userId,
                    jobPostId: jobId,
                  },
                },
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                },
              });
            } catch {
              console.log("JobApplication model not available yet");
              return null;
            }
          })()
        : null,
      userId
        ? prisma.jobSeeker.findUnique({
            where: {
              userId: userId,
            },
            select: {
              id: true,
              resume: true,
            },
          })
        : null,
    ]);

    if (!jobData) {
      return notFound();
    }
    
    return {
      jobData,
      savedJob,
      existingApplication,
      jobSeeker,
    };
  } catch (error) {
    console.error("Error fetching job data:", error);
    return notFound();
  }
}

type Params = Promise<{ jobId: string }>;
export default async function JobIdPage({ params }: { params: Params }) {
  const { jobId } = await params;
  const session = await auth();
  const req = await request();
  const decision = await getClient(!!session).protect(req, { requested: 10 });

  if (decision.isDenied()) {
    throw new Error("forbidden");
  }

  const { jobData: data, savedJob, existingApplication, jobSeeker } = await getjob(jobId, session?.user?.id);
  
  // Check if current user is the company owner
  const isCompanyOwner = session?.user?.id === data.Company.userId;
  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="space-y-8 col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{data.jobTitle}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="font-medium ">{data.Company.name} </p>
              <span className="hidden md:inline text-muted-foreground">*</span>
              <Badge className="rounded-full" variant="secondary">
                {data.employmentType}
              </Badge>
              <span className="hidden md:inline text-muted-foreground">*</span>
              <Badge>{data.location}</Badge>
            </div>
          </div>
          {session?.user && !isCompanyOwner ? (
            <form
              action={
                savedJob
                  ? unSaveJobPost.bind(null, savedJob.id)
                  : saveJobPost.bind(null, jobId)
              }
            >
              <SaveJobButton savedJob={!!savedJob} />
            </form>
          ) : !session?.user ? (
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline" })}
            >
              <Heart className="size-4" />
              Save Job
            </Link>
          ) : null}
        </div>
        <section>
          <JsonToHtml json={JSON.parse(data.jobDescription)} />
        </section>
        <section>
          <h3 className="font-semibold mb-4">
            Benefits{" "}
            <span className="text-sm  text-muted-foreground font-normal">
              (green is offered)
            </span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {benefits.map((benefit) => {
              const isOffered = data.benefits.includes(benefit.id);
              return (
                <Badge
                  className={cn(
                    isOffered ? "" : "opacity-75 cursor-not-allowed",
                    "text-sm px-4 py-1.5 rounded-full"
                  )}
                  key={benefit.id}
                  variant={isOffered ? "default" : "outline"}
                >
                  <span className="flex items-center gap-2">
                    {benefit.icon}
                    {benefit.label}
                  </span>
                </Badge>
              );
            })}
          </div>
        </section>
      </div>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Apply now</h3>
              <Separator />
              <p className="text-sm text-muted-foreground mt-1">
                Please let {data.Company.name} know you found this job on
                CAREER-WAVE. This helps us grow!
              </p>
            </div>
            
            {!session?.user ? (
              <Link href="/login" className={buttonVariants({ className: "w-full" })}>
                Login to Apply
              </Link>
            ) : isCompanyOwner ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  You cannot apply to your own job posting
                </p>
              </div>
            ) : existingApplication ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Application Submitted</p>
                  <p className="text-xs text-green-600">
                    Applied on {existingApplication.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Status: <span className="capitalize">{existingApplication.status.toLowerCase()}</span>
                  </p>
                </div>
              </div>
            ) : (
              <ApplyJobButton
                jobId={data.id}
                jobTitle={data.jobTitle}
                companyName={data.Company.name}
                hasExistingResume={!!jobSeeker?.resume}
                existingResumeUrl={jobSeeker?.resume}
              />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold">About the Job</h3>
          <div className="space-y-2">
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Posted on</span>
              <span className="text-sm">
                {data.createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Apply Before
              </span>
              <span className="text-sm">
                {new Date(
                  data.createdAt.getTime() +
                    data.listingDuration * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Employment Type
              </span>
              <span className="text-sm">{data.employmentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Job Location
              </span>
              <span className="text-sm">{data.location}</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={data.Company.Logo}
                alt="Company Logo"
                height={48}
                width={48}
                className="rounded-full size-12"
              />
              <div className="flex flex-col">
                <h3 className="font-semibold">{data.Company.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {data.Company.about}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
