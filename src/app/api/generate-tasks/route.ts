/* ===================== */
/* Generate Tasks API Route */
/* Uses Gemini first, then safe fallback if Gemini is unavailable.
   Important: all generated tasks start as TODO.
*/
/* ===================== */

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

/* ===================== */
/* Types */
/* ===================== */

type GeneratedTask = {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

/* ===================== */
/* Gemini Client */
/* Uses GOOGLE_API_KEY from .env.local.
 */
/* ===================== */

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

/* ===================== */
/* Task Count Detector */
/* Detects requested count from prompts like "5 steps" or "10 tasks".
 */
/* ===================== */

function detectTaskCount(goal: string) {
  const match = goal.match(/(\d+)\s*(steps|tasks|days|خطوات|مهام|أيام)?/i);
  const count = match ? Number(match[1]) : 8;

  return Math.min(Math.max(count, 3), 20);
}

/* ===================== */
/* Safe Fallback Tasks */
/* Used only when Gemini is unavailable. All tasks start as TODO.
 */
/* ===================== */

function createFallbackTasks(goal: string, taskCount: number): GeneratedTask[] {
  return Array.from({ length: taskCount }, (_, index) => {
    const step = index + 1;

    return {
      id: step,
      title: `Step ${step}: Plan action`,
      description: `Complete one clear action toward this goal: "${goal.slice(
        0,
        90,
      )}".`,
      status: "TODO",
    };
  });
}

/* ===================== */
/* Safe JSON Parser */
/* Converts Gemini output into normalized tasks.
   All tasks are forced to TODO so the user controls progress manually.
*/
/* ===================== */

function parseTasks(text: string): GeneratedTask[] | null {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as GeneratedTask[];

    if (!Array.isArray(parsed)) return null;

    return parsed.map((task, index) => ({
      id: index + 1,
      title: String(task.title || "Untitled task").slice(0, 50),
      description: String(task.description || "No description.").slice(0, 160),
      status: "TODO",
    }));
  } catch {
    return null;
  }
}

/* ===================== */
/* Gemini Prompt */
/* Requests exact-count, clean, useful JSON tasks.
 */
/* ===================== */

function createPrompt(goal: string, taskCount: number) {
  return `
You are a senior productivity assistant.

Create exactly ${taskCount} high-quality tasks for the user's goal.

Quality rules:
- The plan must directly match the user's goal
- Tasks must be specific, useful, and practical
- Avoid generic tasks like "Analyze goal" or "Review output"
- Order tasks logically from start to finish
- Keep titles short and clean
- Descriptions must explain what the user should actually do
- All tasks must use status "TODO"
- Return ONLY valid JSON
- No markdown
- No extra text

User goal:
"${goal}"

Return ONLY this JSON format:
[
  {
    "title": "Short task title",
    "description": "Clear action-focused description",
    "status": "TODO"
  }
]
`;
}

/* ===================== */
/* Gemini Model Fallback */
/* Tries multiple Gemini models before using local fallback.
 */
/* ===================== */

async function generateWithGemini(
  goal: string,
  taskCount: number,
): Promise<GeneratedTask[] | null> {
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: createPrompt(goal, taskCount),
      });

      const tasks = parseTasks(response.text || "");

      if (tasks && tasks.length > 0) {
        console.log("SOURCE:", model);
        return tasks;
      }

      console.log("SOURCE:", `${model}-parse-failed`);
    } catch (error) {
      console.error(`GEMINI_MODEL_ERROR (${model}):`, error);
    }
  }

  return null;
}

/* ===================== */
/* POST Handler */
/* Receives goal, detects task count, tries Gemini, then fallback.
 */
/* ===================== */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const goal = String(body.goal || "").trim();

    if (!goal) {
      return NextResponse.json(
        { success: false, message: "Goal is required." },
        { status: 400 },
      );
    }

    const taskCount = detectTaskCount(goal);

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: true,
        source: "fallback-no-api-key",
        tasks: createFallbackTasks(goal, taskCount),
      });
    }

    const aiTasks = await generateWithGemini(goal, taskCount);

    return NextResponse.json({
      success: true,
      source: aiTasks ? "gemini" : "fallback",
      tasks: aiTasks || createFallbackTasks(goal, taskCount),
    });
  } catch (error) {
    console.error("GENERATE_TASKS_ROUTE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate tasks.",
      },
      { status: 500 },
    );
  }
}
