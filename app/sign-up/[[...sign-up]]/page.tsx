import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 sm:px-6 md:px-8 py-16 bg-[var(--surface)] w-full max-w-full min-w-0">
      <div className="w-full max-w-md">
        <SignUp />
      </div>
    </div>
  );
}
