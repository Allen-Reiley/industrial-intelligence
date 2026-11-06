// dashboard/src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handlers = toNextJsHandler(auth.handler);

export async function GET(request: NextRequest) {
  try {
    return await handlers.GET(request);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("🚨 [Auth API GET Error]:", error);
    return NextResponse.json(
      { error: "Internal Auth Error", detail: errMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlers.POST(request);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("🚨 [Auth API POST Error]:", error);
    return NextResponse.json(
      { error: "Internal Auth Error", detail: errMessage },
      { status: 500 }
    );
  }
}
