import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a test company user
  const companyUser = await prisma.user.upsert({
    where: { email: 'company@test.com' },
    update: {},
    create: {
      email: 'company@test.com',
      name: 'Test Company User',
      onboardingCompleted: true,
      userType: 'COMPANY',
      Company: {
        create: {
          name: 'Tech Innovations Inc',
          location: 'San Francisco, CA',
          about: 'We are a leading technology company focused on innovation and growth.',
          Logo: '/company.jpg',
          website: 'https://techinnovations.com',
          xAccount: '@techinnovations',
        }
      }
    },
    include: {
      Company: true
    }
  });

  // Create a test job seeker user
  const jobSeekerUser = await prisma.user.upsert({
    where: { email: 'jobseeker@test.com' },
    update: {},
    create: {
      email: 'jobseeker@test.com',
      name: 'Test Job Seeker',
      onboardingCompleted: true,
      userType: 'JOB_SEEKER',
      JobSeeker: {
        create: {
          name: 'John Doe',
          about: 'Experienced software developer with 5+ years in web development.',
          resume: '/resume.pdf',
        }
      }
    },
    include: {
      JobSeeker: true
    }
  });

  // Create some test job posts
  if (companyUser.Company) {
    const jobs = [
      {
        jobTitle: 'Senior Frontend Developer',
        employmentType: 'Full-Time',
        location: 'San Francisco, CA',
        salaryFrom: 120000,
        salaryTo: 160000,
        jobDescription: 'We are looking for a senior frontend developer to join our team. You will be responsible for building user interfaces using React, TypeScript, and modern web technologies.',
        listingDuration: 30,
        benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours'],
        status: 'ACTIVE' as const,
        companyId: companyUser.Company.id,
      },
      {
        jobTitle: 'Backend Engineer',
        employmentType: 'Full-Time',
        location: 'Remote',
        salaryFrom: 100000,
        salaryTo: 140000,
        jobDescription: 'Join our backend team to build scalable APIs and microservices. Experience with Node.js, PostgreSQL, and cloud platforms required.',
        listingDuration: 30,
        benefits: ['Health Insurance', 'Remote Work', 'Stock Options'],
        status: 'ACTIVE' as const,
        companyId: companyUser.Company.id,
      },
      {
        jobTitle: 'Product Manager',
        employmentType: 'Full-Time',
        location: 'New York, NY',
        salaryFrom: 130000,
        salaryTo: 170000,
        jobDescription: 'We need a product manager to drive our product strategy and work closely with engineering and design teams.',
        listingDuration: 30,
        benefits: ['Health Insurance', 'Dental', 'Vision', 'Commuter Benefits'],
        status: 'ACTIVE' as const,
        companyId: companyUser.Company.id,
      }
    ];

    for (const job of jobs) {
      await prisma.jobPost.upsert({
        where: { 
          id: `seed-${job.jobTitle.toLowerCase().replace(/\s+/g, '-')}` 
        },
        update: {},
        create: {
          id: `seed-${job.jobTitle.toLowerCase().replace(/\s+/g, '-')}`,
          ...job
        }
      });
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log('📧 Test accounts created:');
  console.log('   Company: company@test.com');
  console.log('   Job Seeker: jobseeker@test.com');
  console.log('🏢 Company created: Tech Innovations Inc');
  console.log('💼 3 test job posts created');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });