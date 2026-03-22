import { NextResponse } from "next/server";
import { getRosettaDecoder } from "@/lib/codex/rosetta";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/codex/rosetta
 * Returns the Rosetta decoder document.
 * AI consumers call this ONCE to unlock Codex-encoded content.
 */
export async function GET() {
  const rosetta = getRosettaDecoder();

  return NextResponse.json({
    codex: "CodexLib Proprietary Compression Language",
    ...rosetta,
    usage: {
      step1: "Include the decoder text in your system/context prompt",
      step2: "Request any book or publication with ?format=codex",
      step3: "The response will be Codex-encoded (50-70% fewer tokens)",
      step4: "Your AI reads it natively using the decoder rules",
    },
  });
}
