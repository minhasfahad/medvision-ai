import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate-report
 *
 * Accepts: { className, confidence, detected, confidenceBand, riskLevel }
 * Returns: { findings, conclusion, recommendation, confidenceInterpretation }
 *
 * The Anthropic API call lives here (server-side) so:
 *  1. The API key is never exposed to the browser.
 *  2. CORS is not an issue — this is a server-to-server call.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { className, confidence, detected, confidenceBand, riskLevel } = body;

    if (!className || confidence === undefined || detected === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const prompt = `You are a senior radiologist writing a formal MRI brain scan report. 
Generate a professional, medically accurate radiology report based on these AI analysis results:

- Detected: ${detected}
- Classification: ${className}
- Confidence Score: ${Number(confidence).toFixed(2)}%
- Confidence Band: ${confidenceBand}
- Risk Level: ${riskLevel}

CRITICAL RULES:
1. Every report must be UNIQUE and specific to the exact confidence score and tumor type.
2. Use formal radiology language (signal intensity, morphological features, anatomical regions, etc).
3. Vary sentence structure and medical terminology - never use generic boilerplate.
4. If confidence < 60%, include language about diagnostic uncertainty and recommend repeat imaging.
5. If confidence 60-75%, note moderate confidence and recommend clinical correlation.
6. If confidence 75-90%, use confident clinical language with standard follow-up advice.
7. If confidence > 90%, use very confident decisive language with urgent referral tone if tumor detected.
8. Each tumor type must have DIFFERENT clinical descriptions:
   - Meningioma: slow-growing, extra-axial, dural attachment, homogeneous enhancement
   - Glioma: infiltrative, parenchymal, heterogeneous signal, mass effect
   - Pituitary: sellar/suprasellar region, optic chiasm proximity, hormonal implications
   - No Tumor: specific reassuring language about normal parenchymal signal
9. Do NOT use any special unicode characters like em-dashes, en-dashes, or special quotes. Use only plain ASCII.

Respond ONLY with a JSON object, no markdown, no backticks, no preamble:
{
  "findings": "3-4 sentences of detailed radiological findings paragraph",
  "conclusion": "1 concise clinical conclusion sentence",
  "recommendation": "1-2 sentences of specific clinical recommendation",
  "confidenceInterpretation": "1 sentence interpreting what this confidence level means clinically"
}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key is configured, skip straight to fallback-friendly 404
    // so the PDF generator uses its built-in fallback content immediately.
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "No API key configured - fallback will be used." },
        { status: 503 }
      );
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic API error:", errText);
      return NextResponse.json(
        { success: false, message: "AI service unavailable." },
        { status: 502 }
      );
    }

    const data = await anthropicResponse.json();
    const raw = data.content
      .map((item: { type: string; text?: string }) =>
        item.type === "text" ? item.text : ""
      )
      .join("")
      .trim();

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      success: true,
      data: {
        findings: parsed.findings,
        conclusion: parsed.conclusion,
        recommendation: parsed.recommendation,
        confidenceInterpretation: parsed.confidenceInterpretation,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report content." },
      { status: 500 }
    );
  }
}