import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

// Templates are rasterized once (see supabase/migrations/0001_certificate_requests.sql
// sibling asset-prep step) from "APA Certificate - {25,50}.svg" at the repo root into
// public/certificates/templates/certificate-{25,50}.png, at 2x the SVG's native
// 1000x1500 canvas for crisp text. The PDF page is built at the native 1000x1500
// point size and the 2x raster PNG is scaled down into it.
const PAGE_WIDTH = 1000;
const PAGE_HEIGHT = 1500;
const RASTER_SCALE = 2;

const TEMPLATE_PATHS: Record<25 | 50, string> = {
  25: path.join(process.cwd(), /* turbopackIgnore: true */ "public/certificates/templates/certificate-25.png"),
  50: path.join(process.cwd(), /* turbopackIgnore: true */ "public/certificates/templates/certificate-50.png"),
};

// Bounding box of the baked-in "NAME GOES HERE" placeholder, measured directly off
// the rasterized template (2000x3000) and halved into the 1000x1500 PDF page space.
const NAME_BOX = {
  x: 265,
  yTop: 480, // distance from the top of the page
  width: 460,
  height: 87,
};

// The placeholder sits over the design's flowing fabric texture, not a flat color —
// a solid-fill rectangle reads as a stamped-out hole. Instead we blur the existing
// pixels in that region (erasing the crisp placeholder text while keeping the local
// gradient intact) and darken the result slightly to fully suppress any residual glow.
const PATCH_PADDING = 30; // raster px, gives the blur room to taper at the edges
const BLUR_SIGMA = 40;
const DARKEN_BRIGHTNESS = 0.45;

async function buildBackgroundWithNamePatch(templateBytes: Buffer): Promise<Buffer> {
  const box = {
    x: NAME_BOX.x * RASTER_SCALE,
    y: NAME_BOX.yTop * RASTER_SCALE,
    width: NAME_BOX.width * RASTER_SCALE,
    height: NAME_BOX.height * RASTER_SCALE,
  };
  const region = {
    left: box.x - PATCH_PADDING,
    top: box.y - PATCH_PADDING,
    width: box.width + PATCH_PADDING * 2,
    height: box.height + PATCH_PADDING * 2,
  };

  const patch = await sharp(templateBytes)
    .extract(region)
    .blur(BLUR_SIGMA)
    .modulate({ brightness: DARKEN_BRIGHTNESS })
    .png()
    .toBuffer();

  return sharp(templateBytes)
    .composite([{ input: patch, top: region.top, left: region.left }])
    .png()
    .toBuffer();
}

export interface CertificateData {
  fullName: string;
  pointsAwarded: 25 | 50;
  certificateNumber: string;
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const templatePath = TEMPLATE_PATHS[data.pointsAwarded];
  const templateBytes = await fs.readFile(templatePath);
  const backgroundBytes = await buildBackgroundWithNamePatch(templateBytes);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const templateImage = await pdfDoc.embedPng(backgroundBytes);
  page.drawImage(templateImage, {
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  });

  const rectY = PAGE_HEIGHT - NAME_BOX.yTop - NAME_BOX.height;

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = fitFontSize(data.fullName, font, NAME_BOX.width - 20, 34);
  const textWidth = font.widthOfTextAtSize(data.fullName, fontSize);
  page.drawText(data.fullName, {
    x: PAGE_WIDTH / 2 - textWidth / 2,
    y: rectY + NAME_BOX.height / 2 - fontSize * 0.35,
    size: fontSize,
    font,
    color: rgb(1, 1, 1),
  });

  // Certificate number printed small, out of the way, for internal verification —
  // the design has no dedicated slot for it.
  const smallFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const idLabel = `Certificate ID: ${data.certificateNumber}`;
  const idWidth = smallFont.widthOfTextAtSize(idLabel, 10);
  page.drawText(idLabel, {
    x: PAGE_WIDTH / 2 - idWidth / 2,
    y: 24,
    size: 10,
    font: smallFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}

function fitFontSize(text: string, font: import("pdf-lib").PDFFont, maxWidth: number, startSize: number): number {
  let size = startSize;
  while (size > 14 && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }
  return size;
}
