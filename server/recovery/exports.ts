import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { SubscriptionPlan } from "../../shared/recovery";

export type ChartExportFormat = "csv" | "pdf";

export type ChartExportPoint = {
  date: string;
  score: number;
};

export type DataExportStatus = {
  eligible: boolean;
  status: "not_eligible" | "provider_not_configured";
  supportedFormats: Array<"csv" | "pdf">;
  scope: Array<"chart_data">;
};

export function getDataExportStatus(plan: SubscriptionPlan): DataExportStatus {
  const eligible = plan === "pro";
  return {
    eligible,
    status: eligible ? "provider_not_configured" : "not_eligible",
    supportedFormats: ["csv", "pdf"],
    scope: ["chart_data"],
  };
}

function escapeCsv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createChartCsv(points: ChartExportPoint[]) {
  return [
    "Date,Recovery score",
    ...points.map(
      point => `${escapeCsv(point.date)},${escapeCsv(point.score)}`
    ),
  ].join("\n");
}

export async function createChartPdf(points: ChartExportPoint[]) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [612, 792];
  const margin = 48;
  let page = document.addPage(pageSize);
  let y = 744;

  const drawHeader = () => {
    page.drawText("RecoveryLog", {
      x: margin,
      y,
      size: 20,
      font: bold,
      color: rgb(0.06, 0.12, 0.24),
    });
    page.drawText("30-day recovery chart data", {
      x: margin,
      y: y - 24,
      size: 11,
      font: regular,
      color: rgb(0.29, 0.36, 0.45),
    });
    page.drawText("Informational tracking only — not medical advice.", {
      x: margin,
      y: y - 42,
      size: 9,
      font: regular,
      color: rgb(0.4, 0.45, 0.52),
    });
    y -= 82;
    page.drawText("Date", {
      x: margin,
      y,
      size: 10,
      font: bold,
      color: rgb(0.06, 0.12, 0.24),
    });
    page.drawText("Recovery score", {
      x: margin + 300,
      y,
      size: 10,
      font: bold,
      color: rgb(0.06, 0.12, 0.24),
    });
    y -= 12;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageSize[0] - margin, y },
      thickness: 1,
      color: rgb(0.85, 0.88, 0.92),
    });
    y -= 18;
  };

  drawHeader();
  for (const point of points) {
    if (y < 62) {
      page = document.addPage(pageSize);
      y = 744;
      drawHeader();
    }
    page.drawText(point.date, {
      x: margin,
      y,
      size: 10,
      font: regular,
      color: rgb(0.16, 0.2, 0.28),
    });
    page.drawText(`${point.score}/100`, {
      x: margin + 300,
      y,
      size: 10,
      font: regular,
      color: rgb(0.16, 0.2, 0.28),
    });
    y -= 22;
  }

  if (points.length === 0) {
    page.drawText("No chart points are available for this period.", {
      x: margin,
      y,
      size: 10,
      font: regular,
      color: rgb(0.29, 0.36, 0.45),
    });
  }

  const bytes = await document.save();
  return new Uint8Array(bytes);
}
