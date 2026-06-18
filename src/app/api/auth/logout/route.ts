import { type NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth/middleware"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * POST /api/auth/logout
 * Logs out the authenticated user by invalidating their session.
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Response (success):
 *   { "message": "Logged out successfully" }
 *
 * Response (error):
 *   { "error": "Unauthorized" }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (authResult instanceof NextResponse) return authResult

    // Sign out the user by invalidating their session
    const supabase = createAdminClient()
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.substring("Bearer ".length)

    if (token) {
      await supabase.auth.admin.signOut({ jwt: token })
    }

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    )
  } catch (err) {
    console.error("[v0] Logout error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
