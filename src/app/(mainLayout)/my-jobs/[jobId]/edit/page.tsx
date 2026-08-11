import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireuser";
import { EditJobForm } from "@/components/forms/EditJobForm";
import { notFound } from "next/navigation";


async function getData(jobId: string, userId: string) {
  const data = await prisma.jobPost.findUnique({
    where: {
      id: jobId,
      Company: {
        userId: userId,
      },
    },
    select: {
      benefits: true,
      id: true,
      jobTitle: true,
      jobDescription: true,
      salaryFrom: true,
      salaryTo: true,
      listingDuration: true,
      employmentType: true,
      location: true,
      Company: {
        select: {
          name: true,
          Logo: true,
          about: true,
          website: true,
          location: true,
          xAccount: true,
        },
      },
    },
  });

  if (!data) {
    return notFound();
  }
  return data;
}

type Params = Promise<{ jobId: string }>;

export default async function EditJobPage({ params }: { params: Params }) {
  const { jobId } = await params;
  const user = await requireUser();
  const data = await getData(jobId, user.id as string);
  return <EditJobForm jobPost={data} />
  ;
}
