import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Career-Wave <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

interface ApplicationEmailsParams {
  candidateEmail: string;
  candidateName: string;
  companyEmail?: string | null;
  companyName: string;
  jobTitle: string;
  jobId: string;
}

export async function sendApplicationReceivedEmails({
  candidateEmail,
  candidateName,
  companyEmail,
  companyName,
  jobTitle,
  jobId,
}: ApplicationEmailsParams) {
  try {
    // 1. Email to Candidate confirming submission
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [candidateEmail],
      subject: `Application Submitted: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Application Confirmed!</h2>
          <p>Hi ${candidateName},</p>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 4px 0 0; font-size: 14px;"><strong>Position:</strong> ${jobTitle}</p>
            <p style="margin: 4px 0 0; font-size: 14px;"><strong>Status:</strong> Pending Review</p>
          </div>
          <p>The company will review your application and you will receive notifications when your status is updated.</p>
          <div style="margin-top: 24px;">
            <a href="${APP_URL}/my-applications" style="background-color: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">View My Applications</a>
          </div>
          <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #9ca3af;">Career Wave Job Board</p>
        </div>
      `,
    });

    // 2. Alert to Company recruiter if company email is available
    if (companyEmail) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [companyEmail],
        subject: `New Applicant: ${candidateName} applied for ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">New Application Received!</h2>
            <p>Hi ${companyName} team,</p>
            <p><strong>${candidateName}</strong> just applied for your open role: <strong>${jobTitle}</strong>.</p>
            <div style="margin-top: 24px;">
              <a href="${APP_URL}/applications" style="background-color: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Review in Dashboard</a>
            </div>
            <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="font-size: 12px; color: #9ca3af;">Career Wave Employer Portal</p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.warn("Failed to dispatch application emails via Resend:", error);
  }
}

interface StatusUpdateEmailParams {
  candidateEmail: string;
  candidateName: string;
  companyName: string;
  jobTitle: string;
  newStatus: string;
  companyNotes?: string | null;
}

export async function sendStatusUpdateEmail({
  candidateEmail,
  candidateName,
  companyName,
  jobTitle,
  newStatus,
  companyNotes,
}: StatusUpdateEmailParams) {
  try {
    const formattedStatus = newStatus.charAt(0) + newStatus.slice(1).toLowerCase();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [candidateEmail],
      subject: `Application Update: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Status Update on Your Application</h2>
          <p>Hi ${candidateName},</p>
          <p><strong>${companyName}</strong> has updated the status of your application for <strong>${jobTitle}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>New Status:</strong> <span style="color: #2563eb; font-weight: bold;">${formattedStatus}</span></p>
            ${
              companyNotes
                ? `<p style="margin: 8px 0 0; font-size: 14px;"><strong>Note from Employer:</strong> ${companyNotes}</p>`
                : ""
            }
          </div>
          <div style="margin-top: 24px;">
            <a href="${APP_URL}/my-applications" style="background-color: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Check Application Details</a>
          </div>
          <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #9ca3af;">Career Wave Job Board</p>
        </div>
      `,
    });
  } catch (error) {
    console.warn("Failed to dispatch status update email via Resend:", error);
  }
}
