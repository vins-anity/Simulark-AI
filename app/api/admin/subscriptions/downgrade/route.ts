import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Subscription downgrades are disabled. Simulark is free during public beta.",
    },
    { status: 410 },
  );
}
