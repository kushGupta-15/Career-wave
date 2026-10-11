import { prisma } from "@/app/utils/db";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import { PayJobButton } from "@/components/general/PayJobButton";

interface CancelPageProps {
  searchParams: Promise<{
    job_id?: string;
  }>;
}

export default async function PaymentCancelPage({ searchParams }: CancelPageProps) {
  const { job_id } = await searchParams;

  let job = null;
  if (job_id) {
    job = await prisma.jobPost.findUnique({
      where: { id: job_id },
      select: {
        id: true,
        jobTitle: true,
        listingDuration: true,
      },
    });
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <Card className="border-amber-200/50 shadow-md dark:border-amber-900/30">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-amber-50 dark:ring-amber-950/20">
            <AlertCircle className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Checkout Cancelled</CardTitle>
          <CardDescription className="text-base mt-2">
            No charges were incurred. Your job posting has been saved as a draft.
          </CardDescription>
        </CardHeader>

        {job && (
          <CardContent className="pt-2">
            <div className="bg-muted/40 rounded-lg p-4 border flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{job.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{job.listingDuration} Days package</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium">
                Draft
              </span>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          {job_id && (
            <PayJobButton jobId={job_id} className="w-full sm:flex-1 py-5" size="default" />
          )}
          <Button asChild variant="outline" className="w-full sm:flex-1 py-5">
            <Link href="/my-jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to My Jobs
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
