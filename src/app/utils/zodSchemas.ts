import {z} from "zod";
export const companySchema = z.object({
    name: z.string().min(2, "Company name must be contain at least 2 characters"),
    location: z.string().min(1, "Company location must be contain at least 1 character"),
    about: z.string().min(10, "please provide some information about your comapny"),
    Logo: z.string().min(1, "please upload a logo"),
    website: z.string().url("please enter a valid url"),
    xAccount: z.string().optional(),
});
export const jobSchema = z.object({
    name: z.string().min(2, "Name should be at least 2 characters"),
    about: z.string().min(10, "please provide some information about your job"),
    resume: z.string().min(1, "please upload a resume"),
});

export const jobPostSchema = z.object({
    jobTitle: z.string().min(2,"JobTitle is required"),
    employmentType: z.string().min(1,"EmploymentType is required"),
    location: z.string().min(1,"Location is required"),
    salaryFrom: z.number().min(1,"SalaryFrom is required"),
    salaryTo: z.number().min(1,"SalaryTo is required"),
    jobDescription: z.string().min(10,"JobDescription is required"),
    listingDuration: z.number().min(1,"ListingDuration is required"),
    benefits: z.array(z.string()).min(1, "Atleast One benefit is required"),
    companyName: z.string().min(2,"Company Name is required"),
    companyLocation: z.string().min(1,"Company Location is required"),
    companyAbout: z.string().min(10,"Company About is required"),
    companyLogo: z.string().min(1,"Company Logo is required"),
    companyWebsite: z.string().url("Company Website is required"),
    companyXAccount: z.string().optional(),
})