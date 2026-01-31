import { NextRequest, NextResponse } from "next/server";
import { generateArchitecture } from "@/actions/ai-orchestrator";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await generateArchitecture(body);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("[API Generate] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
