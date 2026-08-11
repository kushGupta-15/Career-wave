import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { auth } from "@/app/utils/auth";
import { Userdropdawn } from "./UserDropdawn";
import { prisma } from "@/app/utils/db";

export async function Navbar() {
  const session = await auth();

  // Check if user is a company (only companies should see Post Job button)
  let isCompany = false;
  if (session?.user?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { userType: true },
      });
      isCompany = user?.userType === "COMPANY";
    } catch (error) {
      console.log("Error checking user type:", error);
    }
  }

  return (
    <nav
      className="
        fixed top-0 left-0 z-50 w-full
        flex justify-between items-center p-4
        backdrop-blur-md
        bg-white/60 dark:bg-white/10
        border-b border-black/10 dark:border-white/20
      "
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo1.png" alt="Logo" width={40} height={40} />
        <h1 className="text-2xl font-bold">
          Career <span className="text-primary">Wave</span>
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-5">
        <ThemeToggle />

        {/* Only company users can post jobs */}
        {session?.user && isCompany && (
          <Link
            href="/post-job"
            className={buttonVariants({
              size: "lg",
              rounded: "full",
            })}
          >
            Post Job
          </Link>
        )}

        {session?.user ? (
          <Userdropdawn
            email={session.user.email as string}
            name={session.user.name as string}
            image={session.user.image as string}
          />
        ) : (
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
            })}
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2">
        <ThemeToggle />

        {session?.user ? (
          <Userdropdawn
            email={session.user.email as string}
            name={session.user.name as string}
            image={session.user.image as string}
          />
        ) : (
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
