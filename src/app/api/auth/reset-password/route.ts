import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * POST /api/auth/reset-password
 * Resets a user's password using the recovery token from the reset email.
 *
 * Request body:
 *   {
 *     "token": "reset_token_from_email",
 *     "new_password": "newpassword123"
 *   }
 *
 * Response (success):
 *   { "message": "Password reset successfully" }
 *
 * Response (error):
 *   { "error": "Invalid or expired token" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, new_password } = body

    // Validate required fields
    if (!token || !new_password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 },
      )
    }

    // Validate password strength (minimum 8 characters)
    if (new_password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    // Update the password using the recovery token
    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.updateUserById(token, {
      password: new_password,
    })

    if (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 },
    )
  } catch (err) {
    console.error("[v0] Reset password error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
