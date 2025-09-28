import { NextResponse } from "next/server"
import { generateEmailResponse } from "@/lib/emailResponse"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await generateEmailResponse(body.email)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la génération de réponse' },
      { status: 500 }
    )
  }
}
