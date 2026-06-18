import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * POST /api/auth/reset-password-request
 * Sends a password reset email to the user.
 *
 * Request body:
 *   {
 *     "email": "user@example.com"
 *   }
 *
 * Response (success):
 *   { "message": "Password reset email sent" }
 *
 * Response (error):
 *   { "error": "Email not found" }
 *
 * Note: For security, this endpoint returns success even if the email
 * doesn't exist, to prevent email enumeration attacks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      )
    }

    // Request a password reset from Supabase Auth
    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        // The reset link will redirect to this URL
        // The client should handle the token and new_password parameters
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
      },
    })

    // Always return success to prevent email enumeration
    // The actual error is logged server-side
    if (error) {
      console.error("[v0] Reset password request error:", error)
    }

    return NextResponse.json(
      { message: "If an account exists with that email, a password reset link has been sent" },
      { status: 200 },
    )
  } catch (err) {
    console.error("[v0] Reset password request error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
