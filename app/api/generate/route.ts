import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { marked } from "marked"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt, taskTitle, projectName } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite", // fast + cheap
    });

    const fullPrompt = `User idea: ${prompt} Write a clear, structured, professional task description in 100 words.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    const htmlDescription = marked(text)

    return NextResponse.json({
      description: htmlDescription,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
