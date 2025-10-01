# 🎯 TalentXcel Unified Resume Builder

A modern, AI-powered resume builder with ATS optimization and professional export capabilities.

---

## 🚀 Quick Start

### For Users
1. **Visit** `/resume` - Main hub with two options:
   - 📤 **Upload Resume** - Parse and enhance existing resume
   - ✨ **Start from Scratch** - Guided resume creation

2. **Edit Your Resume** at `/resume/build/:id`
   - Section-by-section editing with inline AI assistance
   - Real-time preview on the right
   - ATS score monitoring in sidebar

3. **Export** your resume as PDF or DOCX when ready

---

## ✨ Key Features

### 1. AI-Powered Enhancement (FREE Gemini 2.5 Flash)
- **Inline AI buttons** - Enhance any section with one click
- **Summary generation** - AI writes compelling professional summaries
- **Job optimization** - Tailor resume to specific job descriptions
- **Bullet suggestions** - Generate achievement-focused bullet points

### 2. ATS Analysis & Scoring
- **Real-time ATS score** (0-100) displayed in sidebar
- **Detailed analysis** with keyword matching
- **Actionable recommendations** to improve score
- **Format validation** for ATS compatibility

### 3. Professional Export
- **PDF export** - Clean, ATS-friendly formatting
- **DOCX export** - Fully editable Word documents
- **Auto-naming** - Files named after user automatically

### 4. Smart Upload & Parsing
- **Drag-and-drop** file upload (PDF, DOCX, DOC, TXT)
- **AI parsing** - Extracts structured data automatically
- **Enhancement on upload** - Initial improvements applied instantly

---

## 🏗️ Architecture

### Frontend Components

```
src/
├── pages/resume/
│   ├── UnifiedResumeHub.tsx        # Main entry point
│   ├── UnifiedResumeBuilder.tsx    # Three-pane builder
│   └── UnifiedUploadPage.tsx       # Upload wizard
├── components/resume/
│   ├── ai/
│   │   └── InlineAIEnhancer.tsx    # Inline AI buttons
│   ├── ats/
│   │   └── ATSScoreDisplay.tsx     # ATS scoring UI
│   └── sections/
│       ├── PersonalInfoEditor.tsx   # Contact info editor
│       ├── ExperienceEditor.tsx     # Work experience editor
│       └── SkillsEditor.tsx         # Skills manager
└── services/
    ├── resumeEnhancementService.ts  # AI enhancement client
    ├── atsAnalyzerService.ts        # ATS analysis client
    ├── resumeExportService.ts       # PDF/DOCX export
    └── resumeParsingService.ts      # Upload parsing client
```

### Backend (Supabase Edge Functions)

```
supabase/functions/
├── enhance-resume/      # AI content enhancement
├── ats-analyzer/        # ATS compatibility analysis
└── ai-resume-parser/    # Resume upload parsing
```

### Database Schema
- `ai_resumes` - Stores resume data with versioning
- User authentication tied to resume ownership
- RLS policies ensure data privacy

---

## 🔧 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Supabase Edge Functions
- **AI:** Lovable AI Gateway (Gemini 2.5 Flash - FREE)
- **Export:** jsPDF, docx
- **Routing:** React Router v6

---

## 📊 AI Integration

### Lovable AI Gateway
- **Endpoint:** `https://ai.gateway.lovable.dev/v1/chat/completions`
- **Model:** `google/gemini-2.5-flash`
- **Cost:** FREE during promotional period
- **Rate Limits:** Handled with proper error messages

### Edge Functions
All AI calls go through Supabase edge functions (never direct from client):

1. **enhance-resume** - Content enhancement
   - Actions: `enhance_section`, `generate_summary`, `optimize_for_job`, `suggest_bullets`
   
2. **ats-analyzer** - ATS compatibility analysis
   - Returns score + detailed recommendations
   - Supports job-specific targeting

3. **ai-resume-parser** - Upload parsing
   - Extracts structured data from files
   - Initial enhancement applied

---

## 🎨 User Flow

### Upload Flow
```
/resume → Click "Upload Resume" → /resume/upload
→ Drag-drop file → AI parses → Initial enhancement
→ /resume/build/:id (Edit & Refine)
```

### Build from Scratch Flow
```
/resume → Click "Start from Scratch" → /resume/build
→ Fill sections → Use inline AI → Export
```

---

## 🔐 Security

- All AI calls through backend edge functions
- No API keys exposed to client
- RLS policies on resume data
- User authentication required for save/export

---

## 🚦 Migration Status

### Completed Phases
- ✅ **Phase 1:** Foundation (Hub, Builder, Routes)
- ✅ **Phase 2:** Upload & AI Parsing
- ✅ **Phase 3:** AI Integration (Inline enhancements)
- ✅ **Phase 4:** Migration & Cleanup (Redirects)
- ✅ **Phase 5:** ATS Scoring + Export

### Legacy Routes
Old routes automatically redirect to new unified builder:
- `/resume-builder/*` → `/resume/*`
- `/resume/edit/:id` → `/resume/build/:id`
- `/tools/resume-builder` → `/resume`

---

## 🎯 Next Phase

**Phase 6: Templates & Visual Customization**
- 10 professional templates
- Live template switching
- Color/font customization
- Mobile responsiveness

---

## 📝 Development Notes

### Adding New AI Actions
1. Add action type to edge function switch statement
2. Define prompt in edge function
3. Create client service method
4. Add UI button in appropriate section

### Creating New Editor Sections
1. Create section editor component in `src/components/resume/sections/`
2. Add to `UnifiedResumeBuilder.tsx` edit tab
3. Include AI enhancement button
4. Update export services to include section

### Testing Edge Functions
View logs at:
- enhance-resume: [Supabase Dashboard](https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/functions/enhance-resume/logs)
- ats-analyzer: [Supabase Dashboard](https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/functions/ats-analyzer/logs)

---

## 💡 Tips for Users

1. **Use Inline AI Early** - Enhance sections as you write them
2. **Target Jobs** - Paste job descriptions for optimized keywords
3. **Check ATS Score** - Aim for 80+ before applying
4. **Export Both Formats** - PDF for applications, DOCX for customization

---

## 🐛 Troubleshooting

### AI Not Working
- Check Lovable AI credits in workspace settings
- Review edge function logs for errors
- Verify internet connection

### Export Issues
- Ensure all required fields are filled
- Check console for detailed errors
- Try different export format

### Upload Problems
- Verify file size < 10MB
- Use supported formats: PDF, DOCX, DOC, TXT
- Check file isn't password-protected

---

**Status:** Production Ready ✅  
**Last Updated:** 2025-01-31  
**Version:** 1.0.0
