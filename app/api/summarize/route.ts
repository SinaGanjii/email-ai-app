import { NextResponse } from "next/server"
import { summarizeEmail } from "@/lib/emailSummarizer"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await summarizeEmail(body.email)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du résumé' },
      { status: 500 }
    )
  }
}
