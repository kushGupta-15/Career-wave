import { stripe } from "@/app/utils/stripe";
import { activatePaidJob } from "@/app/action";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Briefcase, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/my-jobs");
  }

  let session;
  let job = null;

  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
    const jobId = session.metadata?.jobId;

    if (session.payment_status === "paid" && jobId) {
      job = await activatePaidJob(jobId);
    }
  } catch (error) {
    console.error("Error retrieving Stripe session:", error);
  }

  if (!session || session.payment_status !== "paid") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Card className="text-center p-6">
          <CardHeader>
            <CardTitle className="text-xl">Payment Verification Pending</CardTitle>
            <CardDescription>
              We are still waiting for confirmation from Stripe. Please check your dashboard in a moment.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/my-jobs">Go to My Jobs</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
  const currency = (session.currency || "USD").toUpperCase();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="border-green-200/50 shadow-lg dark:border-green-900/30">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-green-50 dark:ring-green-950/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Payment Confirmed!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Your job posting is now active and published to candidates on CareerWave.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="bg-muted/40 rounded-xl p-5 border divide-y divide-border/60">
            {job && (
              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Job Title</span>
                <span className="font-semibold text-foreground">{job.jobTitle}</span>
              </div>
            )}
            {job?.Company?.name && (
              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Company</span>
                <span className="font-semibold text-foreground">{job.Company.name}</span>
              </div>
            )}
            <div className="py-2.5 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Listing Duration</span>
              <span className="font-medium text-foreground">
                {session.metadata?.durationDays ? `${session.metadata.durationDays} Days` : "Active"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ${amountTotal} {currency}
              </span>
            </div>
            {session.customer_email && (
              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Receipt Sent To</span>
                <span className="text-foreground">{session.customer_email}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          {job && (
            <Button asChild className="w-full sm:flex-1" size="lg">
              <Link href={`/job/${job.id}`}>
                <Briefcase className="w-4 h-4 mr-2" />
                View Live Job
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="w-full sm:flex-1" size="lg">
            <Link href="/my-jobs">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Recruiter Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
