import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireuser";
import { CreateJobForm } from "@/components/forms/createJobForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { redirect } from "next/navigation";

const compnies = [
  { id: 0, name: "Arcjet", logo: "/arcjet.jpg" },
  { id: 1, name: "Innegst", logo: "/inngest-locale.png" },
  { id: 2, name: "Arcjet", logo: "/arcjet.jpg" },
  { id: 3, name: "Innegst", logo: "/inngest-locale.png" },
  { id: 4, name: "Arcjet", logo: "/arcjet.jpg" },
  { id: 5, name: "Innegst", logo: "/inngest-locale.png" },
];

async function getCompany(userId: string) {
  const data = await prisma.company.findUnique({
    where: {
      userId: userId,
    },
    select: {
      name: true,
      location: true,
      about: true,
      Logo: true,
      xAccount: true,
      website: true,
    },
  });
  if (!data) {
    return redirect("/onboarding");
  }
  return data;
}

const testimonials = [
  {
    quote:
      "This platform transformed the way we manage our workflow. The seamless integration and intuitive design saved us countless hours!",
    author: "Emily Carter",
    company: "Arcjet",
  },
  {
    quote:
      "Incredible experience! The AI-powered features helped us generate documentation effortlessly. Highly recommend it!",
    author: "Daniel Lee",
    company: "Inngest",
  },
  {
    quote:
      "A game-changer for our business! The scheduling automation and easy-to-use interface have made our operations smoother than ever.",
    author: "Sarah Mitchell",
    company: "Career-Wave",
  },
  {
    quote:
      "Exceptional service and support! The team was always available to address our concerns, and the product exceeded our expectations.",
    author: "Olivia Martinez",
    company: "Skyline Tech",
  },
  {
    quote:
      "Thanks to this solution, we streamlined our recruitment process and found the best talent quickly and efficiently.",
    author: "James Foster",
    company: "NextGen Solutions",
  },
  {
    quote:
      "The user experience is unparalleled. From setup to execution, everything was simple, efficient, and effective.",
    author: "Sophia Patel",
    company: "BrightPath Innovations",
  },
  {
    quote:
      "The real-time analytics feature provided us with insights that transformed our strategies. This tool is worth every penny.",
    author: "Liam Reynolds",
    company: "Visionary Labs",
  },
  {
    quote:
      "I have never encountered a more intuitive platform. It simplified complex processes and allowed us to focus on growth.",
    author: "Isabella Morgan",
    company: "Elevate Corp",
  },
];

const stats = [
  { id: 0, value: "10k+", label: "Monthly active job seekers" },
  { id: 1, value: "500+", label: "Companies hiring" },
  { id: 2, value: "50k+", label: "Total job listings" },
  { id: 3, value: "90%", label: "Job match success rate" },
  { id: 4, value: "24/7", label: "Customer support availability" },
  { id: 5, value: "30+", label: "Industries covered" },
  { id: 6, value: "2M+", label: "Resumes processed" },
  { id: 7, value: "5k+", label: "New job postings per month" },
  { id: 8, value: "100k+", label: "Successful hires" },
];

export default async function PostJobPage() {
  const session = await requireUser();
  const data = await getCompany(session.id as string);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 pt-20">
      <CreateJobForm
        companyAbout={data.about}
        companyLocation={data.location}
        companyLogo={data.Logo}
        companyName={data.name}
        companyWebsite={data.website}
        companyXAccount={data.xAccount}
      />
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Trusted By Thousands of Businesses
            </CardTitle>
            <CardDescription>
              Our platform is trusted by thousands of businesses worldwide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {compnies.map((company) => (
                <div key={company.id}>
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={80}
                    height={80}
                    className="rounded-lg opacity-80 transition-opacity hover:opacity-100"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {testimonials.map((testimonials, index) => (
                <blockquote
                  key={index}
                  className="border-l-2 border-primary pl-4"
                >
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{testimonials.quote}&quot;
                  </p>
                  <footer className="text-sm font-medium mt-2">
                    - {testimonials.author}, {testimonials.company}
                  </footer>
                </blockquote>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.id} className="rounded-lg bg-muted p-4">
                  <h4 className="text-2xl font-bold">{stat.value} </h4>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
