"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { UploadDropzone } from "../general/uploadthingReexported";
import { FileText, X } from "lucide-react";
import { applyToJob } from "@/app/action";
import { toast } from "sonner";

const applicationSchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
});

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  hasExistingResume: boolean;
  existingResumeUrl?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function JobApplicationForm({
  jobId,
  jobTitle,
  companyName,
  hasExistingResume,
  existingResumeUrl,
  onClose,
  onSuccess,
}: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string>("");

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
      resumeUrl: existingResumeUrl || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof applicationSchema>) => {
    try {
      setIsSubmitting(true);
      
      const resumeToUse = uploadedResumeUrl || existingResumeUrl;
      
      await applyToJob(jobId, values.coverLetter, resumeToUse);
      
      toast.success("Application submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Application error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          Apply for {jobTitle}
        </CardTitle>
        <p className="text-muted-foreground">at {companyName}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">
              Cover Letter <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell the employer why you're interested in this role and what makes you a great fit..."
              className="min-h-[120px]"
              {...form.register("coverLetter")}
            />
            <p className="text-sm text-muted-foreground">
              A personalized cover letter can help you stand out from other candidates.
            </p>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <Label>Resume</Label>
            
            {hasExistingResume && !uploadedResumeUrl && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Using your profile resume</p>
                  <p className="text-xs text-muted-foreground">
                    You can upload a different resume below if needed
                  </p>
                </div>
              </div>
            )}

            {uploadedResumeUrl && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">New resume uploaded</p>
                  <p className="text-xs text-green-600">This will be used for your application</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedResumeUrl("")}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!uploadedResumeUrl && (
              <UploadDropzone
                endpoint="resumeUploader"
                onClientUploadComplete={(res) => {
                  setUploadedResumeUrl(res[0].url);
                  toast.success("Resume uploaded successfully!");
                }}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                  toast.error("Failed to upload resume");
                }}
                className="ut-button:bg-primary ut-button:text-white ut-button:hover:bg-primary/90 ut-label:text-muted-foreground ut-allowed-content:text-muted-foreground border-primary"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!hasExistingResume && !uploadedResumeUrl)}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>

          {!hasExistingResume && !uploadedResumeUrl && (
            <p className="text-sm text-muted-foreground text-center">
              Please upload a resume to submit your application
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}