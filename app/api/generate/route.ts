import { type NextRequest, NextResponse } from "next/server";

/**
 * @deprecated Use POST /api/chat instead.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Use POST /api/chat for architecture generation.",
      deprecated: true,
      replacement: "/api/chat",
    },
    {
      status: 410,
      headers: {
        Deprecation: "true",
        Link: '</api/chat>; rel="successor-version"',
      },
    },
  );
}
