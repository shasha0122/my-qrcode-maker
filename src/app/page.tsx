import Link from "next/link";
import { DownloadIcon, LockIcon, QrCodeIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="flex flex-1 flex-col justify-center gap-10 py-8">
      <section className="grid gap-4">
        <p className="text-sm font-medium text-primary">QR 코드 생성기</p>
        <h1 className="font-heading max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          필요한 순간에, 나만의 QR 코드를 안전하게 만드세요.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          회원가입 후 URL이나 텍스트를 QR로 바꾸고, 계정에만 보이는 기록으로
          보관할 수 있습니다. 세션은 HttpOnly 쿠키로 관리됩니다.
        </p>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <Link href="/generate" className={cn(buttonVariants({ size: "lg" }))}>
              QR 만들러 가기
            </Link>
          ) : (
            <>
              <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
                무료로 시작하기
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <QrCodeIcon className="size-5 text-primary" />
            <CardTitle>즉시 생성</CardTitle>
            <CardDescription>
              입력한 내용은 브라우저에서 QR 이미지로 변환됩니다.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <LockIcon className="size-5 text-primary" />
            <CardTitle>계정별 보호</CardTitle>
            <CardDescription>
              저장된 QR은 본인만 읽고 수정·삭제할 수 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <DownloadIcon className="size-5 text-primary" />
            <CardTitle>바로 저장</CardTitle>
            <CardDescription>
              만든 QR을 PNG로 받거나, 계정 기록에 남겨 둘 수 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
