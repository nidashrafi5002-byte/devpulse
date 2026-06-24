"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { GitBranch, Loader2, LogOut, Zap } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: session?.user?.username }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPortfolioData(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="text-yellow-400 w-8 h-8" />
            <h1 className="text-4xl font-bold">DevPulse</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-md">
            Connect your GitHub and get an AI-powered portfolio with skill analysis in seconds.
          </p>
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-200 transition mx-auto"
          >
            <GitBranch className="w-5 h-5" />
            Sign in with GitHub
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Zap className="text-yellow-400 w-6 h-6" />
          <span className="text-xl font-bold">DevPulse</span>
        </div>
        <div className="flex items-center gap-4">
          <img
            src={session.user?.image!}
            className="w-8 h-8 rounded-full"
            alt="avatar"
          />
          <span className="text-gray-300">{session.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-500 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {!portfolioData ? (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Welcome, {session.user?.name}!
            </h2>
            <p className="text-gray-400">
              Click below to analyze your GitHub and generate your AI portfolio
            </p>
            {error && <p className="text-red-400">{error}</p>}
            <button
              onClick={analyze}
              disabled={loading}
              className="flex items-center gap-2 bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold text-lg hover:bg-yellow-300 transition mx-auto disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              {loading ? "Analyzing your GitHub..." : "Generate My Portfolio"}
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
              <h2 className="text-2xl font-bold">{session.user?.name}</h2>
              <p className="text-gray-400">{portfolioData.analysis.summary}</p>
              <div className="flex gap-2 flex-wrap mt-3">
                {portfolioData.analysis.topLanguages.map((lang: string) => (
                  <span
                    key={lang}
                    className="bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Skills</h3>
              <div className="space-y-3">
                {portfolioData.analysis.skills.map((skill: any) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span className="text-gray-400">{skill.level}/100</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
             <h3 className="text-xl font-bold mb-4">Top Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolioData.repos.map((repo: any) => (
                  <div
                    key={repo.name}
                    className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{repo.name}</span>
                      <span className="text-yellow-400 text-sm">
                        ⭐ {repo.stars}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {repo.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      {repo.language && (
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300">
                          {repo.language}
                        </span>
                      )}
                      
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-400 text-xs hover:underline"
                      >
                        View on GitHub &#8594;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPortfolioData(null)}
              className="text-gray-500 underline text-sm"
            >
              Regenerate Portfolio
            </button>
          </div>
        )}
      </div>
    </main>
  );
}