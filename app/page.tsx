"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { GitBranch, Loader2, LogOut, Zap, Star, Copy, Check, Briefcase } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [searchUsername, setSearchUsername] = useState("");
  const [activeUsername, setActiveUsername] = useState("");

  const analyze = async (targetUsername?: string) => {
    setLoading(true);
    setError("");
    const username = targetUsername || session?.user?.username;
    setActiveUsername(username || "");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPortfolioData(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/u/${activeUsername}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jobMatches = [
    { title: "Frontend Developer", company: "Startup Inc", match: 92, type: "Remote" },
    { title: "Full Stack Engineer", company: "Tech Corp", match: 87, type: "Hybrid" },
    { title: "AI/ML Engineer", company: "AI Labs", match: 81, type: "Remote" },
  ];

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-yellow-400 p-3 rounded-2xl">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-5xl font-black text-white">DevPulse</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-lg mx-auto mb-4">
              Turn your GitHub into a stunning AI-powered portfolio in seconds
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-10">
              <span>✨ AI Skill Analysis</span>
              <span>📊 GitHub Stats</span>
              <span>💼 Job Matches</span>
            </div>
          </div>

          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-yellow-400/30"
          >
            <GitBranch className="w-5 h-5" />
            Sign in with GitHub
          </button>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-3xl w-full">
            {[
              { icon: "🤖", title: "AI Analysis", desc: "Groq AI analyzes your repos and generates skill scores" },
              { icon: "📊", title: "GitHub Stats", desc: "See your top languages, stars, and project highlights" },
              { icon: "💼", title: "Job Matches", desc: "Get matched with jobs that fit your skill profile" },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 rounded-2xl p-6 text-left border border-gray-800">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 p-1.5 rounded-lg">
            <Zap className="text-black w-4 h-4" />
          </div>
          <span className="text-xl font-black">DevPulse</span>
        </div>
        <div className="flex items-center gap-4">
          <img src={session.user?.image!} className="w-8 h-8 rounded-full border-2 border-yellow-400" alt="avatar" />
          <span className="text-gray-300 hidden md:block">{session.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-white transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {!portfolioData ? (
          <div className="text-center space-y-8">
            {/* Profile Card */}
            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
              <img src={session.user?.image!} className="w-24 h-24 rounded-full border-4 border-yellow-400 mx-auto mb-4" alt="avatar" />
              <h2 className="text-3xl font-black">{session.user?.name}</h2>
              <p className="text-gray-400 mt-2">@{session.user?.username}</p>
              <p className="text-gray-500 mt-4 max-w-md mx-auto">
                Ready to generate your AI-powered portfolio? Click below to analyze your GitHub repositories.
              </p>
            </div>

            {/* Search any GitHub user */}
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search any GitHub username..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze(searchUsername || undefined)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={() => analyze(searchUsername || undefined)}
                disabled={loading}
                className="bg-gray-700 text-white px-5 py-3 rounded-full hover:bg-gray-600 transition"
              >
                Search
              </button>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={() => analyze()}
              disabled={loading}
              className="flex items-center gap-3 bg-yellow-400 text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300 mx-auto disabled:opacity-50 shadow-lg hover:shadow-yellow-400/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {loading ? "Analyzing your GitHub..." : "Generate My Portfolio"}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Hero */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700">
              <div className="flex items-start gap-6">
                <img
                  src={activeUsername === session?.user?.username 
                    ? session.user?.image! 
                    : `https://github.com/${activeUsername}.png`}
                  className="w-20 h-20 rounded-2xl border-4 border-yellow-400"
                  alt="avatar"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-black">
                    {activeUsername === session?.user?.username ? session.user?.name : activeUsername}
                  </h2>
                  <p className="text-gray-400 mb-3">@{activeUsername}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{portfolioData.analysis.summary}</p>
                  <div className="flex gap-2 flex-wrap mt-4">
                    {portfolioData.analysis.topLanguages.map((lang: string) => (
                      <span key={lang} className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Share Portfolio */}
              <div className="mt-6 flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                <span className="text-gray-400 text-sm flex-1 truncate">
                {typeof window !== "undefined" ? window.location.origin : ""}/u/{activeUsername}
                </span>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
              <h3 className="text-xl font-black mb-6">Skills</h3>
              <div className="space-y-4">
                {portfolioData.analysis.skills.map((skill: any) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-yellow-400 font-bold">{skill.level}/100</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-2.5 rounded-full transition-all"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Matches */}
            <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-black">Job Matches</h3>
              </div>
              <div className="space-y-3">
                {jobMatches.map((job) => (
                  <div key={job.title} className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
                    <div>
                      <p className="font-bold">{job.title}</p>
                      <p className="text-gray-400 text-sm">{job.company} · {job.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full">
                        {job.match}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Repos */}
            <div>
              <h3 className="text-xl font-black mb-4">Top Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolioData.repos.map((repo: any) => (
                  <div key={repo.name} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-yellow-400/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white">{repo.name}</span>
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Star className="w-3 h-3" />
                        <span>{repo.stars}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      {repo.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      {repo.language && (
                        <span className="text-xs bg-gray-800 border border-gray-700 px-2 py-1 rounded-full text-gray-300">
                          {repo.language}
                        </span>
                      )}
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-400 text-xs font-bold hover:underline ml-auto"
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
              className="text-gray-500 hover:text-gray-300 underline text-sm transition"
            >
              Regenerate Portfolio
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
