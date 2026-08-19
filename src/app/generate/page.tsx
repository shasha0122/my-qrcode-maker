import { redirect } from "next/navigation";

import { QrGenerator } from "@/components/qr-generator";
import { createClient } from "@/lib/supabase/server";

export default async function GeneratePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login?next=/generate");
  }

  return <QrGenerator />;
}
