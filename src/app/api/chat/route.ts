import { NextResponse } from "next/server";
import arcjet, { detectBot, shield } from "@/app/utils/arcjet";
import { prisma } from "@/app/utils/db";
import { GoogleGenAI } from "@google/genai";

const aj = arcjet
  .withRule(
    shield({
      mode: "LIVE",
    })
  )
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  );

export async function POST(request: Request) {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    // If Gemini API key is configured, use Gemini 3.8 Flash with live job database context
    if (process.env.GEMINI_API_KEY) {
      try {
        const activeJobs = await prisma.jobPost.findMany({
          where: { status: "ACTIVE" },
          take: 6,
          orderBy: { createdAt: "desc" },
          include: {
            Company: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        });

        const jobsContext = activeJobs
          .map(
            (j) =>
              `- "${j.jobTitle}" at ${j.Company.name} (${j.location}, ${j.employmentType}, $${j.salaryFrom.toLocaleString()} - $${j.salaryTo.toLocaleString()})`
          )
          .join("\n");

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const interaction = await ai.interactions.create({
          model: "gemini-3.8-flash",
          input: `You are Career Wave AI Copilot, an expert, encouraging career advisor and platform guide on the Career Wave job board.
Your mission is to help job seekers find the right roles, provide actionable resume/interview advice, and help employers understand hiring trends.

Live Platform Data (Real Active Jobs on Career Wave right now):
${jobsContext || "No active jobs listed at this moment."}

Guidelines:
- Answer the user directly, concisely, and warmly.
- If the user asks about available jobs, reference the live active jobs above.
- Use clean Markdown with bullet points where appropriate.
- Keep responses focused and readable (under 180 words unless in-depth advice is requested).

User message: ${message}`,
        });

        if (interaction.output_text) {
          return NextResponse.json({ response: interaction.output_text });
        }
      } catch (geminiError) {
        console.warn("Gemini interaction failed, falling back to rule-based response:", geminiError);
      }
    }

    // Graceful fallback if Gemini API is unavailable
    const userMessage = message.toLowerCase();
    let fallback =
      "Hello! I am your Career Wave Assistant. You can ask me about active jobs, resume tips, or how to prepare for interviews.";

    if (userMessage.includes("job") || userMessage.includes("search") || userMessage.includes("find")) {
      fallback =
        "You can search for live roles on our Browse Jobs page (`/jobs`), filter by remote vs on-site, salary range, and company name!";
    } else if (userMessage.includes("resume") || userMessage.includes("cv")) {
      fallback =
        "Top resume tip: Quantify your achievements (e.g. 'Improved speed by 30%') and tailor your skills directly to the keywords in the job post.";
    }

    return NextResponse.json({ response: fallback });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}