import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-heading text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <Link href="/" className={cn(buttonVariants())}>
        홈으로 돌아가기
      </Link>
    </div>
  );
}
