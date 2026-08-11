import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "@/components/general/Footer";
import { ClientSearchBar } from "@/components/general/ClientSearchBar";

export default function LandingPage() {
  return (
    <>
    <main className="pt-20">
      {/* ================= HERO SECTION ================= */}
      <section
        className="
          relative min-h-[90vh]
          flex flex-col items-center justify-center text-center
          px-6
          bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.18),transparent_60%)]
        "
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Find Your <span className="text-primary">Next Career</span> Opportunity
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Discover thousands of jobs from top companies.  
          Remote, hybrid, and on-site roles — all in one place.
        </p>

        <div className="mt-10 w-full max-w-2xl">
          <ClientSearchBar />
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/jobs">
            <Button size="lg" rounded="full">
              Browse Jobs
            </Button>
          </Link>

          <Link href="/post-job">
            <Button size="lg" variant="outline" rounded="full">
              Post a Job
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= STATS / TRUST ================= */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold">10K+</p>
            <p className="text-muted-foreground mt-1">Jobs Posted</p>
          </div>
          <div>
            <p className="text-3xl font-bold">5K+</p>
            <p className="text-muted-foreground mt-1">Companies</p>
          </div>
          <div>
            <p className="text-3xl font-bold">50+</p>
            <p className="text-muted-foreground mt-1">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-bold">100%</p>
            <p className="text-muted-foreground mt-1">Free for Candidates</p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 bg-secondary/40">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          How It Works
        </h2>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-background shadow-sm">
            <h3 className="text-lg font-semibold">1. Search Jobs</h3>
            <p className="mt-3 text-muted-foreground">
              Filter jobs by role, location, salary, and company.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-background shadow-sm">
            <h3 className="text-lg font-semibold">2. Apply Easily</h3>
            <p className="mt-3 text-muted-foreground">
              Apply directly with your profile — no unnecessary steps.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-background shadow-sm">
            <h3 className="text-lg font-semibold">3. Get Hired</h3>
            <p className="mt-3 text-muted-foreground">
              Connect with recruiters and land your next role.
            </p>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose Our Platform?
            </h2>

            <ul className="mt-6 space-y-4 text-muted-foreground">
              <li>✔ Verified companies & job listings</li>
              <li>✔ Smart filters & salary transparency</li>
              <li>✔ Remote-first friendly platform</li>
              <li>✔ Fast & simple applications</li>
            </ul>
          </div>

          <div
            className="
              h-64 rounded-2xl
              bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.25),transparent_60%)]
            "
          />
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section
        className="
          py-24 text-center
          bg-primary text-primary-foreground
        "
      >
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Take the Next Step?
        </h2>

        <p className="mt-4 opacity-90">
          Join thousands of professionals finding better opportunities.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/jobs">
            <Button size="lg" variant="secondary" rounded="full">
              Start Exploring
            </Button>
          </Link>

          <Link href="/signup">
            <Button size="lg" variant="outline" rounded="full">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </main>
    <Footer />
    </>
     
  );
}
