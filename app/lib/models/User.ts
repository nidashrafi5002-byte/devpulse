import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String },
  avatar: { type: String },
  summary: { type: String },
  skills: [{ name: String, level: Number }],
  topLanguages: [String],
  jobMatches: [{ title: String, company: String, type: String, match: Number }],
  repos: [
    {
      name: String,
      description: String,
      language: String,
      stars: Number,
      url: String,
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);