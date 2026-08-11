import { LoginForm } from "@/components/forms/LoginForm";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <Image src="/logo.png.png" alt="Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">
            Career <span className="text-primary">Wave</span>
          </h1>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
