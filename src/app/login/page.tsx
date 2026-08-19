import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center">
      <AuthForm
        mode="login"
        nextPath={params.next}
        errorCode={params.error}
      />
    </div>
  );
}
