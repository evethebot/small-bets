import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your {{PRODUCT_NAME}} account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white text-lg font-bold">
            S
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
