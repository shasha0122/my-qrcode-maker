"use client";

import { useState } from "react";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { QrCode } from "@/lib/supabase/database.types";

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function QrHistory({ initialItems }: { initialItems: QrCode[] }) {
  const [items, setItems] = useState(initialItems);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleDownload(item: QrCode) {
    if (!item.image_data_url) {
      toast.error("저장된 QR 이미지가 없습니다.");
      return;
    }
    const safeName = (item.title || "qr-code")
      .replace(/[<>:"/\\|?*]/g, "")
      .slice(0, 40);
    downloadDataUrl(item.image_data_url, `${safeName}.png`);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 QR 코드를 삭제할까요?")) {
      return;
    }

    setPendingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("qr_codes").delete().eq("id", id);
    setPendingId(null);

    if (error) {
      toast.error("삭제하지 못했습니다.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    toast.success("삭제했습니다.");
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>저장된 QR이 없습니다</CardTitle>
          <CardDescription>
            생성 페이지에서 QR을 만든 뒤 기록에 저장해 보세요.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} size="sm">
          <CardHeader>
            <CardTitle className="truncate">
              {item.title || "제목 없음"}
            </CardTitle>
            <CardDescription>
              {new Date(item.created_at).toLocaleString("ko-KR")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {item.image_data_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_data_url}
                alt={item.title ? `${item.title} QR 코드` : "저장된 QR 코드"}
                className="aspect-square w-full rounded-lg bg-white p-2"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                저장된 이미지가 없습니다
              </div>
            )}
            <p className="line-clamp-2 break-all text-xs text-muted-foreground">
              {item.content}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownload(item)}
                disabled={!item.image_data_url}
              >
                <DownloadIcon />
                다운로드
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pendingId === item.id}
                onClick={() => void handleDelete(item.id)}
              >
                <Trash2Icon />
                삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
