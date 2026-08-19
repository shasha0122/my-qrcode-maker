import QRCode from "qrcode";

const QR_SIZE = 1024;
const LOGO_SRC = "/qr-logo.png";
const LOGO_RATIO = 0.2;
const PAD_RATIO = 0.08;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
) {
  const r = Math.min(radius, size / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + size, y, x + size, y + size, r);
  ctx.arcTo(x + size, y + size, x, y + size, r);
  ctx.arcTo(x, y + size, x, y, r);
  ctx.arcTo(x, y, x + size, y, r);
  ctx.closePath();
}

export async function generateQrDataUrl(content: string) {
  const qrDataUrl = await QRCode.toDataURL(content, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: QR_SIZE,
    color: {
      dark: "#215c32",
      light: "#ffffff",
    },
  });

  const canvas = document.createElement("canvas");
  canvas.width = QR_SIZE;
  canvas.height = QR_SIZE;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return qrDataUrl;
  }

  const qrImage = await loadImage(qrDataUrl);
  ctx.drawImage(qrImage, 0, 0, QR_SIZE, QR_SIZE);

  try {
    const logo = await loadImage(LOGO_SRC);
    const logoSize = QR_SIZE * LOGO_RATIO;
    const pad = logoSize * PAD_RATIO;
    const boxSize = logoSize + pad * 2;
    const boxX = (QR_SIZE - boxSize) / 2;
    const boxY = (QR_SIZE - boxSize) / 2;
    const logoX = (QR_SIZE - logoSize) / 2;
    const logoY = (QR_SIZE - logoSize) / 2;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, boxX, boxY, boxSize, boxSize * 0.18);
    ctx.fill();

    ctx.save();
    drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize * 0.16);
    ctx.clip();
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    ctx.restore();
  } catch {
    return qrDataUrl;
  }

  return canvas.toDataURL("image/png");
}
