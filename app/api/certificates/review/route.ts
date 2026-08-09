import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { generateCertificatePdf } from "@/lib/certificate/generate";

type DeliveryMethod = "email" | "discord" | "both";

interface ReviewRequestBody {
  requestId: string;
  action: "issue" | "reject";
  pointsAwarded?: 25 | 50;
  rejectionReason?: string;
  deliveryMethod: DeliveryMethod;
}

interface CertificateRequestRow {
  id: string;
  full_name: string;
  email: string;
  discord_username: string | null;
  points_claimed: 25 | 50;
}

function getServiceRoleClient() {
  let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  if (supabaseUrl.endsWith("/")) supabaseUrl = supabaseUrl.slice(0, -1);
  if (supabaseUrl.endsWith("/rest/v1")) supabaseUrl = supabaseUrl.slice(0, -8);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

export async function POST(req: NextRequest) {
  try {
    const authClient = await createServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as ReviewRequestBody;
    const { requestId, action, deliveryMethod } = body;

    if (!requestId || (action !== "issue" && action !== "reject")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (action === "issue" && body.pointsAwarded !== 25 && body.pointsAwarded !== 50) {
      return NextResponse.json({ error: "pointsAwarded must be 25 or 50" }, { status: 400 });
    }
    if (action === "reject" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ error: "rejectionReason is required" }, { status: 400 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const db = getServiceRoleClient();

    const { data: row, error: fetchError } = await db
      .from("certificate_requests")
      .select("id, full_name, email, discord_username, points_claimed")
      .eq("id", requestId)
      .single<CertificateRequestRow>();
    if (fetchError || !row) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "reject") {
      const { error: updateError } = await db
        .from("certificate_requests")
        .update({
          status: "rejected",
          rejection_reason: body.rejectionReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      await deliverRejection({
        row,
        reason: body.rejectionReason!,
        deliveryMethod,
      });

      return NextResponse.json({ success: true, status: "rejected" });
    }

    // action === "issue"
    const pointsAwarded = body.pointsAwarded!;
    const certificateNumber = `CAT-${new Date().getFullYear()}-${row.id.slice(0, 8).toUpperCase()}`;

    const pdfBytes = await generateCertificatePdf({
      fullName: row.full_name,
      pointsAwarded,
      certificateNumber,
    });

    const storagePath = `${certificateNumber}.pdf`;
    const { error: uploadError } = await db.storage
      .from("certificates")
      .upload(storagePath, Buffer.from(pdfBytes), {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    const {
      data: { publicUrl: certificateUrl },
    } = db.storage.from("certificates").getPublicUrl(storagePath);

    const { error: updateError } = await db
      .from("certificate_requests")
      .update({
        status: "issued",
        points_awarded: pointsAwarded,
        certificate_number: certificateNumber,
        certificate_url: certificateUrl,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await deliverCertificate({
      row,
      pdfBytes,
      certificateNumber,
      certificateUrl,
      pointsAwarded,
      deliveryMethod,
    });

    return NextResponse.json({ success: true, status: "issued", certificateUrl, certificateNumber });
  } catch (err) {
    console.error("[certificates/review]", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function deliverCertificate(params: {
  row: CertificateRequestRow;
  pdfBytes: Uint8Array;
  certificateNumber: string;
  certificateUrl: string;
  pointsAwarded: number;
  deliveryMethod: DeliveryMethod;
}) {
  const { row, pdfBytes, certificateNumber, certificateUrl, pointsAwarded, deliveryMethod } = params;
  const filename = `${certificateNumber}.pdf`;

  if (deliveryMethod === "email" || deliveryMethod === "both") {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (resendApiKey && fromEmail) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: fromEmail,
        to: row.email,
        subject: `Your Activity Point Certificate (${pointsAwarded} points)`,
        text: `Hi ${row.full_name},\n\nYour activity point certificate for ${pointsAwarded} points has been issued. It's attached to this email.\n\nCertificate ID: ${certificateNumber}\n\n- Catalyst`,
        attachments: [
          {
            filename,
            content: Buffer.from(pdfBytes).toString("base64"),
          },
        ],
      });
    }
  }

  if (deliveryMethod === "discord" || deliveryMethod === "both") {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const formData = new FormData();
      formData.append(
        "payload_json",
        JSON.stringify({
          embeds: [
            {
              title: "Activity Point Certificate Issued",
              color: 0x22c55e,
              fields: [
                { name: "Name", value: row.full_name, inline: true },
                { name: "Points", value: String(pointsAwarded), inline: true },
                { name: "Certificate ID", value: certificateNumber, inline: false },
                ...(row.discord_username ? [{ name: "Discord", value: row.discord_username, inline: true }] : []),
              ],
              url: certificateUrl,
            },
          ],
        })
      );
      formData.append("file", new Blob([Buffer.from(pdfBytes)], { type: "application/pdf" }), filename);
      await fetch(webhookUrl, { method: "POST", body: formData });
    }
  }
}

async function deliverRejection(params: {
  row: CertificateRequestRow;
  reason: string;
  deliveryMethod: DeliveryMethod;
}) {
  const { row, reason, deliveryMethod } = params;

  if (deliveryMethod === "email" || deliveryMethod === "both") {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (resendApiKey && fromEmail) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: fromEmail,
        to: row.email,
        subject: "Your Activity Point Certificate Request",
        text: `Hi ${row.full_name},\n\nYour activity point certificate request could not be approved.\n\nReason: ${reason}\n\nYou're welcome to submit a new request once you've addressed this.\n\n- Catalyst`,
      });
    }
  }

  if (deliveryMethod === "discord" || deliveryMethod === "both") {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "Activity Point Certificate Request Rejected",
              color: 0xef4444,
              fields: [
                { name: "Name", value: row.full_name, inline: true },
                ...(row.discord_username ? [{ name: "Discord", value: row.discord_username, inline: true }] : []),
                { name: "Reason", value: reason, inline: false },
              ],
            },
          ],
        }),
      });
    }
  }
}
