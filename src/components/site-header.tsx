import Link from "next/link";
import { QrCodeIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link
          href={user ? "/generate" : "/"}
          className="flex items-center gap-2"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <QrCodeIcon className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            QR 생성기
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/generate"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                <QrCodeIcon />
                생성
              </Link>
              <Link
                href="/history"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                기록
              </Link>
              <form action="/auth/sign-out" method="post">
                <Button variant="outline" size="sm" type="submit">
                  로그아웃
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                회원가입
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
