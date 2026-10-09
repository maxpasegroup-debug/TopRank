import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
// Process liveness only. Database and authentication readiness are separate.
export function GET() { return NextResponse.json({ status: "alive" }, { headers: { "Cache-Control": "no-store" } }); }
