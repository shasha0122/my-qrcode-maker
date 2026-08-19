"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { DownloadIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { generateQrDataUrl } from "@/lib/qr";
import {
  QR_CONTENT_MAX,
  QR_TITLE_MAX,
  qrSaveSchema,
} from "@/lib/validations/qr";
import { cn } from "@/lib/utils";

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function isPngDataUrl(value: string) {
  return value.startsWith("data:image/png;base64,");
}

export function QrGenerator() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  const remaining = useMemo(
    () => QR_CONTENT_MAX - content.length,
    [content.length],
  );

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setSavedId(null);

    const parsed = qrSaveSchema.safeParse({ title, content });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "content");
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setGenerating(true);
    try {
      const dataUrl = await generateQrDataUrl(parsed.data.content);
      setPreview(dataUrl);
    } catch {
      toast.error("QR 코드를 만들지 못했습니다. 내용을 확인해 주세요.");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!preview) {
      return;
    }
    const safeName = (title.trim() || "qr-code")
      .replace(/[<>:"/\\|?*]/g, "")
      .slice(0, 40);
    downloadDataUrl(preview, `${safeName}.png`);
  }

  async function handleSave() {
    const parsed = qrSaveSchema.safeParse({ title, content });
    if (!parsed.success || !preview || !isPngDataUrl(preview)) {
      toast.error("먼저 QR을 생성한 뒤 저장해 주세요.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        return;
      }

      const { data, error } = await supabase
        .from("qr_codes")
        .insert({
          user_id: user.id,
          title: parsed.data.title || null,
          content: parsed.data.content,
          image_data_url: preview,
        })
        .select("id")
        .single();

      if (error || !data) {
        toast.error("QR 코드를 저장하지 못했습니다.");
        return;
      }

      setSavedId(data.id);
      toast.success("QR 이미지와 내용을 기록에 저장했습니다.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">QR 코드 만들기</CardTitle>
          <CardDescription>
            URL, 문구, 연락처 정보를 입력하면 바로 QR 이미지를 만들 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleGenerate}>
            <div className="grid gap-2">
              <Label htmlFor="title">제목 (선택)</Label>
              <Input
                id="title"
                value={title}
                maxLength={QR_TITLE_MAX}
                placeholder="명함, 이벤트 페이지 등"
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={Boolean(fieldErrors.title)}
              />
              {fieldErrors.title ? (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                maxLength={QR_CONTENT_MAX}
                placeholder="https://example.com"
                onChange={(event) => setContent(event.target.value)}
                aria-invalid={Boolean(fieldErrors.content)}
                className="min-h-36"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>최대 {QR_CONTENT_MAX}자까지 저장됩니다.</span>
                <span>{remaining}자 남음</span>
              </div>
              {fieldErrors.content ? (
                <p className="text-xs text-destructive">{fieldErrors.content}</p>
              ) : null}
            </div>

            <Button type="submit" size="lg" disabled={generating}>
              {generating ? <Loader2Icon className="animate-spin" /> : null}
              QR 생성
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>미리보기</CardTitle>
          <CardDescription>
            생성한 QR 이미지를 계정 기록에 저장하면 나중에 다시 볼 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary/70 p-6">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="생성된 QR 코드"
                className="size-full max-w-72 rounded-lg bg-white p-2"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                내용을 입력한 뒤 QR 생성을 눌러 주세요.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              disabled={!preview}
            >
              <DownloadIcon />
              PNG 다운로드
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!preview || saving}
            >
              {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              내 기록에 저장
            </Button>
          </div>
          {savedId ? (
            <p className="text-sm text-muted-foreground">
              저장되었습니다.{" "}
              <Link
                href="/history"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "h-auto px-0",
                )}
              >
                기록에서 QR 이미지 보기
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
