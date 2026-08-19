import { redirect } from "next/navigation";

import { QrHistory } from "@/components/qr-history";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (!userId) {
    redirect("/login?next=/history");
  }

  const { data, error } = await supabase
    .from("qr_codes")
    .select("id, user_id, title, content, image_data_url, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("QR 기록을 불러오지 못했습니다.");
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          내 QR 기록
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          이 목록은 로그인한 계정에만 보입니다.
        </p>
      </div>
      <QrHistory initialItems={data ?? []} />
    </div>
  );
}
