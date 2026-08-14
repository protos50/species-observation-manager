import { LoginForm } from "@/app/(main)/components/LoginForm";

import PagesTopLoader from "nextjs-toploader";

export default function LoginPage() {
  return (
    <>
      <PagesTopLoader />
      <div className=" min-h-[calc(100vh-64px)] flex items-center justify-center ">
        <div className="w-full max-w-sm ">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
