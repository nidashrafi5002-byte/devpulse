import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    // Fetch repos from GitHub
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=20&sort=updated`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    const repos = await reposRes.json();

    if (!Array.isArray(repos)) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }

    // Build summary for Gemini
    const repoSummary = repos
      .map((r: any) => `${r.name}: ${r.language || "unknown"}, stars:${r.stargazers_count}, ${r.description || "no description"}`)
      .join("\n");

    // Call Gemini AI
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze these GitHub repositories and return ONLY a valid JSON object with no markdown, no backticks, no explanation. The JSON must have exactly these fields:
- "skills": array of objects with "name" (string) and "level" (number 1-100)
- "summary": a 2 sentence string describing this developer
- "topLanguages": array of strings

Repositories:
${repoSummary}`
            }]
          }]
        })
      }
    );

    const geminiData = await geminiRes.json();
    console.log("GEMINI RESPONSE:", JSON.stringify(geminiData));

    if (!geminiData.candidates) {
      return NextResponse.json({ error: "Gemini API error" }, { status: 500 });
    }

    const aiText = geminiData.candidates[0].content.parts[0].text;
    const clean = aiText.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);

    // Build repos with CORRECT html_url
    const cleanRepos = repos.slice(0, 10).map((r: any) => ({
      name: r.name,
      description: r.description || "",
      language: r.language || "",
      stars: r.stargazers_count || 0,
      url: r.html_url, // ← correct GitHub page URL
    }));

    console.log("Sample repo URL:", cleanRepos[0]?.url);

    // Save to MongoDB
    await connectDB();
    await User.findOneAndUpdate(
      { username },
      {
        username,
        skills: analysis.skills,
        summary: analysis.summary,
        topLanguages: analysis.topLanguages,
        repos: cleanRepos,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      analysis,
      repos: cleanRepos,
    });

  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
