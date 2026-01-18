import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const handler = toNextJsHandler(auth);

export { GET as GET, POST as POST } = handler;
