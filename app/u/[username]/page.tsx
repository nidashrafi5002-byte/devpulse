"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Zap, Star, Briefcase, GitBranch } from "lucide-react";

export default function PublicPortfolio() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const jobMatches = [
    { title: "Frontend Developer", company: "Startup Inc", match: 92, type: "Remote" },
    { title: "Full Stack Engineer", company: "Tech Corp", match: 87, type: "Hybrid" },
    { title: "AI/ML Engineer", company: "AI Labs", match: 81, type: "Remote" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${username}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        setData(json.user);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchUser();
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Zap className="w-12 h-12 text-yellow-400 animate-pulse mx-auto" />
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black">Portfolio not found</h1>
          <p className="text-gray-400">@{username} hasn't generated their DevPulse portfolio yet.</p>
          <a href="/" className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-300 transition">
            <Zap className="w-4 h-4" />
            Generate yours for free
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 p-1.5 rounded-lg">
            <Zap className="text-black w-4 h-4" />
          </div>
          <span className="text-xl font-black">DevPulse</span>
        </div>
        
        <a
          href="/"
          className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 transition"
        >
          Generate yours free
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
        {/* Profile Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700">
          <div className="flex items-start gap-6">
            <img
              src={`https://github.com/${username}.png`}
              className="w-20 h-20 rounded-2xl border-4 border-yellow-400"
              alt={username}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-black">{data.name || username}</h1>
              <p className="text-gray-400 mb-3">@{username}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
              <div className="flex gap-2 flex-wrap mt-4">
                {data.topLanguages?.map((lang: string) => (
                  <span key={lang} className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
          <h2 className="text-xl font-black mb-6">Skills</h2>
          <div className="space-y-4">
            {data.skills?.map((skill: any) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-yellow-400 font-bold">{skill.level}/100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-2.5 rounded-full"
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
            <h2 className="text-xl font-black">Job Matches</h2>
          </div>
          <div className="space-y-3">
            {jobMatches.map((job) => (
              <div key={job.title} className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
                <div>
                  <p className="font-bold">{job.title}</p>
                  <p className="text-gray-400 text-sm">{job.company} · {job.type}</p>
                </div>
                <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full">
                  {job.match}% match
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Repos */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-black">Top Repositories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.repos?.map((repo: any) => (
              <div key={repo.name} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-yellow-400/50 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{repo.name}</span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <Star className="w-3 h-3" />
                    <span>{repo.stars}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">{repo.description || "No description"}</p>
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

        {/* Footer CTA */}
        <div className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-400 mb-4">Want your own AI-powered portfolio?</p>
          
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition"
          >
            <Zap className="w-4 h-4" />
            Generate yours free on DevPulse
          </a>
        </div>
      </div>
    </main>
  );
}
