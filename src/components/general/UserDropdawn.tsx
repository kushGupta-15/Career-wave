import { ChevronDown, Heart, Layers2, LogOut, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "@/app/utils/auth";
import { auth } from "@/app/utils/auth";
import { prisma } from "@/app/utils/db";

interface iAppprops{
    email: string;
    name: string;
    image: string;
}

async function getUserType(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { userType: true }
    });
    return user?.userType;
}

export async function Userdropdawn({email, name, image}: iAppprops){
    const session = await auth();
    const userType = session?.user?.id ? await getUserType(session.user.id) : null;
    
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                    <Avatar>
                        <AvatarImage src={image} alt="Profile Image"/>
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <ChevronDown size={16} strokeWidth={2} className="ml-2 opacity-60"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                    {name}
                </span>
                <span className="text-xs text-muted-foreground">
                    {email}
                </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/favorites">
                        <Heart size={16} strokeWidth={2} className="opacity-60"/>
                        <span>Favourite Jobs</span>
                        </Link>
                        
                    </DropdownMenuItem>
                    {userType === "COMPANY" && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href="/my-jobs">
                                <Layers2 size={16} strokeWidth={2} className="opacity-60"/>
                                <span>My Job Listings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/applications">
                                <Users size={16} strokeWidth={2} className="opacity-60"/>
                                <span>Applications</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}
                    {userType === "JOB_SEEKER" && (
                        <DropdownMenuItem asChild>
                            <Link href="/my-applications">
                            <Layers2 size={16} strokeWidth={2} className="opacity-60"/>
                            <span>My Applications</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuItem asChild>
                    <form action={async () => {
                        "use server";
                        await signOut({redirectTo:"/"});

                    }}>
                        <button className="flex items-center w-full gap-2">
                            <LogOut size={16} strokeWidth={2} className="opacity-60"/>
                            <span>Logout</span>
                        </button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
            
        </DropdownMenu>
    )
}