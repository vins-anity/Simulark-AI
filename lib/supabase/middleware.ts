import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshing the auth token
  // Refreshing the auth token
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (_e) {
    // Ignore invalid refresh token errors
  }

  // Protected routes
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/projects")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Check for onboarding completion
    // We check user_metadata first as it's available on the session user
    const onboardingCompleted = user.user_metadata?.onboarding_completed;

    // If onboarding is NOT completed, redirect to onboarding page
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // Auth routes (redirect to dashboard or onboarding)
  if (request.nextUrl.pathname.startsWith("/auth/signin")) {
    if (user) {
      const onboardingCompleted = user.user_metadata?.onboarding_completed;
      if (onboardingCompleted) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  // Onboarding route (redirect to dashboard if already completed)
  if (request.nextUrl.pathname.startsWith("/onboarding")) {
    if (user?.user_metadata?.onboarding_completed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
