import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="
        mt-24
        border-t border-border/40
        bg-background/70 backdrop-blur-md
      "
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        
        {/* Brand */}
        <div>
          <h3 className="text-xl font-bold text-primary">CareerWave</h3>
          <p className="mt-4 text-sm text-muted-foreground">
            Find better opportunities. Hire smarter. Build careers.
          </p>
        </div>

        {/* Jobs */}
        <div>
          <h4 className="font-semibold mb-4">Jobs</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/jobs" className="hover:text-primary">
                Browse Jobs
              </Link>
            </li>
            <li>
              <Link href="/jobs?jobTypes=full-time" className="hover:text-primary">
                Full Time Jobs
              </Link>
            </li>
            <li>
              <Link href="/jobs?jobTypes=internship" className="hover:text-primary">
                Internships
              </Link>
            </li>
            <li>
              <Link href="/jobs?location=remote" className="hover:text-primary">
                Remote Jobs
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-primary">About Us</Link></li>
            <li><Link href="/" className="hover:text-primary">Careers</Link></li>
            <li><Link href="/" className="hover:text-primary">Contact</Link></li>
            <li><Link href="/" className="hover:text-primary">Blog</Link></li>
          </ul>
        </div>

        {/* Employers */}
        <div>
          <h4 className="font-semibold mb-4">For Employers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/post-job" className="hover:text-primary">Post a Job</Link></li>
            <li><Link href="/my-jobs" className="hover:text-primary">Manage Jobs</Link></li>
            <li><Link href="/applications" className="hover:text-primary">View Applicants</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CareerWave. All rights reserved.
          </p>

          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Privacy</Link>
            <Link href="/" className="hover:text-primary">Terms</Link>
            <Link href="/" className="hover:text-primary">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
