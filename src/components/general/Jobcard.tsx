"use client";

import Link from "next/link";
import { Card, CardHeader } from "../ui/card";
import { MapPin, Clock, DollarSign, Building2, Bookmark } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { Button } from "../ui/button";

interface iAppProps {
  job: {
    id: string;
    createdAt: Date;
    benefits?: string[];
    Company: {
      about: string;
      name: string;
      location: string;
      Logo: string;
    };
    jobTitle: string;
    employmentType: string;
    location: string;
    salaryFrom: number;
    salaryTo: number;
  };
}

export function Jobcard({ job }: iAppProps) {
  const handleSaveJob = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement save job functionality
    console.log("Save job:", job.id);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary group">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <Image
              src={job.Company.Logo}
              alt={job.Company.name}
              width={56}
              height={56}
              className="size-14 rounded-lg object-cover border"
            />
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/job/${job.id}`} className="block">
                  <h1 className="text-xl md:text-2xl font-bold hover:text-primary transition-colors line-clamp-2">
                    {job.jobTitle}
                  </h1>
                </Link>
                
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Link 
                    href={`/?company=${encodeURIComponent(job.Company.name)}`}
                    className="text-base font-medium text-muted-foreground hover:text-primary transition-colors truncate"
                  >
                    {job.Company.name}
                  </Link>
                </div>

                {/* Job Meta Information */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{job.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-green-600">
                      {formatCurrency(job.salaryFrom)} - {formatCurrency(job.salaryTo)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Job Type and Benefits */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary" className="capitalize">
                    {job.employmentType.replace("-", " ")}
                  </Badge>
                  
                  {job.benefits && job.benefits.slice(0, 2).map((benefit, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                  
                  {job.benefits && job.benefits.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.benefits.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleSaveJob}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Company Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mt-3 leading-relaxed">
              {job.Company.about}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
