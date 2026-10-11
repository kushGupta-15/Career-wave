"use server";

import { redirect } from "next/navigation";
import { prisma } from "./utils/db";
import { requireUser } from "./utils/requireuser";
import { companySchema, jobPostSchema, jobSchema } from "./utils/zodSchemas";
import { z } from "zod";
import arcjet, { detectBot, shield } from "./utils/arcjet";
import { request } from "@arcjet/next";
import { inngest } from "./utils/inngest/client";
import { revalidatePath } from "next/cache";
import { sendApplicationReceivedEmails, sendStatusUpdateEmail } from "./utils/email";

const aj = arcjet
    .withRule(
        shield({
            mode: "LIVE",
        })
    )
    .withRule(
        detectBot({
            mode: "LIVE",
            allow: [],
        })
    );

export async function createCompany(data: z.infer<typeof companySchema>) {
    const session = await requireUser();
    const req = await request();
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
        throw new Error("Access denied");
    }

    const validateData = companySchema.parse(data);

    await prisma.user.update({
        where: {
            id: session.id,
        },
        data: {
            onboardingCompleted: true,
            userType: "COMPANY",
            Company: {
                create: {
                    name: validateData.name!,
                    location: validateData.location!,
                    about: validateData.about!,
                    Logo: validateData.Logo,
                    website: validateData.website,
                    xAccount: validateData.xAccount,
                },
            },
        },
    });
    return redirect("/");
}

export async function createJobSeeker(data: z.infer<typeof jobSchema>) {
    const user = await requireUser();

    const req = await request();
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
        throw new Error("Access denied");
    }
    const validateData = jobSchema.parse(data);

    await prisma.user.update({
        where: {
            id: user.id as string,
        },
        data: {
            onboardingCompleted: true,
            userType: "JOB_SEEKER",
            JobSeeker: {
                create: {
                    name: validateData.name,
                    about: validateData.about,
                    resume: validateData.resume,
                },
            },
        },
    });

    try {
        await inngest.send({
            name: "jobseeker/created",
            data: {
                userId: user.id as string,
            }
        });
    } catch (inngestError) {
        console.warn("Inngest event dispatch skipped or failed:", inngestError);
    }

    return redirect("/");
}


export async function createJob(data: z.infer<typeof jobPostSchema>) {
    const user = await requireUser();
    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }
    const validateData = jobPostSchema.parse(data);

    const company = await prisma.company.findUnique({
        where: {
            userId: user.id
        },
        select: {
            id: true,
        }
    });

    if (!company?.id) {
        return redirect('/onboarding');
    }

    const jobPost = await prisma.jobPost.create({
        data: {
            employmentType: validateData.employmentType,
            jobTitle: validateData.jobTitle,
            jobDescription: validateData.jobDescription,
            listingDuration: validateData.listingDuration,
            location: validateData.location,
            salaryFrom: validateData.salaryFrom,
            salaryTo: validateData.salaryTo,
            benefits: validateData.benefits,
            companyId: company.id,
            status: "ACTIVE",
        },
        select: {
            id: true,
        }
    });

    try {
        await inngest.send({
            name: "job/created",
            data: {
                jobId: jobPost.id,
                expirationDays: validateData.listingDuration,
            }
        });
    } catch (inngestError) {
        console.warn("Inngest event dispatch skipped or failed:", inngestError);
    }

    return redirect("/my-jobs");
}

export async function saveJobPost(jobId: string) {
    const user = await requireUser();

    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }

    await prisma.savedJobPost.create({
        data: {
            jobPostId: jobId,
            userId: user.id as string,
        }
    });

    revalidatePath(`/job/${jobId}`);
}

export async function unSaveJobPost(savedJobPostId: string) {
    const user = await requireUser();

    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }

    const data = await prisma.savedJobPost.delete({
        where: {
            id: savedJobPostId,
            userId: user.id,
        },
        select: {
            jobPostId: true,
        }
    });

    revalidatePath(`/job/${data.jobPostId}`);
}

export async function applyToJob(jobId: string, coverLetter?: string, resumeUrl?: string) {
    const user = await requireUser();
    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }

    try {
        // 1. Verify job exists and is ACTIVE
        const job = await prisma.jobPost.findUnique({
            where: {
                id: jobId,
            },
            select: {
                status: true,
                jobTitle: true,
                Company: {
                    select: {
                        name: true,
                        userId: true,
                        user: {
                            select: {
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        if (!job) {
            throw new Error("Job not found");
        }

        if (job.status !== "ACTIVE") {
            throw new Error("This job is no longer accepting applications");
        }

        if (job.Company.userId === user.id) {
            throw new Error("You cannot apply to your own job listing");
        }

        // 2. Check if user is a job seeker
        const jobSeeker = await prisma.jobSeeker.findUnique({
            where: {
                userId: user.id,
            },
            select: {
                id: true,
                name: true,
                resume: true,
                user: {
                    select: {
                        email: true,
                        name: true,
                    }
                }
            }
        });

        if (!jobSeeker) {
            throw new Error("Only job seekers can apply to jobs. Please complete onboarding first.");
        }

        // 3. Check if already applied
        const existingApplication = await prisma.jobApplication.findUnique({
            where: {
                userId_jobPostId: {
                    userId: user.id,
                    jobPostId: jobId,
                }
            }
        });

        if (existingApplication) {
            throw new Error("You have already applied to this job");
        }

        // 4. Create application
        await prisma.jobApplication.create({
            data: {
                jobPostId: jobId,
                userId: user.id,
                coverLetter: coverLetter || null,
                resume: resumeUrl || jobSeeker.resume,
                status: "PENDING",
            }
        });

        // 5. Fire automated email notifications (safe background dispatch)
        sendApplicationReceivedEmails({
            candidateEmail: jobSeeker.user.email,
            candidateName: jobSeeker.name || jobSeeker.user.name || "Candidate",
            companyEmail: job.Company.user?.email,
            companyName: job.Company.name,
            jobTitle: job.jobTitle,
            jobId,
        }).catch((err) => console.warn("Application email dispatch failed:", err));

        revalidatePath(`/job/${jobId}`);
        return { success: true };
    } catch (error) {
        console.error("Error applying to job:", error);
        throw error;
    }
}

export async function updateApplicationStatus(applicationId: string, status: string, companyNotes?: string) {
    const user = await requireUser();
    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }

    try {
        // Check if user is a company owner
        const company = await prisma.company.findUnique({
            where: {
                userId: user.id,
            },
            select: {
                id: true,
                name: true,
            }
        });

        if (!company) {
            throw new Error("Only companies can update application status");
        }

        // Verify the application belongs to this company's job
        const application = await prisma.jobApplication.findUnique({
            where: {
                id: applicationId,
            },
            include: {
                JobPost: {
                    select: {
                        jobTitle: true,
                        companyId: true,
                    }
                },
                User: {
                    select: {
                        email: true,
                        name: true,
                    }
                }
            }
        });

        if (!application || application.JobPost.companyId !== company.id) {
            throw new Error("Application not found or access denied");
        }

        await prisma.jobApplication.update({
            where: {
                id: applicationId,
            },
            data: {
                status: status as "PENDING" | "REVIEWED" | "SHORTLISTED" | "INTERVIEWED" | "HIRED" | "REJECTED",
                companyNotes: companyNotes || null,
            }
        });

        // Fire status update email to candidate
        sendStatusUpdateEmail({
            candidateEmail: application.User.email,
            candidateName: application.User.name || "Candidate",
            companyName: company.name,
            jobTitle: application.JobPost.jobTitle,
            newStatus: status,
            companyNotes,
        }).catch((err) => console.warn("Status update email dispatch failed:", err));

        revalidatePath("/applications");
        return { success: true };
    } catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
}

export async function withdrawApplication(applicationId: string) {
    const user = await requireUser();
    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }

    const application = await prisma.jobApplication.findUnique({
        where: {
            id: applicationId,
        },
        select: {
            userId: true,
            jobPostId: true,
            status: true,
        }
    });

    if (!application || application.userId !== user.id) {
        throw new Error("Application not found or access denied");
    }

    if (application.status === "HIRED") {
        throw new Error("Cannot withdraw an application that has already been hired");
    }

    await prisma.jobApplication.delete({
        where: {
            id: applicationId,
        }
    });

    revalidatePath("/my-applications");
    revalidatePath(`/job/${application.jobPostId}`);
    return { success: true };
}

export async function editJobPost(data: z.infer<typeof jobPostSchema>, jobId: string) {
    const user = await requireUser();
    const req = await request();
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }
    const validateData = jobPostSchema.parse(data);

    await prisma.jobPost.update({
        where: {
            id: jobId,
            Company: {
                userId: user.id,
            }
        },
        data: {
            jobDescription: validateData.jobDescription,
            jobTitle: validateData.jobTitle,
            employmentType: validateData.employmentType,
            location: validateData.location,
            salaryFrom: validateData.salaryFrom,
            salaryTo: validateData.salaryTo,
            listingDuration: validateData.listingDuration,
            benefits: validateData.benefits,
        }
    });
    return redirect("/my-jobs");
}

export async function deleteJobPost(jobId: string) {
    const session = await requireUser();
    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
        throw new Error("Forbidden");
    }

    await prisma.jobPost.delete({
        where: {
            id: jobId,
            Company: {
                userId: session.id,
            }
        }
    });

    try {
        await inngest.send({
            name: 'job/cancel.expiration',
            data: { jobId: jobId },
        });
    } catch (inngestError) {
        console.warn("Inngest event dispatch skipped or failed:", inngestError);
    }

    return redirect("/my-jobs");
}