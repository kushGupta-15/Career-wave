"use client";

import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent} from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { updateApplicationStatus } from "@/app/action";
import { toast } from "sonner";
import { Eye, FileText, Mail, User } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  resume: string;
  createdAt: Date;
  companyNotes: string | null;
  User: {
    name: string | null;
    email: string;
    image: string | null;
    JobSeeker: {
      name: string;
      about: string;
    } | null;
  };
  JobPost: {
    jobTitle: string;
    id: string;
  };
}

interface ApplicationsTableProps {
  applications: Application[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "INTERVIEWED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "HIRED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      setIsUpdating(true);
      await updateApplicationStatus(applicationId, newStatus, notes);
      toast.success("Application status updated successfully!");
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.User.image || ""} />
                  <AvatarFallback>
                    {application.User.JobSeeker?.name?.charAt(0) || application.User.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {application.User.JobSeeker?.name || application.User.name || "Anonymous"}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {application.User.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Applied for: <strong>{application.JobPost.jobTitle}</strong></span>
                    <span>•</span>
                    <span>{formatRelativeTime(application.createdAt)}</span>
                  </div>

                  {application.User.JobSeeker?.about && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {application.User.JobSeeker.about}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(application.status)}>
                  {application.status.charAt(0) + application.status.slice(1).toLowerCase()}
                </Badge>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Application Details</DialogTitle>
                    </DialogHeader>
                    
                    {selectedApplication && (
                      <ApplicationDetails
                        application={selectedApplication}
                        onStatusUpdate={handleStatusUpdate}
                        isUpdating={isUpdating}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ApplicationDetails({
  application,
  onStatusUpdate,
  isUpdating,
}: {
  application: Application;
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
  isUpdating: boolean;
}) {
  const [newStatus, setNewStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.companyNotes || "");

  const handleUpdate = () => {
    onStatusUpdate(application.id, newStatus, notes);
  };

  return (
    <div className="space-y-6">
      {/* Candidate Info */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={application.User.image || ""} />
          <AvatarFallback className="text-lg">
            {application.User.JobSeeker?.name?.charAt(0) || application.User.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">
            {application.User.JobSeeker?.name || application.User.name || "Anonymous"}
          </h3>
          <p className="text-muted-foreground flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {application.User.email}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Applied for: <strong>{application.JobPost.jobTitle}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            {formatRelativeTime(application.createdAt)}
          </p>
        </div>
      </div>

      {/* About */}
      {application.User.JobSeeker?.about && (
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            About the Candidate
          </h4>
          <p className="text-sm bg-muted p-3 rounded-lg">
            {application.User.JobSeeker.about}
          </p>
        </div>
      )}

      {/* Cover Letter */}
      {application.coverLetter && (
        <div>
          <h4 className="font-semibold mb-2">Cover Letter</h4>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
          </div>
        </div>
      )}

      {/* Resume */}
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Resume
        </h4>
        <Link
          href={application.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <FileText className="h-4 w-4" />
          View Resume (PDF)
        </Link>
      </div>

      {/* Status Update */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Update Application Status</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
                <SelectItem value="HIRED">Hired</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Company Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add internal notes about this candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={isUpdating || newStatus === application.status}
            className="w-full"
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>
    </div>
  );
}