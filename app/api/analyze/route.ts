import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=20&sort=updated`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    const repos = await reposRes.json();

    if (!Array.isArray(repos)) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }

    const repoSummary = repos
      .map((r: any) => `${r.name}: ${r.language || "unknown"}, stars:${r.stargazers_count}, ${r.description || "no description"}`)
      .join("\n");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{
          role: "user",
          content: `Analyze these GitHub repositories and return ONLY a valid JSON object with no markdown, no backticks, no explanation. The JSON must have exactly these fields:
- "skills": array of objects with "name" (string) and "level" (number 1-100)
- "summary": a 2 sentence string describing this developer
- "topLanguages": array of strings

Repositories:
${repoSummary}`
        }],
        temperature: 0.3,
      }),
    });

    const groqData = await groqRes.json();

    if (!groqData.choices) {
      console.error("Groq error:", JSON.stringify(groqData));
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
    }

    const aiText = groqData.choices[0].message.content;
    const clean = aiText.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);

    const cleanRepos = repos.slice(0, 10).map((r: any) => ({
      name: r.name,
      description: r.description || "",
      language: r.language || "",
      stars: r.stargazers_count || 0,
      url: r.html_url,
    }));

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
