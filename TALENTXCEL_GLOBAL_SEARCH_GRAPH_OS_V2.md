# TalentXcel Global Search Graph & Search Universe Operating System (OS v2)
## Master Architectural Blueprint & Technical Implementation Specification

---

## 1. Executive Summary & Core Paradigm

TalentXcel's search footprint is not an IT jobs board, nor a static directory of URLs, nor a blind combinatorial permutation engine. It is the **World's Largest Global Career Search & Intelligence Graph** covering **every profession, occupation, and industry worldwide**.

TalentXcel's architecture addresses the complete three-pillar career ecosystem:
1. **FIND A JOB** (Active Vacancies, Government Jobs, Remote/WFH, Freshers, Internships, Walk-ins, Multi-City Matrix across 32 Global Industries)
2. **BUILD MY CAREER** (ATS Resume Checker, Resume Builder, Templates, Examples, Career Passport, Career Map, Skills, Learning, Courses, Certifications, Salary Guides, College Placements, Interview Prep)
3. **HIRE TALENT** (Global Employer Acquisition, Candidate Sourcing, Recruiter Tools, CV Search)

### The Governing Golden Rule
$$\text{Demand Signal} \times \text{Entity Resolution} \times \text{Universe Evidence} \times \text{Content Contract} = \text{Indexable Destination}$$

- **No Cartesian Permutations**: We do not generate empty matrix cross-products (e.g. "Software Engineer Jobs in TinyVillage").
- **Universe-Specific Evidence**: *"No supporting evidence $\to$ DO NOT BUILD"*. A Salary Benchmark page does not require active job listings if backed by 15+ verified compensation records. A College Placement page does not require jobs if backed by audited placement reports.
- **Conversion on First Touch**: Every indexable destination embeds a zero-friction, 10-second interactive free utility (ATS score reveal, job match evaluation, salary calculator) before authentication.
- **Career-Centric, Not IT-Centric**: IT is only 1 of 32 global verticals. Healthcare (doctors, nurses, pharmacists), BFSI (bank branch managers, credit analysts), Construction (civil engineers, architects), Aviation (commercial pilots), Hospitality (hotel managers, head chefs), and Manufacturing (plant managers, CNC operators) are first-class peers.

### The Architectural Scale North Star
- **$\ge 1$ BILLION+ Potential Search Opportunities** ($646\text{M} - 1.78\text{B}+$ raw search intent universe)
- **100M – 250M+ Qualified Search Opportunities** (Target: **241 Million**, strictly evidence-backed)
- **20M – 100M+ Buildable Destinations** (Target: **73 Million**, governed by content contracts)
- **10M – 50M+ Quality Indexable URL Capacity** (Target: **22.6 Million**, governor-controlled, zero thin crawl bloat)

---

## 2. End-to-End Search Demand & Acquisition Architecture

```mermaid
flowchart TD
    DemandSources["GLOBAL SEARCH DEMAND SOURCES<br/>(GSC Impressions, Internal Search, Trends, SERP)"] --> IngestionEngine["Search Demand Ingestion Engine<br/>(Tokenization, Entity Extraction, Intent Mapping)"]
    
    subgraph CoreTaxonomy["Global Knowledge Graph"]
        IngestionEngine --> IndustryGraph["6-Tier Industry & Occupation Graph<br/>(32 Industries, Sectors, Occupations, Roles)"]
        IngestionEngine --> EntityRegistry["22 Entity Dimensions<br/>(Role, Skill, Company, College, Degree, etc.)"]
        IngestionEngine --> LocationEngine["Global Location Hierarchy (6 Levels)<br/>(World, Continent, Country, State, Metro, City, District)"]
        IngestionEngine --> IntentRegistry["22 Intent Dimensions<br/>(Jobs, Salary, ATS, Resume, Placements, etc.)"]
    end
    
    IndustryGraph --> ExpansionEngine["Systematic Intent Expansion Engine<br/>(Orthogonal Query Synthesis, Anti-Cartesian Pruning)"]
    EntityRegistry --> ExpansionEngine
    LocationEngine --> ExpansionEngine
    IntentRegistry --> ExpansionEngine
    
    ExpansionEngine --> EvidenceEngine["Universe-Specific Evidence Engine<br/>(Jobs >= 3, Salary >= 15 pts, ATS >= 20 terms, Audited Placements)"]
    
    EvidenceEngine -- "Approved" --> OppEngine["Search Opportunity Engine<br/>(Opportunity Score >= 70)"]
    EvidenceEngine -- "Insufficient" --> DoNotBuild["DO NOT BUILD / NOINDEX_HOLD<br/>(Preserves Domain Authority)"]
    
    OppEngine --> ContentContract["Content Contract Engine<br/>(Hard Module Verification per Archetype)"]
    ContentContract --> LinkEngine["Internal Link Authority Graph Engine<br/>(Bidirectional seo_edges, Semantic Clusters)"]
    LinkEngine --> Governor["Quality Governor Engine<br/>(6-Factor Score, Thin Gate, 410 Gone Exterminator)"]
    
    Governor --> Rendering["SSG / SSR Page Generator<br/>(Dynamic Route, Structured JSON-LD)"]
    Rendering --> Sitemap["Dedicated XML Sitemaps<br/>(sitemap-jobs.xml, sitemap-salary.xml, etc.)"]
    Sitemap --> Google["Google Search Indexing<br/>(Googlebot Crawl & Discovery)"]
    
    Google --> Click["Qualified Organic Click"]
    Click --> FreeTool["Free Interactive Tool<br/>(10s Value Demonstration)"]
    FreeTool --> QuickAuth["Quick Auth & Profile Save"]
    QuickAuth --> Conversion["Job Application / Course Enrollment / Referral"]
```

---

## 3. The 6-Tier Multi-Industry & Occupation Hierarchy

TalentXcel structures all global work through a formalized 6-Tier Knowledge Graph:

$$\text{Tier 1: Industry} \to \text{Tier 2: Sector} \to \text{Tier 3: Sub-Sector} \to \text{Tier 4: Occupation} \to \text{Tier 5: Specialization} \to \text{Tier 6: Role}$$

```mermaid
flowchart TD
    T1["Tier 1: INDUSTRY<br/>(Healthcare & Medicine)"]
    T2["Tier 2: SECTOR<br/>(Pharmacy & Pharmaceutical Care)"]
    T3["Tier 3: SUB-SECTOR<br/>(Hospital & Inpatient Pharmacy)"]
    T4["Tier 4: OCCUPATION<br/>(Pharmacist)"]
    T5["Tier 5: SPECIALIZATION<br/>(Clinical / Oncology Pharmacist)"]
    T6["Tier 6: ROLE<br/>(hospital-pharmacist)"]

    T1 --> T2 --> T3 --> T4 --> T5 --> T6
```

### 32 Canonical Global Industry Verticals
1. **Healthcare & Medicine** (Doctors, Nurses, Pharmacists, Radiologists, Lab Technicians)
2. **Banking, Financial Services & Insurance (BFSI)** (Relationship Managers, Credit Analysts, Actuaries, Branch Managers)
3. **Hospitality, Travel & Tourism** (Hotel General Managers, Executive Chefs, F&B Directors, Concierge)
4. **Construction, Civil & Real Estate** (Civil Engineers, Structural Engineers, Quantity Surveyors, Architects)
5. **Aviation, Aerospace & Defense** (Commercial Pilots, First Officers, Flight Attendants, Air Traffic Controllers, Avionics Engineers)
6. **Automotive & Future Mobility** (Automotive Engineers, EV Powertrain Engineers, Diagnostic Technicians)
7. **Manufacturing, Industrial & Heavy Machinery** (Plant Managers, Industrial Engineers, CNC Operators, Quality Engineers)
8. **Supply Chain, Logistics & Maritime** (Logistics Directors, Warehouse Managers, Customs Officers, Marine Engineers)
9. **Education, Higher Ed & Academia** (Professors, High School Teachers, Instructional Designers, Principals)
10. **Legal, Judiciary & Compliance** (Corporate Lawyers, Regulatory Compliance Officers, Legal Counsel, Paralegals)
11. **Agriculture, Agritech & Food Processing** (Agronomists, Farm Managers, Food Safety Scientists)
12. **Media, Journalism & Creative Arts** (Journalists, Video Producers, Creative Directors, Animators)
13. **Energy, Utilities & Renewables** (Petroleum Engineers, Solar PV Specialists, Power Grid Operators)
14. **Government, Civil Services & Public Administration** (Civil Servants, Police Officers, Tax Inspectors)
15. **Retail, Consumer Goods & E-Commerce** (Store Managers, Merchandisers, Category Managers)
16. **IT, Software & Cybersecurity** (Software Engineers, Cloud Architects, Cybersecurity Specialists)
17. *(Plus 16 additional global sectors covering Telecommunications, Biotechnology, Mining, Chemical, Marine, Non-Profit, Defense, etc.)*

### Cross-Connected to 22 Intent Dimensions
Each occupation connects orthogonally to the 22 intent archetypes:
- `pharmacist jobs in srinagar` $\to$ `/jobs/pharmacist/srinagar`
- `pharmacist salary in dubai` $\to$ `/salary/pharmacist/dubai`
- `pharmacist resume examples` $\to$ `/resume/examples/pharmacist`
- `pharmacist ats keywords` $\to$ `/resume/ats-check/pharmacist`
- `pharmacist interview questions` $\to$ `/interview-questions/pharmacist`
- `pharmacist government jobs` $\to$ `/government-jobs?role=pharmacist`
- `hotel manager jobs in london` $\to$ `/jobs/hotel-manager/london`
- `hotel manager salary` $\to$ `/salary/hotel-manager`
- `civil engineer jobs in dubai` $\to$ `/jobs/civil-engineer/dubai`
- `commercial pilot salary in dubai` $\to$ `/salary/commercial-pilot/dubai`

---

## 4. TalentXcel Global Search Universe — 1.057 Billion Target Catalog

The platform registers **31 Search Universes** calibrated to capture over **1.057 Billion** search keywords with **73 Million** buildable destinations and **22.6 Million** indexable quality pages:

| Universe ID | Category Name | Pillar | Keyword Universe (Min–Max) | Keyword Target | Qualified Intents | Destination Target | Indexable Capacity | Priority | Evidence Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `JOBS` | Active Jobs & Vacancies | `FIND_A_JOB` | 80M – 200M | **120,000,000** | 25,000,000 | **10,000,000** | 3,000,000 | 🔴 Critical | Job Inventory ($\ge 3$ jobs) |
| `GOVERNMENT_JOBS` | Government & Public Sector | `FIND_A_JOB` | 15M – 40M | **25,000,000** | 6,000,000 | **2,000,000** | 600,000 | 🔴 Critical | Official Gazette Notice |
| `COMPANIES` | Companies & Employers Hub | `FIND_A_JOB` | 20M – 60M | **35,000,000** | 8,000,000 | **3,500,000** | 1,000,000 | 🔴 Critical | Verified Employer Profile |
| `RESUMES` | Resume Builder | `BUILD_MY_CAREER` | 5M – 15M | **10,000,000** | 2,500,000 | **800,000** | 250,000 | 🔴 Critical | Role Builder Modules |
| `RESUME_TEMPLATES` | Resume Templates | `BUILD_MY_CAREER` | 8M – 25M | **15,000,000** | 3,500,000 | **1,200,000** | 400,000 | 🔴 Critical | Curated Templates |
| `RESUME_EXAMPLES` | Resume Examples | `BUILD_MY_CAREER` | 25M – 75M | **45,000,000** | 10,000,000 | **3,500,000** | 1,100,000 | 🔴 Critical | Bullet Point Banks |
| `ATS_CHECKER` | Free ATS Resume Checker | `BUILD_MY_CAREER` | 15M – 45M | **25,000,000** | 5,000,000 | **1,800,000** | 600,000 | 🔴 Critical | ATS Keyword Taxonomy |
| `ATS_KEYWORDS` | High-Impact ATS Keywords | `BUILD_MY_CAREER` | 25M – 70M | **40,000,000** | 8,000,000 | **2,500,000** | 800,000 | 🔴 Critical | Frequency Heatmap |
| `CAREER_MAP` | Career Roadmap & Progression | `BUILD_MY_CAREER` | 10M – 30M | **15,000,000** | 3,500,000 | **1,200,000** | 400,000 | 🔴 Critical | Career Progression Ladder |
| `SKILLS` | Skills Intelligence & Value | `BUILD_MY_CAREER` | 20M – 55M | **30,000,000** | 7,000,000 | **2,200,000** | 700,000 | 🔴 Critical | Skill Demand & Premium |
| `SALARY` | Salary Benchmarks & Pay Bands| `BUILD_MY_CAREER` | 35M – 100M | **60,000,000** | 15,000,000 | **5,000,000** | 1,500,000 | 🔴 Critical | Audited P10..P90 Dataset ($\ge 15$) |
| `INTERVIEW_QUESTIONS`| Interview Questions & STAR | `BUILD_MY_CAREER` | 20M – 60M | **35,000,000** | 8,000,000 | **3,000,000** | 1,000,000 | 🔴 Critical | Curated Questions ($\ge 10$) |
| `COURSES` | Online Courses & Bootcamps | `BUILD_MY_CAREER` | 20M – 55M | **30,000,000** | 7,000,000 | **2,500,000** | 800,000 | 🔴 Critical | Accredited Curriculum |
| `CERTIFICATIONS` | Industry Certifications | `BUILD_MY_CAREER` | 10M – 30M | **18,000,000** | 4,000,000 | **1,500,000** | 500,000 | 🟠 High | Official Board Data |
| `COLLEGES` | Colleges Directory | `BUILD_MY_CAREER` | 10M – 25M | **15,000,000** | 3,500,000 | **1,200,000** | 450,000 | 🔴 Critical | 10,250+ College NIRF Profiles |
| `DEGREES` | Degrees & Academic Programs | `BUILD_MY_CAREER` | 12M – 35M | **20,000,000** | 5,000,000 | **1,800,000** | 600,000 | 🔴 Critical | Academic Curriculum |
| `ADMISSIONS` | College Admissions & Cutoffs | `BUILD_MY_CAREER` | 12M – 35M | **20,000,000** | 5,000,000 | **1,800,000** | 600,000 | 🟠 High | Official Cutoff Records |
| `PLACEMENTS` | Audited Campus Placements | `BUILD_MY_CAREER` | 6M – 18M | **10,000,000** | 2,500,000 | **800,000** | 250,000 | 🟠 High | Audited Placement Reports |
| `CAREER_PASSPORT` | Verified Career Passports | `BUILD_MY_CAREER` | 70M – 200M | **120,000,000** | 30,000,000 | **6,000,000** | 1,500,000 | 🔴 Critical | Verified Candidate Profiles |
| `TALENTSCORE` | TalentScore Benchmarks | `BUILD_MY_CAREER` | 10M – 25M | **15,000,000** | 3,500,000 | **1,200,000** | 400,000 | 🟠 High | Percentile Assessment Rubrics |
| `REMOTE` | Remote & WFH Jobs Worldwide | `FIND_A_JOB` | 18M – 50M | **30,000,000** | 7,000,000 | **2,200,000** | 700,000 | 🔴 Critical | Remote Listings ($\ge 3$) |
| `FRESHER` | Freshers & Entry-Level Jobs | `FIND_A_JOB` | 18M – 50M | **30,000,000** | 7,000,000 | **2,200,000** | 700,000 | 🔴 Critical | 0-1 Yr Vacancies ($\ge 3$) |
| `INTERNSHIPS` | Internships & Traineeships | `FIND_A_JOB` | 12M – 35M | **22,000,000** | 5,000,000 | **1,800,000** | 600,000 | 🔴 Critical | Traineeships ($\ge 2$) |
| `JOB_TYPES` | Job Types & Contracts | `FIND_A_JOB` | 10M – 25M | **15,000,000** | 3,000,000 | **1,000,000** | 300,000 | 🟠 High | Contract Listings |
| `INDUSTRIES` | Industry Sectors & Verticals | `FIND_A_JOB` | 10M – 30M | **18,000,000** | 4,000,000 | **1,400,000** | 450,000 | 🟠 High | 32 Vertical Industry Hubs |
| `RECRUITERS` | Employer Recruiter Portal | `HIRE_TALENT` | 10M – 25M | **15,000,000** | 3,000,000 | **1,000,000** | 300,000 | 🟠 High | Recruiter Landing Pages |
| `EDITORIAL_ADVICE` | Career Advice & Editorial | `BUILD_MY_CAREER` | 50M – 130M | **80,000,000** | 18,000,000 | **3,500,000** | 1,000,000 | 🔴 Critical | Editorial Benchmark Content |
| `LOCATION_INTELLIGENCE`| Location Intelligence (31st)| `FIND_A_JOB` | 60M – 160M | **100,000,000** | 24,000,000 | **4,000,000** | 1,200,000 | 🔴 Critical | Location Graph & Edges |
| `RANKINGS` | Company & College Rankings | `FIND_A_JOB` | 10M – 25M | **15,000,000** | 3,000,000 | **1,000,000** | 300,000 | 🟠 High | Leaderboard Datasets |
| `CAREER_PIVOT` | Career Switch Guides | `BUILD_MY_CAREER` | 10M – 25M | **15,000,000** | 3,000,000 | **1,000,000** | 300,000 | 🟠 High | Skill Bridge Matrix |
| `LEARNING` | Learning Hub & Tutorials | `BUILD_MY_CAREER` | 10M – 30M | **18,000,000** | 4,000,000 | **1,400,000** | 450,000 | 🟠 High | Curated Free Learning Paths |
| **GLOBAL AGGREGATE** | **31 Search Universes** | **ALL PILLARS** | **646M – 1.78B+** | **1,057,000,000 (1.057B)** | **241,000,000** | **73,000,000** | **22,600,000** | **PLATFORM SCALE** | **Operating System v2** |

---

## 5. The 31st Universe: Global Location Intelligence as the Multiplier Engine

Location is not just another entity dimension — it is the **universal cross-product acquisition multiplier** spanning every other universe.

```
~250 Sovereign Countries & Territories
   └── Thousands of Administrative States / Provinces
        └── Tens of Thousands of Metros & Economic Urban Clusters
             └── Tens of Thousands of Municipal Cities
                  └── Thousands of High-Density Districts & Economic Zones
```

Every meaningful location node connects orthogonally to:
- Jobs in [Location] (across Healthcare, BFSI, Tech, Engineering, Hospitality)
- Salaries & Compensation Bands in [Location] (denominated in local currencies: INR, USD, AED, GBP, EUR)
- Hiring Companies & GCCs in [Location]
- In-Demand Skills in [Location]
- Cost of Living & Quality of Life in [Location]
- Colleges & Universities in [Location]
- Government Jobs & Regional Exams in [Location]
- Fresher & Graduate Recruitment in [Location]
- Relocation Allowances & Visa Sponsorship Frameworks in [Location]

### The Anti-Cartesian Math
- 100,000 Normalized Roles $\times$ 10,000 Global Locations $\times$ 10 Intent Classes = **10 Billion theoretical permutations**.
- The **Universe Evidence Engine** and **Anti-Cartesian Pruner** evaluate this universe down to **~36M – 155M legitimate opportunities**, yielding **73M buildable destinations** where real first-party data and candidate demand intersect.

---

## 6. Structural Competitive Analysis: Unifying Competitor Models

| Platform | Core SEO Model | Competitor Scale | Fundamental Limitation | How TalentXcel Unifies & Surpasses It |
| :--- | :--- | :--- | :--- | :--- |
| **LinkedIn** | Jobs + People + Companies + Schools + Skills | Millions of jobs; hundreds of thousands of category/location hubs | Closed behind heavy login walls; weak interactive resume/ATS tooling; no direct salary calculator. | TalentXcel pairs every job with a **10-second interactive match evaluator** and native ATS score reveal before authentication. |
| **Naukri** | Roles $\times$ Locations $\times$ Experience $\times$ Recruiter | Thousands of city and experience hubs across India | India-centric; fragmented tooling; static job listings lacking transparent placement and skill pathways. | TalentXcel expands globally (India, US, UK, UAE, Germany, Canada, Singapore) with verified local currencies and seamless Career Passport credentials. |
| **Coursera** | Course + Subject + Skill + Degree + University | 100M+ learners; 200+ universities | Disconnected from live job hiring; cannot evaluate candidates' current resumes or match them directly to vacancies. | TalentXcel connects **Course $\to$ Skill $\to$ Resume $\to$ ATS $\to$ Job Opening** in a single end-to-end loop. |
| **Zety** | 700+ CV examples; role-specific resume templates | ~1,000 highly granular content templates | No live job inventory; purely an editorial paywalled builder without recruiter connectivity. | TalentXcel connects every resume template to **live matching jobs, salary data, and interview prep** in that exact role. |
| **Enhancv** | 1,700+ resume guides & examples | ~2,000 role/industry articles | Editorial articles with zero live database telemetry or employer recruitment infrastructure. | TalentXcel turns every role guide into a **dynamic, live-data acquisition destination** powered by first-party ATS algorithms. |

---

## 7. The 22 Machine-Readable Entity Dimensions

TalentXcel's knowledge universe is modeled across 22 canonical entity dimensions:

| Dimension ID | Entity Class | Schema.org Type | Canonical DB Table | Allowed Parent Dimensions | Primary Orthogonal Intents | Evidence Verification Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ROLE` | Job Role / Designation | `Occupation` | `seo_entities` | `INDUSTRY`, `CAREER_PATHWAY` | `JOBS`, `SALARY`, `RESUME`, `ATS_CHECKER`, `INTERVIEWS` | `VERIFIED_ROLES_TAXONOMY` |
| `SKILL` | Technical / Domain Skill | `DefinedTerm` | `seo_entities` | `ROLE`, `COURSE`, `CERTIFICATION` | `JOBS`, `COURSES`, `SALARY`, `INTERVIEWS` | `VERIFIED_SKILLS_TAXONOMY` |
| `COMPANY` | Corporate Employer | `Organization` | `seo_entities` | `INDUSTRY`, `CITY`, `COUNTRY` | `JOBS`, `SALARY`, `INTERVIEWS`, `HIRING` | `VERIFIED_EMPLOYER_PROFILES` |
| `LOCATION` | Generic Location | `Place` | `location_entities` | Base Node | `JOBS`, `SALARY`, `COMPANIES` | `GLOBAL_LOCATION_CATALOG` |
| `COUNTRY` | Sovereign Nation | `Country` | `location_entities` | `LOCATION` | `JOBS`, `GOVT_JOBS`, `SALARY`, `REMOTE` | `ISO_3166_OFFICIAL` |
| `STATE` | State / Province | `AdministrativeArea` | `location_entities` | `COUNTRY` | `JOBS`, `GOVT_JOBS`, `COLLEGES` | `NATIONAL_ADMIN_REGISTRIES` |
| `METRO` | Metropolitan Area | `Place` | `location_entities` | `COUNTRY`, `STATE` | `JOBS`, `SALARY`, `COMPANIES` | `METRO_PLANNING_AUTHORITIES` |
| `CITY` | City / Municipality | `City` | `location_entities` | `STATE`, `METRO`, `COUNTRY` | `JOBS`, `SALARY`, `COLLEGES`, `COMPANIES` | `MUNICIPAL_CENSUS_CATALOGS` |
| `DISTRICT` | Tech Corridor / Borough | `Place` | `location_entities` | `CITY`, `METRO` | `JOBS` | `CORRIDOR_TRANSIT_REGISTRIES` |
| `INDUSTRY` | Industry Sector | `Industry` | `seo_entities` | Base Node | `JOBS`, `SALARY`, `HIRING`, `CAREER_PATHWAY` | `NAICS_CLASSIFICATION` |
| `EXPERIENCE` | Tenure Tier | `DefinedTerm` | `seo_entities` | `ROLE` | `JOBS`, `SALARY`, `RESUME` | `STANDARDIZED_EXPERIENCE_TIERS` |
| `CAREER_STAGE`| Life Stage (Fresher/Student) | `DefinedTerm` | `seo_entities` | Base Node | `FRESHER`, `INTERNSHIP`, `RESUME` | `TALENTXCEL_CAREER_ARCHETYPES` |
| `DEGREE` | Academic Degree | `EducationalCredential`| `seo_entities` | `COLLEGE` | `COLLEGES`, `ADMISSIONS`, `JOBS` | `UGC_AICTE_FRAMEWORK` |
| `COLLEGE` | University / College | `CollegeOrUniversity` | `seo_entities` | `CITY`, `STATE`, `COUNTRY` | `COLLEGES`, `ADMISSIONS`, `PLACEMENTS` | `NIRF_NAAC_OFFICIAL_REGISTRY` |
| `COURSE` | Learning Program | `Course` | `seo_entities` | `COLLEGE`, `SKILL` | `COURSES`, `CERTIFICATIONS`, `SKILLS` | `ACCREDITED_PROVIDERS` |
| `CERTIFICATION`| Industry Credential | `EducationalCredential`| `seo_entities` | `SKILL`, `ROLE` | `CERTIFICATIONS`, `SALARY`, `JOBS` | `OFFICIAL_VENDOR_REGISTRY` |
| `SALARY` | Pay Band Tier | `MonetaryDistribution`| `seo_entities` | `ROLE`, `LOCATION` | `SALARY`, `JOBS` | `AUDITED_SALARY_DATASETS` |
| `JOB_TYPE` | Contract Type | `DefinedTerm` | `seo_entities` | Base Node | `JOBS`, `INTERNSHIP` | `STANDARD_LABOR_DEFINITIONS` |
| `WORK_MODE` | Remote / Hybrid / On-site | `DefinedTerm` | `seo_entities` | Base Node | `REMOTE`, `JOBS` | `TALENTXCEL_WORKPLACE_MODELS` |
| `GOVERNMENT_BODY`| Public Commission | `GovernmentOrganization`| `seo_entities` | `COUNTRY`, `STATE` | `GOVT_JOBS`, `EXAMS` | `OFFICIAL_GAZETTE_NOTICES` |
| `EXAM` | Competitive Test | `Exam` | `seo_entities` | `GOVERNMENT_BODY`, `COLLEGE` | `GOVT_JOBS`, `ADMISSIONS` | `OFFICIAL_EXAM_COMMISSIONS` |
| `CAREER_PATHWAY`| Career Progression Ladder| `Occupation` | `seo_entities` | `INDUSTRY` | `CAREER_PATHWAY`, `SKILLS`, `SALARY` | `TALENTXCEL_CAREER_MAP_GRAPH`|

---

## 8. The 22 Machine-Readable Intent Dimensions

Every search query is classified into one of 22 intent archetypes with strict evidence requirements and conversion anchors:

| Intent ID | Product Pillar | Required Evidence Type | Min Threshold | Target Template Archetype | Primary Conversion Widget | Target URL Pattern |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `JOBS` | `FIND_A_JOB` | `JOB_INVENTORY` | 3 active jobs | `JOB_ROLE_CITY_PAGE` | `InteractiveJobMatchWidget` | `/jobs/{role}/{location}` |
| `HIRING` | `HIRE_TALENT` | `EMPLOYER_VERIFIED_PROFILE` | 1 account | `EMPLOYER_ACQUISITION_PAGE` | `MultiLocationJobComposer` | `/hire/{role}/{location}` |
| `RESUME` | `BUILD_MY_CAREER` | `RESUME_TEMPLATE_CATALOG` | 1 template | `RESUME_ROLE_LEVEL` | `UnifiedResumeBuilder` | `/resume/examples/{role}` |
| `CV` | `BUILD_MY_CAREER` | `RESUME_TEMPLATE_CATALOG` | 1 template | `RESUME_ROLE_LEVEL` | `UnifiedResumeBuilder` | `/resume/examples/{role}` |
| `TEMPLATE` | `BUILD_MY_CAREER` | `RESUME_TEMPLATE_CATALOG` | 3 templates | `RESUME_ROLE_LEVEL` | `TemplateGallery` | `/resume-templates/{role}` |
| `EXAMPLE` | `BUILD_MY_CAREER` | `RESUME_TEMPLATE_CATALOG` | 5 bullet sets | `RESUME_ROLE_LEVEL` | `ResumeExamplesPage` | `/resume/examples/{role}` |
| `ATS_CHECKER`| `BUILD_MY_CAREER` | `ATS_KEYWORD_TAXONOMY` | 20 terms | `ATS_CHECKER_TOOL` | `ATSOptimizer (Instant Scan)` | `/resume/ats-check/{role}` |
| `KEYWORDS` | `BUILD_MY_CAREER` | `ATS_KEYWORD_TAXONOMY` | 15 terms | `ATS_CHECKER_TOOL` | `ATSOptimizer` | `/resume/ats-check/{role}` |
| `SALARY` | `BUILD_MY_CAREER` | `SALARY_DATASET` | 15 records | `SALARY_BENCHMARK_PAGE` | `SalaryAnalyzer` | `/salary/{role}/{location}` |
| `SKILLS` | `BUILD_MY_CAREER` | `SKILL_TAXONOMY_INTELLIGENCE` | 1 taxonomy node | `SKILL_INTELLIGENCE_PAGE` | `SkillAssessor` | `/skills/{skill}` |
| `COURSES` | `BUILD_MY_CAREER` | `COURSE_CURRICULUM` | 1 curriculum | `COURSE_DESTINATION_PAGE` | `CoursePlayer` | `/learning/courses/{skill}` |
| `CERTIFICATIONS`| `BUILD_MY_CAREER` | `CERTIFICATION_BODY_DATA` | 1 syllabus | `COURSE_DESTINATION_PAGE` | `CoursePlayer` | `/certifications/{cert}` |
| `COLLEGES` | `BUILD_MY_CAREER` | `COLLEGE_PLACEMENT_REPORT` | 1 profile | `COLLEGE_DOSSIER_PLACEMENTS` | `CareerPathway` | `/colleges/{slug}` |
| `ADMISSIONS` | `BUILD_MY_CAREER` | `COLLEGE_PLACEMENT_REPORT` | 1 cutoff table | `COLLEGE_DOSSIER_PLACEMENTS` | `CareerPathway` | `/colleges/{slug}/admissions` |
| `PLACEMENTS` | `BUILD_MY_CAREER` | `COLLEGE_PLACEMENT_REPORT` | 1 audited report | `COLLEGE_DOSSIER_PLACEMENTS` | `CampusCareerMatcher` | `/colleges/{slug}/placements` |
| `INTERVIEWS` | `BUILD_MY_CAREER` | `INTERVIEW_QUESTION_BANK` | 10 questions | `INTERVIEW_QUESTIONS_PAGE` | `InterviewQuestionsPage` | `/interview-questions/{role}` |
| `CAREER_PATHWAY`| `BUILD_MY_CAREER`| `SKILL_TAXONOMY_INTELLIGENCE` | 1 ladder | `SKILL_INTELLIGENCE_PAGE` | `InteractiveRoadmapBuilder`| `/career-pathways/{role}` |
| `CAREER_SWITCH`| `BUILD_MY_CAREER`| `SKILL_TAXONOMY_INTELLIGENCE` | 1 bridge map | `SKILL_INTELLIGENCE_PAGE` | `InteractiveRoadmapBuilder`| `/career-pathways/{from}-{to}` |
| `REMOTE` | `FIND_A_JOB` | `JOB_INVENTORY` | 3 remote jobs | `JOB_ROLE_CITY_PAGE` | `InteractiveJobMatchWidget` | `/jobs/{role}/remote` |
| `FRESHER` | `FIND_A_JOB` | `JOB_INVENTORY` | 3 entry jobs | `JOB_ROLE_CITY_PAGE` | `InteractiveJobMatchWidget` | `/jobs/{role}/freshers` |
| `INTERNSHIP` | `FIND_A_JOB` | `JOB_INVENTORY` | 2 internships | `JOB_ROLE_CITY_PAGE` | `InteractiveJobMatchWidget` | `/internships/{role}/{loc}` |
| `GOVT_JOBS` | `FIND_A_JOB` | `GOVT_GAZETTE_NOTIFICATION` | 1 notice | `GOVERNMENT_JOB_PAGE` | `InteractiveJobMatchWidget` | `/government-jobs?role={role}`|

---

## 9. Search Graph Milestones Roadmap

```mermaid
flowchart LR
    M1["MILESTONE 1<br/>10 Million Discovered Opportunities<br/>(Cross-Industry Seed: 32 Verticals x 1,000 Cities)"] --> M2["MILESTONE 2<br/>100 Million Discovered Opportunities<br/>(National & Regional Occupations)"]
    M2 --> M3["MILESTONE 3<br/>1.057 BILLION+ Search Opportunities<br/>(Ubiquitous Global Career Graph)"]
```

### Milestone #1: 10 Million Discovered Opportunities (Immediate Cross-Industry Seed)
- Discover, normalize, and classify 10 Million real search intents across 32 industry verticals (Healthcare, BFSI, Hospitality, Construction, Aviation, IT).
- Seed and harvest verified entities: Pharmacists, Hotel Managers, Civil Engineers, Commercial Pilots, Registered Nurses, Software Engineers.
- Ensure 0 empty Cartesian pages; enforce the 4-part formula.

### Milestone #2: 100 Million Discovered Opportunities
- Expand into mid-tail roles, regional languages (Hindi, Arabic, German, Spanish, French).
- Sub-city economic zones (DIFC Dubai, BKC Mumbai, Whitefield Bangalore, City of London, Manhattan NYC).
- Employer $\times$ Role combinations across 5,000+ global enterprises.

### Milestone #3: 1.057 BILLION+ Search Opportunities (The Ubiquitous Career Graph)
- Comprehensive global career intelligence covering every recognized occupation, municipality, and credential worldwide.
- Permanent Governance: Only the evidence-backed subset enters the XML sitemaps and indexable corpus (~22.6 Million indexable quality pages).

---

## 10. Technical SEO CI Verification Gates vs Business North Star

### Technical SEO CI Verification Gates (Automated & Blocking)
1. **Schema Validation**: 100% compliant JSON-LD (`JobPosting`, `BreadcrumbList`, `Occupation`, `FAQPage`, `ItemList`, `SoftwareApplication`, `Dataset`).
2. **Canonical Correctness**: Zero conflicting user-selected vs Google-selected canonicals.
3. **Soft 404 Prevention**: Thin or zero-inventory job URLs return HTTP 404 / NOINDEX_HOLD.
4. **Expired Job Exterminator**: Expired jobs emit `HTTP 410 Gone` and are purged from XML sitemaps.
5. **Content Contract Compliance**: 100% mandatory modules satisfied before URL is added to XML sitemaps.
6. **No Substring Alias Collisions**: Short geographic aliases (`in`, `de`, `ca`, `us`) do not produce false token matches.

### Business Growth North Star (Monitored Daily via Funnel Telemetry)
- 10,000 $\to$ 100,000+ daily search impressions
- 500 $\to$ 2,000+ daily organic clicks
- 40,000–50,000 daily organic candidate registrations
- Unit Funnel Milestone: `1,000 impressions -> 50 clicks -> 5 signups -> 1 application`.

---

## 11. The Global Occupation Evidence Factory & Executive Funnel Telemetry

### 11.1 The Global Occupation Evidence Factory: 12-Factor Evidence Saturation
TalentXcel's core operating principle is:
> *"Don't build more URLs. Build more connected, evidence-rich career graphs. Once those graphs are populated, the URLs emerge naturally from genuine demand and evidence."*

For every occupation across the 32 global industries, the factory progressively acquires and validates:

| Evidence Dimension | Required Threshold | Validation Criteria | Example (Pharmacist) |
| :--- | :--- | :--- | :--- |
| **1. Active Jobs** | $\ge 3$ active listings | Verified vacancies from direct employers/ATS | 38 vacancies (Apollo, Fortis, Aster, Boots) |
| **2. Salary Records** | $\ge 15$ verified records | P10, P25, P50 (median), P75, P90 spread | 42 records (Median: 6.8 LPA, P90: 14.0 LPA) |
| **3. ATS Vocabulary** | $\ge 20$ domain terms | Domain keywords, tools, action verbs | 28 terms (Pharmacology, USP <797>, Epic Willow) |
| **4. Interview Question Bank** | $\ge 10$ STAR questions | Behavioral, clinical, situational STAR answers | 12 questions (Drug interaction, Cold chain) |
| **5. Resume Examples** | Role-specific bullet banks| Formatted via Google XYZ formula | Bullet bank with % accuracy & shrinkage metrics |
| **6. Skills Intelligence** | Taxonomy + market premium | Primary/emerging skills + salary differential | Pharmacology, Pharmacogenomics (+18.5% premium) |
| **7. Course Curriculum** | Structured syllabus | Accredited training providers & modules | Clinical Pharmacotherapy (Johns Hopkins / Coursera) |
| **8. Certifications & Licenses**| Official governing bodies | Accredited licenses, exam prerequisites | PharmD License, BCPS, PCI / GPhC registration |
| **9. Career Path Roadmap** | Progression trajectory | 4-stage ladder + lateral transition pivots | Junior Pharmacist $\to$ Specialist $\to$ Chief $\to$ Director |
| **10. Verified Employers** | Enterprise profiles | Top hospital networks, retail chains, clinics | Apollo, Max, Aster DM, Boots, CVS Health |
| **11. Regional Demand Hubs** | Geographical nodes | Tier-1 & Tier-2 employment density hubs | Delhi NCR, Mumbai, Bangalore, Dubai, London, Srinagar |
| **12. Government Opportunities**| Public sector exams | Official commission notices & exam schedules | Drug Inspector, ESIC Medical Pharmacist, RRB |

### 11.2 Horizontal Expansion Clusters
```
HEALTHCARE: Pharmacist ➔ Nurse ➔ Doctor/Physician ➔ Medical Lab Tech ➔ Radiologist ➔ Dentist ➔ Physiotherapist
BFSI: Relationship Manager ➔ Credit Analyst ➔ Branch Manager ➔ Actuary ➔ Investment Banker ➔ Risk Officer
CONSTRUCTION: Civil Engineer ➔ Structural Engineer ➔ Quantity Surveyor ➔ Architect ➔ Site Engineer
AVIATION: Commercial Pilot ➔ First Officer ➔ Cabin Crew ➔ Aircraft Maintenance Engineer ➔ Air Traffic Controller
HOSPITALITY: Hotel Manager ➔ Executive Chef ➔ F&B Director ➔ Front Office Manager ➔ Travel Consultant
MANUFACTURING: Production Engineer ➔ Plant Manager ➔ CNC Machinist ➔ QA/QC Engineer ➔ Automotive Diagnostician
LEGAL & COMPLIANCE: Corporate Lawyer ➔ Legal Counsel ➔ Regulatory Compliance Officer
EDUCATION: School Teacher ➔ Principal / Headmaster ➔ Academic Counselor ➔ University Professor
TECH: Software Engineer ➔ DevOps Engineer ➔ Data Scientist ➔ Cloud Architect ➔ Cybersecurity Specialist
```

### 11.3 Executive Search-to-Career Funnel & Metrics
The platform measures the complete 14-stage acquisition-to-hire funnel:

$$\begin{aligned}
&\text{Modeled Demand (1.057B+ Search Opportunities)} \\
\longrightarrow\;& \text{Recognized Entity (540M)} \\
\longrightarrow\;& \text{Recognized Intent (380M)} \\
\longrightarrow\;& \text{Qualified Opportunity (241M, Score } \ge 70\text{)} \\
\longrightarrow\;& \text{Buildable Evidence-Backed Destination (73M)} \\
\longrightarrow\;& \text{Maximum Quality Indexable Capacity (22.6M Ceiling)} \\
\longrightarrow\;& \text{Submitted Sitemaps (12,053 Live Clean Corpus)} \\
\longrightarrow\;& \text{Indexed by Googlebot (8,450)} \\
\longrightarrow\;& \text{Organic Impressions (28,400)} \\
\longrightarrow\;& \text{Organic Clicks (710)} \\
\longrightarrow\;& \text{Interactive Tool Engagements (298, 42\% Engagement)} \\
\longrightarrow\;& \text{Candidate Registrations (78, 10.99\% Signup)} \\
\longrightarrow\;& \text{Job Applications Submitted (19, 24.36\% Application)} \\
\longrightarrow\;& \text{Successful Hires \& Placements (3, 15.79\% Placement)}
\end{aligned}$$

#### The Four-Box Executive Dashboard & Yield Engine
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🌐 BOX 1: GLOBAL CAREER GRAPH                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  • Modeled Search Opportunities : 1.057B+                                    │
│  • Qualified Opportunities      : 241M                                       │
│  • Evidence-Backed Destinations : 73M                                        │
│  • Maximum Quality Capacity     : 22.6M (Governor Ceiling)                   │
│  • Submitted to XML Sitemaps    : 12,053 (Live Clean Corpus)                 │
│  • Actually Indexed (Googlebot) : 8,450 (GSC Confirmed Index)                │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ 🧭 BOX 2: OCCUPATION GRAPH (PHASE B 500-TARGET)                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  • Saturated Occupations        : 44 (Phase A) / 500 (Phase B Milestone)    │
│  • Specialized Sub-Sectors      : 68 Sectors (Cataloged & Mapped)            │
│  • Career Graph Coverage        : 8.80% (44 saturated / 500 canonical target)│
│  • Internal Roadmap Cadence     : B1 (100) ➔ B2 (250) ➔ B3 (500 Roles)       │
│  • Evidence Contract Standard   : 12-Factor Full Evidence Saturation         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ 📈 BOX 3: MARKET PERFORMANCE & TRANSACTIONS                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│  • Organic Search Impressions   : 28,400                                     │
│  • Organic Qualified Clicks     : 710 (CTR: 2.50%)                           │
│  • Candidate Registrations      : 78 (10.99% Signup Rate)                    │
│  • Job Applications Submitted   : 19 (24.36% Application Rate)               │
│  • Successful Hires / Matches   : 3 (15.79% Placement Rate)                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ 🎯 BOX 4: YIELD & UNIT ECONOMICS                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│  ⭐ Qualified Opp Coverage       : 0.0035% — intentionally governor-limited   │
│  ⭐ Career Event Yield           : 14.08% (100 career events / 710 clicks)    │
│  ⭐ Occupation Transaction Yield : 0.43 applications / saturated occupation   │
│  ⭐ Occupation Placement Yield   : 0.068 matches / saturated occupation       │
│  ⭐ Occupation Search Yield     : 645.5 impressions / saturated occupation   │
│  • Unit Economic CTR            : 2.50%                                      │
│  • Unit Economic Signup Rate    : 10.99%                                     │
│  • Unit Economic App Rate       : 24.36%                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Executive Yield Ratios Defined
1. **Qualified Opportunity Coverage**:
   $$\text{Coverage} = \frac{\text{Actually Indexed Clean Pages}}{\text{Qualified Opportunities}} = \frac{8,450}{241,000,000} = 0.0035\% \quad \text{(Intentionally Governor-Limited)}$$
   *Reflects deliberate quality constraint: only destinations with verified first-party evidence enter indexable sitemaps. Zero thin content.*

2. **Career Event Yield**:
   $$\text{Career Event Yield} = \frac{\text{Registrations} + \text{Applications} + \text{Matches}}{\text{Organic Qualified Clicks}} = \frac{78 + 19 + 3}{710} = 14.08\%$$
   *Measures total downstream candidate activity (100 career events across 710 clicks). Relabeled from "conversion" to avoid confusion with single-event conversion rates.*

3. **Occupation Transaction Yield (Applications)**:
   $$\text{Transaction Yield} = \frac{\text{Applications Submitted}}{\text{Evidence-Saturated Occupations}} = \frac{19}{44} = 0.43 \text{ applications / saturated occupation}$$

4. **Occupation Placement Yield (Hires / Matches)**:
   $$\text{Placement Yield} = \frac{\text{Matches \& Placements}}{\text{Evidence-Saturated Occupations}} = \frac{3}{44} = 0.068 \text{ matches / saturated occupation}$$

5. **Occupation Economic Yield (Revenue)**:
   $$\text{Economic Yield} = \frac{\text{Direct Monetized Revenue}}{\text{Evidence-Saturated Occupations}} = \frac{\text{₹0.00}}{44} = \text{₹0.00 / saturated occupation} \quad \text{(Post-B1 Target)}$$

6. **Occupation Search Yield**:
   $$\text{Search Yield} = \frac{\text{Total Organic Impressions}}{\text{Evidence-Saturated Occupations}} = \frac{28,400}{44} = 645.5 \text{ impressions / saturated occupation}$$

---

### 11.4 Phase B Milestone: 500 Occupations across 68 Specialized Sub-Sectors

#### Factory Prioritization Engine (Demand × Evidence × Transaction Potential)
Candidate occupations are never chosen uniformly across industries. Instead, the Evidence Factory scores and queues roles using:

$$\text{Priority Score} = \Big(\text{Demand} \times 0.35 + \text{JobDensity} \times 0.25 + \text{SalaryDepth} \times 0.15 + \text{TransactionPotential} \times 0.25\Big) \times \text{SectorDiversityWeight}$$

- **Sector Diversity Quotas**: Applied to ensure non-IT industries (Healthcare, BFSI, Construction, Aviation, Hospitality, Manufacturing) maintain balanced coverage.
- **Factory Pipeline**:
  $$\text{Role Queued} \longrightarrow \text{Demand Score} \longrightarrow \text{Evidence Audit} \longrightarrow \text{12-Factor Saturation} \longrightarrow \text{Publish} \longrightarrow \text{Measure Yield}$$

#### Structured Phase B Cadence
1. **Phase B1 — First 100 Occupations**:
   - Scale from $44 \to 100$ fully saturated occupations.
   - Focus: High-demand, high-vacancy vocations across Healthcare, BFSI, Construction, Aviation, and Core Systems.
2. **Phase B2 — 250 Occupations Expansion**:
   - Scale from $100 \to 250$ occupations.
   - Enforce sector diversity across all 15 industry verticals (Hospitality, Logistics, Manufacturing, Education, Legal, Agriculture).
3. **Phase B3 — 500 Occupations / 68 Sectors**:
   - Complete evidence saturation of all $500+$ roles across $68$ specialized sub-sectors.
   - **Data Stop & Analysis**: Before advancing to Phase C (2,500), evaluate deep telemetry per occupation (impressions, clicks, CTR, applications, placements, cost-to-evidence, and revenue).

#### 68 Specialized Sub-Sectors Catalog
| Vertical Industry | Specialized Sub-Sectors | Target Occupations | Priority Focus |
| :--- | :--- | :--- | :--- |
| **Healthcare & Life Sciences** | 12 Sectors | 85 Roles | Hospitals, Pharmacy, Diagnostics, MedTech, Biotech, Mental Health |
| **BFSI & Fintech** | 8 Sectors | 65 Roles | Retail Banking, Corporate Lending, Investment Banking, Wealth, Risk, Actuarial |
| **Construction & Real Estate**| 6 Sectors | 50 Roles | Civil Infrastructure, High-Rise, Architecture, Quantity Surveying, MEP |
| **Manufacturing & Automotive**| 6 Sectors | 50 Roles | EV Mobility, Plant Ops, CNC Precision, Automation/PLC, Lean Six Sigma |
| **IT, Software & AI** | 6 Sectors | 50 Roles | Full-Stack, AI/ML/LLM, Cloud/DevOps, Cybersecurity, Data Eng, Embedded |
| **Hospitality & Tourism** | 5 Sectors | 40 Roles | Luxury Hotels, Culinary Arts, Travel Agencies, MICE Events, Cruise Ships |
| **Aviation & Aerospace** | 5 Sectors | 35 Roles | Cockpit, Cabin Safety, MRO Maintenance, Air Traffic, Avionics Defense |
| **Logistics & Supply Chain** | 3 Sectors | 22 Roles | Multimodal Freight, Warehousing/Cold Chain, Last-Mile Express Fleet |
| **Education & EdTech** | 3 Sectors | 22 Roles | Higher Ed Academia, K-12 Schooling, Instructional Design / EdTech |
| **Legal & Compliance** | 3 Sectors | 20 Roles | Corporate Law/M&A, IP & Patents, Litigation & Regulatory Compliance |
| **Agriculture & Food Tech** | 3 Sectors | 20 Roles | Precision Agronomy, Industrial Food Processing, Grain Trading Supply |
| **Media & Creative Design** | 2 Sectors | 14 Roles | Digital Journalism/Broadcasting, VFX/Animation/Game Art |
| **Energy & CleanTech** | 2 Sectors | 14 Roles | Solar/Wind/Battery Storage, Oil/Gas Petrochem & Substation Power |
| **Government & Public Safety**| 2 Sectors | 13 Roles | Civil Administration/Public Policy, Law Enforcement & Forensics |
| **Retail & E-Commerce** | 2 Sectors | 14 Roles | Omnichannel Store Networks, E-Commerce Marketplaces & D2C Brands |
| **TOTAL (Phase B Milestone)** | **68 Sectors** | **514 Roles** | **Full 12-Factor Evidence Saturation Standard** |

---

### 11.5 Per-Occupation Evidence & Economic Ledger (Phase B1 Execution Engine)

To prevent blind content creation and evaluate exact unit economics per occupation archetype, TalentXcel maintains a persistent **Per-Occupation Evidence & Economic Ledger** (`src/lib/seo/searchUniverse/occupationLedger.ts`).

#### The Ledger Tracking Schema (12 Dimensions)
For every canonical occupation in the career graph, the factory records:
$$\text{Occupation Slug} \longrightarrow \text{Evidence Score} \longrightarrow \text{Freshness} \longrightarrow \text{Pages Published} \longrightarrow \text{Indexed Pages} \longrightarrow \text{Impressions} \longrightarrow \text{Clicks} \longrightarrow \text{Registrations} \longrightarrow \text{Applications} \longrightarrow \text{Matches} \longrightarrow \text{Revenue} \longrightarrow \text{Production Cost}$$

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 📋 BOX 5: PER-OCCUPATION EVIDENCE & ECONOMIC LEDGER (B1 FACTORY)             │
├──────────────────────────────────────────────────────────────────────────────┤
│  • Proven Baseline Units        : 44 Occupations (Phase A Verified)         │
│  • B1 Priority Candidates Queued: 56 Occupations (Demand x Evidence Weighted) │
│  • B1 Milestone Target Scale    : 100 Occupations (Review Gate Milestone)     │
│  • Aggregate Production Cost    : ₹52,800 (44 units @ ₹1,200/unit)       │
│  • Commercial Revenue Target    : ₹0.00 (B1 Commercial Validation)       │
│  • Top Performing Archetypes    :                                            │
│      - Registered Nurse: 3 apps, 1 match, 1850 imp                           │
│      - Pharmacist: 2 apps, 1 match, 1420 imp                                 │
│      - Commercial Pilot: 1 apps, 1 match, 1050 imp                           │
│      - Software Engineer: 2 apps, 0 match, 2100 imp                          │
│      - Relationship Manager: 1 apps, 0 match, 980 imp                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### B1 Factory Balance & Empirical Baseline
- **Proven Phase A Cohort (44 Units)**:
  - Total Impressions: $28,400$
  - Total Organic Clicks: $710$
  - Total Candidate Registrations: $78$
  - Total Applications: $19$ (Application Yield: $0.43$ apps/role)
  - Total Matches/Placements: $3$ (Placement Yield: $0.068$ matches/role)
  - Production Cost: ₹$52,800$ (₹$1,200$ average cost-to-evidence per unit)
- **Queued Phase B1 Candidates (56 Units)**:
  - Balanced across all 15 industry verticals: Healthcare (8), BFSI (7), Construction (5), Aviation (5), Hospitality (4), Manufacturing (5), Logistics (4), Education (3), Legal (3), Agriculture (2), Media (2), Energy (2), Government (2), Retail (2), Tech/AI (2).
  - Target Scale: Exactly $44 \text{ proven} + 56 \text{ candidates} = 100 \text{ Occupations}$.

#### Mandatory B1 Review Gate Condition
> [!IMPORTANT]
> **Strict Scaling Halt Condition**: Do not advance to Phase B2 ($250$) or B3 ($500$) until all 100 occupations have completed at least 30 days of live production tracking, and the factory evaluates:
> 1. Which occupations and sub-sectors yield the highest applications and placements per ₹1,000 of evidence production cost?
> 2. Which location and credential modifiers trigger the highest CTR and lowest bounce rate?
> 3. Where is Googlebot indexation rate highest vs where is crawl throttling observed?
> Production capacity will be re-allocated based exclusively on empirical ledger yield rather than theoretical keyword volume.
