import { Button } from "@/components/ui/button";
import { Building2, UserRound } from "lucide-react";

type UserSelectionType = "Company" | "Jobseeker";
interface UserSelectionTypeProps {
  onSelect: (user: UserSelectionType) => void;
}

export function UserTypeselection({ onSelect }: UserSelectionTypeProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Welcome! lets get started</h2>
        <p className="text-muted-foreground">
          Choose how would you like to use our platform!
        </p>
      </div>
      <div className="grid gap-4">
        <Button
          onClick={() => onSelect("Company")}
          variant="outline"
          className="w-full h-auto items-center p-6 gap-4 border-2 transition-all duration-200 hover:border-primary hover:bg-primary/5 "
        >
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center ">
            <Building2 className="size-6 text-primary" />
          </div>

          <div className="text-left">
            <h3 className="text-lg font-semibold"> Company / Organization </h3>
            <p> Post jobs and find exceptional talent</p>
          </div>
        </Button>
        <Button
          onClick={() => onSelect("Jobseeker")}
          variant="outline"
          className="w-full h-auto items-center p-6 gap-4 border-2 transition-all duration-200 hover:border-primary hover:bg-primary/5"
        >
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserRound className="size-6 text-primary" />
          </div>

          <div className="text-left">
            <h3 className="text-lg font-semibold"> Job Seeker </h3>
            <p> Find your dream job opportunity and get hired !</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
