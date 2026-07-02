import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Subscription upgrades are disabled. Simulark is free during public beta.",
    },
    { status: 410 },
  );
}
