// import { prisma } from "@/app/utils/db";
// import { requireUser } from "@/app/utils/requireuser";
// import { ApplicationsTable } from "@/components/general/ApplicationsTable";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { redirect } from "next/navigation";

// async function getApplicationsForCompany(userId: string) {
//   try {
//     // First check if user is a company
//     const company = await prisma.company.findUnique({
//       where: {
//         userId: userId,
//       },
//       select: {
//         id: true,
//         name: true,
//       },
//     });

//     if (!company) {
//       return redirect("/");
//     }

//     let applications = [];
//     let stats = [];

//     try {
//       // Get all applications for this company's jobs
//       applications = await prisma.jobApplication.findMany({
//         where: {
//           JobPost: {
//             companyId: company.id,
//           },
//         },
//         include: {
//           User: {
//             select: {
//               name: true,
//               email: true,
//               image: true,
//               JobSeeker: {
//                 select: {
//                   name: true,
//                   about: true,
//                 },
//               },
//             },
//           },
//           JobPost: {
//             select: {
//               jobTitle: true,
//               id: true,
//             },
//           },
//         },
//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//       // Get application stats
//       stats = await (prisma as any).jobApplication.groupBy({
//         by: ["status"],
//         where: {
//           JobPost: {
//             companyId: company.id,
//           },
//         },
//         _count: {
//           status: true,
//         },
//       });
//     } catch {
//       console.log("Prisma model not available yet, using empty data");
//       applications = [];
//       stats = [];
//     }

//     return {
//       applications,
//       stats,
//       company,
//     };
//   } catch (error) {
//     console.error("Error fetching applications:", error);
//     return {
//       applications: [],
//       stats: [],
//       company: { id: "temp", name: "Company" },
//     };
//   }
// }

// export default async function ApplicationsPage() {
//   const session = await requireUser();
//   const { applications, stats, company } = await getApplicationsForCompany(session.id);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       case "REVIEWED":
//         return "bg-blue-100 text-blue-800";
//       case "SHORTLISTED":
//         return "bg-purple-100 text-purple-800";
//       case "INTERVIEWED":
//         return "bg-indigo-100 text-indigo-800";
//       case "HIRED":
//         return "bg-green-100 text-green-800";
//       case "REJECTED":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const totalApplications = stats.reduce((sum, stat) => sum + stat._count.status, 0);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Job Applications</h1>
//         <p className="text-muted-foreground">
//           Manage applications for {company.name}'s job postings
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Applications
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalApplications}</div>
//           </CardContent>
//         </Card>

//         {stats.map((stat) => (
//           <Card key={stat.status}>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 {stat.status.charAt(0) + stat.status.slice(1).toLowerCase()}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className={`text-2xl font-bold ${getStatusColor(stat.status)}`}
//               >
//                 {stat._count.status}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Applications Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Applications</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {applications.length > 0 ? (
//             <ApplicationsTable applications={applications} />
//           ) : (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">
//                 No applications received yet. Share your job postings to attract candidates!
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireuser";
import { ApplicationsTable } from "@/components/general/ApplicationsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";

type ApplicationStat = {
  status: ApplicationStatus;
  _count: {
    status: number;
  };
};

async function getApplicationsForCompany(userId: string) {
  // 1️⃣ Check if user is a company
  const company = await prisma.company.findUnique({
    where: { userId },
    select: { id: true, name: true },
  });

  if (!company) {
    redirect("/");
  }

  // 2️⃣ Get all job IDs of this company
  const jobPosts = await prisma.jobPost.findMany({
    where: { companyId: company.id },
    select: { id: true },
  });

  const jobPostIds = jobPosts.map((job) => job.id);

  if (jobPostIds.length === 0) {
    return {
      applications: [],
      stats: [] as ApplicationStat[],
      company,
    };
  }

  // 3️⃣ Fetch applications
  const applications = await prisma.jobApplication.findMany({
    where: {
      jobPostId: { in: jobPostIds },
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          image: true,
          JobSeeker: {
            select: {
              name: true,
              about: true,
            },
          },
        },
      },
      JobPost: {
        select: {
          id: true,
          jobTitle: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 4️⃣ Fetch stats (NO relation filter here ❗)
  const stats = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: {
      jobPostId: { in: jobPostIds },
    },
    _count: {
      status: true,
    },
  });

  return { applications, stats, company };
}

export default async function ApplicationsPage() {
  const session = await requireUser();
  const { applications, stats, company } =
    await getApplicationsForCompany(session.id);

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800";
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800";
      case "INTERVIEWED":
        return "bg-indigo-100 text-indigo-800";
      case "HIRED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalApplications = stats.reduce(
    (sum, stat) => sum + stat._count.status,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <p className="text-muted-foreground">
          Manage applications for {company.name}&apos;s job postings
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

        {stats.map((stat) => (
          <Card key={stat.status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.status.charAt(0) +
                  stat.status.slice(1).toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(stat.status)}`}
              >
                {stat._count.status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <ApplicationsTable applications={applications} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No applications received yet. Share your job postings to attract candidates!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
