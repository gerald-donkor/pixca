import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 bg-[#F6F6F6]">
      <SignIn />
    </div>
  );
}
