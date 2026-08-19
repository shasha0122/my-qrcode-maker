import { z } from "zod";

export const QR_CONTENT_MAX = 2000;
export const QR_TITLE_MAX = 80;

export const qrSaveSchema = z.object({
  title: z
    .string()
    .trim()
    .max(QR_TITLE_MAX, `제목은 ${QR_TITLE_MAX}자까지 입력할 수 있습니다.`)
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, "QR에 담을 내용을 입력해 주세요.")
    .max(
      QR_CONTENT_MAX,
      `내용은 ${QR_CONTENT_MAX}자까지 입력할 수 있습니다.`,
    ),
});

export type QrSaveValues = z.infer<typeof qrSaveSchema>;
