# QR 생성기

Next.js와 Supabase로 만든 QR 코드 생성기입니다.

## 로컬 실행

`.env.local` 파일을 만들고 아래 값을 넣습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

```bash
npm install
npm run dev
```

## Vercel 배포 시 필수 환경 변수

[Vercel 프로젝트 설정](https://vercel.com/docs/environment-variables)의 Environment Variables에 다음을 **Production / Preview / Development** 모두에 추가하세요.

| Name | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://<project-ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable key (`sb_publishable_...`) |

값은 [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard)에서 복사합니다. 저장소에는 넣지 마세요.

배포 후 Supabase Authentication → URL Configuration에도 배포 주소를 추가하세요.

- Site URL: `https://<vercel-도메인>`
- Redirect URLs: `https://<vercel-도메인>/auth/callback`, `https://<vercel-도메인>/auth/confirm`
