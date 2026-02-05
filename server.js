const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// -------- Multer --------
const upload = multer({ dest: "uploads/" });

// -------- Gemini --------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Working model (as per your account)
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash",
});

// -------- API --------
app.post("/generate-cover-letter", upload.single("resume"), async (req, res) => {
  try {
    // ✅ NEW INPUTS
    const {
      name,
      email,
      phone,
      linkedin,
      skills,
      jobRole,
      companyName,
      experience,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Phone are required",
      });
    }

    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);

    // -------- PROMPT (Dynamic & Clean) --------
const prompt = `
You are an expert HR professional.

STRICT RULES (MUST FOLLOW):
- DO NOT write labels like "Your Name", "Your Email", "Your Phone", "Your LinkedIn".
- DO NOT use square brackets [ ].
- DO NOT create template-style headings.
- Write ONLY real values provided below.
- If any value is missing, omit that line.
- Output only plain text. No markdown.

CANDIDATE DETAILS (USE VALUES DIRECTLY):
Name: ${name}
Phone: ${phone}
Email: ${email}
LinkedIn: ${linkedin || ""}

JOB DETAILS:
Role: ${jobRole}
Company: ${companyName}
Experience: ${experience}

SKILLS:
${skills}

RESUME CONTENT:
${pdfData.text}

FORMAT (FOLLOW EXACTLY):

${name}
${phone} | ${email}
${linkedin || ""}

Dear Hiring Team at ${companyName},

Write a professional, ATS-friendly cover letter body.

End exactly with:
Sincerely,
${name}
`;
    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text();

    res.json({
      success: true,
      coverLetter,
    });

    fs.unlinkSync(req.file.path);
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({
      success: false,
      message: "Cover letter generation failed",
    });
  }
});

// -------- Server --------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
