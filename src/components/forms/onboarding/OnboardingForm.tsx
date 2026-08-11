"use client"
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { UserTypeselection } from "./UserTypeForm";
import { CompanyForm } from "./CompanyForm";
import { JobSeekerform } from "./JobSeekerForm";

type UserSelectionType = "Company" | "Jobseeker" | null;

export function Onboardingform() {
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState<UserSelectionType>(null);

    const handleUserTypeSelection = (type: UserSelectionType) => {
        setUserType(type);
        setStep(2);
    };

    const renderStep = () => {
        switch (step) {
            case 1: 
                return <UserTypeselection onSelect={handleUserTypeSelection}/>;
            case 2:
                return userType === "Company" ? <CompanyForm/> : <JobSeekerform/>;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-10">
                <Image src="/logo.png.png" alt="Logo" width={50} height={50} />
                <h1 className="text-4xl font-bold">
                    Career <span className="text-primary">Wave</span>
                </h1>
            </div>
            <Card className="max-w-lg w-full">
                <CardContent className="p-6 ">
                    {renderStep()}
                </CardContent>
            </Card>
        </>
    );
}
