import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireuser";
import { EmptyState } from "@/components/general/EmptyState";
import { Jobcard } from "@/components/general/Jobcard";

async function getFavorties(userId: string) {
  const data = await prisma.savedJobPost.findMany({
    where: {
      userId: userId,
    },
    select: {
      JobPost: {
        select: {
          id: true,
          jobTitle: true,
          salaryFrom: true,
          salaryTo: true,
          employmentType: true,
          location: true,
          createdAt: true,
          Company: {
            select: {
              name: true,
              about: true,
              location: true,
              Logo: true,
            },
          },
        },
      },
    },
  });

  return data;
}

export default async function FavoritesPage() {
  const session = await requireUser();
  const data = await getFavorties(session?.id as string);

  if (data.length === 0) {
    return (
      <EmptyState
        title="No Favorites found"
        description="You dont have any favorites yet."
        buttonText="Find a job"
        href="/" 
      />
    );
  }

  return (
    <div className="grid grid-cols-1 mt-5 gap-4">
        {data.map((favorite) => (
            <Jobcard key={favorite.JobPost.id} job={favorite.JobPost} />
        ))}
    </div>
  )
}
