import { AdminLoginForm } from "@/components/pages/login/form";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center flex items-center gap-2">
            <Spinner />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <AdminLoginForm />
        </div>
      </div>
    </Suspense>
  );
}
