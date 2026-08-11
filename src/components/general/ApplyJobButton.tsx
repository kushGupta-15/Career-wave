"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { JobApplicationForm } from "../forms/JobApplicationForm";

interface ApplyJobButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  hasExistingResume: boolean;
  existingResumeUrl?: string;
}

export function ApplyJobButton({
  jobId,
  jobTitle,
  companyName,
  hasExistingResume,
  existingResumeUrl,
}: ApplyJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    // Refresh the page to show updated application status
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <JobApplicationForm
          jobId={jobId}
          jobTitle={jobTitle}
          companyName={companyName}
          hasExistingResume={hasExistingResume}
          existingResumeUrl={existingResumeUrl}
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}