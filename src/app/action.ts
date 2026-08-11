"use server";

import { redirect } from "next/navigation";
import { prisma } from "./utils/db";
import { requireUser } from "./utils/requireuser";
import { companySchema, jobPostSchema, jobSchema } from "./utils/zodSchemas";
import { z } from "zod";
import arcjet, { detectBot, shield } from "./utils/arcjet";
import { request } from "@arcjet/next";
import { stripe } from "./utils/stripe";
import { jobListingDurationPricing } from "./utils/jobListingDurationPricing";
import { inngest } from "./utils/inngest/client";
import { revalidatePath } from "next/cache";

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
            user: {
                select: {
                    stripeCustomerId: true,
                }
            }
        }

    })
    if (!company?.id) {
        return redirect('/onboarding');
    }

    let stripeCustomerId = company.user.stripeCustomerId;
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email as string,
            name: user.name as string,
        });

        stripeCustomerId = customer.id;

        // update user with stripe customer id

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                stripeCustomerId: customer.id,
            },
        });
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
        },
        select: {
            id: true,
        }
    });

    const pricingTier = jobListingDurationPricing.find(
        (tier) => tier.days === validateData.listingDuration
    );
    if (!pricingTier) {
        throw new Error("Invalid listing duration selected");
    }

    await inngest.send({
        name: "job/created",
        data: {
            jobId: jobPost.id,
            expirationDays: validateData.listingDuration,
        }
    })

    const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
            {
                price_data: {
                    product_data: {
                        name: `Job Posting - ${pricingTier.days} Days`,
                        description: pricingTier.description,
                        images: [
                            "https://ido7tjyo2l.ufs.sh/f/w49lbr5cJiZ6N0ZgWmJPlh6qrOnk2EQdmI71wfYAM5SRjecu",
                        ]
                    },
                    currency: 'USD',
                    unit_amount: pricingTier.price * 100,
                },
                quantity: 1,
            }
        ],
        metadata: {
            jobId: jobPost.id,
        },
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`,

    })

    return redirect(session.url as string);
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
        // Check if user is a job seeker
        const jobSeeker = await prisma.jobSeeker.findUnique({
            where: {
                userId: user.id,
            },
            select: {
                id: true,
                resume: true,
            }
        });

        if (!jobSeeker) {
            throw new Error("Only job seekers can apply to jobs");
        }

        // Check if already applied
        let existingApplication = null;
        try {
            existingApplication = await (prisma as unknown as {
                jobApplication: {
                    findUnique: (args: {
                        where: {
                            userId_jobPostId: {
                                userId: string;
                                jobPostId: string;
                            }
                        }
                    }) => Promise<unknown>;
                }
            }).jobApplication.findUnique({
                where: {
                    userId_jobPostId: {
                        userId: user.id,
                        jobPostId: jobId,
                    }
                }
            });
        } catch {
            console.log("JobApplication model not available yet");
        }

        if (existingApplication) {
            throw new Error("You have already applied to this job");
        }

        // Create application
        try {
            await (prisma as unknown as {
                jobApplication: {
                    create: (args: {
                        data: {
                            jobPostId: string;
                            userId: string;
                            coverLetter: string | null;
                            resume: string;
                            status: string;
                        }
                    }) => Promise<unknown>;
                }
            }).jobApplication.create({
                data: {
                    jobPostId: jobId,
                    userId: user.id,
                    coverLetter: coverLetter || null,
                    resume: resumeUrl || jobSeeker.resume,
                    status: "PENDING",
                }
            });
        } catch {
            throw new Error("Application system is currently being updated. Please try again later.");
        }

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
            }
        });

        if (!company) {
            throw new Error("Only companies can update application status");
        }

        // Verify the application belongs to this company's job
        let application = null;
        try {
            application = await (prisma as unknown as {
                jobApplication: {
                    findUnique: (args: {
                        where: { id: string };
                        include: {
                            JobPost: {
                                select: {
                                    companyId: true;
                                }
                            }
                        }
                    }) => Promise<{
                        JobPost: { companyId: string };
                    } | null>;
                }
            }).jobApplication.findUnique({
                where: {
                    id: applicationId,
                },
                include: {
                    JobPost: {
                        select: {
                            companyId: true,
                        }
                    }
                }
            });
        } catch {
            throw new Error("Application system is currently being updated. Please try again later.");
        }

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

        revalidatePath("/applications");
        return { success: true };
    } catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
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

    await inngest.send({
        name: 'job/cancel.expiration',
        data: { jobId: jobId },
    });
    return redirect("/my-jobs");
}