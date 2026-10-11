import { prisma } from "@/app/utils/db";
import { Jobcard } from "@/components/general/Jobcard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Globe, MapPin, ArrowLeft, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CompanyPageProps {
  params: Promise<{ companyId: string }>;
}

async function getCompanyData(companyId: string) {
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
    include: {
      JobPost: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          jobTitle: true,
          employmentType: true,
          location: true,
          salaryFrom: true,
          salaryTo: true,
          benefits: true,
          createdAt: true,
          Company: {
            select: {
              name: true,
              Logo: true,
              location: true,
              about: true,
            },
          },
        },
      },
    },
  });

  return company;
}

export default async function CompanyProfilePage({ params }: CompanyPageProps) {
  const { companyId } = await params;
  const company = await getCompanyData(companyId);

  if (!company) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/jobs"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1 text-muted-foreground hover:text-foreground",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      {/* Company Header Card */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="h-28 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b" />
        <CardContent className="p-6 md:p-8 -mt-14 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-20 md:size-24 rounded-xl border bg-background overflow-hidden p-1 shadow-md">
                <Image
                  src={company.Logo}
                  alt={company.name}
                  width={96}
                  height={96}
                  className="size-full rounded-lg object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                  <span>•</span>
                  <Badge variant="secondary" className="font-medium">
                    {company.JobPost.length} Open {company.JobPost.length === 1 ? "Role" : "Roles"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Social / External Links */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {company.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "gap-1.5 flex-1 sm:flex-none",
                  })}
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {company.xAccount && (
                <a
                  href={`https://x.com/${company.xAccount.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "gap-1.5 flex-1 sm:flex-none",
                  })}
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              )}
            </div>
          </div>

          {/* About Company */}
          <div className="space-y-2 pt-2 border-t">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              About {company.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {company.about}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Open Positions</h2>
          <span className="text-sm text-muted-foreground">
            {company.JobPost.length} available {company.JobPost.length === 1 ? "position" : "positions"}
          </span>
        </div>

        {company.JobPost.length > 0 ? (
          <div className="grid gap-4">
            {company.JobPost.map((job) => (
              <Jobcard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {company.name} has no open positions right now. Check back later!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
