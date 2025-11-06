// ===============================
// ✅ AI Resume Builder Backend (Stable, Enhanced, Node v22+ Ready)
// ===============================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs/promises";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

// ===============================
// ✅ Rate Limiting (API Protection)
// ===============================
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many requests. Please try again later." },
});
app.use(limiter);

// ===============================
// 🧠 Helper: Call OpenRouter API
// ===============================
async function callOpenRouter(messages, max_tokens = 400) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("❌ Missing OPENROUTER_API_KEY in .env");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenRouter API Error:", JSON.stringify(data, null, 2));
    throw new Error(`OpenRouter API failed: ${JSON.stringify(data)}`);
  }

  return data.choices?.[0]?.message?.content?.trim() || "⚠️ No response text received.";
}

// ===============================
// 📄 File Text Extraction Helper
// ===============================
async function extractText(file) {
  const buffer = await fs.readFile(file.path);
  const name = file.originalname.toLowerCase();

  if (name.endsWith(".pdf")) {
    const data = await pdfParse.default(buffer);
    return data.text;
  } else if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ path: file.path });
    return value;
  } else if (name.endsWith(".txt") || name.endsWith(".md")) {
    return buffer.toString("utf8");
  } else {
    return buffer.toString("utf8");
  }
}

// ===============================
// 🌐 TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("✅ AI Resume Builder backend is running!");
});

// ===============================
// 🧾 AI SUMMARY GENERATION
// ===============================
app.post("/api/ai-summary", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Job title is required" });

    const prompt = `
Write a concise, professional Harvard-style resume summary for a ${title}.
Keep it between 35–40 words. Focus on leadership, measurable impact, and domain expertise. Make it professional and detailed.
`;

    const messages = [
      { role: "system", content: "You are a Harvard resume expert writing concise, high-impact summaries." },
      { role: "user", content: prompt },
    ];

    const aiText = await callOpenRouter(messages, 120);
    res.json({ text: aiText });
  } catch (err) {
    console.error("AI Summary Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 💼 AI EXPERIENCE GENERATION (Structured JSON)
// ===============================
app.post("/api/ai-experience", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Job title is required" });

    const prompt = `
You are a top-tier resume writer. 
Create a recent professional experience for someone with the role "${title}".
Include these details:
1. company: realistic company name
2. jobTitle: actual job title
3. dates: realistic start – end years (format: YYYY – YYYY or YYYY – Present)
4. bullets: 3–4 strong, measurable achievements starting with action verbs

Return ONLY valid JSON like this:
{
  "company": "...",
  "jobTitle": "...",
  "dates": "...",
  "bullets": ["...", "...", "..."]
}
`;

    const messages = [
      { role: "system", content: "You are an expert resume writer generating structured JSON." },
      { role: "user", content: prompt },
    ];

    const aiText = await callOpenRouter(messages, 300);

    let aiData;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      aiData = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch (err) {
      console.error("⚠️ Failed to parse AI JSON:", err);
      // Retry once
      const retryPrompt = `Fix your previous JSON response. Only return valid JSON for a ${title} experience.`;
      const retryMessages = [
        { role: "system", content: "You are an expert resume writer generating structured JSON." },
        { role: "user", content: retryPrompt },
      ];
      const retryText = await callOpenRouter(retryMessages, 200);
      try {
        const jsonMatch = retryText.match(/\{[\s\S]*\}/);
        aiData = JSON.parse(jsonMatch ? jsonMatch[0] : retryText);
      } catch {
        aiData = {
          company: "Company Name",
          jobTitle: title,
          dates: "2021 – Present",
          bullets: [
            `Performed key responsibilities as a ${title}.`,
            "Achieved measurable results.",
            "Collaborated with team members effectively.",
          ],
        };
      }
    }

    res.json(aiData);
  } catch (err) {
    console.error("AI Experience Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 🧩 AI RESUME TAILORING
// ===============================
app.post("/api/tailor-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription)
      return res.status(400).json({ error: "Resume and job description required." });

    const prompt = `
You are a Harvard-trained resume consultant.
Rewrite the candidate’s resume summary and experience sections to best match this job description.

Rules:
- Do NOT invent new experience.
- Prioritize aligning existing skills and achievements.
- Use job-relevant keywords naturally.
- Tone: confident, precise, and results-driven.
- Length: around 200 words.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}
`;

    const messages = [
      { role: "system", content: "You are an expert resume optimization consultant." },
      { role: "user", content: prompt },
    ];

    const tailoredResume = await callOpenRouter(messages, 400);
    res.json({ tailoredResume });
  } catch (err) {
    console.error("AI Tailor Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✉️ AI COVER LETTER GENERATION
// ===============================
app.post("/api/generate-cover-letter", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription)
      return res.status(400).json({ error: "Missing resume or job description" });

    const prompt = `
You are a professional career writer.
Write a personalized Harvard-style cover letter (180–250 words)
that directly connects the candidate’s key skills and experiences from their resume
to the role described in the job description below.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}
`;

    const messages = [
      { role: "system", content: "You are a professional HR and cover letter writer." },
      { role: "user", content: prompt },
    ];

    const coverLetter = await callOpenRouter(messages, 400);
    res.json({ coverLetter });
  } catch (err) {
    console.error("AI Cover Letter Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 📤 UPLOAD FILES + COVER LETTER GENERATION
// ===============================
app.post(
  "/api/upload-and-generate-cover",
  upload.fields([
    { name: "resumeFile", maxCount: 1 },
    { name: "jobFile", maxCount: 1 },
  ]),
  async (req, res) => {
    let resumeFile, jobFile;
    try {
      resumeFile = req.files?.resumeFile?.[0];
      jobFile = req.files?.jobFile?.[0];
      if (!resumeFile || !jobFile)
        return res.status(400).json({ error: "Both resume and job files required." });

      const resumeText = (await extractText(resumeFile)).slice(0, 6000);
      const jobDescription = (await extractText(jobFile)).slice(0, 4000);

      const prompt = `
You are a senior HR recruiter and expert cover letter writer.
Write a personalized, impactful Harvard-style cover letter (180–250 words)
based on the resume and job description below.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}
`;

      const messages = [
        { role: "system", content: "You are a professional HR cover letter specialist." },
        { role: "user", content: prompt },
      ];

      const coverLetter = await callOpenRouter(messages, 400);
      res.json({ coverLetter });
    } catch (err) {
      console.error("Upload & Cover Letter Error:", err);
      res.status(500).json({ error: err.message });
    } finally {
      // Clean up uploaded files safely
      if (resumeFile) await fs.unlink(resumeFile.path).catch(() => {});
      if (jobFile) await fs.unlink(jobFile.path).catch(() => {});
    }
  }
);

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
