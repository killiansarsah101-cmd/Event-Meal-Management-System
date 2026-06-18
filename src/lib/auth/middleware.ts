import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * User object returned by the authentication middleware.
 * Contains the authenticated user's full record from the users table.
 */
export interface AuthenticatedUser {
  id: string
  tenant_id: string | null
  event_id: string | null
  email: string
  full_name: string
  role: "super_admin" | "organizer" | "registration_staff" | "catering_staff" | "finance_team"
  status: "active" | "inactive" | "pending"
}

/**
 * Authentication middleware for API routes.
 *
 * This middleware:
 * 1. Validates the Supabase Auth JWT token from the Authorization header
 * 2. Reads the authenticated user's full record from the users table
 * 3. Returns a 401 Unauthorized if the token is missing or invalid
 * 4. Returns a 403 Forbidden if the user's status is not 'active'
 * 5. Returns the user object on success
 *
 * Usage in an API route:
 *   export async function POST(request: NextRequest) {
 *     const authResult = await validateAuth(request)
 *     if (authResult instanceof NextResponse) return authResult // Error response
 *     const user = authResult as AuthenticatedUser
 *     // ... rest of your endpoint
 *   }
 */
export async function validateAuth(
  request: NextRequest,
): Promise<AuthenticatedUser | NextResponse> {
  // Extract the Authorization header
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid authorization header" },
      { status: 401 },
    )
  }

  const token = authHeader.substring("Bearer ".length)

  // Verify the JWT with Supabase
  const adminClient = createAdminClient()
  const {
    data: { user: authUser },
    error: authError,
  } = await adminClient.auth.admin.getUserById(token)

  if (authError || !authUser) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    )
  }

  // Query the users table for the authenticated user's full record
  const { data: userRecord, error: userError } = await adminClient
    .from("users")
    .select("id, tenant_id, event_id, email, full_name, role, status")
    .eq("id", authUser.id)
    .single()

  if (userError || !userRecord) {
    return NextResponse.json(
      { error: "User record not found" },
      { status: 401 },
    )
  }

  // Check if user status is active
  if (userRecord.status !== "active") {
    return NextResponse.json(
      { error: "User account is not active" },
      { status: 403 },
    )
  }

  return userRecord as AuthenticatedUser
}
