import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface AdminRequestContext {
  userId: string;
  isAdmin: boolean;
}

export async function verifyAdminAccess(): Promise<
  { success: true; userId: string } | { success: false; response: NextResponse }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 },
        ),
      };
    }

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("[Admin Verify] Error:", error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      ),
    };
  }
}
