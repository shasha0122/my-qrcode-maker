"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mapAuthError } from "@/lib/auth/errors";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

export function AuthForm({
  mode,
  nextPath,
  errorCode,
}: {
  mode: AuthMode;
  nextPath?: string;
  errorCode?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState(
    errorCode === "auth"
      ? "인증에 실패했습니다. 다시 로그인해 주세요."
      : "",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);

  const isSignup = mode === "signup";
  const redirectTo = getSafeRedirectPath(nextPath);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = isSignup
      ? signupSchema.safeParse(raw)
      : loginSchema.safeParse(raw);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      if (isSignup) {
        const origin = window.location.origin;
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          },
        });

        if (error) {
          setFormError(mapAuthError(error.message));
          return;
        }

        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });

          if (signInError) {
            setEmailSent(true);
            toast.message("가입은 완료되었습니다. 메일 인증 후 로그인해 주세요.");
            return;
          }
        }

        toast.success("회원가입이 완료되었습니다.");
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        setFormError(mapAuthError(error.message));
        return;
      }

      toast.success("로그인되었습니다.");
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setFormError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {isSignup ? "계정 만들기" : "다시 만나서 반가워요"}
        </CardTitle>
        <CardDescription>
          {isSignup
            ? "이메일과 비밀번호로 가입합니다."
            : "저장한 QR 코드와 생성기에 접근하려면 로그인해 주세요."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent ? (
          <Alert>
            <AlertDescription>
              입력한 이메일로 인증 링크를 보냈습니다. 메일의 링크를 누르면
              가입이 완료됩니다.
            </AlertDescription>
          </Alert>
        ) : (
          <form className="grid gap-4" onSubmit={onSubmit} noValidate>
            {formError ? (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email ? (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={8}
                maxLength={72}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  8자 이상, 72자 이하로 입력해 주세요.
                </p>
              )}
            </div>

            {isSignup ? (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                />
                {fieldErrors.confirmPassword ? (
                  <p className="text-xs text-destructive">
                    {fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending} size="lg">
              {pending ? <Loader2Icon className="animate-spin" /> : null}
              {isSignup ? "회원가입" : "로그인"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        {isSignup ? (
          <p className="text-sm text-muted-foreground">
            이미 계정이 있나요?{" "}
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "link" }), "h-auto px-0")}
            >
              로그인
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            아직 계정이 없나요?{" "}
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "link" }), "h-auto px-0")}
            >
              회원가입
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
