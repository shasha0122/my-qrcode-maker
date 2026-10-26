export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Auth still accepts the legacy JWT anon key more reliably than
  // sb_publishable_ keys on some projects.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  return { url, key };
}
