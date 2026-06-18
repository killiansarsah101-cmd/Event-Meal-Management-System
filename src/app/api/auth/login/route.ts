import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * POST /api/auth/login
 * Authenticates a user with email and password.
 *
 * Request body:
 *   {
 *     "email": "user@example.com",
 *     "password": "securepassword123"
 *   }
 *
 * Response (success):
 *   {
 *     "session": {
 *       "access_token": "...",
 *       "refresh_token": "...",
 *       "expires_in": 3600,
 *       "expires_at": 1234567890,
 *       "token_type": "bearer",
 *       "user": { "id": "...", "email": "..." }
 *     }
 *   }
 *
 * Response (error):
 *   { "error": "Invalid email or password" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      )
    }

    // Sign in with Supabase Auth
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      )
    }

    // Return the session
    return NextResponse.json(
      { session: data.session },
      { status: 200 },
    )
  } catch (err) {
    console.error("[v0] Login error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
