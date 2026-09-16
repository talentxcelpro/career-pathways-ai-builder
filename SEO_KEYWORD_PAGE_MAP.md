# TalentXcel — Search Intent to Page Mapping (Phase 2)
**Domain**: `https://talentxcel.in`  
**Date**: 2026-08-25T14:24:37.198Z  

## 1. Intent Mapping Policy
Every public URL on TalentXcel owns a single primary search intent to prevent keyword cannibalization:
- **Brand / Entity Intent**: `/company/talentxcel` (Authoritative entity hub)
- **Commercial Intent**: `/services/*` (10 dedicated commercial landing pages)
- **Job Search Intent**: `/jobs` and `/jobs/:slug` (Active transactional openings)
- **Educational Intent**: `/colleges`, `/colleges/pathway`, `/colleges/:slug`
- **Informational Authority Intent**: `/topics/*` (11 semantic topic hubs) and `/resources/*`

## 2. Master Keyword-to-Route Mapping Table
| Target Keyword Concept | Cluster | Primary Intent | Secondary Intent | Target Route | Conversion Goal | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| "TalentXcel" | TalentXcel Brand & Entity | `brand` | `navigational` | [`/company/talentxcel`](https://talentxcel.in/company/talentxcel) | `BRAND_ENGAGEMENT` | Priority 1 |
| "TalentXcel careers and jobs" | TalentXcel Brand & Entity | `job-search` | `brand` | [`/jobs`](https://talentxcel.in/jobs) | `JOB_APPLY` | Priority 1 |
| "recruitment services India" | Recruitment Solutions | `commercial` | `employer` | [`/services/staffing-recruitment`](https://talentxcel.in/services/staffing-recruitment) | `EMPLOYER_LEAD` | Priority 1 |
| "recruitment topics and guides" | Recruitment Solutions | `informational` | `commercial` | [`/topics/recruitment`](https://talentxcel.in/topics/recruitment) | `EMPLOYER_LEAD` | Priority 1 |
| "corporate staffing solutions" | Staffing Solutions | `commercial` | `employer` | [`/services/staffing-recruitment`](https://talentxcel.in/services/staffing-recruitment) | `EMPLOYER_LEAD` | Priority 1 |
| "recruitment process outsourcing services" | RPO Solutions | `commercial` | `employer` | [`/services/rpo`](https://talentxcel.in/services/rpo) | `EMPLOYER_LEAD` | Priority 1 |
| "AI recruitment platform" | AI Recruitment | `commercial` | `employer` | [`/services/ai-recruitment`](https://talentxcel.in/services/ai-recruitment) | `EMPLOYER_LEAD` | Priority 1 |
| "artificial intelligence career topic hub" | AI Recruitment | `informational` | `career` | [`/topics/artificial-intelligence`](https://talentxcel.in/topics/artificial-intelligence) | `BRAND_ENGAGEMENT` | Priority 1 |
| "professional career services" | Career Services | `career` | `commercial` | [`/services/career-services`](https://talentxcel.in/services/career-services) | `RESUME_CREATE` | Priority 1 |
| "career growth and progression hub" | Career Services | `informational` | `career` | [`/topics/careers`](https://talentxcel.in/topics/careers) | `JOB_APPLY` | Priority 1 |
| "ATS resume builder" | Resume & ATS Tools | `transactional` | `career` | [`/services/resume-building`](https://talentxcel.in/services/resume-building) | `RESUME_CREATE` | Priority 1 |
| "ATS friendly resume writing guide" | Resume & ATS Tools | `informational` | `career` | [`/resources/how-to-write-an-ats-friendly-resume-in-2026-complete-step-by-step-guide`](https://talentxcel.in/resources/how-to-write-an-ats-friendly-resume-in-2026-complete-step-by-step-guide) | `RESUME_CREATE` | Priority 1 |
| "verified jobs in Noida" | Job Search | `job-search` | `transactional` | [`/jobs`](https://talentxcel.in/jobs) | `JOB_APPLY` | Priority 1 |
| "job search strategy and preparation" | Job Search | `informational` | `job-search` | [`/topics/job-search`](https://talentxcel.in/topics/job-search) | `JOB_APPLY` | Priority 1 |
| "top engineering and MBA colleges India" | Higher Education | `education` | `informational` | [`/colleges`](https://talentxcel.in/colleges) | `CAREER_PATHWAY` | Priority 1 |
| "6-step AI career pathway generator" | Higher Education | `education` | `career` | [`/colleges/pathway`](https://talentxcel.in/colleges/pathway) | `CAREER_PATHWAY` | Priority 1 |
| "tuition free global masters and scholarships" | Higher Education | `education` | `informational` | [`/colleges/global-programs`](https://talentxcel.in/colleges/global-programs) | `CAREER_PATHWAY` | Priority 1 |
| "online learning and verified skills" | Learning & Skills | `education` | `career` | [`/learning`](https://talentxcel.in/learning) | `CAREER_PATHWAY` | Priority 2 |
| "hire pre-screened talent for employers" | Employer Solutions | `employer` | `commercial` | [`/employer`](https://talentxcel.in/employer) | `EMPLOYER_LEAD` | Priority 1 |
| "IT systems consulting and software engineering" | Technology & IT Services | `commercial` | `employer` | [`/services/it-services`](https://talentxcel.in/services/it-services) | `EMPLOYER_LEAD` | Priority 1 |
