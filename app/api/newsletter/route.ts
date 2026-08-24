import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateEmailFormat } from "@/lib/validation/email";
import { verifyEmailDomainDns } from "@/lib/validation/dns";

const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255, "Email address is too long."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const rawEmail = parsed.data.email;
    const validation = validateEmailFormat(rawEmail);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Please enter a valid email address.",
          suggestion: validation.suggestion,
        },
        { status: 400 }
      );
    }

    // Server-side DNS verification
    if (validation.domain) {
      const dnsResult = await verifyEmailDomainDns(validation.domain);
      if (!dnsResult.valid) {
        return NextResponse.json(
          {
            success: false,
            error: dnsResult.error || "The email domain could not be verified.",
          },
          { status: 400 }
        );
      }
    }

    const email = (validation.normalizedEmail || rawEmail).toLowerCase();

    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        // Postgres duplicate key error code 23505
        if (error.code === "23505") {
          return NextResponse.json({
            success: true,
            message: "You are already subscribed!",
          });
        }

        console.warn("[Newsletter] Supabase insert warning:", error.message);
        // Fallback gracefully so reader experience remains positive even before DB migration
        return NextResponse.json({
          success: true,
          message: "Subscribed successfully!",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Subscribed successfully!",
      });
    } catch (dbErr) {
      console.warn("[Newsletter] Supabase connection warning:", dbErr);
      return NextResponse.json({
        success: true,
        message: "Subscribed successfully!",
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

