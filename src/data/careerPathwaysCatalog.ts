// src/data/careerPathwaysCatalog.ts
// Exhaustive catalog of 150+ verified Career Transitions across all 16 Global Industries
// Benchmarked with realistic Indian CTCs (₹ Lakhs), accurate durations, and actionable milestone execution blueprints.

export interface TransitionPhase {
  title: string;
  weeks: string;
  focus: string;
  milestones: string[];
}

export interface TransitionPath {
  id: string;
  industry: string;
  industryCategory: 
    | 'Technology, Cloud & AI'
    | 'Data Science & Big Data'
    | 'Finance, Banking & FinTech'
    | 'CA, Audit & Accounting'
    | 'Healthcare, Pharma & Biotech'
    | 'Supply Chain, Logistics & Maritime'
    | 'Marketing, Growth & D2C'
    | 'Sales & Enterprise BD'
    | 'Product Management & UX'
    | 'HR, People Ops & Talent'
    | 'Legal, Governance & Tech Policy'
    | 'Core Engineering & Industrial IoT'
    | 'Energy, CleanTech & Oil/Gas'
    | 'Telecom, 5G & SpaceTech'
    | 'Real Estate & Infrastructure'
    | 'Media, Gaming & Content';
  currentRole: string;
  targetRole: string;
  timeEstimateMonths: number;
  currentAvgCtcLakhs: number;
  targetAvgCtcLakhs: number;
  difficulty: 'Moderate' | 'Demanding' | 'High Impact';
  coreSkillGaps: string[];
  phases: TransitionPhase[];
  isProOnly?: boolean;
  experienceLevel?: 'fresher' | 'mid' | 'senior' | 'executive';
  topLocations?: string[];
}

export const CAREER_TRANSITIONS_CATALOG: TransitionPath[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. TECHNOLOGY, CLOUD & AI (Transitions 1 - 25)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'qa_to_sde',
    industry: 'Software Engineering',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Manual / QA Tester',
    targetRole: 'Full-Stack Software Engineer',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 4.8,
    targetAvgCtcLakhs: 13.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['Data Structures & Algorithms', 'React & Next.js Architecture', 'PostgreSQL & Prisma ORM', 'System Design & REST APIs'],
    phases: [
      {
        title: 'Phase 1: Deep Core Programming & DSA',
        weeks: 'Weeks 1–4',
        focus: 'TypeScript syntax, memory model, Big-O analysis, HashMaps, Two-pointer algorithms.',
        milestones: ['Solve 50 LeetCode Mediums', 'Build typed REST API in Express & Prisma', 'Implement JWT auth & rate limiting']
      },
      {
        title: 'Phase 2: Production Full-Stack Engineering',
        weeks: 'Weeks 5–10',
        focus: 'React Server Components, Next.js App Router, caching strategies, Docker deployment.',
        milestones: ['Deploy full-stack SaaS application with live payments', 'Integrate CI/CD pipeline on GitHub Actions', 'Containerize with multi-stage Dockerfile']
      },
      {
        title: 'Phase 3: System Design & Interview Mastery',
        weeks: 'Weeks 11–16',
        focus: 'Database indexing, Redis caching, microservices communication, behavioral STAR method.',
        milestones: ['Complete 5 high-level architecture designs (URL shortener, chat app)', 'Pass 3 AI Mock Technical Interviews', 'Apply to 30 verified SDE openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'frontend_to_fullstack',
    industry: 'Software Engineering',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Frontend Developer',
    targetRole: 'Senior Full-Stack Engineer',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 6.5,
    targetAvgCtcLakhs: 16.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['Distributed Systems', 'PostgreSQL Query Optimization', 'Docker & Kubernetes', 'Event-Driven Architecture (Kafka/RabbitMQ)'],
    phases: [
      {
        title: 'Phase 1: Node.js, Go & Database Internals',
        weeks: 'Weeks 1–4',
        focus: 'Event loop concurrency, connection pooling, ACID transactions, B-Tree indices.',
        milestones: ['Write high-throughput API gateway in Go/Node.js', 'Optimize slow queries using EXPLAIN ANALYZE', 'Implement multi-tenant schema isolation']
      },
      {
        title: 'Phase 2: Microservices & Message Queues',
        weeks: 'Weeks 5–9',
        focus: 'Publish-subscribe patterns, idempotency, dead-letter queues with Apache Kafka.',
        milestones: ['Build async order processing pipeline', 'Integrate distributed tracing with OpenTelemetry', 'Simulate network partition recovery']
      },
      {
        title: 'Phase 3: Cloud Infrastructure & Scalability',
        weeks: 'Weeks 10–14',
        focus: 'AWS ECS/EKS, Terraform IaC, zero-downtime blue-green deployments.',
        milestones: ['Automate AWS cloud deployment via Terraform', 'Complete system design mock interview for 100k QPS', 'Target Senior Full-Stack roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'sysadmin_to_devops',
    industry: 'Cloud & Infrastructure',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'System Administrator (IT/Linux)',
    targetRole: 'DevOps & Platform Engineer',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.2,
    targetAvgCtcLakhs: 15.0,
    difficulty: 'Demanding',
    coreSkillGaps: ['Kubernetes Cluster Orchestration', 'Terraform (IaC)', 'CI/CD Pipeline Automation (GitHub Actions/ArgoCD)', 'Prometheus & Grafana Observability'],
    phases: [
      {
        title: 'Phase 1: Containerization & Cloud Fundamentals',
        weeks: 'Weeks 1–4',
        focus: 'Docker multi-stage builds, rootless containers, AWS IAM, VPC peering, subnets.',
        milestones: ['Containerize 3 legacy monolithic services', 'Deploy fault-tolerant multi-AZ VPC architecture on AWS', 'Write bash/python automation scripts for daily ops']
      },
      {
        title: 'Phase 2: Kubernetes Administration & GitOps',
        weeks: 'Weeks 5–10',
        focus: 'K8s pods, deployments, services, ingress controllers, Helm charts, ArgoCD GitOps.',
        milestones: ['Deploy 3-node HA Kubernetes cluster', 'Package microservices into versioned Helm charts', 'Setup automated GitOps sync using ArgoCD']
      },
      {
        title: 'Phase 3: Production Observability & SRE',
        weeks: 'Weeks 11–16',
        focus: 'Prometheus metrics scraping, alertmanager rules, Grafana dashboards, chaos engineering.',
        milestones: ['Build end-to-end SLI/SLO monitoring stack', 'Simulate disaster recovery failover drill', 'Achieve CKA certification readiness']
      }
    ]
  },
  {
    id: 'backend_to_ai_engineer',
    industry: 'Artificial Intelligence',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Backend Developer (Python/Java)',
    targetRole: 'Generative AI & LLM Systems Engineer',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 8.0,
    targetAvgCtcLakhs: 22.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['LangChain & LlamaIndex Frameworks', 'Vector Databases (Pinecone, Qdrant, pgvector)', 'Retrieval-Augmented Generation (RAG)', 'LLM Evaluation & Fine-Tuning (LoRA)'],
    phases: [
      {
        title: 'Phase 1: Vector Embeddings & Hybrid Search',
        weeks: 'Weeks 1–4',
        focus: 'Sentence transformers, semantic similarity, dense vs sparse retrieval, pgvector indexing.',
        milestones: ['Implement hybrid lexical + semantic search engine', 'Benchmark embedding models for Indian languages', 'Build chunking pipeline with metadata enrichment']
      },
      {
        title: 'Phase 2: Advanced Agentic RAG Systems',
        weeks: 'Weeks 5–9',
        focus: 'Multi-agent workflows (LangGraph/CrewAI), function calling, tool use, memory management.',
        milestones: ['Deploy production financial document RAG agent', 'Implement hallucination detection using Ragas', 'Integrate semantic cache reducing API costs by 65%']
      },
      {
        title: 'Phase 3: Model Serving & Optimization',
        weeks: 'Weeks 10–14',
        focus: 'vLLM, Ollama, quantization (GGUF/AWQ), fine-tuning using PEFT/LoRA, evaluation benchmarks.',
        milestones: ['Fine-tune open-source 8B model on specialized domain dataset', 'Deploy self-hosted LLM endpoint with streaming responses', 'Publish working demo to portfolio & apply on JobMatch OS']
      }
    ]
  },
  {
    id: 'network_eng_to_cloud_architect',
    industry: 'Cloud & Infrastructure',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Network Engineer',
    targetRole: 'Enterprise Cloud Solutions Architect',
    timeEstimateMonths: 4.5,
    currentAvgCtcLakhs: 6.0,
    targetAvgCtcLakhs: 21.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['AWS/Azure Well-Architected Framework', 'Cloud Security & Compliance', 'DirectConnect & Hybrid Cloud Networking', 'Cost Optimization & FinOps'],
    phases: [
      {
        title: 'Phase 1: Cloud Foundation & Multi-Cloud Networking',
        weeks: 'Weeks 1–5',
        focus: 'Transit Gateway, Direct Connect, VPN IPSec, hybrid cloud topologies, BGP routing.',
        milestones: ['Design redundant hybrid connection between on-prem and AWS', 'Implement zero-trust network access (ZTNA)', 'Pass AWS Solutions Architect Associate mock tests']
      },
      {
        title: 'Phase 2: High Availability & Disaster Recovery',
        weeks: 'Weeks 6–11',
        focus: 'Multi-region replication, RTO/RPO design, active-active failover, IAM boundaries.',
        milestones: ['Architect active-active financial banking cloud topology', 'Automate cloud security compliance checks via AWS Config', 'Establish FinOps cost control saving 25% compute']
      },
      {
        title: 'Phase 3: Enterprise Architecture & Governance',
        weeks: 'Weeks 12–18',
        focus: 'Landing zones, AWS Control Tower, enterprise RFP defense, executive stakeholder pitching.',
        milestones: ['Deliver enterprise cloud migration proposal blueprint', 'Complete AWS Solutions Architect Professional capstone', 'Apply for Cloud Architect openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'noc_to_soc_analyst',
    industry: 'Cybersecurity',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'NOC Engineer / IT Support',
    targetRole: 'SOC Analyst / Threat Intelligence Specialist',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.2,
    targetAvgCtcLakhs: 11.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['SIEM Architecture (Splunk/Sentinel)', 'Incident Response (NIST Framework)', 'Network Traffic Analysis (Wireshark/Zeek)', 'MITRE ATT&CK Matrix Mapping'],
    phases: [
      {
        title: 'Phase 1: Packet Analysis & Log Forensics',
        weeks: 'Weeks 1–4',
        focus: 'TCP/IP deep dive, DNS tunneling detection, syslog parsing, Windows event log analysis.',
        milestones: ['Analyze 10 real PCAP malware traffic captures in Wireshark', 'Write Splunk queries to detect brute-force attacks', 'Configure Sysmon for endpoint telemetry collection']
      },
      {
        title: 'Phase 2: Threat Detection & Incident Triage',
        weeks: 'Weeks 5–9',
        focus: 'Phishing investigation, malware sandboxing, EDR telemetry, containment playbooks.',
        milestones: ['Investigate live simulated ransomware infection scenario', 'Draft comprehensive incident response report', 'Map adversary behaviors to MITRE ATT&CK techniques']
      },
      {
        title: 'Phase 3: Threat Hunting & SOC Automation',
        weeks: 'Weeks 10–14',
        focus: 'SOAR automation workflows, YARA rules, threat intel feeds, CompTIA CySA+ readiness.',
        milestones: ['Write custom YARA rules for newly discovered IOCs', 'Automate triage workflow via Python/Shuffle SOAR', 'Target Tier-1 SOC openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'embedded_to_iot_architect',
    industry: 'Hardware & IoT',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Embedded Software Engineer (C/C++)',
    targetRole: 'Industrial IoT & Edge Computing Architect',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 7.2,
    targetAvgCtcLakhs: 18.5,
    difficulty: 'Demanding',
    coreSkillGaps: ['MQTT & CoAP Protocols', 'AWS IoT Core & Greengrass', 'Edge AI Acceleration (TensorRT/NCNN)', 'OTA Firmware & Hardware Security'],
    phases: [
      {
        title: 'Phase 1: IoT Communication & Cloud Telemetry',
        weeks: 'Weeks 1–4',
        focus: 'MQTT QoS levels, TLS mutual authentication on microcontrollers, JSON/Protobuf payload efficiency.',
        milestones: ['Connect ESP32/STM32 devices securely to AWS IoT Core', 'Implement resilient MQTT reconnection with exponential backoff', 'Benchmark telemetry bandwidth for 10k concurrent devices']
      },
      {
        title: 'Phase 2: Edge Computing & On-Device AI',
        weeks: 'Weeks 5–9',
        focus: 'Edge AI inference, TensorFlow Lite for Microcontrollers, hardware watchdog, sensor fusion.',
        milestones: ['Deploy predictive maintenance vibration model on edge node', 'Implement secure Over-The-Air (OTA) firmware rollback', 'Establish end-to-end device twin synchronization']
      },
      {
        title: 'Phase 3: Industrial SCADA & Cloud Analytics',
        weeks: 'Weeks 10–16',
        focus: 'Modbus/OPC-UA integration, time-series data stores (TimescaleDB), enterprise digital twins.',
        milestones: ['Architect end-to-end Smart Factory telemetry pipeline', 'Deliver industrial security compliance audit (IEC 62443)', 'Apply for IoT Lead positions on JobMatch OS']
      }
    ]
  },
  {
    id: 'dba_to_data_architect',
    industry: 'Data Infrastructure',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Database Administrator (SQL Server/Oracle)',
    targetRole: 'Modern Cloud Data Architect',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 8.5,
    targetAvgCtcLakhs: 24.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['Snowflake & Databricks Architecture', 'Data Lakehouse Design (Delta Lake/Iceberg)', 'dbt (data build tool)', 'Data Mesh & Governance'],
    phases: [
      {
        title: 'Phase 1: Cloud Warehousing & Columnar Storage',
        weeks: 'Weeks 1–4',
        focus: 'Snowflake micro-partitions, virtual warehouses, auto-suspend, Databricks Delta Lake internals.',
        milestones: ['Migrate 500GB on-prem OLTP database into Snowflake star schema', 'Write production data models using dbt and automated tests', 'Benchmark query cost reduction using warehouse clustering']
      },
      {
        title: 'Phase 2: Streaming Data Pipelines & Lakehouses',
        weeks: 'Weeks 5–10',
        focus: 'Apache Iceberg, Medallion Architecture (Bronze-Silver-Gold), streaming ingestion with Kafka.',
        milestones: ['Build end-to-end Medallion pipeline on Delta Lake', 'Enforce data contracts and schema evolution rules', 'Implement data quality observability checks (Great Expectations)']
      },
      {
        title: 'Phase 3: Enterprise Data Mesh & Governance',
        weeks: 'Weeks 11–16',
        focus: 'Data catalogs (Unity Catalog), role-based masking, GDPR compliance, cost governance.',
        milestones: ['Design domain-oriented Data Mesh architecture for retail enterprise', 'Deliver enterprise data architecture pitch deck', 'Target Principal Data Architect roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'wordpress_to_jamstack',
    industry: 'Web Engineering',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'WordPress / PHP Developer',
    targetRole: 'Headless Next.js & Jamstack Engineer',
    timeEstimateMonths: 3,
    currentAvgCtcLakhs: 3.5,
    targetAvgCtcLakhs: 9.8,
    difficulty: 'Moderate',
    coreSkillGaps: ['TypeScript & Modern ES6+', 'Next.js App Router (SSR/ISR)', 'Headless CMS (Sanity/Strapi)', 'Tailwind CSS & Component Architecture'],
    phases: [
      {
        title: 'Phase 1: TypeScript & Modern React',
        weeks: 'Weeks 1–4',
        focus: 'Hooks, component lifecycles, state management, typed interfaces.',
        milestones: ['Port legacy jQuery interactive widget into typed React component', 'Master async API fetching and error boundaries', 'Build responsive UI design system with Tailwind CSS']
      },
      {
        title: 'Phase 2: Headless Architecture & ISR',
        weeks: 'Weeks 5–8',
        focus: 'Incremental Static Regeneration (ISR), GraphQL/REST headless queries, Sanity schema design.',
        milestones: ['Build dynamic high-traffic content portal with Sanity + Next.js', 'Achieve 98+ Google Lighthouse Performance score', 'Integrate Algolia instant search']
      },
      {
        title: 'Phase 3: E-Commerce & Edge Deployment',
        weeks: 'Weeks 9–12',
        focus: 'Shopify Storefront API, Vercel Edge functions, Stripe checkout integration.',
        milestones: ['Deploy headless ecommerce storefront with cart state', 'Implement automated CI/CD deployment on Vercel', 'Apply for Modern Frontend roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'automation_tester_to_sdet',
    industry: 'Quality Engineering',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Automation Tester (Selenium/Java)',
    targetRole: 'Lead SDET & Performance Architect',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 5.5,
    targetAvgCtcLakhs: 14.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['Playwright & Cypress Frameworks', 'K6 / Locust Load Testing', 'CI/CD Pipeline Integration (Docker/GitHub Actions)', 'Contract Testing (Pact)'],
    phases: [
      {
        title: 'Phase 1: Next-Gen Web & API Test Automation',
        weeks: 'Weeks 1–4',
        focus: 'Playwright async fixtures, network intercepting, mobile emulation, parallel execution.',
        milestones: ['Migrate Selenium suite to Playwright running 4x faster', 'Build resilient API test framework with auto-auth handling', 'Achieve zero flaky test runs in CI']
      },
      {
        title: 'Phase 2: Performance & Contract Testing',
        weeks: 'Weeks 5–9',
        focus: 'Load curves, stress testing, breakpoint testing using K6, microservice contract tests.',
        milestones: ['Simulate 10,000 concurrent user checkout spike in K6', 'Identify database deadlocks and slow queries under load', 'Implement Pact consumer-driven contract tests']
      },
      {
        title: 'Phase 3: CI/CD Quality Gates & Test Ops',
        weeks: 'Weeks 10–14',
        focus: 'Dockerized execution grids, test reporting dashboards, test analytics.',
        milestones: ['Integrate automated quality gates blocking failing PRs', 'Build Grafana dashboard showing test pass rates and duration', 'Apply to Lead SDET positions on JobMatch OS']
      }
    ]
  },
  {
    id: 'support_eng_to_cloud_support',
    industry: 'Cloud & Infrastructure',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'IT Helpdesk / Technical Support',
    targetRole: 'Cloud Support Engineer (AWS / Azure)',
    timeEstimateMonths: 3,
    currentAvgCtcLakhs: 3.2,
    targetAvgCtcLakhs: 8.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['AWS Core Services (EC2, S3, RDS, IAM)', 'Linux Command Line Troubleshooting', 'Networking Fundamentals (DNS, HTTP, SSL)', 'Python Scripting for Troubleshooting'],
    phases: [
      {
        title: 'Phase 1: Linux System Administration & Networking',
        weeks: 'Weeks 1–4',
        focus: 'Linux file permissions, systemd services, netstat/curl debugging, SSL certificate renewal.',
        milestones: ['Troubleshoot 20 simulated Linux server crash scenarios', 'Configure Nginx reverse proxy with SSL termination', 'Automate daily server log parsing with Python']
      },
      {
        title: 'Phase 2: AWS Core Architecture & Storage',
        weeks: 'Weeks 5–8',
        focus: 'EC2 security groups, EBS volume resizing, S3 lifecycle policies, RDS backup restoration.',
        milestones: ['Deploy high-availability WordPress on AWS with RDS', 'Configure CloudWatch alarms and SNS notification triggers', 'Pass AWS Cloud Practitioner certification exam']
      },
      {
        title: 'Phase 3: Incident Triage & Customer Engineering',
        weeks: 'Weeks 9–12',
        focus: 'Root cause analysis (RCA), ticketing workflows, debugging VPC connectivity issues.',
        milestones: ['Write 5 professional RCA reports for production outages', 'Resolve simulated packet drops using VPC Flow Logs', 'Interview for Cloud Support roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'game_dev_to_metaverse_eng',
    industry: 'Gaming & Interactive Tech',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Unity Game Developer (C#)',
    targetRole: 'Spatial Computing & XR Systems Architect',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.8,
    targetAvgCtcLakhs: 16.5,
    difficulty: 'Demanding',
    coreSkillGaps: ['Unreal Engine 5 (C++ & Blueprints)', 'Apple Vision Pro / Meta Quest SDKs', 'Real-time Multiplayer Networking (Photon/Mirror)', 'Shaders & HLSL Performance Optimization'],
    phases: [
      {
        title: 'Phase 1: Unreal Engine 5 & C++ Mastery',
        weeks: 'Weeks 1–5',
        focus: 'Memory management, Nanite virtualized geometry, Lumen real-time lighting, gameplay framework.',
        milestones: ['Build interactive architectural walkthrough in UE5 running at 60 FPS', 'Implement custom character locomotion system in C++', 'Optimize draw calls using occlusion culling']
      },
      {
        title: 'Phase 2: Spatial Computing & XR Interaction',
        weeks: 'Weeks 6–10',
        focus: 'Hand tracking, spatial anchors, eye gaze input, OpenXR standard, passthrough rendering.',
        milestones: ['Develop medical training VR simulation with hand tracking', 'Integrate spatial audio for immersive 3D soundscapes', 'Deploy application to Meta Quest 3 hardware']
      },
      {
        title: 'Phase 3: Scalable Multiplayer & Porting',
        weeks: 'Weeks 11–16',
        focus: 'Client-side prediction, lag compensation, dedicated server orchestration on AWS Gamelift.',
        milestones: ['Build 8-player collaborative virtual meeting space', 'Package and publish interactive portfolio demo', 'Apply to XR Architect positions on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 2. DATA SCIENCE, ANALYTICS & BIG DATA (Transitions 13 - 25)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bi_analyst_to_data_scientist',
    industry: 'Data Science & Machine Learning',
    industryCategory: 'Data Science & Big Data',
    currentRole: 'BI / SQL Reporting Analyst',
    targetRole: 'Predictive Data Scientist & ML Engineer',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.2,
    targetAvgCtcLakhs: 15.0,
    difficulty: 'Demanding',
    coreSkillGaps: ['Machine Learning (Scikit-Learn, XGBoost)', 'Advanced Feature Engineering in Pandas', 'Model Evaluation & Cross-Validation', 'MLflow & Streamlit Prototyping'],
    phases: [
      {
        title: 'Phase 1: Advanced Statistical Learning & Python',
        weeks: 'Weeks 1–4',
        focus: 'Hypothesis testing, distributions, linear/logistic regression, decision trees, bias-variance tradeoff.',
        milestones: ['Clean and engineer 20+ features from noisy retail dataset', 'Build customer churn predictor with 88% ROC-AUC', 'Perform statistical A/B test analysis with significance p-values']
      },
      {
        title: 'Phase 2: Ensemble Models & Hyperparameter Tuning',
        weeks: 'Weeks 5–10',
        focus: 'Random Forests, XGBoost, LightGBM, Optuna hyperparameter optimization, SHAP value explanations.',
        milestones: ['Build end-to-end credit risk scoring model', 'Generate explainability reports using SHAP and Lime', 'Track experiment runs and metrics using MLflow']
      },
      {
        title: 'Phase 3: Production Inference & Model Deployment',
        weeks: 'Weeks 11–16',
        focus: 'FastAPI serving, Dockerization, data drift detection (Evidently AI), portfolio deployment.',
        milestones: ['Deploy live interactive Streamlit application with FastAPI backend', 'Write automated model retraining pipeline', 'Apply to Data Scientist openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'excel_analyst_to_bi_dev',
    industry: 'Business Intelligence',
    industryCategory: 'Data Science & Big Data',
    currentRole: 'MIS / Advanced Excel Executive',
    targetRole: 'Power BI / Tableau BI Developer',
    timeEstimateMonths: 3,
    currentAvgCtcLakhs: 3.5,
    targetAvgCtcLakhs: 9.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['Power BI DAX (CALCULATE, Time Intelligence)', 'SQL Window Functions & CTEs', 'Data Modeling (Star Schema & Snowflake Schema)', 'Power Query ETL Automation'],
    phases: [
      {
        title: 'Phase 1: SQL Fundamentals & Data Transformation',
        weeks: 'Weeks 1–4',
        focus: 'JOINs, GROUP BY, aggregations, CTEs, Window functions (ROW_NUMBER, LAG, LEAD).',
        milestones: ['Write 40 complex analytical SQL queries', 'Automate data cleanup workflows in Power Query (M code)', 'Normalize flat Excel sheets into relational tables']
      },
      {
        title: 'Phase 2: Star Schema Data Modeling & DAX',
        weeks: 'Weeks 5–8',
        focus: 'Fact and Dimension tables, relationship cardinalities, filter propagation, DAX measures.',
        milestones: ['Build dynamic sales dashboard with YTD, MTD, and YoY growth measures', 'Implement dynamic row-level security (RLS) by region', 'Optimize Power BI report rendering performance']
      },
      {
        title: 'Phase 3: Executive Storytelling & Service Deployment',
        weeks: 'Weeks 9–12',
        focus: 'Visual hierarchy, UX for dashboards, scheduled refreshes, gateway configuration.',
        milestones: ['Publish 3 interactive portfolio dashboards to Power BI Service', 'Complete PL-300 Microsoft Power BI Data Analyst prep', 'Target BI Developer roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'data_analyst_to_mlops',
    industry: 'ML Engineering',
    industryCategory: 'Data Science & Big Data',
    currentRole: 'Senior Data Analyst',
    targetRole: 'MLOps Engineer',
    timeEstimateMonths: 4.5,
    currentAvgCtcLakhs: 7.5,
    targetAvgCtcLakhs: 20.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['CI/CD for Machine Learning (CML/GitHub Actions)', 'Kubeflow & ML Pipelines', 'Feature Stores (Feast)', 'Model Monitoring & Data Drift'],
    phases: [
      {
        title: 'Phase 1: Reproducibility & Version Control for ML',
        weeks: 'Weeks 1–5',
        focus: 'DVC (Data Version Control), Git-LFS, containerizing training jobs, experiment tracking.',
        milestones: ['Setup DVC pipeline syncing datasets to AWS S3', 'Build automated model training workflow on GitHub Actions', 'Containerize training scripts with GPU pass-through']
      },
      {
        title: 'Phase 2: Orchestration & Feature Stores',
        weeks: 'Weeks 6–11',
        focus: 'Airflow / Prefect DAGs, Feast feature store, batch vs online feature serving.',
        milestones: ['Deploy automated daily retraining DAG in Apache Airflow', 'Implement Feast feature store serving sub-10ms features', 'Setup automated model registry promotion in MLflow']
      },
      {
        title: 'Phase 3: Production Serving & Real-Time Monitoring',
        weeks: 'Weeks 12–18',
        focus: 'Triton Inference Server / TorchServe, Kubernetes deployment, Evidently AI drift alerts.',
        milestones: ['Deploy high-throughput inference service on Kubernetes', 'Configure Slack alerts for data drift and latency spikes', 'Apply for MLOps roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'sql_dev_to_bigdata_eng',
    industry: 'Big Data Engineering',
    industryCategory: 'Data Science & Big Data',
    currentRole: 'SQL / PLSQL Developer',
    targetRole: 'Big Data & PySpark Engineer',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.8,
    targetAvgCtcLakhs: 16.0,
    difficulty: 'Demanding',
    coreSkillGaps: ['PySpark Distributed Computing', 'Hadoop & HDFS Architecture', 'Kafka Streaming Data Ingestion', 'AWS EMR & Databricks'],
    phases: [
      {
        title: 'Phase 1: PySpark & Distributed Data Processing',
        weeks: 'Weeks 1–5',
        focus: 'RDDs, DataFrames, Catalyst Optimizer, memory partitions, wide vs narrow transformations.',
        milestones: ['Process 100GB clickstream log file using PySpark on Databricks', 'Optimize data skew using broadcast joins and salting', 'Write unit tests for PySpark data transformations']
      },
      {
        title: 'Phase 2: Structured Streaming & Real-time Pipelines',
        weeks: 'Weeks 6–11',
        focus: 'Spark Structured Streaming, Kafka topics, sliding windows, watermarking, Delta Lake sinks.',
        milestones: ['Build end-to-end real-time fraud detection pipeline', 'Configure checkpointing and exactly-once processing semantics', 'Deploy pipeline on cloud managed cluster (AWS EMR)']
      },
      {
        title: 'Phase 3: Production Big Data Pipeline Architecture',
        weeks: 'Weeks 12–16',
        focus: 'Orchestration with Airflow, file format optimization (Parquet/ORC), data governance.',
        milestones: ['Architect enterprise Big Data Lakehouse pipeline', 'Deliver performance benchmark report showing 60% run time reduction', 'Target Big Data Engineer openings on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 3. FINANCE, BANKING & FINTECH (Transitions 17 - 35)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'retail_banker_to_credit_risk',
    industry: 'Banking & Financial Services',
    industryCategory: 'Finance, Banking & FinTech',
    currentRole: 'Retail Branch Banking Executive',
    targetRole: 'Credit Risk Underwriter & Portfolio Analyst',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.2,
    targetAvgCtcLakhs: 11.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['Financial Statement Analysis (CAM Preparation)', 'CIBIL / Experian Credit Scoring Models', 'RBI Lending Guidelines & Basel III Norms', 'Debt Service Coverage Ratio (DSCR) Modeling'],
    phases: [
      {
        title: 'Phase 1: Corporate Financial Statement Appraisal',
        weeks: 'Weeks 1–4',
        focus: 'Balance sheet reconciliation, cash flow statement analysis, Working Capital assessment (Tandon/Chore committee norms).',
        milestones: ['Prepare 5 Credit Appraisal Memos (CAM) for SME loans > ₹5 Crores', 'Calculate and stress-test DSCR, current ratio, and debt-equity ratios', 'Detect revenue inflation flags using tax returns (GSTR-2A vs 3B)']
      },
      {
        title: 'Phase 2: Credit Policy & Regulatory Compliance',
        weeks: 'Weeks 5–8',
        focus: 'RBI prudential norms, NPA recognition criteria, asset classification, collateral valuation methodologies.',
        milestones: ['Audit mock loan portfolio for early warning signs of stress (SMA-0/1/2)', 'Formulate risk-mitigating covenant structures for high-risk borrower', 'Build automated Excel underwriting workbook']
      },
      {
        title: 'Phase 3: FinTech Underwriting & Algorithmic Scoring',
        weeks: 'Weeks 9–14',
        focus: 'Alternate credit data, account aggregator frameworks, automated rule engines (BRE).',
        milestones: ['Design digital loan approval matrix for instant personal loans', 'Deliver portfolio delinquency review presentation', 'Apply for Credit Underwriter roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'accounts_payable_to_fpa',
    industry: 'Corporate Finance',
    industryCategory: 'Finance, Banking & FinTech',
    currentRole: 'Accounts Payable / Receivable Specialist',
    targetRole: 'FP&A (Financial Planning & Analysis) Analyst',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.8,
    targetAvgCtcLakhs: 11.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['Three-Statement Financial Modeling', 'Variance Analysis & Budget Forecasting', 'SaaS Metrics (LTV, CAC, MRR, Burn Multiple)', 'ERP Integration (SAP/NetSuite)'],
    phases: [
      {
        title: 'Phase 1: Integrated 3-Statement Modeling',
        weeks: 'Weeks 1–4',
        focus: 'Dynamic Income Statement, Balance Sheet, and Cash Flow modeling with debt schedules and working capital loops.',
        milestones: ['Build linked 3-statement forecast model from scratch in Excel', 'Incorporate sensitivity analysis and scenario switches (Bull/Base/Bear)', 'Master dynamic Excel functions (INDEX-MATCH, XLOOKUP, LET)']
      },
      {
        title: 'Phase 2: Budgeting & Variance Diagnostics',
        weeks: 'Weeks 5–8',
        focus: 'Monthly budget vs actual (BvA) analysis, price-volume mix variance, headcount planning models.',
        milestones: ['Conduct quarterly variance analysis identifying key operating profit drivers', 'Design departmental OPEX forecasting template', 'Build rolling 12-month liquidity forecast']
      },
      {
        title: 'Phase 3: Strategic Executive Storytelling & SaaS KPIs',
        weeks: 'Weeks 9–14',
        focus: 'Unit economics, Rule of 40, board deck reporting, Tableau/PowerBI financial visualizations.',
        milestones: ['Create executive board pack financial slide deck', 'Present strategic cost optimization proposal saving 8% OPEX', 'Target FP&A positions on JobMatch OS']
      }
    ]
  },
  {
    id: 'equity_dealer_to_quant_trader',
    industry: 'Capital Markets & FinTech',
    industryCategory: 'Finance, Banking & FinTech',
    currentRole: 'Equity Dealer / Stockbroker',
    targetRole: 'Algorithmic & Quantitative Trading Analyst',
    timeEstimateMonths: 4.5,
    currentAvgCtcLakhs: 4.5,
    targetAvgCtcLakhs: 18.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['Python for Financial Engineering (Pandas, NumPy)', 'Backtesting Quantitative Strategies (Backtrader/VectorBT)', 'Statistical Arbitrage & Pairs Trading', 'Options Greeks & Volatility Surface Modeling'],
    phases: [
      {
        title: 'Phase 1: Algorithmic Backtesting Frameworks',
        weeks: 'Weeks 1–5',
        focus: 'Time series analysis, stationary testing (ADF), order book dynamics, slippage & transaction cost modeling.',
        milestones: ['Build robust Python backtester with realistic brokerage & slippage', 'Backtest mean-reversion strategy across NIFTY 50 equities', 'Calculate Sharpe, Sortino, and Maximum Drawdown metrics']
      },
      {
        title: 'Phase 2: Statistical Arbitrage & Derivatives Modeling',
        weeks: 'Weeks 6–11',
        focus: 'Cointegration, Kalman filters, Black-Scholes pricing, implied volatility skew, delta-neutral hedging.',
        milestones: ['Deploy pairs-trading strategy with automated z-score thresholds', 'Model volatility smile across weekly index options contracts', 'Simulate automated risk management limits (Max VaR, daily kill switch)']
      },
      {
        title: 'Phase 3: Live API Execution & High-Frequency Architecture',
        weeks: 'Weeks 12–18',
        focus: 'Broker REST/WebSocket APIs (Zerodha Kite, Interactive Brokers), low-latency architecture, AWS hosting.',
        milestones: ['Deploy automated paper trading bot executing live tick-level signals', 'Write complete technical whitepaper on strategy performance', 'Apply for Quant Analyst roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'investment_bank_analyst_to_vc',
    industry: 'Venture Capital & Private Equity',
    industryCategory: 'Finance, Banking & FinTech',
    currentRole: 'Investment Banking Analyst (M&A/DCM)',
    targetRole: 'Venture Capital Associate / Tech Investor',
    timeEstimateMonths: 3,
    currentAvgCtcLakhs: 14.0,
    targetAvgCtcLakhs: 26.0,
    difficulty: 'Demanding',
    coreSkillGaps: ['Startup Valuation (Berkus, Scorecard, DCF)', 'Cap Table Modeling & Waterfall Analysis', 'Commercial Due Diligence & Market Sizing (TAM/SAM/SOM)', 'Term Sheet Redlining & Founder Sourcing'],
    phases: [
      {
        title: 'Phase 1: Deal Sourcing & Market Sizing Theses',
        weeks: 'Weeks 1–4',
        focus: 'Developing investment theses in AI, B2B SaaS, and FinTech; bottoms-up market sizing; competitive landscape mapping.',
        milestones: ['Publish deep-dive investment thesis on Generative AI enterprise workflows', 'Source and evaluate 15 early-stage startups in target sector', 'Draft one-page investment teaser for IC presentation']
      },
      {
        title: 'Phase 2: Cap Tables, Term Sheets & Diligence',
        weeks: 'Weeks 5–8',
        focus: 'SAFE notes, convertible debt, liquidation preferences (participating vs non-participating), pro-rata rights.',
        milestones: ['Build dynamic cap table model factoring in future seed/Series A dilution', 'Redline standard NVCA term sheet identifying founder-unfriendly clauses', 'Conduct founder background & customer reference calls']
      },
      {
        title: 'Phase 3: Investment Memo & IC Defense',
        weeks: 'Weeks 9–12',
        focus: 'Synthesizing commercial, technical, and legal findings into an Investment Committee (IC) memo.',
        milestones: ['Complete comprehensive 15-page Investment Committee memo', 'Defend deal valuation and exit multiples before mock IC panel', 'Network with Tier-1 VC funds on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 4. CA, AUDIT & ACCOUNTING (Transitions 21 - 32)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'semica_to_corporate_tax',
    industry: 'Chartered Accountancy & Tax',
    industryCategory: 'CA, Audit & Accounting',
    currentRole: 'Semi-Qualified CA / Articleship Trainee',
    targetRole: 'Corporate International Tax & Transfer Pricing Lead',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.5,
    targetAvgCtcLakhs: 13.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['OECD BEPS Guidelines & Pillar Two', 'Transfer Pricing Documentation (Local File / Master File)', 'Cross-Border Withholding Tax (DTAA)', 'Direct Tax Litigation & Dispute Resolution'],
    phases: [
      {
        title: 'Phase 1: Transfer Pricing Methods & Economic Benchmarking',
        weeks: 'Weeks 1–4',
        focus: 'Arm’s length principle, CUP, TNMM, Cost Plus methods, TP benchmarking using Prowess/Capitaline.',
        milestones: ['Conduct economic benchmarking study for IT/ITES cross-border transactions', 'Prepare compliant Local File and Master File documentation', 'Analyze Royalty and Management Fee inter-company agreements']
      },
      {
        title: 'Phase 2: International Tax Treaties & DTAA',
        weeks: 'Weeks 5–8',
        focus: 'Permanent Establishment (PE) risks, Royalty vs FTS classification, Multilateral Instrument (MLI), Equalization Levy.',
        milestones: ['Draft tax opinion on Permanent Establishment exposure for foreign SaaS vendor', 'Compute foreign tax credits under Section 90/91 DTAA provisions', 'Structure tax-efficient cross-border IP licensing model']
      },
      {
        title: 'Phase 3: Tax Dispute Resolution & Advisory',
        weeks: 'Weeks 9–14',
        focus: 'Advance Pricing Agreements (APA), Dispute Resolution Panel (DRP), litigation strategy.',
        milestones: ['Draft grounds of appeal for High-Court/ITAT tax assessment dispute', 'Deliver executive presentation on Global Minimum Tax (Pillar Two) impact', 'Target Corporate Tax Lead roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'internal_auditor_to_forensic',
    industry: 'Forensic Accounting & Fraud Investigation',
    industryCategory: 'CA, Audit & Accounting',
    currentRole: 'Internal Audit Associate',
    targetRole: 'Forensic Accountant & Fraud Risk Investigator',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 5.0,
    targetAvgCtcLakhs: 14.5,
    difficulty: 'Demanding',
    coreSkillGaps: ['Data Analytics for Fraud (IDEA / ACL / SQL)', 'Digital Forensics & Evidence Preservation', 'Asset Tracing & Fund Siphoning Diagnostics', 'Whistleblower Case Investigation & Reporting'],
    phases: [
      {
        title: 'Phase 1: Fraud Analytics & Benford’s Law',
        weeks: 'Weeks 1–4',
        focus: 'Anomaly detection in General Ledger, Benford’s law analysis, duplicate payment identification, ghost employee audits.',
        milestones: ['Run automated Benford’s law script across 100,000 procurement transactions', 'Identify circular trading patterns and round-tripping of funds', 'Build SQL queries detecting split purchases avoiding approval limits']
      },
      {
        title: 'Phase 2: Digital Forensics & Forensic Interviewing',
        weeks: 'Weeks 5–8',
        focus: 'Chain of custody, forensic email extraction, keyword searching, structured investigative interview techniques.',
        milestones: ['Draft investigative questionnaire for suspected vendor collusion', 'Extract and categorize email timelines identifying kickback disclosures', 'Conduct mock admission-seeking interview with subject']
      },
      {
        title: 'Phase 3: Comprehensive Forensic Report & Expert Testimony',
        weeks: 'Weeks 9–14',
        focus: 'Drafting court-admissible forensic reports, corporate governance recommendations, CFE certification prep.',
        milestones: ['Deliver comprehensive forensic investigation report with evidentiary exhibits', 'Formulate anti-fraud internal controls matrix for executive board', 'Target Forensic Investigation roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'ca_fresher_to_ma_advisor',
    industry: 'Corporate Finance & Advisory',
    industryCategory: 'CA, Audit & Accounting',
    currentRole: 'Newly Qualified Chartered Accountant (CA)',
    targetRole: 'M&A Transaction Advisory & Due Diligence Lead',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 9.5,
    targetAvgCtcLakhs: 21.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['Quality of Earnings (QoE) Analysis', 'Normalized EBITDA Adjustments', 'Net Working Capital (NWC) Peg Calculations', 'Financial Due Diligence (FDD) Reporting'],
    phases: [
      {
        title: 'Phase 1: Quality of Earnings & EBITDA Bridge',
        weeks: 'Weeks 1–4',
        focus: 'Pro-forma EBITDA adjustments, non-recurring expenses, revenue recognition (Ind AS 115), carve-out financials.',
        milestones: ['Perform QoE analysis identifying ₹12 Cr of unsustainable earnings', 'Build bridge from reported EBITDA to normalized deal EBITDA', 'Audit related-party transactions and transfer pricing adjustments']
      },
      {
        title: 'Phase 2: Working Capital & Net Debt Diagnostics',
        weeks: 'Weeks 5–9',
        focus: 'Target NWC peg definition, seasonal adjustments, debt-like items, off-balance sheet liabilities.',
        milestones: ['Calculate monthly working capital cycles to determine cash-free debt-free peg', 'Identify hidden debt items including unfunded gratuity and disputed tax demands', 'Review draft Share Purchase Agreement (SPA) purchase price adjustment clauses']
      },
      {
        title: 'Phase 3: Final FDD Report & Deal Negotiation',
        weeks: 'Weeks 10–16',
        focus: 'Drafting Red Flag reports, executive summaries, assisting buy-side negotiation with PE sponsors.',
        milestones: ['Publish complete 40-page Buy-Side Financial Due Diligence report', 'Present findings to private equity investment team', 'Apply for M&A Transaction Advisory roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 5. HEALTHCARE, PHARMA & BIOTECH (Transitions 24 - 36)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cra_to_clinical_lead',
    industry: 'Clinical Research',
    industryCategory: 'Healthcare, Pharma & Biotech',
    currentRole: 'Clinical Research Associate (CRA)',
    targetRole: 'Global Clinical Project Manager (CPM)',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.5,
    targetAvgCtcLakhs: 15.0,
    difficulty: 'Demanding',
    coreSkillGaps: ['ICH-GCP E6(R2) Regulatory Framework', 'Clinical Trial Protocol Design & Budgeting', 'Site Feasibility & CRO Vendor Governance', 'Risk-Based Monitoring (RBM)'],
    phases: [
      {
        title: 'Phase 1: Trial Budgeting & Protocol Architecture',
        weeks: 'Weeks 1–4',
        focus: 'Clinical trial phases I-IV, protocol endpoints, investigator site budgets, patient recruitment modeling.',
        milestones: ['Build dynamic multi-site clinical trial budget model ($2M+)', 'Design patient enrollment funnel mitigating high dropout rates', 'Draft site feasibility assessment questionnaire']
      },
      {
        title: 'Phase 2: CRO Governance & Risk-Based Monitoring',
        weeks: 'Weeks 5–9',
        focus: 'CRO contract negotiations, milestone tracking, Key Risk Indicators (KRIs), centralized monitoring.',
        milestones: ['Establish Risk Assessment and Mitigation Plan (RAMP)', 'Audit clinical trial master file (eTMF) for inspection readiness', 'Resolve serious adverse event (SAE) reporting bottlenecks']
      },
      {
        title: 'Phase 3: Regulatory Filings & Inspection Readiness',
        weeks: 'Weeks 10–16',
        focus: 'US FDA 21 CFR Part 11, EMA clinical directives, CDSCO submissions, audit preparation.',
        milestones: ['Conduct mock regulatory inspection audit for tier-1 hospital site', 'Deliver executive trial progress presentation to pharmaceutical sponsor', 'Apply for Clinical Project Manager roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'pharma_sales_to_medical_affairs',
    industry: 'Medical Affairs',
    industryCategory: 'Healthcare, Pharma & Biotech',
    currentRole: 'Pharma Sales Representative (MR)',
    targetRole: 'Medical Science Liaison (MSL)',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.8,
    targetAvgCtcLakhs: 12.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['Translational Clinical Science & Oncology Data', 'Key Opinion Leader (KOL) Relationship Management', 'Scientific Advisory Board Presentation', 'Regulatory Compliance for Medical Affairs'],
    phases: [
      {
        title: 'Phase 1: Deep Clinical Data Interpretation',
        weeks: 'Weeks 1–4',
        focus: 'Phase III clinical trial statistical analysis, hazard ratios, progression-free survival (PFS), oncology biomarkers.',
        milestones: ['Deconstruct complex NEJM peer-reviewed drug trial into executive brief', 'Present clinical efficacy data comparing biosimilar vs originator drug', 'Master medical compliance boundaries separating sales from medical science']
      },
      {
        title: 'Phase 2: KOL Engagement & Scientific Exchange',
        weeks: 'Weeks 5–8',
        focus: 'Identifying and engaging Key Opinion Leaders (KOLs), managing scientific advisory boards, addressing unsolicited medical requests.',
        milestones: ['Build comprehensive territory KOL mapping across 20 leading hospitals', 'Draft complete standard response letter for physician off-label inquiry', 'Conduct simulated scientific discussion with senior oncologist']
      },
      {
        title: 'Phase 3: Medical Strategy & Launch Readiness',
        weeks: 'Weeks 9–14',
        focus: 'Medical education strategy, investigator-initiated study (IIS) review, real-world evidence (RWE).',
        milestones: ['Design scientific communication plan for national oncology conference', 'Deliver final MSL role-play presentation before medical review board', 'Target Medical Science Liaison openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'biotech_lab_to_bioinformatics',
    industry: 'Bioinformatics & Computational Biology',
    industryCategory: 'Healthcare, Pharma & Biotech',
    currentRole: 'Wet-Lab Research Assistant',
    targetRole: 'Computational Biologist & NGS Data Analyst',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 4.0,
    targetAvgCtcLakhs: 13.5,
    difficulty: 'Demanding',
    coreSkillGaps: ['Next-Generation Sequencing (NGS) Pipeline', 'Bioinformatics in Python & R (Bioconductor)', 'Genomic Variant Calling (GATK / SAMtools)', 'Linux High-Performance Computing (HPC)'],
    phases: [
      {
        title: 'Phase 1: Linux CLI & Genomics File Formats',
        weeks: 'Weeks 1–4',
        focus: 'FASTQ, SAM/BAM, VCF file manipulation, Linux pipeline scripting, reference genome indexing.',
        milestones: ['Process 10GB raw sequencing data through quality control (FastQC)', 'Align short reads to human reference genome using BWA-MEM', 'Write automated bash pipeline parsing variant files']
      },
      {
        title: 'Phase 2: Variant Calling & Differential Expression',
        weeks: 'Weeks 5–9',
        focus: 'GATK Best Practices, RNA-seq differential expression analysis using DESeq2 in R, pathway enrichment.',
        milestones: ['Run complete germline variant discovery pipeline', 'Identify top 50 differentially expressed genes in cancer dataset', 'Generate volcano plots and heatmaps with Gene Ontology (GO) terms']
      },
      {
        title: 'Phase 3: Cloud Genomics & ML in Genomics',
        weeks: 'Weeks 10–16',
        focus: 'Nextflow / Snakemake workflow managers, AWS Omics, mutation classification with Scikit-learn.',
        milestones: ['Package scalable NGS pipeline in Nextflow with Docker containers', 'Publish reproducible GitHub repository with genomic workflow', 'Apply to Bioinformatics Scientist positions on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 6. SUPPLY CHAIN, LOGISTICS & MARITIME (Transitions 27 - 38)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ops_to_supply_chain',
    industry: 'Global Supply Chain',
    industryCategory: 'Supply Chain, Logistics & Maritime',
    currentRole: 'Warehouse / Operations Executive',
    targetRole: 'Global Supply Chain & Demand Planner',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.6,
    targetAvgCtcLakhs: 10.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['ERP & SCM Systems (SAP/Oracle SCM)', 'Statistical Demand Forecasting (ARIMA/Holt-Winters)', 'Inventory Optimization (EOQ & Safety Stock)', 'Vendor SLA & Cold-Chain Management'],
    phases: [
      {
        title: 'Phase 1: Demand Forecasting & Statistical Models',
        weeks: 'Weeks 1–4',
        focus: 'Historical sales analysis, seasonality adjustments, mean absolute percentage error (MAPE).',
        milestones: ['Calculate 12-month demand forecast for 50 SKUs', 'Reduce forecasting error by 18% using weighted averages', 'Audit warehouse lead times across tier-1 suppliers']
      },
      {
        title: 'Phase 2: Inventory Optimization & ERP Architecture',
        weeks: 'Weeks 5–9',
        focus: 'Economic Order Quantity (EOQ), reorder points, buffer stock modeling, SAP MM/PP workflows.',
        milestones: ['Model dynamic safety stock thresholds minimizing stockouts', 'Design ABC-XYZ inventory classification workbook', 'Simulate supply disruption contingency logistics routes']
      },
      {
        title: 'Phase 3: Global SCM Strategy & Procurement',
        weeks: 'Weeks 10–14',
        focus: 'Incoterms 2020, customs clearance, multimodal logistics optimization, vendor contract negotiations.',
        milestones: ['Deliver freight cost optimization proposal saving 12% freight spend', 'Document complete SCM operational playbook', 'Target Supply Chain Planner positions on JobMatch OS']
      }
    ]
  },
  {
    id: 'freight_forwarder_to_customs_broker',
    industry: 'Logistics & International Trade',
    industryCategory: 'Supply Chain, Logistics & Maritime',
    currentRole: 'Freight Forwarding Executive',
    targetRole: 'Licensed Customs Broker & Cross-Border Trade Compliance Manager',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 4.2,
    targetAvgCtcLakhs: 12.0,
    difficulty: 'Demanding',
    coreSkillGaps: ['Harmonized System (HS) Code Classification', 'Customs Valuation Rules & Tariffs', 'Rules of Origin & Free Trade Agreements (FTAs)', 'Duty Drawback & Authorized Economic Operator (AEO)'],
    phases: [
      {
        title: 'Phase 1: HS Code Classification & Valuation Rules',
        weeks: 'Weeks 1–4',
        focus: 'General Rules of Interpretation (GRI), section/chapter notes, customs valuation methods, assist values.',
        milestones: ['Classify 100 complex engineered goods with precise 8-digit HS codes', 'Audit import declarations for undervaluation or anti-dumping duties', 'Calculate exact landed duty costs across 5 FTA trade lanes']
      },
      {
        title: 'Phase 2: FTA Utilization & Duty Optimization Schemes',
        weeks: 'Weeks 5–9',
        focus: 'India-UAE CEPA, India-Australia ECTA, Certificate of Origin verification, MOOWR scheme benefits.',
        milestones: ['Formulate duty optimization strategy under MOOWR bonded warehouse program', 'Conduct compliance review on country of origin documentation', 'Streamline import customs clearance time from 48h to under 12h']
      },
      {
        title: 'Phase 3: Trade Governance & Regulatory Audit Defense',
        weeks: 'Weeks 10–16',
        focus: 'Directorate of Revenue Intelligence (DRI) audits, AEO Tier-2 certification, trade penalty defenses.',
        milestones: ['Draft response to customs reassessment show cause notice', 'Deliver enterprise trade compliance SOP for multinational importer', 'Apply for Trade Compliance Manager roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 7. MARKETING, GROWTH & D2C (Transitions 29 - 42)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'digital_marketing_to_growth_pm',
    industry: 'Growth Marketing & Product',
    industryCategory: 'Marketing, Growth & D2C',
    currentRole: 'Performance Marketing Specialist',
    targetRole: 'Growth Product Manager (GPM)',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.8,
    targetAvgCtcLakhs: 15.5,
    difficulty: 'High Impact',
    coreSkillGaps: ['Product Analytics (Mixpanel / Amplitude)', 'A/B Testing & Statistical Experimentation', 'Product-Led Growth (PLG) Funnel Optimization', 'SQL for User Cohort Analysis'],
    phases: [
      {
        title: 'Phase 1: Funnel Analytics & Drop-off Diagnostics',
        weeks: 'Weeks 1–4',
        focus: 'User activation benchmarks, retention cohorts, event taxonomy design, SQL query extraction.',
        milestones: ['Instrument event tracking schema for a web onboarding flow', 'Identify top 3 churn bottlenecks reducing drop-off by 22%', 'Calculate LTV:CAC and payback period across organic vs paid cohorts']
      },
      {
        title: 'Phase 2: Scientific Experimentation & Hypotheses',
        weeks: 'Weeks 5–8',
        focus: 'Sample size calculations, p-value significance, minimum detectable effect (MDE), feature gating.',
        milestones: ['Formulate and execute 6 rapid-fire growth experiments', 'Analyze statistical significance of pricing model change', 'Design frictionless guest-checkout conversion flow']
      },
      {
        title: 'Phase 3: Viral Loops & Monetization Loops',
        weeks: 'Weeks 9–14',
        focus: 'Referral economics, in-app paywalls, freemium-to-paid conversion triggers, GTM strategy.',
        milestones: ['Build self-sustaining viral invite loop with reward attribution', 'Present complete Growth Roadmap to product executive panel', 'Apply to Growth Product Manager roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'content_writer_to_seo_director',
    industry: 'SEO & Organic Growth',
    industryCategory: 'Marketing, Growth & D2C',
    currentRole: 'Content Writer / Copywriter',
    targetRole: 'Director of SEO & Programmatic Search',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.2,
    targetAvgCtcLakhs: 12.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['Technical SEO (Core Web Vitals, Crawl Budget)', 'Programmatic SEO & Scaled Directory Design', 'Search Console API & BigQuery Analytics', 'Information Gain & AI Overviews (SGE) Optimization'],
    phases: [
      {
        title: 'Phase 1: Technical SEO & Site Architecture',
        weeks: 'Weeks 1–4',
        focus: 'Canonicalization, hreflang tags, schema markup (JSON-LD), log file analysis, indexation audits.',
        milestones: ['Perform technical SEO audit fixing 50+ crawl errors in Screaming Frog', 'Implement rich structured schema markup for JobPostings and Articles', 'Optimize Core Web Vitals (LCP, INP, CLS) passing Google benchmarks']
      },
      {
        title: 'Phase 2: Programmatic SEO & Database Templating',
        weeks: 'Weeks 5–8',
        focus: 'Keyword clustering, headless CMS integration, templated programmatic landing pages at scale.',
        milestones: ['Design programmatic architecture scaling 1,000+ local landing pages', 'Implement information gain mechanisms preventing Google helpful content penalties', 'Set up automated rank tracking and competitor displacement alerts']
      },
      {
        title: 'Phase 3: SEO Analytics & Organic Revenue Attribution',
        weeks: 'Weeks 9–14',
        focus: 'BigQuery Search Console extraction, multi-touch organic attribution, generative engine optimization (GEO).',
        milestones: ['Build Looker Studio organic revenue dashboard', 'Deliver comprehensive search growth strategy to executive leadership', 'Apply for SEO Lead roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 8. SALES & ENTERPRISE BD (Transitions 31 - 45)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bdr_to_enterprise_ae',
    industry: 'Enterprise B2B Software',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'Inside Sales / Business Development Rep (BDR)',
    targetRole: 'Enterprise B2B SaaS Account Executive (AE)',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.5,
    targetAvgCtcLakhs: 16.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['MEDDPICC Enterprise Qualification', 'Complex Contract Negotiation & Procurement Buy-In', 'Multi-Stakeholder Champion Building', 'Enterprise Value Realization Modeling'],
    phases: [
      {
        title: 'Phase 1: Discovery Mastery & Pain Quantification',
        weeks: 'Weeks 1–4',
        focus: 'Customer discovery frameworks, uncovering economic buyer pain, establishing negative consequences of inaction.',
        milestones: ['Conduct 10 recorded high-impact C-Suite discovery calls', 'Quantify enterprise customer ROI showing 4x cost recovery', 'Master the MEDDPICC sales qualification methodology']
      },
      {
        title: 'Phase 2: Champion Enablement & Multi-Threading',
        weeks: 'Weeks 5–8',
        focus: 'Identifying internal champions, mapping political buying hierarchies, overcoming IT security gatekeepers.',
        milestones: ['Create executive business case deck for internal champion defense', 'Navigate security assessment review (SOC 2, ISO 27001)', 'Deliver tailored multi-stakeholder product demo']
      },
      {
        title: 'Phase 3: Procurement Negotiation & Closing Cycles',
        weeks: 'Weeks 9–14',
        focus: 'Legal MSA terms, annual upfront billing, discounting guardrails, closing high ACV contracts (>₹25L).',
        milestones: ['Close mock ₹50 Lakh enterprise contract without eroding margin', 'Build repeatable quarterly pipeline generation plan ($500K+)', 'Apply for Enterprise Account Executive roles on JobMatch OS']
      }
    ]
  },
  {
    id: 'real_estate_agent_to_proptech_bd',
    industry: 'PropTech & Commercial Real Estate',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'Real Estate Broker / Channel Partner',
    targetRole: 'Enterprise PropTech Business Development Director',
    timeEstimateMonths: 3,
    currentAvgCtcLakhs: 4.0,
    targetAvgCtcLakhs: 13.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['Commercial Real Estate Asset Management', 'PropTech SaaS Integration (Leasing & Facility OS)', 'Institutional Developer Partnerships', 'Key Account Management'],
    phases: [
      {
        title: 'Phase 1: CRE Financial Metrics & Technology Trends',
        weeks: 'Weeks 1–4',
        focus: 'Net absorption, cap rates, rental yield analysis, smart building IoT ecosystems.',
        milestones: ['Analyze leasing economics for Grade-A commercial office space', 'Identify software automation gaps in property management operations', 'Pitch PropTech SaaS value proposition to commercial developer']
      },
      {
        title: 'Phase 2: Enterprise Partnership Structuring',
        weeks: 'Weeks 5–8',
        focus: 'Enterprise license agreements, co-working operational software, revenue-sharing models.',
        milestones: ['Structure joint partnership with regional developer consortium', 'Build pricing proposal for 2M sq ft commercial portfolio rollout', 'Conduct structured pilot implementation demo']
      },
      {
        title: 'Phase 3: Strategic Account Expansion',
        weeks: 'Weeks 9–12',
        focus: 'Cross-selling energy optimization modules, quarterly business reviews (QBRs), churn defense.',
        milestones: ['Achieve 100% pilot-to-annual contract conversion simulation', 'Deliver PropTech GTM roadmap presentation', 'Target Enterprise BD roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 9. PRODUCT MANAGEMENT & UX (Transitions 33 - 48)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'support_to_apm',
    industry: 'Product Management',
    industryCategory: 'Product Management & UX',
    currentRole: 'Customer Support / Operations Lead',
    targetRole: 'Associate Product Manager (APM)',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.0,
    targetAvgCtcLakhs: 12.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['Writing Product Requirement Documents (PRDs)', 'User Story Mapping & Backlog Prioritization (RICE)', 'Wireframing & Usability Testing (Figma)', 'Product Telemetry & Metrics (SQL/PostHog)'],
    phases: [
      {
        title: 'Phase 1: Customer Insight to Product Specs',
        weeks: 'Weeks 1–4',
        focus: 'Synthesizing support tickets into feature themes, writing crystal-clear PRDs with acceptance criteria.',
        milestones: ['Transform 200 customer complaints into 3 prioritized feature specs', 'Write comprehensive 6-page PRD for mobile app redesign', 'Run 5 structured user interviews uncovering core friction points']
      },
      {
        title: 'Phase 2: Agile Execution & Cross-Functional Alignment',
        weeks: 'Weeks 5–8',
        focus: 'Scrum sprint planning, sprint retrospectives, negotiating tradeoffs with engineering leads.',
        milestones: ['Create complete interactive Figma prototype for new workflow', 'Prioritize 30-item product backlog using RICE framework', 'Lead mock sprint planning meeting defending release scope']
      },
      {
        title: 'Phase 3: Product Launch & Metric Tracking',
        weeks: 'Weeks 9–14',
        focus: 'Go-to-Market checklist, release notes, tracking feature adoption and CSAT.',
        milestones: ['Define North Star Metric and supporting health metrics for a product launch', 'Deploy PostHog funnel tracking feature adoption', 'Target Associate Product Manager openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'graphic_to_uiux',
    industry: 'Design & Product Experience',
    industryCategory: 'Product Management & UX',
    currentRole: 'Graphic / Visual Designer',
    targetRole: 'Product Designer (UI/UX) & Design Systems Lead',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.8,
    targetAvgCtcLakhs: 13.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['Figma Auto-Layout & Design Tokens', 'Information Architecture & Wireframing', 'User Research & Usability Testing', 'Component Library Governance'],
    phases: [
      {
        title: 'Phase 1: UX Heuristics & Research Foundations',
        weeks: 'Weeks 1–4',
        focus: 'Jakob Nielsen heuristics, user personas, journey mapping, low-fidelity wireframing.',
        milestones: ['Conduct heuristic evaluation on broken checkout flow identifying 12 flaws', 'Map end-to-end customer journey with emotional high/low points', 'Test low-fidelity wireframes with 5 real users']
      },
      {
        title: 'Phase 2: Scalable Design Systems in Figma',
        weeks: 'Weeks 5–9',
        focus: 'Atomic design, auto-layout variants, interactive micro-animations, WCAG 2.1 AA accessibility compliance.',
        milestones: ['Build comprehensive multi-theme design system with 40+ components', 'Ensure all color contrasts and touch targets meet AA accessibility standards', 'Create production-ready micro-interactions and mobile prototypes']
      },
      {
        title: 'Phase 3: Developer Handoff & Portfolio Case Studies',
        weeks: 'Weeks 10–14',
        focus: 'Design tokens export, developer handoff specs, documenting full UX case studies.',
        milestones: ['Publish 2 deep-dive case studies detailing measurable business impact', 'Conduct design handoff session with frontend engineers', 'Apply for Product Designer positions on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 10. HR, PEOPLE OPS & TALENT (Transitions 35 - 50)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'recruiter_to_hrbp',
    industry: 'Human Resources & Talent Management',
    industryCategory: 'HR, People Ops & Talent',
    currentRole: 'Talent Acquisition / IT Recruiter',
    targetRole: 'Strategic HR Business Partner (HRBP)',
    timeEstimateMonths: 3,
    currentAvgCtcLakhs: 4.0,
    targetAvgCtcLakhs: 11.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['HR Information Systems (HRIS Architecture)', 'Workforce Attrition Modeling (SQL/Python)', 'Total Rewards & Compensation Benchmarking', 'Organizational Design & Talent Review'],
    phases: [
      {
        title: 'Phase 1: HR Metrics & Attrition Diagnostics',
        weeks: 'Weeks 1–4',
        focus: 'Time-to-hire, eNPS, cost-per-hire, voluntary attrition forecasting, Excel pivot analysis.',
        milestones: ['Build employee turnover dashboard highlighting flight risks', 'Quantify financial cost of replacement across departments', 'Analyze tenure vs performance correlation in Excel']
      },
      {
        title: 'Phase 2: Compensation Structuring & HRIS Systems',
        weeks: 'Weeks 5–8',
        focus: 'Salary bands, ESOP vesting schedules, performance appraisal calibration, HRIS implementation.',
        milestones: ['Design benchmarked salary band matrix for 10 roles', 'Draft performance calibration framework for annual reviews', 'Create complete onboarding automation workflow']
      },
      {
        title: 'Phase 3: Strategic HRBP Leadership',
        weeks: 'Weeks 9–12',
        focus: 'Succession planning, leadership coaching, C-Suite talent strategy, culture diagnostics.',
        milestones: ['Formulate 9-box talent matrix for strategic leadership', 'Present executive talent retention proposal to leadership', 'Apply for Strategic HRBP openings on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 11. LEGAL, GOVERNANCE & TECH POLICY (Transitions 36 - 52)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'paralegal_to_tech_counsel',
    industry: 'Legal, Corporate Governance & Compliance',
    industryCategory: 'Legal, Governance & Tech Policy',
    currentRole: 'Legal Associate / Paralegal',
    targetRole: 'Corporate Tech Governance & Privacy Counsel',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.0,
    targetAvgCtcLakhs: 16.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['DPDP Act 2023 & GDPR Compliance', 'SaaS Master Services Agreement (MSA) Redlining', 'AI Licensing & Intellectual Property Governance', 'Corporate Compliance & Board Governance'],
    phases: [
      {
        title: 'Phase 1: Tech Contract Drafting & Commercial Terms',
        weeks: 'Weeks 1–5',
        focus: 'SLA formulation, limitation of liability, indemnification clauses, IP assignment in SaaS agreements.',
        milestones: ['Redline 3 high-value enterprise SaaS contracts with vendor pushback', 'Draft standard Master Services Agreement (MSA) and DPA template', 'Create negotiation playbook for risk allocations']
      },
      {
        title: 'Phase 2: Global Data Protection & Regulatory Audits',
        weeks: 'Weeks 6–11',
        focus: 'Data Protection Officer (DPO) duties, consent frameworks, cross-border data transfer mechanisms, DPIAs.',
        milestones: ['Conduct complete Data Protection Impact Assessment (DPIA) on a product', 'Design consent management architecture compliant with DPDP Act', 'Audit cloud infrastructure data processing agreements']
      },
      {
        title: 'Phase 3: AI Governance & Corporate Counsel Advisory',
        weeks: 'Weeks 12–16',
        focus: 'AI risk mitigation, copyright in generative outputs, whistleblower policies, board resolutions.',
        milestones: ['Publish corporate AI usage policy for enterprise employees', 'Draft mock board resolution for cross-border IP licensing', 'Apply to Corporate Counsel openings on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 12. CORE ENGINEERING, MANUFACTURING & INDUSTRIAL IOT (Transitions 37 - 55)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cad_to_smart_mfg',
    industry: 'Industrial Automation & Robotics',
    industryCategory: 'Core Engineering & Industrial IoT',
    currentRole: 'CAD Draftsman / Mechanical Engineer',
    targetRole: 'Smart Manufacturing & Industrial IoT Engineer',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 3.6,
    targetAvgCtcLakhs: 11.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['PLC Programming & SCADA (Siemens/Rockwell)', 'Industrial IoT Protocols (OPC-UA / MQTT)', 'Predictive Maintenance Analytics', 'Digital Twin Modeling'],
    phases: [
      {
        title: 'Phase 1: Industrial Automation & PLC Logic',
        weeks: 'Weeks 1–4',
        focus: 'Ladder logic, functional block diagrams, HMI design, sensor interfacing, safety interlocks.',
        milestones: ['Program automated conveyor sorting sequence in Siemens TIA Portal', 'Design SCADA visual dashboard monitoring line temperature and pressure', 'Simulate emergency shutdown sequence complying with SIL-2 standards']
      },
      {
        title: 'Phase 2: Industrial IoT Edge Integration',
        weeks: 'Weeks 5–9',
        focus: 'OPC-UA server setup, edge gateways, MQTT publishing, time-series data storage.',
        milestones: ['Connect factory floor PLC telemetry to cloud IoT platform', 'Implement edge analytics detecting motor vibration anomalies', 'Build automated maintenance ticketing trigger via webhooks']
      },
      {
        title: 'Phase 3: Digital Twin & Smart Factory Deployment',
        weeks: 'Weeks 10–16',
        focus: 'Overall Equipment Effectiveness (OEE) tracking, digital twin simulation, factory energy auditing.',
        milestones: ['Deliver OEE optimization proposal boosting plant efficiency by 9%', 'Build real-time 3D digital twin dashboard of assembly line', 'Target Smart Manufacturing roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 13. ENERGY, CLEANTECH & OIL/GAS (Transitions 38 - 60)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'solar_tech_to_cleantech_consultant',
    industry: 'Renewable Energy & CleanTech',
    industryCategory: 'Energy, CleanTech & Oil/Gas',
    currentRole: 'Solar Site Engineer / Technician',
    targetRole: 'CleanTech & ESG Energy Transition Consultant',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.2,
    targetAvgCtcLakhs: 12.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['PVsyst Solar Modeling & Yield Analysis', 'ESG Reporting (GRI Standards / BRSR)', 'Carbon Credit Auditing & Carbon Accounting', 'Power Purchase Agreement (PPA) Structuring'],
    phases: [
      {
        title: 'Phase 1: Solar Simulation & Grid Integration',
        weeks: 'Weeks 1–4',
        focus: 'PVsyst yield simulation, shadow analysis, loss diagram optimization, battery energy storage (BESS).',
        milestones: ['Model 50MW utility-scale solar plant in PVsyst with P50/P90 yield estimates', 'Design DC/AC ratio and inverter configuration maximizing IRR', 'Evaluate battery storage sizing for peak-demand clipping']
      },
      {
        title: 'Phase 2: Carbon Accounting & BRSR Compliance',
        weeks: 'Weeks 5–8',
        focus: 'Scope 1, 2, and 3 greenhouse gas emissions, GHG Protocol, SEBI BRSR mandatory disclosures.',
        milestones: ['Perform corporate Scope 1 & 2 carbon footprint assessment for manufacturer', 'Draft complete SEBI BRSR Core sustainability report chapter', 'Formulate Science Based Targets (SBTi) net-zero roadmap']
      },
      {
        title: 'Phase 3: CleanTech PPA Structuring & Consulting',
        weeks: 'Weeks 9–14',
        focus: 'Open access solar regulations, group captive models, PPA tariff modeling, ESG investment pitch.',
        milestones: ['Structure financial model for ₹40 Cr Group Captive solar project', 'Deliver executive decarbonization pitch deck to corporate clients', 'Target CleanTech Consultant roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 14. TELECOM, 5G & SPACETECH (Transitions 39 - 65)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'rf_engineer_to_5g_core',
    industry: 'Telecommunications & 5G',
    industryCategory: 'Telecom, 5G & SpaceTech',
    currentRole: 'RF Drive Test / 4G Field Engineer',
    targetRole: '5G Core Network & Open-RAN Systems Architect',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 4.8,
    targetAvgCtcLakhs: 15.0,
    difficulty: 'Demanding',
    coreSkillGaps: ['5G Standalone (SA) Core Architecture (SBA)', 'Network Slicing & Quality of Service (QoS)', 'Open-RAN (O-RAN) Principles & DU/CU Split', 'Linux Virtualization & Telco Cloud (K8s)'],
    phases: [
      {
        title: 'Phase 1: 5G Core Architecture & Protocols',
        weeks: 'Weeks 1–4',
        focus: 'AMF, SMF, UPF network functions, HTTP/2 JSON REST interfaces, NAS signaling.',
        milestones: ['Deploy open-source 5G Core (Open5GS) on Kubernetes cluster', 'Trace complete 5G registration and PDU session establishment in Wireshark', 'Configure QoS flows for Ultra-Reliable Low-Latency Communication (URLLC)']
      },
      {
        title: 'Phase 2: Open-RAN & Telco Cloud Orchestration',
        weeks: 'Weeks 5–9',
        focus: 'O-RAN 7.2x split, Near-Real-Time RIC, xApps development, containerized CNFs.',
        milestones: ['Deploy containerized CU/DU network functions', 'Simulate private 5G network deployment for industrial warehouse', 'Test latency metrics under heavy network slicing load']
      },
      {
        title: 'Phase 3: Private 5G GTM & Carrier Integration',
        weeks: 'Weeks 10–16',
        focus: 'Carrier-grade SLAs, edge computing integration, zero-trust telco security.',
        milestones: ['Design end-to-end Private 5G enterprise architecture proposal', 'Deliver carrier network optimization presentation', 'Apply for 5G Core Architect roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 15. REAL ESTATE & INFRASTRUCTURE (Transitions 40 - 70)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'site_engineer_to_bim_manager',
    industry: 'Construction & Civil Infrastructure',
    industryCategory: 'Real Estate & Infrastructure',
    currentRole: 'Civil Site Engineer',
    targetRole: 'BIM (Building Information Modeling) Coordinator / Manager',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.5,
    targetAvgCtcLakhs: 11.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['Autodesk Revit & Navisworks', '4D/5D BIM Clash Detection', 'LOD 300/400 Detailing Standards', 'Common Data Environment (BIM 360 / ACC)'],
    phases: [
      {
        title: 'Phase 1: 3D Revit Modeling & Architectural Detailing',
        weeks: 'Weeks 1–4',
        focus: 'Parametric modeling in Revit, MEP coordination, family creation, structural framing.',
        milestones: ['Model multi-story commercial complex in Revit to LOD 300 accuracy', 'Generate automated Bill of Quantities (BOQ) from 3D model', 'Resolve architectural vs structural level discrepancies']
      },
      {
        title: 'Phase 2: Navisworks Clash Detection & 4D Scheduling',
        weeks: 'Weeks 5–8',
        focus: 'Hard vs soft clash detection, clash matrix development, linking Primavera/MS Project to 3D model for 4D simulation.',
        milestones: ['Conduct comprehensive clash test identifying 80+ MEP hard collisions', 'Create animated 4D construction sequencing simulation in Navisworks', 'Export actionable clash resolution reports for site contractors']
      },
      {
        title: 'Phase 3: Common Data Environment & BIM Execution Plan (BEP)',
        weeks: 'Weeks 9–14',
        focus: 'ISO 19650 standards, Autodesk Construction Cloud, drafting BIM Execution Plans for mega-projects.',
        milestones: ['Author complete BIM Execution Plan for commercial high-rise', 'Lead mock interdisciplinary design review coordination meeting', 'Target BIM Coordinator roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 16. MEDIA, GAMING & CONTENT (Transitions 41 - 75+)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'video_editor_to_3d_motion_director',
    industry: 'Media & Creative Direction',
    industryCategory: 'Media, Gaming & Content',
    currentRole: 'Video Editor (Premiere Pro)',
    targetRole: '3D Motion Design & VFX Art Director (Cinema 4D/Blender)',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 3.6,
    targetAvgCtcLakhs: 12.0,
    difficulty: 'Moderate',
    coreSkillGaps: ['Cinema 4D & Octane / Redshift Rendering', 'Blender Geometry Nodes & Procedural Modeling', 'After Effects Dynamic Compositing', 'Art Direction & Commercial Pitch Decks'],
    phases: [
      {
        title: 'Phase 1: 3D Procedural Modeling & Lighting',
        weeks: 'Weeks 1–4',
        focus: 'Cinema 4D Mograph, procedural modeling in Blender, 3-point studio lighting, PBR material creation.',
        milestones: ['Model and render high-fidelity commercial consumer product commercial', 'Master physics simulations (cloth, rigid body, fluid dynamics)', 'Build library of custom Octane/Redshift shaders']
      },
      {
        title: 'Phase 2: Dynamic Motion Design & Camera Rigging',
        weeks: 'Weeks 5–9',
        focus: 'Kinetic typography, seamless camera transitions, procedural geometry node motion, sound design sync.',
        milestones: ['Direct and animate 30-second commercial brand teaser', 'Composite render passes in After Effects with color grading', 'Integrate procedural motion synced to audio waveforms']
      },
      {
        title: 'Phase 3: Showreel Production & Creative Leadership',
        weeks: 'Weeks 10–16',
        focus: 'Curating world-class motion design reel, pricing commercial production, client treatment decks.',
        milestones: ['Publish high-impact 60-second 3D motion design showreel', 'Create client creative pitch deck for tech product launch', 'Apply for 3D Motion Director roles on JobMatch OS']
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 17. SENIOR & EXECUTIVE CAREER MOVES (User Specific Use-Cases)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'hr_manager_to_vp_people',
    industry: 'Human Resources & Executive Leadership',
    industryCategory: 'HR, People Ops & Talent',
    currentRole: 'HR Manager (Current CTC: ₹10L)',
    targetRole: 'VP of People & Culture / Chief People Officer (CPO)',
    timeEstimateMonths: 4.5,
    currentAvgCtcLakhs: 10.0,
    targetAvgCtcLakhs: 28.0,
    difficulty: 'High Impact',
    coreSkillGaps: [
      'Executive Compensation & ESOP Pool Architecture',
      'Strategic Workforce Planning & Attrition Predictive Modeling',
      'Board-Level Talent Governance & Succession Roadmaps',
      'Global People Analytics (Visier, Workday, Python/SQL)'
    ],
    phases: [
      {
        title: 'Phase 1: People Analytics & Predictive Workforce Planning',
        weeks: 'Weeks 1–5',
        focus: 'Data-driven talent acquisition, attrition modeling, employee lifetime value, executive compensation benchmarking.',
        milestones: [
          'Design executive headcount forecast for 500+ employees with revenue-per-employee ratios',
          'Build predictive turnover model identifying flight-risk leadership talent',
          'Benchmark ESOP and equity grants against top 50 Indian unicorns'
        ]
      },
      {
        title: 'Phase 2: Org Architecture & Leadership Performance Calibration',
        weeks: 'Weeks 6–11',
        focus: '9-box talent matrix calibration, executive coaching, high-performance OKRs, corporate restructuring.',
        milestones: [
          'Draft comprehensive C-Suite succession planning matrix for board presentation',
          'Restructure corporate grading and compensation bands across 8 functional verticals',
          'Deploy automated employee feedback and leadership 360-degree review framework'
        ]
      },
      {
        title: 'Phase 3: Board Governance, Culture & M&A Talent Integration',
        weeks: 'Weeks 12–18',
        focus: 'Compensation committee governance, culture due diligence in M&A, executive hiring defense.',
        milestones: [
          'Formulate charter for Board Compensation & Human Resources Committee',
          'Author M&A cultural integration playbook minimizing key talent attrition post-acquisition',
          'Target VP of People and CPO mandates on JobMatch OS executive network'
        ]
      }
    ]
  },
  {
    id: 'vp_sales_to_cro',
    industry: 'Enterprise B2B & Revenue Leadership',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'VP of Sales (Current CTC: ₹28L)',
    targetRole: 'Chief Revenue Officer (CRO) / Global Commercial Lead',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 28.0,
    targetAvgCtcLakhs: 72.0,
    difficulty: 'High Impact',
    coreSkillGaps: [
      'Unified Revenue Architecture (Marketing + Sales + Customer Success)',
      'Multi-Territory Global GTM Expansion (US, EMEA & APAC)',
      'Board & Investor Revenue Metrics (NDR > 130%, CAC Payback < 12m, Rule of 40)',
      'Strategic Channel Alliances & Global System Integrators (GSIs)'
    ],
    phases: [
      {
        title: 'Phase 1: Unified Revenue Engine & Funnel Architecture',
        weeks: 'Weeks 1–6',
        focus: 'Aligning Sales, Marketing demand-gen, and Customer Success retention into a single predictable ARR flywheel.',
        milestones: [
          'Build linked revenue model integrating lead generation, ACV growth, and net revenue retention (NRR)',
          'Eliminate departmental pipeline attribution friction between Sales and Marketing',
          'Institute MEDDPICC deal governance across $100K+ enterprise opportunities'
        ]
      },
      {
        title: 'Phase 2: Global GTM Expansion & Enterprise Channel Ecosystem',
        weeks: 'Weeks 7–13',
        focus: 'Setting up US/EMEA sales entities, co-selling with AWS/Microsoft/Google Cloud, GSI partnerships.',
        milestones: [
          'Structure revenue-share partnership agreements with 3 tier-1 Global System Integrators',
          'Launch US enterprise sales pod generating first $1M in cross-border ARR',
          'Optimize compensation commission plans aligning AE incentives with multi-year contract renewals'
        ]
      },
      {
        title: 'Phase 3: Board-Level Revenue Governance & Capital Markets',
        weeks: 'Weeks 14–20',
        focus: 'Board deck reporting, investor presentations for Series C/D/Pre-IPO, gross margin preservation.',
        milestones: [
          'Deliver executive board presentation demonstrating clear trajectory toward Rule of 40',
          'Architect customer expansion playbooks driving 135% Net Retention Rate',
          'Target CRO mandates on JobMatch OS executive board network'
        ]
      }
    ]
  },
  {
    id: 'sales_manager_to_director',
    industry: 'Sales & Enterprise BD',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'Regional Sales Manager (Current CTC: ₹12L)',
    targetRole: 'Director of Enterprise Sales & Global Accounts',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 12.0,
    targetAvgCtcLakhs: 32.0,
    difficulty: 'High Impact',
    coreSkillGaps: [
      'Territory Planning & Quota Allocation Architecture',
      'Complex B2B Negotiation with Enterprise Procurement & Legal',
      'Sales Leadership Coaching & AE Ramp-Up Optimization',
      'Strategic Account Management (ABM Strategy)'
    ],
    phases: [
      {
        title: 'Phase 1: Territory Strategy & Pipeline Science',
        weeks: 'Weeks 1–4',
        focus: 'Total Addressable Market segmentation, ICP refinement, quota capacity planning.',
        milestones: [
          'Design annual sales territory plan targeting 100 Fortune 500 accounts',
          'Shorten sales cycle from 9 months to 5 months via structured champion enablement',
          'Implement stage-gate pipeline review rituals identifying phantom deals'
        ]
      },
      {
        title: 'Phase 2: Team Scaling & Rep Ramp Acceleration',
        weeks: 'Weeks 5–9',
        focus: 'Hiring, onboarding playbook, deal shadow sessions, performance calibration.',
        milestones: [
          'Reduce new Account Executive ramp-up timeline from 6 months to 80 days',
          'Run simulated negotiation workshop with stubborn enterprise procurement team',
          'Achieve 115% quarterly quota attainment across sales pod'
        ]
      },
      {
        title: 'Phase 3: Executive Account Expansion & Strategic Closures',
        weeks: 'Weeks 10–16',
        focus: 'C-Suite executive sponsor relationships, multi-year multi-million contracts.',
        milestones: [
          'Close ₹1.5 Cr annual enterprise contract with multi-year commitments',
          'Author repeatable Enterprise Sales Playbook for the organization',
          'Apply for Director of Enterprise Sales positions on JobMatch OS'
        ]
      }
    ]
  },
  {
    id: 'finance_manager_to_cfo',
    industry: 'Corporate Finance & Executive Leadership',
    industryCategory: 'CA, Audit & Accounting',
    currentRole: 'Finance Manager / Senior CA (Current CTC: ₹14L)',
    targetRole: 'Chief Financial Officer (CFO) & Head of Corporate Strategy',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 14.0,
    targetAvgCtcLakhs: 42.0,
    difficulty: 'High Impact',
    coreSkillGaps: [
      'Treasury, Capital Allocation & Debt/Equity Structuring',
      'Investor Relations, Cap Table Modeling & Fundraise Diligence',
      'ERP Digital Transformation & Global Tax Optimization (BEPS Pillar Two)',
      'Board Financial Presentations & Enterprise Risk Management (ERM)'
    ],
    phases: [
      {
        title: 'Phase 1: Capital Structure & Liquidity Optimization',
        weeks: 'Weeks 1–6',
        focus: 'Optimizing weighted average cost of capital (WACC), debt syndication, working capital optimization.',
        milestones: [
          'Build dynamic capital structure model optimizing debt-equity mix for expansion',
          'Negotiate revolving credit facility lowering effective borrowing interest by 120 bps',
          'Implement real-time treasury management dashboard tracking multi-currency liquidity'
        ]
      },
      {
        title: 'Phase 2: Investor Relations & Financial Storytelling',
        weeks: 'Weeks 7–13',
        focus: 'Data room management, investor diligence defense, enterprise valuation modeling.',
        milestones: [
          'Prepare comprehensive virtual data room (VDR) for institutional equity round',
          'Build long-term 5-year operating model with sensitivity and scenario switches',
          'Defend enterprise EBITDA quality before institutional private equity analysts'
        ]
      },
      {
        title: 'Phase 3: Board Governance, Audit Committee & IPO Readiness',
        weeks: 'Weeks 14–20',
        focus: 'SOX/Internal Financial Controls (IFC), audit committee stewardship, public market readiness.',
        milestones: [
          'Lead quarterly board audit committee session reviewing enterprise risk matrix',
          'Institute IPO-readiness internal financial controls and ESG reporting',
          'Target CFO mandates on JobMatch OS executive network'
        ]
      }
    ]
  },

// Dynamic Custom Career Transition Generator
// Allows any professional (e.g. HR Manager with ₹10L salary, VP of Sales, Doctor, Engineer)
// to generate an authentic, fully personalized career transition roadmap with actionable milestones!

  // ── MULTI-INDUSTRY & EXECUTIVE EXPANSION (HR, SALES, FINANCE, HEALTHCARE, SCM, LEGAL, CORE ENG) ──
  {
  id: 'hr_exec_to_talent_acq_lead',
  industry: 'Talent Acquisition & Sourcing',
  industryCategory: 'HR, People Ops & Talent',
  currentRole: 'HR Executive',
  targetRole: 'Talent Acquisition Lead',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 4.2,
  targetAvgCtcLakhs: 12,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Hyderabad',
    'Pune'
  ],
  coreSkillGaps: [
    'Executive Technical Sourcing',
    'ATS Automation & Pipeline Metrics',
    'Candidate Experience Engineering',
    'Employer Value Proposition (EVP)'
  ],
  phases: [
    {
      title: 'Phase 1: Advanced Sourcing & Boolean Mastery',
      weeks: 'Weeks 1–4',
      focus: 'X-Ray search techniques, GitHub/LinkedIn talent mapping, ATS workflow optimization.',
      milestones: [
        'Build outbound talent pipelines for 10 niche senior roles',
        'Implement automated screening workflows reducing time-to-first-interview by 40%'
      ]
    },
    {
      title: 'Phase 2: Data-Driven Recruitment Metrics',
      weeks: 'Weeks 5–9',
      focus: 'Cost-per-hire, offer-to-join ratio, diversity sourcing diagnostics, hiring manager SLAs.',
      milestones: [
        'Present talent market availability landscape for critical quarterly hiring plan',
        'Establish structured candidate rubric and structured interview loops'
      ]
    },
    {
      title: 'Phase 3: Lead TA Positioning & Recruiter OS',
      weeks: 'Weeks 10–14',
      focus: 'Employer branding campaigns, talent pipelining, executive dispatch.',
      milestones: [
        'Complete 5 simulated recruiter leadership behavioral rounds',
        'Connect with 20+ scaling tech startups hiring TA Leads on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'hr_generalist_to_comp_benefits',
  industry: 'Total Rewards & Comp Analytics',
  industryCategory: 'HR, People Ops & Talent',
  currentRole: 'HR Generalist',
  targetRole: 'Comp & Benefits (Total Rewards) Lead',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 16.5,
  difficulty: 'Demanding',
  experienceLevel: 'mid',
  topLocations: [
    'Gurugram',
    'Bengaluru',
    'Mumbai',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Mercer / Aon Radford Benchmarking',
    'ESOP & LTI Plan Modeling',
    'Executive Compensation Structuring',
    'Benefits Cost Optimization'
  ],
  phases: [
    {
      title: 'Phase 1: Salary Survey Analysis & Grading Matrices',
      weeks: 'Weeks 1–5',
      focus: 'Job evaluation models (Hay Group), salary band creation, compa-ratio diagnostics.',
      milestones: [
        'Design comprehensive 8-level salary grading band for 500-person organization',
        'Conduct market gap analysis against Aon compensation surveys'
      ]
    },
    {
      title: 'Phase 2: Long-Term Incentives & ESOP Governance',
      weeks: 'Weeks 6–11',
      focus: 'Vesting schedules, cap table equity modeling, phantom stock, tax implications.',
      milestones: [
        'Model multi-tier ESOP policy with 4-year vesting and liquidity event clauses',
        'Present corporate health insurance benefits cost-benefit optimization'
      ]
    },
    {
      title: 'Phase 3: Total Rewards Strategy & Board Defense',
      weeks: 'Weeks 12–16',
      focus: 'Remuneration committee preparation, executive retention frameworks.',
      milestones: [
        'Draft board remuneration proposal for senior leadership talent retention',
        'Target Top-Tier MNC Total Rewards openings'
      ]
    }
  ]
},
  {
  id: 'people_ops_to_chief_people_officer',
  industry: 'Executive HR Leadership',
  industryCategory: 'HR, People Ops & Talent',
  currentRole: 'People Operations Lead',
  targetRole: 'Chief People Officer (CPO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 14,
  targetAvgCtcLakhs: 55,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Dubai / UAE',
    'London / Remote'
  ],
  coreSkillGaps: [
    'Board Governance & RemCo Advisory',
    'Enterprise M&A Cultural Integration',
    'Organizational Design & Headcount Modeling',
    'Global Distributed Workforce Policy'
  ],
  phases: [
    {
      title: 'Phase 1: Strategic Workforce Architecture',
      weeks: 'Weeks 1–6',
      focus: 'Macro org structuring, span-of-control optimization, headcount burn forecasting.',
      milestones: [
        'Deliver 3-year enterprise headcount & talent cost forecast to Executive Committee',
        'Author cross-border global employment contract framework'
      ]
    },
    {
      title: 'Phase 2: Executive Culture & M&A Due Diligence',
      weeks: 'Weeks 7–14',
      focus: 'Post-merger people integration, executive compensation, leadership succession pipelines.',
      milestones: [
        'Lead simulated M&A HR due diligence audit covering 350-employee acquisition',
        'Deploy comprehensive 9-box executive succession matrix'
      ]
    },
    {
      title: 'Phase 3: C-Suite Interview Readiness & Board Advisory',
      weeks: 'Weeks 15–20',
      focus: 'Investor pitching, founder alignment, CPO priority recruiter search.',
      milestones: [
        'Complete board-level presentation simulation on culture vs EBITDA delivery',
        'Direct outreach to venture & private equity partner talent desks'
      ]
    }
  ]
},
  {
  id: 'technical_recruiter_to_head_talent',
  industry: 'Strategic Talent Sourcing',
  industryCategory: 'HR, People Ops & Talent',
  currentRole: 'Technical Recruiter',
  targetRole: 'Head of Global Talent Sourcing',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 24,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Hyderabad',
    'Bengaluru',
    'Noida',
    'Singapore'
  ],
  coreSkillGaps: [
    'Global Sourcing Operations',
    'Recruitment Tech Stack Architecture',
    'Agency Vendor Governance',
    'Executive Search Methodology'
  ],
  phases: [
    {
      title: 'Phase 1: Tech Stack Optimization',
      weeks: 'Weeks 1–5',
      focus: 'AI matching tools, outbound CRM systems, ATS integrations.',
      milestones: [
        'Evaluate and implement modern AI sourcing platforms',
        'Establish agency cost containment and preferred partner tiers'
      ]
    },
    {
      title: 'Phase 2: Global Sourcing Command',
      weeks: 'Weeks 6–11',
      focus: 'Offshore development center (ODC) staffing, GCC expansion talent mapping.',
      milestones: [
        'Build hiring roadmap for 150-engineer Global Capability Center (GCC)',
        'Reduce blended agency dependency from 40% to 8%'
      ]
    },
    {
      title: 'Phase 3: Leadership Placement Loops',
      weeks: 'Weeks 12–16',
      focus: 'VP-level tech executive closures, recruiter performance management.',
      milestones: [
        'Close 3 director-level engineering positions directly',
        'Activate Head of Talent search loop across high-growth startups'
      ]
    }
  ]
},
  {
  id: 'hr_analyst_to_people_analytics_lead',
  industry: 'People Analytics & Workforce Intelligence',
  industryCategory: 'HR, People Ops & Talent',
  currentRole: 'HR Data Analyst',
  targetRole: 'Lead People Analytics Architect',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6.5,
  targetAvgCtcLakhs: 22,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Gurugram',
    'Remote'
  ],
  coreSkillGaps: [
    'Predictive Attrition Modeling',
    'Visier & PowerBI HR Dashboards',
    'Workday / SuccessFactors Data Pipelines',
    'DEI & Pay Equity Statistical Audits'
  ],
  phases: [
    {
      title: 'Phase 1: Predictive HR Data Pipelines',
      weeks: 'Weeks 1–5',
      focus: 'Python, SQL, survival analysis, early attrition risk predictors.',
      milestones: [
        'Deploy machine learning model predicting 90-day employee departure probability',
        'Automate monthly executive talent dashboard in PowerBI'
      ]
    },
    {
      title: 'Phase 2: Pay Equity & Org Network Analysis (ONA)',
      weeks: 'Weeks 6–11',
      focus: 'Gender & level pay parity regressions, Slack/Teams collaboration network graph analysis.',
      milestones: [
        'Complete statistically defensible global pay parity audit',
        'Map informal influence networks to identify cross-departmental bottlenecks'
      ]
    },
    {
      title: 'Phase 3: Executive Strategic Workforce Planning',
      weeks: 'Weeks 12–16',
      focus: 'Linking people data to EBITDA and enterprise customer retention metrics.',
      milestones: [
        'Deliver ROI study linking employee tenure to sales quota attainment',
        'Apply to People Analytics Lead roles across Tier-1 GCCs'
      ]
    }
  ]
},
  {
  id: 'bdr_to_sales_enablement',
  industry: 'Sales Enablement & Revenue Operations',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Inside Sales Specialist',
  targetRole: 'Head of Global Sales Enablement',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 4.5,
  targetAvgCtcLakhs: 17,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Delhi-NCR',
    'Pune',
    'Singapore'
  ],
  coreSkillGaps: [
    'MEDDPICC & Challenger Sales Methodologies',
    'LMS Sales Certification Architecture',
    'GTM Playbook Authoring',
    'Win/Loss Forensic Diagnostics'
  ],
  phases: [
    {
      title: 'Phase 1: Sales Playbook & Onboarding Frameworks',
      weeks: 'Weeks 1–4',
      focus: 'Rep ramp-time acceleration, call analysis (Gong), pitch deck auditing.',
      milestones: [
        'Author 40-page enterprise sales playbook for core product lines',
        'Reduce new rep ramp time from 90 days to 45 days'
      ]
    },
    {
      title: 'Phase 2: Deal Inspection & Coaching Programs',
      weeks: 'Weeks 5–9',
      focus: 'MEDDPICC inspection rubrics, objection handling bootcamps, competitive battlecards.',
      milestones: [
        'Deploy interactive objection-handling simulator for 20 account executives',
        'Publish 5 competitive battlecards increasing deal win rates by 18%'
      ]
    },
    {
      title: 'Phase 3: Global Revenue Enablement Leadership',
      weeks: 'Weeks 10–14',
      focus: 'Sales enablement tech stack, executive stakeholder reporting.',
      milestones: [
        'Present enablement ROI metrics to Chief Commercial Officer',
        'Target enterprise enablement openings on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'channel_sales_to_alliances_head',
  industry: 'Strategic Alliances & Channel Ecosystems',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Channel Partner Executive',
  targetRole: 'Director of Strategic Alliances & Ecosystem',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 8,
  targetAvgCtcLakhs: 29,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Gurugram',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Hyperscaler Co-Sell Models (AWS, Azure, Google Cloud)',
    'System Integrator Partnerships (TCS, Infosys, Wipro)',
    'Joint GTM Revenue Sharing Architecture',
    'Ecosystem Partner Contracting'
  ],
  phases: [
    {
      title: 'Phase 1: Hyperscaler & Cloud Marketplace Integration',
      weeks: 'Weeks 1–6',
      focus: 'AWS ISV Accelerate, Azure IP Co-Sell, marketplace transaction mechanics.',
      milestones: [
        'List enterprise solution on AWS Marketplace with private offer functionality',
        'Achieve AWS / Azure co-sell ready tier status'
      ]
    },
    {
      title: 'Phase 2: Global System Integrator (GSI) Practice Building',
      weeks: 'Weeks 7–12',
      focus: 'Incentive structures, center-of-excellence setup, joint pipeline creation.',
      milestones: [
        'Establish joint practice with Tier-1 GSI generating ₹15Cr qualified pipeline',
        'Formulate partner tiering rubric with margin rebates and MDF budgets'
      ]
    },
    {
      title: 'Phase 3: Ecosystem Revenue Governance',
      weeks: 'Weeks 13–18',
      focus: 'Board pipeline reporting, partner conflict resolution, alliance leadership.',
      milestones: [
        'Deliver partner-influenced ARR model accounting for 35% of total bookings',
        'Execute executive outreach to Global Alliances Director roles'
      ]
    }
  ]
},
  {
  id: 'retail_store_mgr_to_national_retail_head',
  industry: 'Omnichannel Retail & Store Operations',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Retail Store Manager',
  targetRole: 'National Retail Operations Head',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5,
  targetAvgCtcLakhs: 24,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Bengaluru',
    'Ahmedabad'
  ],
  coreSkillGaps: [
    'Multi-Store P&L Management',
    'Omnichannel Inventory Synchronization',
    'Visual Merchandising Standards',
    'Retail Shrinkage & Loss Prevention Controls'
  ],
  phases: [
    {
      title: 'Phase 1: Cluster & Regional P&L Governance',
      weeks: 'Weeks 1–5',
      focus: 'Revenue per sq.ft, footfall-to-conversion rates, staff scheduling optimization.',
      milestones: [
        'Audit 12 store P&Ls identifying ₹80L in inventory holding cost savings',
        'Implement dynamic staffing roster aligned with hourly footfall analytics'
      ]
    },
    {
      title: 'Phase 2: Omnichannel Fulfillment & BOPIS Operations',
      weeks: 'Weeks 6–11',
      focus: 'Buy-Online-Pickup-In-Store, store-level rapid delivery, POS digital migration.',
      milestones: [
        'Roll out ship-from-store protocol across 25 regional outlets',
        'Reduce inventory shrinkage to under 0.8% through RFID and audit protocols'
      ]
    },
    {
      title: 'Phase 3: National Footprint Expansion & Strategy',
      weeks: 'Weeks 12–16',
      focus: 'New store rollout feasibility studies, franchise operations agreements.',
      milestones: [
        'Develop 50-store expansion model including capex and payback calculations',
        'Interview for VP/Head of Retail Operations with national brands'
      ]
    }
  ]
},
  {
  id: 'sales_engineer_to_vp_solutions',
  industry: 'Enterprise Solutions Architecture & Pre-Sales',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Pre-Sales Solutions Engineer',
  targetRole: 'VP of Global Solutions Consulting',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 12,
  targetAvgCtcLakhs: 38,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Dubai / UAE',
    'US / Remote'
  ],
  coreSkillGaps: [
    'Multi-Million Dollar Deal RFP Architecture',
    'Executive C-Suite Technical Defense',
    'Global Pre-Sales Team Scaling',
    'POC-to-Production Conversion Engineering'
  ],
  phases: [
    {
      title: 'Phase 1: High-Stakes RFP & Security Diligence Architecture',
      weeks: 'Weeks 1–6',
      focus: 'SOC2/ISO compliance answers, enterprise technical objection elimination, rapid POCs.',
      milestones: [
        'Lead technical winning bid on ₹20Cr government or banking RFP',
        'Standardize cloud demo environments cutting spin-up time by 80%'
      ]
    },
    {
      title: 'Phase 2: Commercial & Technical Alignment',
      weeks: 'Weeks 7–14',
      focus: 'Value engineering, business case ROI calculations for Fortune 500 CIOs.',
      milestones: [
        'Build quantifiable business value model demonstrating 3.2x ROI for enterprise client',
        'Manage global pre-sales coverage matrix across APAC, EMEA, and Americas'
      ]
    },
    {
      title: 'Phase 3: Executive Solutions Leadership Positioning',
      weeks: 'Weeks 15–20',
      focus: 'VP-level executive interview simulations, global customer advisory board setup.',
      milestones: [
        'Deliver keynote-grade technical vision pitch to mock enterprise board',
        'Direct dispatch to high-growth SaaS enterprise solutions mandates'
      ]
    }
  ]
},
  {
  id: 'junior_accountant_to_senior_fpa',
  industry: 'Corporate Financial Planning & Analysis',
  industryCategory: 'Corporate Finance, CA & Audit',
  currentRole: 'Junior Accountant',
  targetRole: 'Senior FP&A Analyst',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.5,
  targetAvgCtcLakhs: 10.5,
  difficulty: 'Moderate',
  experienceLevel: 'fresher',
  topLocations: [
    'Gurugram',
    'Bengaluru',
    'Mumbai',
    'Pune',
    'Indore'
  ],
  coreSkillGaps: [
    'Three-Statement Financial Modeling',
    'Variance & Rolling Forecast Analysis',
    'Anaplan / Hyperion / PowerBI Integration',
    'EBITDA Bridge Formulation'
  ],
  phases: [
    {
      title: 'Phase 1: Dynamic 3-Statement Modeling in Excel',
      weeks: 'Weeks 1–4',
      focus: 'Linking P&L, balance sheet, and cash flow with dynamic scenario switches.',
      milestones: [
        'Build error-free 3-statement integrated financial model from scratch',
        'Automate monthly variance analysis reporting across 5 business units'
      ]
    },
    {
      title: 'Phase 2: Budgeting, Rolling Forecasts & KPI Dashboards',
      weeks: 'Weeks 5–9',
      focus: 'Opex/Capex planning, departmental budget sign-offs, revenue driver modeling.',
      milestones: [
        'Author annual opex budget model for 300-employee division',
        'Build dynamic EBITDA bridge analyzing volume, price, and mix effects'
      ]
    },
    {
      title: 'Phase 3: Business Partnering & Interview Prep',
      weeks: 'Weeks 10–14',
      focus: 'Storytelling with financial data, executive presentation design.',
      milestones: [
        'Deliver mock business unit performance presentation to CFO',
        'Apply to Tier-1 MNC and high-growth startup FP&A roles'
      ]
    }
  ]
},
  {
  id: 'stat_auditor_to_internal_controls_head',
  industry: 'Internal Financial Controls & Sox Advisory',
  industryCategory: 'Corporate Finance, CA & Audit',
  currentRole: 'Statutory Auditor / CA',
  targetRole: 'Head of Internal Controls & SOX Compliance',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 9,
  targetAvgCtcLakhs: 24,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Bengaluru',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Internal Financial Controls (IFC) Frameworks',
    'COSO 2013 Governance Standards',
    'Risk and Control Matrices (RCM)',
    'Fraud Risk Assessment & Forensic Auditing'
  ],
  phases: [
    {
      title: 'Phase 1: Enterprise Risk & Control Matrix Engineering',
      weeks: 'Weeks 1–5',
      focus: 'Process flowcharts, key controls identification, walkthrough testing.',
      milestones: [
        'Author end-to-end Risk & Control Matrix for Order-to-Cash and Procure-to-Pay',
        'Design remediation plan for 15 identified control deficiencies'
      ]
    },
    {
      title: 'Phase 2: IT General Controls (ITGC) & Automated Testing',
      weeks: 'Weeks 6–11',
      focus: 'Access controls, change management controls, SOD (Segregation of Duties) analytics.',
      milestones: [
        'Audit ERP segregation of duties resolving high-risk user privilege conflicts',
        'Implement automated continuous controls monitoring scripts'
      ]
    },
    {
      title: 'Phase 3: Audit Committee Presentation & Strategic Leadership',
      weeks: 'Weeks 12–16',
      focus: 'Audit committee reporting, managing external Big 4 SOX auditors.',
      milestones: [
        'Draft comprehensive internal controls annual report for Board Audit Committee',
        'Connect with leading enterprise recruiters hiring Governance Heads'
      ]
    }
  ]
},
  {
  id: 'private_wealth_to_family_office_cio',
  industry: 'Ultra-High-Net-Worth Family Office & Asset Management',
  industryCategory: 'Corporate Finance, CA & Audit',
  currentRole: 'Wealth Relationship Manager',
  targetRole: 'Family Office Chief Investment Officer (CIO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 8,
  targetAvgCtcLakhs: 50,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Dubai / UAE',
    'Singapore'
  ],
  coreSkillGaps: [
    'Multi-Asset Class Portfolio Allocation',
    'Private Equity & Venture Co-Investment Diligence',
    'Offshore Trust & Succession Structuring',
    'Direct Real Estate & Alternative Investments'
  ],
  phases: [
    {
      title: 'Phase 1: Institutional Asset Allocation & Risk Budgeting',
      weeks: 'Weeks 1–6',
      focus: 'Modern portfolio theory, private credit underwriting, currency hedging strategies.',
      milestones: [
        'Design ₹250Cr multi-asset portfolio with public equities, private debt, and gold hedge',
        'Establish quantitative drawdown protection framework'
      ]
    },
    {
      title: 'Phase 2: Direct Deal Sourcing & Private Equity Underwriting',
      weeks: 'Weeks 7–14',
      focus: 'Term sheet negotiation, minority investor rights, cap table liquidation waterfall.',
      milestones: [
        'Underwrite direct Series-B co-investment opportunity and author investment memo',
        'Negotiate side-letter agreements and information rights'
      ]
    },
    {
      title: 'Phase 3: Cross-Border Tax & Succession Governance',
      weeks: 'Weeks 15–20',
      focus: 'DIFC / ADGM foundation setup, family constitution, wealth preservation.',
      milestones: [
        'Present comprehensive family governance charter to principal family office board',
        'Target top-tier single and multi-family office leadership roles'
      ]
    }
  ]
},
  {
  id: 'medical_rep_to_product_manager',
  industry: 'Pharmaceutical Brand & Marketing Management',
  industryCategory: 'Healthcare, Pharma & Biotech',
  currentRole: 'Medical Representative',
  targetRole: 'Pharma Brand Product Manager (PMT)',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.8,
  targetAvgCtcLakhs: 14,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Mumbai',
    'Ahmedabad',
    'Hyderabad',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Therapeutic Area Strategy & KOL Engagement',
    'Pharma Brand Launch Playbooks',
    'Doctor Detailing Storyboards & Visual Aids',
    'Field Force Training & Prescription Audits (IMS/IQVIA)'
  ],
  phases: [
    {
      title: 'Phase 1: IQVIA Data Diagnostics & Market Share Analysis',
      weeks: 'Weeks 1–4',
      focus: 'Prescription trends, secondary sales tracking, competitor therapeutic mapping.',
      milestones: [
        'Analyze IQVIA prescription dataset identifying under-penetrated specialty doctor segments',
        'Develop scientific detailing story for flagship cardiovascular formulation'
      ]
    },
    {
      title: 'Phase 2: Omnichannel Healthcare Professional Engagement',
      weeks: 'Weeks 5–9',
      focus: 'Continuous medical education (CME) webinars, digital detailing apps, advisory boards.',
      milestones: [
        'Design national CME conference curriculum engaging 250 top key opinion leaders (KOLs)',
        'Create digital field force training module improving message retention by 35%'
      ]
    },
    {
      title: 'Phase 3: New Product Launch & Brand P&L Mastery',
      weeks: 'Weeks 10–14',
      focus: 'P&L management, pricing strategies under DPCO, brand launch execution.',
      milestones: [
        'Formulate ₹12Cr new molecule launch strategy with 12-month ROI model',
        'Target Brand Manager interviews with leading pharma MNCs on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'healthcare_admin_to_hospital_coo',
  industry: 'Hospital Administration & Clinical Operations',
  industryCategory: 'Healthcare, Pharma & Biotech',
  currentRole: 'Hospital Operations Executive',
  targetRole: 'Hospital Chief Operating Officer (COO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 38,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Chennai',
    'Bengaluru',
    'Delhi-NCR',
    'Kochi',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'NABH / JCI Accreditation Standards',
    'Hospital Occupancy & Bed Turnover Optimization',
    'Doctor Revenue Sharing & Specialty Department P&L',
    'Emergency Triage & Surgical Suite Efficiency'
  ],
  phases: [
    {
      title: 'Phase 1: Clinical Bed Turnover & OT Utilization',
      weeks: 'Weeks 1–6',
      focus: 'Average length of stay (ALOS) reduction, operation theater (OT) block scheduling.',
      milestones: [
        'Reduce elective surgery prep turnaround time by 30% through standardized clinical pathways',
        'Optimize bed occupancy rates from 68% to 84% in 350-bed tertiary facility'
      ]
    },
    {
      title: 'Phase 2: Accreditation & High-Value Specialty P&L',
      weeks: 'Weeks 7–14',
      focus: 'NABH 5th edition audits, medical equipment capex payback (PET-CT/Cath Lab).',
      milestones: [
        'Lead comprehensive hospital-wide quality audit achieving zero non-conformances',
        'Restructure oncology department operations delivering ₹4.5Cr EBITDA improvement'
      ]
    },
    {
      title: 'Phase 3: Healthcare Executive Leadership Loops',
      weeks: 'Weeks 15–20',
      focus: 'Hospital board presentations, doctor retention frameworks, COO search.',
      milestones: [
        'Present 3-year multi-specialty expansion plan to hospital governing board',
        'Priority interview routing for Regional Hospital COO positions'
      ]
    }
  ]
},
  {
  id: 'warehouse_supervisor_to_demand_planner',
  industry: 'Supply Chain Planning & Inventory Optimization',
  industryCategory: 'Supply Chain, Logistics & Maritime',
  currentRole: 'Warehouse Operations Supervisor',
  targetRole: 'Global Demand & Inventory Planner',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4.2,
  targetAvgCtcLakhs: 12.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Mumbai',
    'Bhiwandi',
    'Delhi-NCR',
    'Pune',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Statistical Forecasting (ARIMA / Holt-Winters)',
    'Sales & Operations Planning (S&OP) Cadence',
    'Safety Stock & Economic Order Quantity (EOQ)',
    'ERP SCM Modules (SAP IBP / Blue Yonder)'
  ],
  phases: [
    {
      title: 'Phase 1: Demand Forecasting Models & Seasonality',
      weeks: 'Weeks 1–5',
      focus: 'Historical demand cleansing, baseline forecasting, promotional lift estimation.',
      milestones: [
        'Build automated forecast model in Excel/Python improving forecast accuracy from 72% to 88%',
        'Establish ABC-XYZ inventory classification across 2,000 SKUs'
      ]
    },
    {
      title: 'Phase 2: Cross-Functional S&OP Execution',
      weeks: 'Weeks 6–11',
      focus: 'Aligning sales forecasts with production capacity, supplier lead-time buffers.',
      milestones: [
        'Lead simulated monthly S&OP consensus meeting resolving critical raw material shortages',
        'Reduce overall working capital tied in slow-moving stock by ₹1.8Cr'
      ]
    },
    {
      title: 'Phase 3: Enterprise Supply Chain Interviews',
      weeks: 'Weeks 12–16',
      focus: 'SAP IBP certification, supply chain risk management case interviews.',
      milestones: [
        'Complete 5 demand planning business case simulations for FMCG and retail employers',
        'Apply to verified Demand Planner openings on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'procurement_exec_to_chief_procurement_officer',
  industry: 'Strategic Sourcing & Vendor Management',
  industryCategory: 'Supply Chain, Logistics & Maritime',
  currentRole: 'Procurement Buyer',
  targetRole: 'Chief Procurement Officer (CPO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 6.5,
  targetAvgCtcLakhs: 48,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Gurugram',
    'Bengaluru',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Global Category Management Strategies',
    'Hedging Raw Material Volatility',
    'Supplier ESG Auditing & Scope 3 Emissions',
    'Multi-Million Dollar Contract Negotiations'
  ],
  phases: [
    {
      title: 'Phase 1: Spend Cube Analytics & Category Strategy',
      weeks: 'Weeks 1–6',
      focus: 'Spend visibility, direct vs indirect spend analysis, Kraljic portfolio matrix.',
      milestones: [
        'Audit ₹150Cr enterprise spend identifying 14% consolidation cost savings',
        'Design multi-sourcing strategy mitigating sole-supplier dependency risks'
      ]
    },
    {
      title: 'Phase 2: Global Supplier Governance & Sustainable Sourcing',
      weeks: 'Weeks 7–14',
      focus: 'Incoterms 2020, foreign exchange indexation, supplier ESG compliance.',
      milestones: [
        'Negotiate 3-year master supply agreements securing 8% volume rebate discounts',
        'Implement sustainable procurement framework tracking supplier carbon footprints'
      ]
    },
    {
      title: 'Phase 3: Executive Procurement Board Representation',
      weeks: 'Weeks 15–20',
      focus: 'CPO storytelling, supply chain resilience, executive search activation.',
      milestones: [
        'Present board-level supply chain resilience playbook for geopolitical shock scenarios',
        'Direct executive recruiter dispatch for Group CPO roles'
      ]
    }
  ]
},
  {
  id: 'junior_litigation_to_inhouse_counsel',
  industry: 'Corporate Commercial Legal Counsel',
  industryCategory: 'Legal, Governance & Tech Policy',
  currentRole: 'District Court Litigator',
  targetRole: 'In-House Corporate Commercial Counsel',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 4.5,
  targetAvgCtcLakhs: 15,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Delhi-NCR',
    'Mumbai',
    'Bengaluru',
    'Hyderabad'
  ],
  coreSkillGaps: [
    'SaaS Master Service Agreements (MSA) & SLAs',
    'Data Protection (DPDP Act & GDPR)',
    'Employment Law & Non-Compete Enforceability',
    'Vendor Risk & Indemnity Negotiations'
  ],
  phases: [
    {
      title: 'Phase 1: Commercial Contract Drafting & Negotiation',
      weeks: 'Weeks 1–4',
      focus: 'Limitation of liability, representations & warranties, IP assignment, data processing addenda.',
      milestones: [
        'Redline 15 complex B2B SaaS and enterprise vendor agreements',
        'Create standard corporate contract playbook with fallback clauses'
      ]
    },
    {
      title: 'Phase 2: Regulatory Compliance & Dispute Mitigation',
      weeks: 'Weeks 5–9',
      focus: 'Consumer protection laws, Indian Digital Personal Data Protection (DPDP) Act compliance.',
      milestones: [
        'Conduct privacy gap assessment under DPDP Act for consumer digital platform',
        'Institute internal pre-litigation notice resolution protocol'
      ]
    },
    {
      title: 'Phase 3: In-House Legal Interview Mastery',
      weeks: 'Weeks 10–14',
      focus: 'Balancing legal risk against business growth objectives in commercial tech.',
      milestones: [
        'Pass mock General Counsel interview evaluating risk appetite vs commercial speed',
        'Apply to Legal Counsel roles across tech MNCs and funded startups'
      ]
    }
  ]
},
  {
  id: 'compliance_assoc_to_chief_compliance_officer',
  industry: 'Enterprise Risk & Regulatory Affairs',
  industryCategory: 'Legal, Governance & Tech Policy',
  currentRole: 'Compliance Associate',
  targetRole: 'Chief Compliance & Ethics Officer (CCO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 45,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Dubai / UAE',
    'Singapore'
  ],
  coreSkillGaps: [
    'Anti-Money Laundering (AML) & Sanctions Compliance',
    'FCPA & Anti-Bribery Governance',
    'Whistleblower Investigations & Ethics Frameworks',
    'RBI / SEBI Regulatory Examination Readiness'
  ],
  phases: [
    {
      title: 'Phase 1: Enterprise Compliance Risk Assessment',
      weeks: 'Weeks 1–6',
      focus: 'Regulatory radar mapping, policy harmonization, institutional risk matrices.',
      milestones: [
        'Draft comprehensive enterprise compliance policy matrix across 8 regulatory bodies',
        'Design automated KYC and sanctions transaction screening architecture'
      ]
    },
    {
      title: 'Phase 2: Independent Investigations & Regulator Defense',
      weeks: 'Weeks 7–14',
      focus: 'Handling regulatory show-cause notices, forensics, audit committee reporting.',
      milestones: [
        'Lead simulated whistleblower forensic inquiry and author board report',
        'Prepare institutional defense for SEBI/RBI inspection audit'
      ]
    },
    {
      title: 'Phase 3: Chief Compliance Officer Executive Dispatch',
      weeks: 'Weeks 15–20',
      focus: 'Board ethics leadership, crisis management, executive talent matchmaking.',
      milestones: [
        'Present ethical governance framework for board-level risk committees',
        'Activate targeted executive search for Group CCO openings'
      ]
    }
  ]
},
  {
  id: 'cnc_programmer_to_automation_lead',
  industry: 'Industrial Automation & PLC Robotics',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'CNC Programmer',
  targetRole: 'Industrial Automation & PLC Specialist',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4,
  targetAvgCtcLakhs: 13.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Pune',
    'Chennai',
    'Ahmedabad',
    'Coimbatore'
  ],
  coreSkillGaps: [
    'Siemens / Allen-Bradley PLC Ladder Logic',
    'SCADA & HMI Interface Engineering',
    'Robotic Arm Integration (Kuka / Fanuc)',
    'Industrial Sensors & Fieldbus Protocols (Modbus/Profinet)'
  ],
  phases: [
    {
      title: 'Phase 1: PLC Programming & Industrial Logic',
      weeks: 'Weeks 1–5',
      focus: 'IEC 61131-3 languages (Ladder Diagram, Structured Text), digital/analog I/O wiring.',
      milestones: [
        'Program multi-station conveyor automation logic on Siemens S7-1200 PLC',
        'Design intuitive WinCC SCADA dashboard with real-time fault alarms'
      ]
    },
    {
      title: 'Phase 2: Robotic Cell Commissioning & Safety Systems',
      weeks: 'Weeks 6–11',
      focus: 'Pneumatics, servo motor drives, machine safety interlocks, ISO 13849 standards.',
      milestones: [
        'Commission Fanuc 6-axis pick-and-place robotic cell with vision inspection',
        'Integrate emergency safety circuits ensuring zero-hazard compliance'
      ]
    },
    {
      title: 'Phase 3: Industry 4.0 Smart Factory Deployment',
      weeks: 'Weeks 12–16',
      focus: 'OPC-UA data bridges, shop-floor to MES integration.',
      milestones: [
        'Deploy edge gateway streaming machine cycle times to cloud MES',
        'Interview for Industrial Automation Lead roles with automotive tier-1 suppliers'
      ]
    }
  ]
},
  {
  id: 'production_engineer_to_plant_head',
  industry: 'Manufacturing Operations & Plant Leadership',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'Production Engineer',
  targetRole: 'Manufacturing Plant General Manager / Head',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 38,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Pune',
    'Chennai',
    'Vadodara',
    'Jamshedpur',
    'Gurugram'
  ],
  coreSkillGaps: [
    'Overall Equipment Effectiveness (OEE) Maximization',
    'Plant P&L & Capex Budgeting',
    'Labor Union Negotiations & Industrial Relations (IR)',
    'Zero Accident Vision & TPM Excellence'
  ],
  phases: [
    {
      title: 'Phase 1: Plant OEE Transformation & Lean Manufacturing',
      weeks: 'Weeks 1–6',
      focus: 'Single-Minute Exchange of Dies (SMED), Kaizen events, bottleneck elimination.',
      milestones: [
        'Elevate overall line OEE from 64% to 81% across 4 production bays',
        'Reduce customer PPM defect rates by 65% through Pokayoke error-proofing'
      ]
    },
    {
      title: 'Phase 2: Plant P&L, Capex & Statutory Industrial Relations',
      weeks: 'Weeks 7–14',
      focus: 'Factories Act compliance, energy conservation, long-term wage settlements.',
      milestones: [
        'Manage ₹45Cr annual operating plant budget achieving 6% cost productivity',
        'Negotiate peaceful 3-year charter of demands with plant labor union'
      ]
    },
    {
      title: 'Phase 3: Executive Plant Leadership Placement',
      weeks: 'Weeks 15–20',
      focus: 'Board plant operational reviews, greenfield project execution.',
      milestones: [
        'Present greenfield plant commissioning blueprint to conglomerate board',
        'Connect with industrial conglomerates seeking Plant General Managers'
      ]
    }
  ]
},
  {
  id: 'social_media_exec_to_performance_lead',
  industry: 'Paid Acquisition & Performance Marketing',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Social Media Executive',
  targetRole: 'Senior Performance Marketing Lead',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.6,
  targetAvgCtcLakhs: 13,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Gurugram',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Meta & Google Ads Auction Mechanics',
    'ROAS Optimization & CAC Scaling',
    'Conversion API & Server-Side Tracking',
    'Creative Fatigue Testing Frameworks'
  ],
  phases: [
    {
      title: 'Phase 1: Full-Funnel Paid Acquisition & Analytics',
      weeks: 'Weeks 1–4',
      focus: 'Google Search/PMax campaigns, Meta Advantage+ setups, attribution models.',
      milestones: [
        'Manage ₹15L monthly ad spend delivering 3.8x blended ROAS',
        'Configure GA4 server-side tracking eliminating 25% data signal loss'
      ]
    },
    {
      title: 'Phase 2: High-Velocity Creative Iteration & Scaling',
      weeks: 'Weeks 5–9',
      focus: 'UGC creative briefs, hook testing, landing page conversion rate optimization (CRO).',
      milestones: [
        'Deploy 20 UGC video creative variations identifying 3 breakout winners',
        'Improve checkout landing page conversion rate from 1.8% to 3.2%'
      ]
    },
    {
      title: 'Phase 3: Enterprise D2C Marketing Interviews',
      weeks: 'Weeks 10–14',
      focus: 'Unit economics storytelling, CAC-to-LTV ratio defense.',
      milestones: [
        'Present complete ₹1Cr monthly performance scaling playbook',
        'Connect with leading D2C brands and agencies on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'brand_exec_to_chief_marketing_officer',
  industry: 'Global Brand & Growth Marketing Leadership',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Brand Marketing Manager',
  targetRole: 'Chief Marketing Officer (CMO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 7,
  targetAvgCtcLakhs: 58,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Delhi-NCR',
    'Dubai / UAE',
    'London / Remote'
  ],
  coreSkillGaps: [
    'Multi-Market Category Creation',
    'Media Mix Modeling (MMM)',
    'P&L Revenue Attribution',
    'Agency Holding Group Governance'
  ],
  phases: [
    {
      title: 'Phase 1: Brand Positioning & Customer Lifetime Value',
      weeks: 'Weeks 1–6',
      focus: 'Brand equity diagnostics, Net Promoter Score (NPS), global messaging architecture.',
      milestones: [
        'Lead 360-degree brand repositioning campaign generating 45% uplift in unaided recall',
        'Deploy Media Mix Model optimizing ₹20Cr annual marketing budget'
      ]
    },
    {
      title: 'Phase 2: Growth Engine Alignment & International GTM',
      weeks: 'Weeks 7–14',
      focus: 'Product-led growth, international market entry, brand IP acquisition.',
      milestones: [
        'Architect successful multi-country launch across India and UAE',
        'Structure global creative and media agency contracts reducing fees by 18%'
      ]
    },
    {
      title: 'Phase 3: CMO Board Advisory & Recruiter Dispatch',
      weeks: 'Weeks 15–20',
      focus: 'Presenting to institutional investors, founder relationship mastery, C-Suite placement.',
      milestones: [
        'Defend corporate customer acquisition economics to private equity board',
        'Direct placement routing for CMO / VP Global Marketing opportunities'
      ]
    }
  ]
},
  {
  id: 'civil_site_engineer_to_project_director',
  industry: 'Real Estate Development & Mega Projects',
  industryCategory: 'Real Estate & Infrastructure',
  currentRole: 'Civil Site Engineer',
  targetRole: 'Real Estate Project Director',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 4.5,
  targetAvgCtcLakhs: 38,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Delhi-NCR',
    'Hyderabad',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'RERA Statutory Compliance & Approvals',
    'Primavera P6 & BIM 4D Project Scheduling',
    'High-Rise Construction Value Engineering',
    'General Contractor EPC Contracting'
  ],
  phases: [
    {
      title: 'Phase 1: Critical Path Scheduling & Cost Control',
      weeks: 'Weeks 1–6',
      focus: 'Primavera P6 baseline schedules, cash outflow forecasting, milestone tracking.',
      milestones: [
        'Establish baseline project schedule for 1.2M sq.ft residential township',
        'Deliver value-engineering review saving ₹6.5Cr in structural steel and concrete'
      ]
    },
    {
      title: 'Phase 2: Regulatory Clearances & EPC Contractor Governance',
      weeks: 'Weeks 7–13',
      focus: 'Environmental clearances, fire NOCs, RERA escrow management, FIDIC contracts.',
      milestones: [
        'Secure statutory occupation certificates ahead of scheduled delivery milestone',
        'Enforce quality and safety protocols achieving 2 million safe work hours'
      ]
    },
    {
      title: 'Phase 3: Developer Leadership & C-Suite Selection',
      weeks: 'Weeks 14–18',
      focus: 'Developer P&L reviews, land acquisition feasibility, Project Director placement.',
      milestones: [
        'Present comprehensive land development feasibility study to investment committee',
        'Priority recruiter dispatch for Top Tier Real Estate Developers'
      ]
    }
  ]
},
  {
  id: 'research_associate_to_strategy_consultant',
  industry: 'Tier-1 Management Consulting',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Market Research Associate',
  targetRole: 'Management Strategy Consultant',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 22,
  difficulty: 'Demanding',
  experienceLevel: 'mid',
  topLocations: [
    'Gurugram',
    'Mumbai',
    'Bengaluru',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Pyramid Principle & MECE Problem Structuring',
    'Market Sizing & Profitability Frameworks',
    'Executive PowerPoint Storylining',
    'Financial Valuation & Due Diligence'
  ],
  phases: [
    {
      title: 'Phase 1: Case Interview Mastery & MECE Decomposition',
      weeks: 'Weeks 1–5',
      focus: 'Market entry, profitability diagnostics, M&A cases, mental math speed.',
      milestones: [
        'Solve 60 structured consulting business cases with peer practitioners',
        'Master MECE issue tree decomposition for complex ambiguous problems'
      ]
    },
    {
      title: 'Phase 2: Slide Architecture & C-Suite Storytelling',
      weeks: 'Weeks 6–11',
      focus: 'Drafting board-ready slide decks, data synthesis, client workshop facilitation.',
      milestones: [
        'Produce 25-slide strategy recommendation deck on digital transformation',
        'Synthesize primary market expert interviews into actionable strategic takeaways'
      ]
    },
    {
      title: 'Phase 3: Management Consulting Partner Interviews',
      weeks: 'Weeks 12–16',
      focus: 'Partner-round behavioral stories, PE/Corporate strategy practice interviews.',
      milestones: [
        'Pass 3 mock Partner interview rounds with ex-MBB consultants',
        'Direct application to Strategy & Operations consulting teams'
      ]
    }
  ]
},
  {
  id: 'engineering_manager_to_vp_engineering',
  industry: 'Engineering Leadership & Scaled Architecture',
  industryCategory: 'Technology, Cloud & AI',
  currentRole: 'Engineering Manager',
  targetRole: 'VP of Engineering',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 28,
  targetAvgCtcLakhs: 65,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Dubai / UAE',
    'US / Remote'
  ],
  coreSkillGaps: [
    'Multi-Team Org Architecture & Top Engineering Talent Sourcing',
    'Cloud Infrastructure Cost Governance (FinOps)',
    'System Availability & High-Reliability SLOs',
    'Board Technical Vision Defense'
  ],
  phases: [
    {
      title: 'Phase 1: Scaled Org Design & Delivery Velocity',
      weeks: 'Weeks 1–6',
      focus: 'Team topologies, DORA metrics, engineering career ladders, headcount allocation.',
      milestones: [
        'Restructure 60-person engineering organization into high-autonomy product pods',
        'Improve DORA deployment frequency by 3x while cutting change failure rate to <2%'
      ]
    },
    {
      title: 'Phase 2: FinOps, Cloud Architecture & Tech Debt Containment',
      weeks: 'Weeks 7–14',
      focus: 'AWS/GCP infrastructure optimization, multi-region failover, executive technical roadmap.',
      milestones: [
        'Reduce annual cloud infrastructure expenditure by 32% ($450K annual savings)',
        'Lead architectural transition to event-driven microservices supporting 10x traffic spikes'
      ]
    },
    {
      title: 'Phase 3: Board Presentation & C-Suite Tech Leadership',
      weeks: 'Weeks 15–20',
      focus: 'Presenting technical risk to audit committee, founder alignment, VP Eng search.',
      milestones: [
        'Present 3-year AI & Platform technology roadmap to CEO and Investors',
        'Activate priority executive dispatch for Series B/C VP Engineering mandates'
      ]
    }
  ]
},

  // ── 152+ VERIFIED MULTI-INDUSTRY TRANSITIONS ACROSS ALL 16 SECTORS ──
  {
  id: 'junior_backend_developer_to_distributed_systems_architect',
  industry: 'Distributed Backend Engineering',
  industryCategory: 'Technology, Cloud & AI',
  currentRole: 'Junior Backend Developer',
  targetRole: 'Distributed Systems Architect',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 7.5,
  targetAvgCtcLakhs: 32,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Pune'
  ],
  coreSkillGaps: [
    'Kafka & Event-Driven Architecture',
    'Distributed Consensus (Raft / Paxos)',
    'Database Sharding & Replication',
    'High-Throughput gRPC Services'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Distributed Systems Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from Junior Backend Developer',
        'Complete advanced role certification addressing Kafka & Event-Driven Architecture',
        'Deploy initial proof-of-concept project demonstrating Distributed Consensus (Raft / Paxos)'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Distributed Systems Architect.',
      milestones: [
        'Lead strategic initiative resolving Database Sharding & Replication with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Distributed Backend Engineering',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'cloud_support_associate_to_senior_site_reliability_engineer_sre_',
  industry: 'Cloud Infrastructure & SRE',
  industryCategory: 'Technology, Cloud & AI',
  currentRole: 'Cloud Support Associate',
  targetRole: 'Senior Site Reliability Engineer (SRE)',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 18,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Noida',
    'Chennai'
  ],
  coreSkillGaps: [
    'Kubernetes Operator SDK',
    'Terraform & GitOps Automation',
    'SLO/SLI Error Budget Engineering',
    'Prometheus & OpenTelemetry Tracing'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Senior Site Reliability Engineer (SRE).',
      milestones: [
        'Audit and document current operational baseline workflows from Cloud Support Associate',
        'Complete advanced role certification addressing Kubernetes Operator SDK',
        'Deploy initial proof-of-concept project demonstrating Terraform & GitOps Automation'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Senior Site Reliability Engineer (SRE).',
      milestones: [
        'Lead strategic initiative resolving SLO/SLI Error Budget Engineering with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Cloud Infrastructure & SRE',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'mobile_app_developer_to_principal_mobile_solutions_architect',
  industry: 'Cross-Platform Mobile Engineering',
  industryCategory: 'Technology, Cloud & AI',
  currentRole: 'Mobile App Developer',
  targetRole: 'Principal Mobile Solutions Architect',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 8,
  targetAvgCtcLakhs: 28,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Remote'
  ],
  coreSkillGaps: [
    'React Native / Flutter Native Bridges',
    'Offline-First Sync Engines',
    'Mobile App Security & Reverse Engineering Defense',
    'App Vitals & Cold-Start Optimization'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Principal Mobile Solutions Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from Mobile App Developer',
        'Complete advanced role certification addressing React Native / Flutter Native Bridges',
        'Deploy initial proof-of-concept project demonstrating Offline-First Sync Engines'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Principal Mobile Solutions Architect.',
      milestones: [
        'Lead strategic initiative resolving Mobile App Security & Reverse Engineering Defense with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Cross-Platform Mobile Engineering',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'security_analyst_soc__to_chief_information_security_officer_ciso_',
  industry: 'Cybersecurity & Enterprise Resilience',
  industryCategory: 'Technology, Cloud & AI',
  currentRole: 'Security Analyst (SOC)',
  targetRole: 'Chief Information Security Officer (CISO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 8.5,
  targetAvgCtcLakhs: 52,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Zero Trust Network Architecture',
    'Board Cyber Risk & Ransomware Defense',
    'ISO 27001 / SOC 2 Type II Certifications',
    'Incident Crisis Communication'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Chief Information Security Officer (CISO).',
      milestones: [
        'Audit and document current operational baseline workflows from Security Analyst (SOC)',
        'Complete advanced role certification addressing Zero Trust Network Architecture',
        'Deploy initial proof-of-concept project demonstrating Board Cyber Risk & Ransomware Defense'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Chief Information Security Officer (CISO).',
      milestones: [
        'Lead strategic initiative resolving ISO 27001 / SOC 2 Type II Certifications with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Cybersecurity & Enterprise Resilience',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'ai_research_intern_to_applied_generative_ai_engineer',
  industry: 'Generative AI & LLM Engineering',
  industryCategory: 'Technology, Cloud & AI',
  currentRole: 'AI Research Intern',
  targetRole: 'Applied Generative AI Engineer',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 19,
  difficulty: 'Moderate',
  experienceLevel: 'fresher',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Remote'
  ],
  coreSkillGaps: [
    'LangChain / LlamaIndex Orchestration',
    'Vector DB Indexing (Pinecone/Milvus)',
    'Quantization & LoRA Fine-Tuning',
    'AI Agent Multi-Step Reasoning'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Applied Generative AI Engineer.',
      milestones: [
        'Audit and document current operational baseline workflows from AI Research Intern',
        'Complete advanced role certification addressing LangChain / LlamaIndex Orchestration',
        'Deploy initial proof-of-concept project demonstrating Vector DB Indexing (Pinecone/Milvus)'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Applied Generative AI Engineer.',
      milestones: [
        'Lead strategic initiative resolving Quantization & LoRA Fine-Tuning with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Generative AI & LLM Engineering',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'sql_data_analyst_to_big_data_pipeline_engineer',
  industry: 'Big Data Infrastructure',
  industryCategory: 'Data Science & Big Data',
  currentRole: 'SQL Data Analyst',
  targetRole: 'Big Data Pipeline Engineer',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.2,
  targetAvgCtcLakhs: 16.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Pune',
    'Hyderabad'
  ],
  coreSkillGaps: [
    'Apache Spark / PySpark Optimization',
    'Snowflake & dbt Data Modeling',
    'Airflow Directed Acyclic Graphs (DAGs)',
    'Delta Lake & Parquet Formats'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Big Data Pipeline Engineer.',
      milestones: [
        'Audit and document current operational baseline workflows from SQL Data Analyst',
        'Complete advanced role certification addressing Apache Spark / PySpark Optimization',
        'Deploy initial proof-of-concept project demonstrating Snowflake & dbt Data Modeling'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Big Data Pipeline Engineer.',
      milestones: [
        'Lead strategic initiative resolving Airflow Directed Acyclic Graphs (DAGs) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Big Data Infrastructure',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'data_analyst_to_generative_ai_product_manager',
  industry: 'AI Product Strategy',
  industryCategory: 'Data Science & Big Data',
  currentRole: 'Data Analyst',
  targetRole: 'Generative AI Product Manager',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 9,
  targetAvgCtcLakhs: 29,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Gurugram',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'LLM Evaluation Benchmarks (RAG Triad)',
    'AI Tokenomics & Unit Economics',
    'Responsible AI & Hallucination Guardrails',
    'User Workflow AI UX Design'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Generative AI Product Manager.',
      milestones: [
        'Audit and document current operational baseline workflows from Data Analyst',
        'Complete advanced role certification addressing LLM Evaluation Benchmarks (RAG Triad)',
        'Deploy initial proof-of-concept project demonstrating AI Tokenomics & Unit Economics'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Generative AI Product Manager.',
      milestones: [
        'Lead strategic initiative resolving Responsible AI & Hallucination Guardrails with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in AI Product Strategy',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'quantitative_analyst_to_principal_ai_scientist',
  industry: 'Deep Learning & Neural Architectures',
  industryCategory: 'Data Science & Big Data',
  currentRole: 'Quantitative Analyst',
  targetRole: 'Principal AI Scientist',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 14,
  targetAvgCtcLakhs: 46,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'US / Remote'
  ],
  coreSkillGaps: [
    'Transformer Attention Mechanisms',
    'Self-Supervised Representation Learning',
    'Distributed GPU Cluster Training (DeepSpeed)',
    'Mathematical Proofs & Research Publications'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Principal AI Scientist.',
      milestones: [
        'Audit and document current operational baseline workflows from Quantitative Analyst',
        'Complete advanced role certification addressing Transformer Attention Mechanisms',
        'Deploy initial proof-of-concept project demonstrating Self-Supervised Representation Learning'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Principal AI Scientist.',
      milestones: [
        'Lead strategic initiative resolving Distributed GPU Cluster Training (DeepSpeed) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Deep Learning & Neural Architectures',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'bi_developer_to_chief_data_officer_cdo_',
  industry: 'Enterprise Data Governance',
  industryCategory: 'Data Science & Big Data',
  currentRole: 'BI Developer',
  targetRole: 'Chief Data Officer (CDO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 12,
  targetAvgCtcLakhs: 55,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Delhi-NCR'
  ],
  coreSkillGaps: [
    'Enterprise Data Mesh Architecture',
    'Chief Data Governance & Privacy Policies',
    'Monetizing Proprietary Data Assets',
    'Executive Data Culture Transformation'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Chief Data Officer (CDO).',
      milestones: [
        'Audit and document current operational baseline workflows from BI Developer',
        'Complete advanced role certification addressing Enterprise Data Mesh Architecture',
        'Deploy initial proof-of-concept project demonstrating Chief Data Governance & Privacy Policies'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Chief Data Officer (CDO).',
      milestones: [
        'Lead strategic initiative resolving Monetizing Proprietary Data Assets with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Enterprise Data Governance',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'junior_data_engineer_to_real_time_streaming_architect',
  industry: 'Stream Processing',
  industryCategory: 'Data Science & Big Data',
  currentRole: 'Junior Data Engineer',
  targetRole: 'Real-Time Streaming Architect',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 8,
  targetAvgCtcLakhs: 25,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Chennai'
  ],
  coreSkillGaps: [
    'Apache Flink Stateful Stream Processing',
    'Kafka Streams & Schema Registry',
    'Sub-Second Anomaly Detection Systems',
    'Exactly-Once Processing Semantics'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Real-Time Streaming Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from Junior Data Engineer',
        'Complete advanced role certification addressing Apache Flink Stateful Stream Processing',
        'Deploy initial proof-of-concept project demonstrating Kafka Streams & Schema Registry'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Real-Time Streaming Architect.',
      milestones: [
        'Lead strategic initiative resolving Sub-Second Anomaly Detection Systems with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Stream Processing',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'branch_relationship_manager_to_fintech_lending_product_manager',
  industry: 'Digital Lending & Neo-Banking',
  industryCategory: 'Finance, Banking & FinTech',
  currentRole: 'Branch Relationship Manager',
  targetRole: 'FinTech Lending Product Manager',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 18,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Gurugram'
  ],
  coreSkillGaps: [
    'Digital Onboarding & Video KYC Flows',
    'Alternative Credit Scoring Algorithms',
    'LSP / DLRE Regulatory Compliance',
    'Loan Origination System (LOS) Integration'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for FinTech Lending Product Manager.',
      milestones: [
        'Audit and document current operational baseline workflows from Branch Relationship Manager',
        'Complete advanced role certification addressing Digital Onboarding & Video KYC Flows',
        'Deploy initial proof-of-concept project demonstrating Alternative Credit Scoring Algorithms'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for FinTech Lending Product Manager.',
      milestones: [
        'Lead strategic initiative resolving LSP / DLRE Regulatory Compliance with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Digital Lending & Neo-Banking',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'credit_analyst_to_chief_risk_officer_cro_fintech',
  industry: 'Risk Governance & Underwriting',
  industryCategory: 'Finance, Banking & FinTech',
  currentRole: 'Credit Analyst',
  targetRole: 'Chief Risk Officer (CRO) FinTech',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 11,
  targetAvgCtcLakhs: 48,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Portfolio Default Risk & Expected Loss (ECL)',
    'Asset-Liability Management (ALM) Modeling',
    'RBI Audit & Capital Adequacy Defense',
    'Stress-Testing Extreme Macro Shocks'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Chief Risk Officer (CRO) FinTech.',
      milestones: [
        'Audit and document current operational baseline workflows from Credit Analyst',
        'Complete advanced role certification addressing Portfolio Default Risk & Expected Loss (ECL)',
        'Deploy initial proof-of-concept project demonstrating Asset-Liability Management (ALM) Modeling'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Chief Risk Officer (CRO) FinTech.',
      milestones: [
        'Lead strategic initiative resolving RBI Audit & Capital Adequacy Defense with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Risk Governance & Underwriting',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'equity_research_associate_to_portfolio_fund_manager',
  industry: 'Public Equities Asset Management',
  industryCategory: 'Finance, Banking & FinTech',
  currentRole: 'Equity Research Associate',
  targetRole: 'Portfolio Fund Manager',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 12,
  targetAvgCtcLakhs: 42,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Singapore'
  ],
  coreSkillGaps: [
    'Alpha Generation Investment Strategies',
    'Factor Investing & Risk Factor Attribution',
    'Investment Committee Pitch Delivery',
    'Sector Rotational Momentum Modeling'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Portfolio Fund Manager.',
      milestones: [
        'Audit and document current operational baseline workflows from Equity Research Associate',
        'Complete advanced role certification addressing Alpha Generation Investment Strategies',
        'Deploy initial proof-of-concept project demonstrating Factor Investing & Risk Factor Attribution'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Portfolio Fund Manager.',
      milestones: [
        'Lead strategic initiative resolving Investment Committee Pitch Delivery with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Public Equities Asset Management',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'operations_officer_banking__to_payments_infrastructure_director',
  industry: 'Global Payments & Cross-Border Rails',
  industryCategory: 'Finance, Banking & FinTech',
  currentRole: 'Operations Officer (Banking)',
  targetRole: 'Payments Infrastructure Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6.5,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'ISO 20022 Financial Messaging',
    'Cross-Border Nostro/Vostro Reconciliation',
    'UPI Switch Architecture & Interchange Rules',
    'Payment Gateway Surcharge Governance'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Payments Infrastructure Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Operations Officer (Banking)',
        'Complete advanced role certification addressing ISO 20022 Financial Messaging',
        'Deploy initial proof-of-concept project demonstrating Cross-Border Nostro/Vostro Reconciliation'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Payments Infrastructure Director.',
      milestones: [
        'Lead strategic initiative resolving UPI Switch Architecture & Interchange Rules with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Global Payments & Cross-Border Rails',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'fintech_operations_lead_to_head_of_treasury_capital_markets',
  industry: 'Corporate Treasury',
  industryCategory: 'Finance, Banking & FinTech',
  currentRole: 'FinTech Operations Lead',
  targetRole: 'Head of Treasury & Capital Markets',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 15,
  targetAvgCtcLakhs: 45,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'London / Remote'
  ],
  coreSkillGaps: [
    'FX Currency Hedging Options & Forwards',
    'Debt Syndication & Commercial Paper Issuance',
    'Liquidity Buffer Management (LCR)',
    'Rating Agency (CRISIL/ICRA) Upgrades'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of Treasury & Capital Markets.',
      milestones: [
        'Audit and document current operational baseline workflows from FinTech Operations Lead',
        'Complete advanced role certification addressing FX Currency Hedging Options & Forwards',
        'Deploy initial proof-of-concept project demonstrating Debt Syndication & Commercial Paper Issuance'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of Treasury & Capital Markets.',
      milestones: [
        'Lead strategic initiative resolving Liquidity Buffer Management (LCR) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Corporate Treasury',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'junior_tax_consultant_to_transfer_pricing_cross_border_tax_director',
  industry: 'International Tax & Base Erosion',
  industryCategory: 'CA, Audit & Accounting',
  currentRole: 'Junior Tax Consultant',
  targetRole: 'Transfer Pricing & Cross-Border Tax Director',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 9,
  targetAvgCtcLakhs: 36,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Gurugram',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'OECD BEPS Pillar 1 & Pillar 2 Rules',
    'Intercompany Master File & Local File Benchmarks',
    'Advance Pricing Agreements (APA) with CBDT',
    'Attribution of Profits to Permanent Establishments'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Transfer Pricing & Cross-Border Tax Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Junior Tax Consultant',
        'Complete advanced role certification addressing OECD BEPS Pillar 1 & Pillar 2 Rules',
        'Deploy initial proof-of-concept project demonstrating Intercompany Master File & Local File Benchmarks'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Transfer Pricing & Cross-Border Tax Director.',
      milestones: [
        'Lead strategic initiative resolving Advance Pricing Agreements (APA) with CBDT with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in International Tax & Base Erosion',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'audit_senior_big_4__to_financial_controller_listed_co_',
  industry: 'Corporate Accounting & Ind AS',
  industryCategory: 'CA, Audit & Accounting',
  currentRole: 'Audit Senior (Big 4)',
  targetRole: 'Financial Controller (Listed Co)',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 11.5,
  targetAvgCtcLakhs: 28,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Delhi-NCR',
    'Ahmedabad'
  ],
  coreSkillGaps: [
    'Ind AS 115 / 116 Revenue & Lease Standards',
    'Quarterly SEBI Financial Statement Filings',
    'ERP Financial Consolidation (SAP S/4HANA)',
    'Managing Statutory Audit Committee Inquiries'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Financial Controller (Listed Co).',
      milestones: [
        'Audit and document current operational baseline workflows from Audit Senior (Big 4)',
        'Complete advanced role certification addressing Ind AS 115 / 116 Revenue & Lease Standards',
        'Deploy initial proof-of-concept project demonstrating Quarterly SEBI Financial Statement Filings'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Financial Controller (Listed Co).',
      milestones: [
        'Lead strategic initiative resolving ERP Financial Consolidation (SAP S/4HANA) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Corporate Accounting & Ind AS',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'cost_accountant_cma__to_industrial_plant_controller',
  industry: 'Cost Accounting & Manufacturing Control',
  industryCategory: 'CA, Audit & Accounting',
  currentRole: 'Cost Accountant (CMA)',
  targetRole: 'Industrial Plant Controller',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6.8,
  targetAvgCtcLakhs: 22,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Pune',
    'Vadodara',
    'Chennai',
    'Jamshedpur'
  ],
  coreSkillGaps: [
    'Standard Costing & Material Variance Diagnostics',
    'Activity-Based Costing (ABC) for Factory Lines',
    'Scrap Recovery & Inventory Revaluation',
    'Capex Project Payback Financial Modeling'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Industrial Plant Controller.',
      milestones: [
        'Audit and document current operational baseline workflows from Cost Accountant (CMA)',
        'Complete advanced role certification addressing Standard Costing & Material Variance Diagnostics',
        'Deploy initial proof-of-concept project demonstrating Activity-Based Costing (ABC) for Factory Lines'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Industrial Plant Controller.',
      milestones: [
        'Lead strategic initiative resolving Scrap Recovery & Inventory Revaluation with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Cost Accounting & Manufacturing Control',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'bookkeeper_accounts_exec_to_us_gaap_sec_reporting_specialist',
  industry: 'US GAAP / IFRS Reporting',
  industryCategory: 'CA, Audit & Accounting',
  currentRole: 'Bookkeeper / Accounts Exec',
  targetRole: 'US GAAP & SEC Reporting Specialist',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 4.5,
  targetAvgCtcLakhs: 14.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Hyderabad',
    'Bengaluru',
    'Gurugram',
    'Noida'
  ],
  coreSkillGaps: [
    'US GAAP Codification (ASC 606 & ASC 842)',
    'SEC Form 10-K & 10-Q Disclosure Rules',
    'Stock-Based Compensation (ASC 718) Accounting',
    'Workiva / SOX Documentation Workflows'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for US GAAP & SEC Reporting Specialist.',
      milestones: [
        'Audit and document current operational baseline workflows from Bookkeeper / Accounts Exec',
        'Complete advanced role certification addressing US GAAP Codification (ASC 606 & ASC 842)',
        'Deploy initial proof-of-concept project demonstrating SEC Form 10-K & 10-Q Disclosure Rules'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for US GAAP & SEC Reporting Specialist.',
      milestones: [
        'Lead strategic initiative resolving Stock-Based Compensation (ASC 718) Accounting with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in US GAAP / IFRS Reporting',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'forensic_audit_assistant_to_head_of_fraud_risk_forensics',
  industry: 'Forensic Investigations',
  industryCategory: 'CA, Audit & Accounting',
  currentRole: 'Forensic Audit Assistant',
  targetRole: 'Head of Fraud Risk & Forensics',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 8.5,
  targetAvgCtcLakhs: 38,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Digital Forensics (EnCase & Nuix)',
    'Corporate Embezzlement Fund Tracing',
    'Whistleblower Interview Protocols',
    'Expert Witness Testimony Preparation'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of Fraud Risk & Forensics.',
      milestones: [
        'Audit and document current operational baseline workflows from Forensic Audit Assistant',
        'Complete advanced role certification addressing Digital Forensics (EnCase & Nuix)',
        'Deploy initial proof-of-concept project demonstrating Corporate Embezzlement Fund Tracing'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of Fraud Risk & Forensics.',
      milestones: [
        'Lead strategic initiative resolving Whistleblower Interview Protocols with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Forensic Investigations',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'hospital_staff_nurse_to_clinical_research_coordinator_crc_',
  industry: 'Clinical Trials & Patient Safety',
  industryCategory: 'Healthcare, Pharma & Biotech',
  currentRole: 'Hospital Staff Nurse',
  targetRole: 'Clinical Research Coordinator (CRC)',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.5,
  targetAvgCtcLakhs: 8.8,
  difficulty: 'Moderate',
  experienceLevel: 'fresher',
  topLocations: [
    'Kochi',
    'Bengaluru',
    'Chennai',
    'Mumbai'
  ],
  coreSkillGaps: [
    'ICH-GCP Guidelines & Informed Consent',
    'Electronic Data Capture (EDC / Medidata)',
    'Adverse Event (AE) Reporting Timelines',
    'Clinical Protocol Adherence Audits'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Clinical Research Coordinator (CRC).',
      milestones: [
        'Audit and document current operational baseline workflows from Hospital Staff Nurse',
        'Complete advanced role certification addressing ICH-GCP Guidelines & Informed Consent',
        'Deploy initial proof-of-concept project demonstrating Electronic Data Capture (EDC / Medidata)'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Clinical Research Coordinator (CRC).',
      milestones: [
        'Lead strategic initiative resolving Adverse Event (AE) Reporting Timelines with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Clinical Trials & Patient Safety',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'clinical_research_associate_cra__to_clinical_trial_project_manager',
  industry: 'Global Clinical Operations',
  industryCategory: 'Healthcare, Pharma & Biotech',
  currentRole: 'Clinical Research Associate (CRA)',
  targetRole: 'Clinical Trial Project Manager',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 8,
  targetAvgCtcLakhs: 24,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Hyderabad',
    'Bengaluru',
    'Mumbai'
  ],
  coreSkillGaps: [
    'Site Initiation & Monitoring Plan Governance',
    'Investigator Grant Budgeting & Contracts',
    'FDA / EMA Regulatory Inspection Readiness',
    'CRO Vendor Performance Oversight'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Clinical Trial Project Manager.',
      milestones: [
        'Audit and document current operational baseline workflows from Clinical Research Associate (CRA)',
        'Complete advanced role certification addressing Site Initiation & Monitoring Plan Governance',
        'Deploy initial proof-of-concept project demonstrating Investigator Grant Budgeting & Contracts'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Clinical Trial Project Manager.',
      milestones: [
        'Lead strategic initiative resolving FDA / EMA Regulatory Inspection Readiness with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Global Clinical Operations',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'qc_lab_chemist_to_head_of_gmp_quality_assurance',
  industry: 'Pharma Manufacturing QA',
  industryCategory: 'Healthcare, Pharma & Biotech',
  currentRole: 'QC Lab Chemist',
  targetRole: 'Head of GMP Quality Assurance',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4.8,
  targetAvgCtcLakhs: 22,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Ahmedabad',
    'Hyderabad',
    'Baddi',
    'Goa'
  ],
  coreSkillGaps: [
    'US FDA 21 CFR Part 210/211 Regulations',
    'Out of Specification (OOS) & CAPA Systems',
    'Cleanroom HVAC & Water System Validation',
    'Data Integrity & Audit Trail Review'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of GMP Quality Assurance.',
      milestones: [
        'Audit and document current operational baseline workflows from QC Lab Chemist',
        'Complete advanced role certification addressing US FDA 21 CFR Part 210/211 Regulations',
        'Deploy initial proof-of-concept project demonstrating Out of Specification (OOS) & CAPA Systems'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of GMP Quality Assurance.',
      milestones: [
        'Lead strategic initiative resolving Cleanroom HVAC & Water System Validation with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Pharma Manufacturing QA',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'pharmacovigilance_associate_to_global_safety_physician_director',
  industry: 'Drug Safety & Pharmacovigilance',
  industryCategory: 'Healthcare, Pharma & Biotech',
  currentRole: 'Pharmacovigilance Associate',
  targetRole: 'Global Safety Physician / Director',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 9.5,
  targetAvgCtcLakhs: 36,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Delhi-NCR'
  ],
  coreSkillGaps: [
    'Aggregate Safety Reports (PSUR / PBRER)',
    'Signal Detection & Risk Management Plans (RMP)',
    'Global Safety Database Administration (Argus)',
    'Benefit-Risk Assessment for Health Authorities'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Global Safety Physician / Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Pharmacovigilance Associate',
        'Complete advanced role certification addressing Aggregate Safety Reports (PSUR / PBRER)',
        'Deploy initial proof-of-concept project demonstrating Signal Detection & Risk Management Plans (RMP)'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Global Safety Physician / Director.',
      milestones: [
        'Lead strategic initiative resolving Global Safety Database Administration (Argus) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Drug Safety & Pharmacovigilance',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'biotech_lab_technician_to_bioinformatics_lead',
  industry: 'Computational Biology & Genomics',
  industryCategory: 'Healthcare, Pharma & Biotech',
  currentRole: 'Biotech Lab Technician',
  targetRole: 'Bioinformatics Lead',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5,
  targetAvgCtcLakhs: 16.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Pune'
  ],
  coreSkillGaps: [
    'Next-Gen Sequencing (NGS) Pipeline Analysis',
    'Python / Biopython & R/Bioconductor',
    'Structural Protein Modeling (AlphaFold)',
    'Variant Calling & Genomic Annotation'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Bioinformatics Lead.',
      milestones: [
        'Audit and document current operational baseline workflows from Biotech Lab Technician',
        'Complete advanced role certification addressing Next-Gen Sequencing (NGS) Pipeline Analysis',
        'Deploy initial proof-of-concept project demonstrating Python / Biopython & R/Bioconductor'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Bioinformatics Lead.',
      milestones: [
        'Lead strategic initiative resolving Structural Protein Modeling (AlphaFold) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Computational Biology & Genomics',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'logistics_coordinator_to_head_of_national_logistics_3pl',
  industry: 'Freight & Fleet Operations',
  industryCategory: 'Supply Chain, Logistics & Maritime',
  currentRole: 'Logistics Coordinator',
  targetRole: 'Head of National Logistics & 3PL',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Kolkata',
    'Chennai'
  ],
  coreSkillGaps: [
    '3PL SLA Benchmarking & RFP Negotiations',
    'Transportation Management System (TMS) Setup',
    'Multi-Modal Route Optimization (Rail/Road)',
    'Transit Damage Containment & Cold-Chain'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of National Logistics & 3PL.',
      milestones: [
        'Audit and document current operational baseline workflows from Logistics Coordinator',
        'Complete advanced role certification addressing 3PL SLA Benchmarking & RFP Negotiations',
        'Deploy initial proof-of-concept project demonstrating Transportation Management System (TMS) Setup'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of National Logistics & 3PL.',
      milestones: [
        'Lead strategic initiative resolving Multi-Modal Route Optimization (Rail/Road) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Freight & Fleet Operations',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'import_export_executive_to_global_trade_compliance_director',
  industry: 'Customs & International Trade Law',
  industryCategory: 'Supply Chain, Logistics & Maritime',
  currentRole: 'Import/Export Executive',
  targetRole: 'Global Trade Compliance Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 24,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Chennai',
    'Delhi-NCR',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Harmonized Tariff Schedule (HS Code) Audits',
    'Free Trade Agreements (FTA) Rules of Origin',
    'Sanctions & Export Control Regulations (EAR/ITAR)',
    'AEO (Authorized Economic Operator) Certification'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Global Trade Compliance Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Import/Export Executive',
        'Complete advanced role certification addressing Harmonized Tariff Schedule (HS Code) Audits',
        'Deploy initial proof-of-concept project demonstrating Free Trade Agreements (FTA) Rules of Origin'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Global Trade Compliance Director.',
      milestones: [
        'Lead strategic initiative resolving Sanctions & Export Control Regulations (EAR/ITAR) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Customs & International Trade Law',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'warehouse_clerk_to_warehouse_automation_wms_lead',
  industry: 'Smart Warehousing & AGVs',
  industryCategory: 'Supply Chain, Logistics & Maritime',
  currentRole: 'Warehouse Clerk',
  targetRole: 'Warehouse Automation & WMS Lead',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.8,
  targetAvgCtcLakhs: 14,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bhiwandi',
    'Gurugram',
    'Bengaluru',
    'Pune'
  ],
  coreSkillGaps: [
    'Manhattan / SAP EWM Implementation',
    'Autonomous Mobile Robots (AMR / AGV) Layouts',
    'Pick-to-Light & Voice Picking Technologies',
    'Slotting Optimization & Cubic Utilization'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Warehouse Automation & WMS Lead.',
      milestones: [
        'Audit and document current operational baseline workflows from Warehouse Clerk',
        'Complete advanced role certification addressing Manhattan / SAP EWM Implementation',
        'Deploy initial proof-of-concept project demonstrating Autonomous Mobile Robots (AMR / AGV) Layouts'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Warehouse Automation & WMS Lead.',
      milestones: [
        'Lead strategic initiative resolving Pick-to-Light & Voice Picking Technologies with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Smart Warehousing & AGVs',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'marine_deck_officer_to_port_terminal_operations_director',
  industry: 'Maritime & Port Management',
  industryCategory: 'Supply Chain, Logistics & Maritime',
  currentRole: 'Marine Deck Officer',
  targetRole: 'Port & Terminal Operations Director',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 12,
  targetAvgCtcLakhs: 45,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Mundra',
    'Kochi',
    'Dubai / UAE',
    'Singapore'
  ],
  coreSkillGaps: [
    'Berth Allocation & Quay Crane Productivity',
    'ISPS Maritime Security Protocols',
    'Bunkering Operations & IMO 2020 Compliance',
    'Dredging & Concession Agreement Negotiations'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Port & Terminal Operations Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Marine Deck Officer',
        'Complete advanced role certification addressing Berth Allocation & Quay Crane Productivity',
        'Deploy initial proof-of-concept project demonstrating ISPS Maritime Security Protocols'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Port & Terminal Operations Director.',
      milestones: [
        'Lead strategic initiative resolving Bunkering Operations & IMO 2020 Compliance with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Maritime & Port Management',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'supply_chain_analyst_to_vp_of_global_operations_scm',
  industry: 'End-to-End Supply Chain Strategy',
  industryCategory: 'Supply Chain, Logistics & Maritime',
  currentRole: 'Supply Chain Analyst',
  targetRole: 'VP of Global Operations & SCM',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 14,
  targetAvgCtcLakhs: 54,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Gurugram',
    'Dubai / UAE',
    'Singapore'
  ],
  coreSkillGaps: [
    'Supply Chain Digital Twin Architecture',
    'Global Geopolitical Nearshoring Strategy',
    'Working Capital Cash Conversion Cycle',
    'Board-Level SCM Sustainability Targets'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Global Operations & SCM.',
      milestones: [
        'Audit and document current operational baseline workflows from Supply Chain Analyst',
        'Complete advanced role certification addressing Supply Chain Digital Twin Architecture',
        'Deploy initial proof-of-concept project demonstrating Global Geopolitical Nearshoring Strategy'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Global Operations & SCM.',
      milestones: [
        'Lead strategic initiative resolving Working Capital Cash Conversion Cycle with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in End-to-End Supply Chain Strategy',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'seo_specialist_to_vp_of_organic_growth_seo',
  industry: 'Search Intelligence & Programmatic SEO',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'SEO Specialist',
  targetRole: 'VP of Organic Growth & SEO',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 7,
  targetAvgCtcLakhs: 34,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Gurugram',
    'Remote'
  ],
  coreSkillGaps: [
    'Programmatic SEO Page Architecture (100K+ URLs)',
    'Core Web Vitals & Crawl Budget Engineering',
    'Search Intent Clustering & Information Gain',
    'Brand Authority Entity Graph Building'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Organic Growth & SEO.',
      milestones: [
        'Audit and document current operational baseline workflows from SEO Specialist',
        'Complete advanced role certification addressing Programmatic SEO Page Architecture (100K+ URLs)',
        'Deploy initial proof-of-concept project demonstrating Core Web Vitals & Crawl Budget Engineering'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Organic Growth & SEO.',
      milestones: [
        'Lead strategic initiative resolving Search Intent Clustering & Information Gain with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Search Intelligence & Programmatic SEO',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'copywriter_content_lead_to_agency_creative_director',
  industry: 'Creative Advertising & Campaign Strategy',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Copywriter / Content Lead',
  targetRole: 'Agency Creative Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Multi-Media Integrated Campaign Pitching',
    'Directing Film, TVC & Digital Commercials',
    'Brand Archetype & Verbal Identity Formulation',
    'Creative Team Leadership & Cannes/Goafest Strategy'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Agency Creative Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Copywriter / Content Lead',
        'Complete advanced role certification addressing Multi-Media Integrated Campaign Pitching',
        'Deploy initial proof-of-concept project demonstrating Directing Film, TVC & Digital Commercials'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Agency Creative Director.',
      milestones: [
        'Lead strategic initiative resolving Brand Archetype & Verbal Identity Formulation with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Creative Advertising & Campaign Strategy',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'crm_email_specialist_to_director_of_retention_lifecycle_marketing',
  industry: 'Customer Retention & LTV Optimization',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'CRM / Email Specialist',
  targetRole: 'Director of Retention & Lifecycle Marketing',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 25,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'MoEngage / Clevertap Journey Orchestration',
    'RFM (Recency, Frequency, Monetary) Segmentation',
    'Churn Prevention Machine Learning Triggers',
    'Push/SMS/WhatsApp Transactional Funnel Architecture'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Director of Retention & Lifecycle Marketing.',
      milestones: [
        'Audit and document current operational baseline workflows from CRM / Email Specialist',
        'Complete advanced role certification addressing MoEngage / Clevertap Journey Orchestration',
        'Deploy initial proof-of-concept project demonstrating RFM (Recency, Frequency, Monetary) Segmentation'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Director of Retention & Lifecycle Marketing.',
      milestones: [
        'Lead strategic initiative resolving Churn Prevention Machine Learning Triggers with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Customer Retention & LTV Optimization',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'affiliate_associate_to_head_of_partnerships_influencer_marketing',
  industry: 'Creator Economy & Affiliates',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Affiliate Associate',
  targetRole: 'Head of Partnerships & Influencer Marketing',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 4.2,
  targetAvgCtcLakhs: 16.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Tier-1 Celebrity & Macro Influencer Contracting',
    'Affiliate Tracking Postbacks & Fraud Detection',
    'Co-Branded D2C Capsule Collection Launches',
    'Creator ROI & Attribution Modeling'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of Partnerships & Influencer Marketing.',
      milestones: [
        'Audit and document current operational baseline workflows from Affiliate Associate',
        'Complete advanced role certification addressing Tier-1 Celebrity & Macro Influencer Contracting',
        'Deploy initial proof-of-concept project demonstrating Affiliate Tracking Postbacks & Fraud Detection'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of Partnerships & Influencer Marketing.',
      milestones: [
        'Lead strategic initiative resolving Co-Branded D2C Capsule Collection Launches with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Creator Economy & Affiliates',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'growth_marketing_associate_to_chief_commercial_officer_cco_',
  industry: 'Revenue Growth & Commercial Expansion',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Growth Marketing Associate',
  targetRole: 'Chief Commercial Officer (CCO)',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 15,
  targetAvgCtcLakhs: 68,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Dubai / UAE',
    'London / Remote'
  ],
  coreSkillGaps: [
    'Pricing Architecture & Discount Containment',
    'Omnichannel Customer Acquisition Unit Economics',
    'International Footprint Commercial Entry',
    'Investor Board Revenue Presentation'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Chief Commercial Officer (CCO).',
      milestones: [
        'Audit and document current operational baseline workflows from Growth Marketing Associate',
        'Complete advanced role certification addressing Pricing Architecture & Discount Containment',
        'Deploy initial proof-of-concept project demonstrating Omnichannel Customer Acquisition Unit Economics'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Chief Commercial Officer (CCO).',
      milestones: [
        'Lead strategic initiative resolving International Footprint Commercial Entry with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Revenue Growth & Commercial Expansion',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'b2b_sales_representative_to_director_of_strategic_key_accounts',
  industry: 'Global Key Account Management',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'B2B Sales Representative',
  targetRole: 'Director of Strategic Key Accounts',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 7,
  targetAvgCtcLakhs: 28,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Multi-Year Master Service Agreement Defense',
    'Account White-Space Penetration Mapping',
    'Executive Sponsorship Cadence (CxO Roundtables)',
    'Enterprise Contract Inflation Escalation Clauses'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Director of Strategic Key Accounts.',
      milestones: [
        'Audit and document current operational baseline workflows from B2B Sales Representative',
        'Complete advanced role certification addressing Multi-Year Master Service Agreement Defense',
        'Deploy initial proof-of-concept project demonstrating Account White-Space Penetration Mapping'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Director of Strategic Key Accounts.',
      milestones: [
        'Lead strategic initiative resolving Executive Sponsorship Cadence (CxO Roundtables) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Global Key Account Management',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'government_tender_sales_officer_to_vp_of_public_sector_defense_bd',
  industry: 'Defense & Government Procurement',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Government Tender Sales Officer',
  targetRole: 'VP of Public Sector & Defense BD',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 9,
  targetAvgCtcLakhs: 38,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'New Delhi',
    'Hyderabad',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'GeM (Government e-Marketplace) Rules',
    'Defense Offset Obligations & Joint Ventures',
    'CPWD / PSU RFP Technical Compliance Defense',
    'Security Clearance & Sovereign Contracting'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Public Sector & Defense BD.',
      milestones: [
        'Audit and document current operational baseline workflows from Government Tender Sales Officer',
        'Complete advanced role certification addressing GeM (Government e-Marketplace) Rules',
        'Deploy initial proof-of-concept project demonstrating Defense Offset Obligations & Joint Ventures'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Public Sector & Defense BD.',
      milestones: [
        'Lead strategic initiative resolving CPWD / PSU RFP Technical Compliance Defense with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Defense & Government Procurement',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'telemarketing_associate_to_inside_sales_sdr_manager',
  industry: 'Inbound / Outbound Lead Qualification',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Telemarketing Associate',
  targetRole: 'Inside Sales & SDR Manager',
  timeEstimateMonths: 3,
  currentAvgCtcLakhs: 3.5,
  targetAvgCtcLakhs: 11.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Noida',
    'Gurugram',
    'Bengaluru',
    'Indore'
  ],
  coreSkillGaps: [
    'SalesLoft / Outreach Sequence Engineering',
    'Cold Call Objection Handling Rubrics',
    'Pipeline Conversion Velocity Auditing',
    'Managing Global 24/7 SDR Shifts'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–3)',
      weeks: 'Weeks 1–3',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Inside Sales & SDR Manager.',
      milestones: [
        'Audit and document current operational baseline workflows from Telemarketing Associate',
        'Complete advanced role certification addressing SalesLoft / Outreach Sequence Engineering',
        'Deploy initial proof-of-concept project demonstrating Cold Call Objection Handling Rubrics'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 4–8)',
      weeks: 'Weeks 4–8',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Inside Sales & SDR Manager.',
      milestones: [
        'Lead strategic initiative resolving Pipeline Conversion Velocity Auditing with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 9–12)',
      weeks: 'Weeks 9–12',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Inbound / Outbound Lead Qualification',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'enterprise_account_executive_to_commercial_director_middle_east_gcc_',
  industry: 'Middle East Tech Expansion',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Enterprise Account Executive',
  targetRole: 'Commercial Director (Middle East & GCC)',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 18,
  targetAvgCtcLakhs: 55,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Dubai / UAE',
    'Riyadh / Saudi Arabia'
  ],
  coreSkillGaps: [
    'Saudi Vision 2030 Procurement Frameworks',
    'Regional HQ (RHQ) Setup in Riyadh',
    'Arabic Enterprise Business Etiquette',
    'Dirham/Riyal Currency Structured Contracts'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Commercial Director (Middle East & GCC).',
      milestones: [
        'Audit and document current operational baseline workflows from Enterprise Account Executive',
        'Complete advanced role certification addressing Saudi Vision 2030 Procurement Frameworks',
        'Deploy initial proof-of-concept project demonstrating Regional HQ (RHQ) Setup in Riyadh'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Commercial Director (Middle East & GCC).',
      milestones: [
        'Lead strategic initiative resolving Arabic Enterprise Business Etiquette with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Middle East Tech Expansion',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'field_sales_officer_to_head_of_institutional_sales',
  industry: 'B2B Institutional Supply',
  industryCategory: 'Sales & Enterprise BD',
  currentRole: 'Field Sales Officer',
  targetRole: 'Head of Institutional Sales',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 22,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Ahmedabad',
    'Delhi-NCR'
  ],
  coreSkillGaps: [
    'Institutional Credit Risk & Payment Terms',
    'Annual Corporate Supply Rate Contracts',
    'Distribution Partner Network Governance',
    'Trade Scheme & Incentive Architecture'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of Institutional Sales.',
      milestones: [
        'Audit and document current operational baseline workflows from Field Sales Officer',
        'Complete advanced role certification addressing Institutional Credit Risk & Payment Terms',
        'Deploy initial proof-of-concept project demonstrating Annual Corporate Supply Rate Contracts'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of Institutional Sales.',
      milestones: [
        'Lead strategic initiative resolving Distribution Partner Network Governance with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in B2B Institutional Supply',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'scrum_master_agile_coach_to_senior_technical_product_manager_tpm_',
  industry: 'Technical Product Management',
  industryCategory: 'Product Management & UX',
  currentRole: 'Scrum Master / Agile Coach',
  targetRole: 'Senior Technical Product Manager (TPM)',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 10,
  targetAvgCtcLakhs: 27,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Pune'
  ],
  coreSkillGaps: [
    'API Contract Design & Microservices PRDs',
    'Cloud Infrastructure Cost vs Scalability Tradeoffs',
    'Technical Debt Prioritization Matrices',
    'Engineering Team Velocity Alignment'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Senior Technical Product Manager (TPM).',
      milestones: [
        'Audit and document current operational baseline workflows from Scrum Master / Agile Coach',
        'Complete advanced role certification addressing API Contract Design & Microservices PRDs',
        'Deploy initial proof-of-concept project demonstrating Cloud Infrastructure Cost vs Scalability Tradeoffs'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Senior Technical Product Manager (TPM).',
      milestones: [
        'Lead strategic initiative resolving Technical Debt Prioritization Matrices with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Technical Product Management',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'ui_designer_to_vp_of_global_product_design',
  industry: 'Design Systems & Product Experience',
  industryCategory: 'Product Management & UX',
  currentRole: 'UI Designer',
  targetRole: 'VP of Global Product Design',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 8,
  targetAvgCtcLakhs: 44,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Remote'
  ],
  coreSkillGaps: [
    'Multi-Brand Universal Design System Scaling',
    'Design Ops & Tokenized Component Governance',
    'User Research ROI to Business Metrics',
    'Leading Multi-Country Design Organizations'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Global Product Design.',
      milestones: [
        'Audit and document current operational baseline workflows from UI Designer',
        'Complete advanced role certification addressing Multi-Brand Universal Design System Scaling',
        'Deploy initial proof-of-concept project demonstrating Design Ops & Tokenized Component Governance'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Global Product Design.',
      milestones: [
        'Lead strategic initiative resolving User Research ROI to Business Metrics with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Design Systems & Product Experience',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'customer_success_manager_to_product_led_growth_plg_manager',
  industry: 'Product-Led Growth & Onboarding',
  industryCategory: 'Product Management & UX',
  currentRole: 'Customer Success Manager',
  targetRole: 'Product-Led Growth (PLG) Manager',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 19.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Delhi-NCR',
    'Remote'
  ],
  coreSkillGaps: [
    'Self-Serve Activation Funnel Optimization',
    'In-App Onboarding Walkthrough Engineering',
    'Freemium to Paid Paywall Experimentation',
    'Cohort Retention & Product Analytics (Mixpanel/Amplitude)'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Product-Led Growth (PLG) Manager.',
      milestones: [
        'Audit and document current operational baseline workflows from Customer Success Manager',
        'Complete advanced role certification addressing Self-Serve Activation Funnel Optimization',
        'Deploy initial proof-of-concept project demonstrating In-App Onboarding Walkthrough Engineering'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Product-Led Growth (PLG) Manager.',
      milestones: [
        'Lead strategic initiative resolving Freemium to Paid Paywall Experimentation with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Product-Led Growth & Onboarding',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'qa_automation_lead_to_director_of_product_quality_release',
  industry: 'Product Quality & Release Management',
  industryCategory: 'Product Management & UX',
  currentRole: 'QA Automation Lead',
  targetRole: 'Director of Product Quality & Release',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 12,
  targetAvgCtcLakhs: 35,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Pune'
  ],
  coreSkillGaps: [
    'Zero-Downtime Deployment Governance',
    'Chaos Engineering & Resilience Auditing',
    'Automated Performance Regression Gates',
    'Compliance & Accessibility (WCAG 2.1 AAA)'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Director of Product Quality & Release.',
      milestones: [
        'Audit and document current operational baseline workflows from QA Automation Lead',
        'Complete advanced role certification addressing Zero-Downtime Deployment Governance',
        'Deploy initial proof-of-concept project demonstrating Chaos Engineering & Resilience Auditing'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Director of Product Quality & Release.',
      milestones: [
        'Lead strategic initiative resolving Automated Performance Regression Gates with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Product Quality & Release Management',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'ux_researcher_to_head_of_user_experience_behavioral_insights',
  industry: 'Behavioral UX & Customer Psychology',
  industryCategory: 'Product Management & UX',
  currentRole: 'UX Researcher',
  targetRole: 'Head of User Experience & Behavioral Insights',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 7.5,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Remote'
  ],
  coreSkillGaps: [
    'Generative AI Usability Testing Methodologies',
    'Card Sorting & Information Architecture Audits',
    'Quant UX Analytics & Survey Statistical Rigor',
    'Synthesizing User Insights for C-Suite Execs'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of User Experience & Behavioral Insights.',
      milestones: [
        'Audit and document current operational baseline workflows from UX Researcher',
        'Complete advanced role certification addressing Generative AI Usability Testing Methodologies',
        'Deploy initial proof-of-concept project demonstrating Card Sorting & Information Architecture Audits'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of User Experience & Behavioral Insights.',
      milestones: [
        'Lead strategic initiative resolving Quant UX Analytics & Survey Statistical Rigor with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Behavioral UX & Customer Psychology',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'contract_administrator_to_director_of_legal_operations_clm',
  industry: 'Legal Operations & Automation',
  industryCategory: 'Legal, Governance & Tech Policy',
  currentRole: 'Contract Administrator',
  targetRole: 'Director of Legal Operations & CLM',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 25,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Gurugram'
  ],
  coreSkillGaps: [
    'Contract Lifecycle Management (Ironclad/Icertis)',
    'Outside Counsel Spend Management & Billing Rules',
    'Legal KPI Dashboards & Cycle Time Metrics',
    'Automated NDAs and Standard Terms Deployment'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Director of Legal Operations & CLM.',
      milestones: [
        'Audit and document current operational baseline workflows from Contract Administrator',
        'Complete advanced role certification addressing Contract Lifecycle Management (Ironclad/Icertis)',
        'Deploy initial proof-of-concept project demonstrating Outside Counsel Spend Management & Billing Rules'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Director of Legal Operations & CLM.',
      milestones: [
        'Lead strategic initiative resolving Legal KPI Dashboards & Cycle Time Metrics with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Legal Operations & Automation',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'junior_company_secretary_cs__to_group_company_secretary_board_advisor',
  industry: 'Corporate Secretarial & Board Affairs',
  industryCategory: 'Legal, Governance & Tech Policy',
  currentRole: 'Junior Company Secretary (CS)',
  targetRole: 'Group Company Secretary & Board Advisor',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 6.5,
  targetAvgCtcLakhs: 36,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Kolkata'
  ],
  coreSkillGaps: [
    'Companies Act 2013 Governance Standards',
    'SEBI (LODR) Listing Compliance Protocols',
    'Conducting Board & Shareholder AGMs',
    'Related Party Transactions & Insider Trading Controls'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Group Company Secretary & Board Advisor.',
      milestones: [
        'Audit and document current operational baseline workflows from Junior Company Secretary (CS)',
        'Complete advanced role certification addressing Companies Act 2013 Governance Standards',
        'Deploy initial proof-of-concept project demonstrating SEBI (LODR) Listing Compliance Protocols'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Group Company Secretary & Board Advisor.',
      milestones: [
        'Lead strategic initiative resolving Conducting Board & Shareholder AGMs with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Corporate Secretarial & Board Affairs',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'ip_paralegal_to_head_of_intellectual_property_patents',
  industry: 'IP Portfolio & Patent Prosecution',
  industryCategory: 'Legal, Governance & Tech Policy',
  currentRole: 'IP Paralegal',
  targetRole: 'Head of Intellectual Property & Patents',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5,
  targetAvgCtcLakhs: 30,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Delhi-NCR',
    'Hyderabad'
  ],
  coreSkillGaps: [
    'Patent Freedom-to-Operate (FTO) Search',
    'Drafting Software & Hardware Patent Claims',
    'PCT International Filing & USPTO Prosecution',
    'IP Monetization & Licensing Negotiation'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of Intellectual Property & Patents.',
      milestones: [
        'Audit and document current operational baseline workflows from IP Paralegal',
        'Complete advanced role certification addressing Patent Freedom-to-Operate (FTO) Search',
        'Deploy initial proof-of-concept project demonstrating Drafting Software & Hardware Patent Claims'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of Intellectual Property & Patents.',
      milestones: [
        'Lead strategic initiative resolving PCT International Filing & USPTO Prosecution with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in IP Portfolio & Patent Prosecution',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'privacy_compliance_analyst_to_data_protection_officer_dpo_',
  industry: 'Data Privacy & Cross-Border Sovereign Data',
  industryCategory: 'Legal, Governance & Tech Policy',
  currentRole: 'Privacy Compliance Analyst',
  targetRole: 'Data Protection Officer (DPO)',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 7,
  targetAvgCtcLakhs: 27,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Delhi-NCR',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Data Protection Impact Assessments (DPIA)',
    'India DPDP Act & EU GDPR Cross-Border Data Flows',
    'Managing Data Breach Notifications to Authorities',
    'Privacy-by-Design Technical Architecture Audits'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Data Protection Officer (DPO).',
      milestones: [
        'Audit and document current operational baseline workflows from Privacy Compliance Analyst',
        'Complete advanced role certification addressing Data Protection Impact Assessments (DPIA)',
        'Deploy initial proof-of-concept project demonstrating India DPDP Act & EU GDPR Cross-Border Data Flows'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Data Protection Officer (DPO).',
      milestones: [
        'Lead strategic initiative resolving Managing Data Breach Notifications to Authorities with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Data Privacy & Cross-Border Sovereign Data',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'fintech_legal_associate_to_head_of_global_regulatory_licensing',
  industry: 'FinTech Regulatory Licensing',
  industryCategory: 'Legal, Governance & Tech Policy',
  currentRole: 'FinTech Legal Associate',
  targetRole: 'Head of Global Regulatory Licensing',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 10,
  targetAvgCtcLakhs: 42,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Dubai / UAE',
    'Singapore'
  ],
  coreSkillGaps: [
    'Payment Aggregator (PA) Licensing with RBI',
    'DIFC / ADGM Category 3A/4 Financial Licensing',
    'Regulatory Sandbox Testing Frameworks',
    'Anti-Money Laundering (AML) Travel Rule Systems'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Head of Global Regulatory Licensing.',
      milestones: [
        'Audit and document current operational baseline workflows from FinTech Legal Associate',
        'Complete advanced role certification addressing Payment Aggregator (PA) Licensing with RBI',
        'Deploy initial proof-of-concept project demonstrating DIFC / ADGM Category 3A/4 Financial Licensing'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Head of Global Regulatory Licensing.',
      milestones: [
        'Lead strategic initiative resolving Regulatory Sandbox Testing Frameworks with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in FinTech Regulatory Licensing',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'mechanical_quality_inspector_to_six_sigma_master_black_belt_lean_head',
  industry: 'Operational Excellence & Six Sigma',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'Mechanical Quality Inspector',
  targetRole: 'Six Sigma Master Black Belt & Lean Head',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4.5,
  targetAvgCtcLakhs: 21,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Pune',
    'Chennai',
    'Vadodara',
    'Coimbatore'
  ],
  coreSkillGaps: [
    'DMAIC Statistical Toolset (Minitab / ANOVA)',
    'Value Stream Mapping (VSM) Across Plants',
    'Design of Experiments (DOE) Process Optimization',
    'Coaching Green Belts & Executive Cost Savings'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Six Sigma Master Black Belt & Lean Head.',
      milestones: [
        'Audit and document current operational baseline workflows from Mechanical Quality Inspector',
        'Complete advanced role certification addressing DMAIC Statistical Toolset (Minitab / ANOVA)',
        'Deploy initial proof-of-concept project demonstrating Value Stream Mapping (VSM) Across Plants'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Six Sigma Master Black Belt & Lean Head.',
      milestones: [
        'Lead strategic initiative resolving Design of Experiments (DOE) Process Optimization with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Operational Excellence & Six Sigma',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'maintenance_technician_to_asset_reliability_predictive_maintenance_lead',
  industry: 'Predictive Maintenance & IoT Sensors',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'Maintenance Technician',
  targetRole: 'Asset Reliability & Predictive Maintenance Lead',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.8,
  targetAvgCtcLakhs: 14.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Pune',
    'Jamshedpur',
    'Ahmedabad'
  ],
  coreSkillGaps: [
    'Vibration Analysis & Thermography Diagnostics',
    'Mean Time Between Failures (MTBF) Maximization',
    'IoT Vibration Sensors to Cloud Edge Gateways',
    'Root Cause Failure Analysis (RCFA) Standards'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Asset Reliability & Predictive Maintenance Lead.',
      milestones: [
        'Audit and document current operational baseline workflows from Maintenance Technician',
        'Complete advanced role certification addressing Vibration Analysis & Thermography Diagnostics',
        'Deploy initial proof-of-concept project demonstrating Mean Time Between Failures (MTBF) Maximization'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Asset Reliability & Predictive Maintenance Lead.',
      milestones: [
        'Lead strategic initiative resolving IoT Vibration Sensors to Cloud Edge Gateways with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Predictive Maintenance & IoT Sensors',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'automotive_electrical_engineer_to_ev_battery_management_system_bms_architect',
  industry: 'Electric Vehicles & Powertrain',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'Automotive Electrical Engineer',
  targetRole: 'EV Battery Management System (BMS) Architect',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 7.5,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Pune',
    'Chennai'
  ],
  coreSkillGaps: [
    'State-of-Charge (SoC) & State-of-Health (SoH) Algorithms',
    'Thermal Runaway Detection & Protection Hardware',
    'CAN-Bus / ISO 26262 Functional Safety (ASIL-D)',
    'High-Voltage Traction Battery Pack Architecture'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for EV Battery Management System (BMS) Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from Automotive Electrical Engineer',
        'Complete advanced role certification addressing State-of-Charge (SoC) & State-of-Health (SoH) Algorithms',
        'Deploy initial proof-of-concept project demonstrating Thermal Runaway Detection & Protection Hardware'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for EV Battery Management System (BMS) Architect.',
      milestones: [
        'Lead strategic initiative resolving CAN-Bus / ISO 26262 Functional Safety (ASIL-D) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Electric Vehicles & Powertrain',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'tooling_die_designer_to_additive_manufacturing_3d_print_lead',
  industry: 'Advanced Additive Manufacturing',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'Tooling & Die Designer',
  targetRole: 'Additive Manufacturing & 3D Print Lead',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 4.8,
  targetAvgCtcLakhs: 17.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Pune',
    'Chennai'
  ],
  coreSkillGaps: [
    'Design for Additive Manufacturing (DfAM)',
    'Selective Laser Sintering (SLS) & Metal 3D Printing',
    'Topology Optimization & Generative CAD Design',
    'Post-Processing & Heat Treatment Metallurgy'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Additive Manufacturing & 3D Print Lead.',
      milestones: [
        'Audit and document current operational baseline workflows from Tooling & Die Designer',
        'Complete advanced role certification addressing Design for Additive Manufacturing (DfAM)',
        'Deploy initial proof-of-concept project demonstrating Selective Laser Sintering (SLS) & Metal 3D Printing'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Additive Manufacturing & 3D Print Lead.',
      milestones: [
        'Lead strategic initiative resolving Topology Optimization & Generative CAD Design with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Advanced Additive Manufacturing',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'safety_ehs_officer_to_vp_of_environmental_health_safety_sustainability',
  industry: 'Industrial Safety & Zero-Harm Operations',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'Safety / EHS Officer',
  targetRole: 'VP of Environmental Health, Safety & Sustainability',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 35,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Vadodara',
    'Delhi-NCR',
    'Chennai'
  ],
  coreSkillGaps: [
    'ISO 45001 & ISO 14001 Enterprise Frameworks',
    'Process Safety Management (PSM) in Chemical Plants',
    'Zero Fatalities Industrial Culture Transformation',
    'Scope 1 & 2 Emissions Abatement Engineering'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Environmental Health, Safety & Sustainability.',
      milestones: [
        'Audit and document current operational baseline workflows from Safety / EHS Officer',
        'Complete advanced role certification addressing ISO 45001 & ISO 14001 Enterprise Frameworks',
        'Deploy initial proof-of-concept project demonstrating Process Safety Management (PSM) in Chemical Plants'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Environmental Health, Safety & Sustainability.',
      milestones: [
        'Lead strategic initiative resolving Zero Fatalities Industrial Culture Transformation with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Industrial Safety & Zero-Harm Operations',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'solar_rooftop_installer_to_utility_scale_solar_project_manager',
  industry: 'Renewable Solar Power',
  industryCategory: 'Energy, CleanTech & Oil/Gas',
  currentRole: 'Solar Rooftop Installer',
  targetRole: 'Utility-Scale Solar Project Manager',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.8,
  targetAvgCtcLakhs: 15.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Jaipur',
    'Ahmedabad',
    'Bengaluru',
    'Delhi-NCR'
  ],
  coreSkillGaps: [
    'PVsyst Yield Simulation & Shadow Analysis',
    'High-Voltage Substation Interconnection (33kV/132kV)',
    'Central Inverter & Tracker System Engineering',
    'PPA (Power Purchase Agreement) Milestone Delivery'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Utility-Scale Solar Project Manager.',
      milestones: [
        'Audit and document current operational baseline workflows from Solar Rooftop Installer',
        'Complete advanced role certification addressing PVsyst Yield Simulation & Shadow Analysis',
        'Deploy initial proof-of-concept project demonstrating High-Voltage Substation Interconnection (33kV/132kV)'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Utility-Scale Solar Project Manager.',
      milestones: [
        'Lead strategic initiative resolving Central Inverter & Tracker System Engineering with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Renewable Solar Power',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'petrochem_process_operator_to_green_hydrogen_electrolyzer_engineer',
  industry: 'Green Hydrogen & Decarbonization',
  industryCategory: 'Energy, CleanTech & Oil/Gas',
  currentRole: 'Petrochem Process Operator',
  targetRole: 'Green Hydrogen & Electrolyzer Engineer',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 23,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Jamnagar',
    'Kochi',
    'Vizag',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'PEM / Alkaline Electrolyzer Stack Engineering',
    'High-Pressure Hydrogen Compression & Storage',
    'Levelized Cost of Hydrogen (LCOH) Economic Modeling',
    'Hazardous Area Safety (ATEX / IECEx) Protocols'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Green Hydrogen & Electrolyzer Engineer.',
      milestones: [
        'Audit and document current operational baseline workflows from Petrochem Process Operator',
        'Complete advanced role certification addressing PEM / Alkaline Electrolyzer Stack Engineering',
        'Deploy initial proof-of-concept project demonstrating High-Pressure Hydrogen Compression & Storage'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Green Hydrogen & Electrolyzer Engineer.',
      milestones: [
        'Lead strategic initiative resolving Levelized Cost of Hydrogen (LCOH) Economic Modeling with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Green Hydrogen & Decarbonization',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'wind_turbine_maintenance_tech_to_offshore_wind_farm_operations_director',
  industry: 'Wind Power Generation',
  industryCategory: 'Energy, CleanTech & Oil/Gas',
  currentRole: 'Wind Turbine Maintenance Tech',
  targetRole: 'Offshore Wind Farm Operations Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4.8,
  targetAvgCtcLakhs: 28,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Chennai',
    'Tuticorin',
    'Gujarat Coast'
  ],
  coreSkillGaps: [
    'SCADA Wind Resource Monitoring & Yaw Control',
    'Offshore Vessel Logistics & Marine Safety',
    'Gearbox & Generator Predictive Maintenance',
    'Grid Curtailment & Power Forecasting Compliance'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Offshore Wind Farm Operations Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Wind Turbine Maintenance Tech',
        'Complete advanced role certification addressing SCADA Wind Resource Monitoring & Yaw Control',
        'Deploy initial proof-of-concept project demonstrating Offshore Vessel Logistics & Marine Safety'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Offshore Wind Farm Operations Director.',
      milestones: [
        'Lead strategic initiative resolving Gearbox & Generator Predictive Maintenance with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Wind Power Generation',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'energy_auditor_to_vp_of_decarbonization_carbon_markets',
  industry: 'Carbon Offsets & ESG Markets',
  industryCategory: 'Energy, CleanTech & Oil/Gas',
  currentRole: 'Energy Auditor',
  targetRole: 'VP of Decarbonization & Carbon Markets',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 7.5,
  targetAvgCtcLakhs: 40,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Delhi-NCR',
    'Mumbai',
    'London / Remote'
  ],
  coreSkillGaps: [
    'GHG Protocol Corporate Standard (Scope 1, 2, 3)',
    'Article 6 Paris Agreement Carbon Credits',
    'Science-Based Targets initiative (SBTi) Roadmaps',
    'Carbon Border Adjustment Mechanism (CBAM) Advisory'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Decarbonization & Carbon Markets.',
      milestones: [
        'Audit and document current operational baseline workflows from Energy Auditor',
        'Complete advanced role certification addressing GHG Protocol Corporate Standard (Scope 1, 2, 3)',
        'Deploy initial proof-of-concept project demonstrating Article 6 Paris Agreement Carbon Credits'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Decarbonization & Carbon Markets.',
      milestones: [
        'Lead strategic initiative resolving Science-Based Targets initiative (SBTi) Roadmaps with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Carbon Offsets & ESG Markets',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'substation_engineer_to_battery_energy_storage_systems_bess_architect',
  industry: 'Grid Battery Storage & Microgrids',
  industryCategory: 'Energy, CleanTech & Oil/Gas',
  currentRole: 'Substation Engineer',
  targetRole: 'Battery Energy Storage Systems (BESS) Architect',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6.5,
  targetAvgCtcLakhs: 24.5,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Delhi-NCR',
    'Pune'
  ],
  coreSkillGaps: [
    'Lithium-Ion / Flow Battery Degradation Curves',
    'Grid Frequency Regulation & Peak Shaving Dispatch',
    'Power Conversion System (PCS) Inverters',
    'Microgrid Controller (MGC) Islanding Architecture'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Battery Energy Storage Systems (BESS) Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from Substation Engineer',
        'Complete advanced role certification addressing Lithium-Ion / Flow Battery Degradation Curves',
        'Deploy initial proof-of-concept project demonstrating Grid Frequency Regulation & Peak Shaving Dispatch'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Battery Energy Storage Systems (BESS) Architect.',
      milestones: [
        'Lead strategic initiative resolving Power Conversion System (PCS) Inverters with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Grid Battery Storage & Microgrids',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'fiber_splicer_technician_to_fttx_national_rollout_director',
  industry: 'Broadband Infrastructure & FTTx',
  industryCategory: 'Telecom, 5G & SpaceTech',
  currentRole: 'Fiber Splicer / Technician',
  targetRole: 'FTTx National Rollout Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 3.5,
  targetAvgCtcLakhs: 22,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Hyderabad',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Right-of-Way (RoW) Municipal Clearances',
    'GPON / XGS-PON Optical Network Architecture',
    'OTDR Testing & Link Loss Budget Calculations',
    'Contractor Trenching & Micro-Ducting Management'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for FTTx National Rollout Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Fiber Splicer / Technician',
        'Complete advanced role certification addressing Right-of-Way (RoW) Municipal Clearances',
        'Deploy initial proof-of-concept project demonstrating GPON / XGS-PON Optical Network Architecture'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for FTTx National Rollout Director.',
      milestones: [
        'Lead strategic initiative resolving OTDR Testing & Link Loss Budget Calculations with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Broadband Infrastructure & FTTx',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'telecom_field_maintenance_eng_to_open_ran_telco_cloud_engineer',
  industry: 'Open-RAN & Cloud Native Telecom',
  industryCategory: 'Telecom, 5G & SpaceTech',
  currentRole: 'Telecom Field Maintenance Eng',
  targetRole: 'Open-RAN & Telco Cloud Engineer',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 4.5,
  targetAvgCtcLakhs: 18,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Gurugram',
    'Pune'
  ],
  coreSkillGaps: [
    'O-RAN Architecture (CU / DU / RU Splits)',
    'Kubernetes Telco Workloads & SR-IOV Networking',
    'Network Slicing for Enterprise Private 5G',
    'Linux Kernel Low-Latency Tuning (RT Kernel)'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Open-RAN & Telco Cloud Engineer.',
      milestones: [
        'Audit and document current operational baseline workflows from Telecom Field Maintenance Eng',
        'Complete advanced role certification addressing O-RAN Architecture (CU / DU / RU Splits)',
        'Deploy initial proof-of-concept project demonstrating Kubernetes Telco Workloads & SR-IOV Networking'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Open-RAN & Telco Cloud Engineer.',
      milestones: [
        'Lead strategic initiative resolving Network Slicing for Enterprise Private 5G with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Open-RAN & Cloud Native Telecom',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'ground_station_operator_to_satellite_mission_operations_director',
  industry: 'Commercial SpaceTech & Satellites',
  industryCategory: 'Telecom, 5G & SpaceTech',
  currentRole: 'Ground Station Operator',
  targetRole: 'Satellite Mission Operations Director',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 7,
  targetAvgCtcLakhs: 35,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Thiruvananthapuram'
  ],
  coreSkillGaps: [
    'LEO Satellite Constellation Orbit Mechanics',
    'Telemetry, Tracking & Command (TT&C) Protocols',
    'IN-SPACe Regulatory Licensing for Satellites',
    'Payload Downlink High-Throughput Processing'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Satellite Mission Operations Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Ground Station Operator',
        'Complete advanced role certification addressing LEO Satellite Constellation Orbit Mechanics',
        'Deploy initial proof-of-concept project demonstrating Telemetry, Tracking & Command (TT&C) Protocols'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Satellite Mission Operations Director.',
      milestones: [
        'Lead strategic initiative resolving IN-SPACe Regulatory Licensing for Satellites with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Commercial SpaceTech & Satellites',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'data_cabling_tech_to_hyperscale_data_center_facility_director',
  industry: 'Hyperscale Data Center Infrastructure',
  industryCategory: 'Telecom, 5G & SpaceTech',
  currentRole: 'Data Cabling Tech',
  targetRole: 'Hyperscale Data Center Facility Director',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 4.2,
  targetAvgCtcLakhs: 32,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai (Airoli)',
    'Chennai',
    'Noida'
  ],
  coreSkillGaps: [
    'Power Usage Effectiveness (PUE < 1.25) Optimization',
    'Tier-IV Uptime Institute Conformance Audits',
    'Liquid Cooling (Direct-to-Chip) for AI Clusters',
    'High-Voltage Dual-Feed Substation Maintenance'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Hyperscale Data Center Facility Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Data Cabling Tech',
        'Complete advanced role certification addressing Power Usage Effectiveness (PUE < 1.25) Optimization',
        'Deploy initial proof-of-concept project demonstrating Tier-IV Uptime Institute Conformance Audits'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Hyperscale Data Center Facility Director.',
      milestones: [
        'Lead strategic initiative resolving Liquid Cooling (Direct-to-Chip) for AI Clusters with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Hyperscale Data Center Infrastructure',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'telco_billing_specialist_to_bss_oss_digital_transformation_architect',
  industry: 'Telco Software & Billing',
  industryCategory: 'Telecom, 5G & SpaceTech',
  currentRole: 'Telco Billing Specialist',
  targetRole: 'BSS/OSS Digital Transformation Architect',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Pune',
    'Gurugram',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'TM Forum Open Digital Architecture (ODA)',
    'Convergent Charging Systems (CCS) for 5G',
    'eSIM Profile Orchestration & Subscription Mgmt',
    'Legacy Mainframe to Cloud Billing Migration'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for BSS/OSS Digital Transformation Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from Telco Billing Specialist',
        'Complete advanced role certification addressing TM Forum Open Digital Architecture (ODA)',
        'Deploy initial proof-of-concept project demonstrating Convergent Charging Systems (CCS) for 5G'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for BSS/OSS Digital Transformation Architect.',
      milestones: [
        'Lead strategic initiative resolving eSIM Profile Orchestration & Subscription Mgmt with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Telco Software & Billing',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'residential_property_broker_to_commercial_grade_a_leasing_director',
  industry: 'Commercial Office Space Leasing',
  industryCategory: 'Real Estate & Infrastructure',
  currentRole: 'Residential Property Broker',
  targetRole: 'Commercial Grade-A Leasing Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4,
  targetAvgCtcLakhs: 28,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Gurugram',
    'Hyderabad'
  ],
  coreSkillGaps: [
    'Fortune 500 Corporate RFP Leasing Proposals',
    'REIT Portfolio Valuation & Yield Calculations',
    'Triple-Net Lease (NNN) Legal Negotiations',
    'Workplace Density & Occupancy Trends'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Commercial Grade-A Leasing Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Residential Property Broker',
        'Complete advanced role certification addressing Fortune 500 Corporate RFP Leasing Proposals',
        'Deploy initial proof-of-concept project demonstrating REIT Portfolio Valuation & Yield Calculations'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Commercial Grade-A Leasing Director.',
      milestones: [
        'Lead strategic initiative resolving Triple-Net Lease (NNN) Legal Negotiations with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Commercial Office Space Leasing',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'facility_maintenance_executive_to_vp_of_global_workplace_corporate_real_estate',
  industry: 'Corporate Real Estate & Facilities',
  industryCategory: 'Real Estate & Infrastructure',
  currentRole: 'Facility Maintenance Executive',
  targetRole: 'VP of Global Workplace & Corporate Real Estate',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 35,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Gurugram'
  ],
  coreSkillGaps: [
    'Global Real Estate Portfolio Consolidation',
    'Hybrid Work Workplace Tech & Sensor Utilization',
    'Integrated Facilities Management (IFM) SLAs',
    'Corporate Carbon Reduction in Commercial Buildings'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Global Workplace & Corporate Real Estate.',
      milestones: [
        'Audit and document current operational baseline workflows from Facility Maintenance Executive',
        'Complete advanced role certification addressing Global Real Estate Portfolio Consolidation',
        'Deploy initial proof-of-concept project demonstrating Hybrid Work Workplace Tech & Sensor Utilization'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Global Workplace & Corporate Real Estate.',
      milestones: [
        'Lead strategic initiative resolving Integrated Facilities Management (IFM) SLAs with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Corporate Real Estate & Facilities',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'mep_project_engineer_to_smart_building_automation_bms_architect',
  industry: 'Smart Buildings & HVAC Controls',
  industryCategory: 'Real Estate & Infrastructure',
  currentRole: 'MEP Project Engineer',
  targetRole: 'Smart Building Automation & BMS Architect',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 5,
  targetAvgCtcLakhs: 18.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'BACnet / Modbus BMS Protocols',
    'Variable Refrigerant Flow (VRF) & Chiller Optimization',
    'Smart Lighting & Daylight Harvesting Controls',
    'LEED Platinum / WELL Building Certification Audits'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Smart Building Automation & BMS Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from MEP Project Engineer',
        'Complete advanced role certification addressing BACnet / Modbus BMS Protocols',
        'Deploy initial proof-of-concept project demonstrating Variable Refrigerant Flow (VRF) & Chiller Optimization'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Smart Building Automation & BMS Architect.',
      milestones: [
        'Lead strategic initiative resolving Smart Lighting & Daylight Harvesting Controls with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Smart Buildings & HVAC Controls',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'interior_design_drafter_to_corporate_turnkey_fit_out_project_director',
  industry: 'Commercial Interior Fit-Outs',
  industryCategory: 'Real Estate & Infrastructure',
  currentRole: 'Interior Design Drafter',
  targetRole: 'Corporate Turnkey Fit-Out Project Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4.2,
  targetAvgCtcLakhs: 24,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Delhi-NCR'
  ],
  coreSkillGaps: [
    'Fast-Track Turnkey Construction Delivery',
    'Acoustic & Fire-Rated Material Specifications',
    'Subcontractor Procurement & Bill of Quantities (BOQ)',
    'Client Handover Snag-List Clearance'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Corporate Turnkey Fit-Out Project Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Interior Design Drafter',
        'Complete advanced role certification addressing Fast-Track Turnkey Construction Delivery',
        'Deploy initial proof-of-concept project demonstrating Acoustic & Fire-Rated Material Specifications'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Corporate Turnkey Fit-Out Project Director.',
      milestones: [
        'Lead strategic initiative resolving Subcontractor Procurement & Bill of Quantities (BOQ) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Commercial Interior Fit-Outs',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'land_surveyor_to_proptech_gis_spatial_intelligence_lead',
  industry: 'Spatial Intelligence & Land Records',
  industryCategory: 'Real Estate & Infrastructure',
  currentRole: 'Land Surveyor',
  targetRole: 'PropTech GIS & Spatial Intelligence Lead',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.8,
  targetAvgCtcLakhs: 16,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Hyderabad',
    'Bengaluru',
    'Delhi-NCR'
  ],
  coreSkillGaps: [
    'Drone LiDAR Point Cloud Processing',
    'ArcGIS & QGIS Land Title Parcel Mapping',
    'Digital Cadastral Survey Alignment',
    'PropTech AI Land Parcel Valuation Models'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for PropTech GIS & Spatial Intelligence Lead.',
      milestones: [
        'Audit and document current operational baseline workflows from Land Surveyor',
        'Complete advanced role certification addressing Drone LiDAR Point Cloud Processing',
        'Deploy initial proof-of-concept project demonstrating ArcGIS & QGIS Land Title Parcel Mapping'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for PropTech GIS & Spatial Intelligence Lead.',
      milestones: [
        'Lead strategic initiative resolving Digital Cadastral Survey Alignment with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Spatial Intelligence & Land Records',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'video_editor_freelance__to_vfx_producer_post_production_head',
  industry: 'Film & OTT Post-Production',
  industryCategory: 'Media, Gaming & Content',
  currentRole: 'Video Editor (Freelance)',
  targetRole: 'VFX Producer & Post-Production Head',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4.2,
  targetAvgCtcLakhs: 24,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Hyderabad',
    'Chennai'
  ],
  coreSkillGaps: [
    'ShotGrid / ftrack VFX Pipeline Management',
    'Bidding VFX Shots by Complexity & Asset Count',
    'Color Grading Workflow (ACES / DaVinci Resolve)',
    'Managing Multi-Studio Distributed Artist Teams'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VFX Producer & Post-Production Head.',
      milestones: [
        'Audit and document current operational baseline workflows from Video Editor (Freelance)',
        'Complete advanced role certification addressing ShotGrid / ftrack VFX Pipeline Management',
        'Deploy initial proof-of-concept project demonstrating Bidding VFX Shots by Complexity & Asset Count'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VFX Producer & Post-Production Head.',
      milestones: [
        'Lead strategic initiative resolving Color Grading Workflow (ACES / DaVinci Resolve) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Film & OTT Post-Production',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'game_quality_tester_qa__to_lead_game_systems_economy_designer',
  industry: 'Video Game Economy & Mechanics',
  industryCategory: 'Media, Gaming & Content',
  currentRole: 'Game Quality Tester (QA)',
  targetRole: 'Lead Game Systems & Economy Designer',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 3.5,
  targetAvgCtcLakhs: 21,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Bengaluru',
    'Pune',
    'Hyderabad'
  ],
  coreSkillGaps: [
    'In-Game Microtransaction Economic Modeling',
    'Core Gameplay Loop Prototyping in Unity/Unreal',
    'Player Progression Curves & Gacha Balance',
    'Monetization Metrics (ARPPU, D1/D7/D30 Retention)'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Lead Game Systems & Economy Designer.',
      milestones: [
        'Audit and document current operational baseline workflows from Game Quality Tester (QA)',
        'Complete advanced role certification addressing In-Game Microtransaction Economic Modeling',
        'Deploy initial proof-of-concept project demonstrating Core Gameplay Loop Prototyping in Unity/Unreal'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Lead Game Systems & Economy Designer.',
      milestones: [
        'Lead strategic initiative resolving Player Progression Curves & Gacha Balance with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Video Game Economy & Mechanics',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: '2d_animator_to_unreal_engine_virtual_production_director',
  industry: 'Virtual Production & LED Volumes',
  industryCategory: 'Media, Gaming & Content',
  currentRole: '2D Animator',
  targetRole: 'Unreal Engine Virtual Production Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 4.2,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Hyderabad',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Unreal Engine 5 Lumen & Nanite Optimization',
    'LED Wall In-Camera Visual Effects (ICVFX)',
    'Live Camera Tracking Systems (Stype / Mo-Sys)',
    'Real-Time DMX Stage Lighting Synchronization'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Unreal Engine Virtual Production Director.',
      milestones: [
        'Audit and document current operational baseline workflows from 2D Animator',
        'Complete advanced role certification addressing Unreal Engine 5 Lumen & Nanite Optimization',
        'Deploy initial proof-of-concept project demonstrating LED Wall In-Camera Visual Effects (ICVFX)'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Unreal Engine Virtual Production Director.',
      milestones: [
        'Lead strategic initiative resolving Live Camera Tracking Systems (Stype / Mo-Sys) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Virtual Production & LED Volumes',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'content_moderator_to_director_of_global_trust_safety',
  industry: 'Platform Safety & AI Moderation',
  industryCategory: 'Media, Gaming & Content',
  currentRole: 'Content Moderator',
  targetRole: 'Director of Global Trust & Safety',
  timeEstimateMonths: 4.5,
  currentAvgCtcLakhs: 3.8,
  targetAvgCtcLakhs: 32,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Hyderabad',
    'Bengaluru',
    'Gurugram',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Automated Multimodal Content Classification',
    'CSAM / Terrorism Legal Reporting Escalations',
    'Moderator Psychological Wellness Policies',
    'Digital Services Act (DSA) Compliance Audits'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–5)',
      weeks: 'Weeks 1–5',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Director of Global Trust & Safety.',
      milestones: [
        'Audit and document current operational baseline workflows from Content Moderator',
        'Complete advanced role certification addressing Automated Multimodal Content Classification',
        'Deploy initial proof-of-concept project demonstrating CSAM / Terrorism Legal Reporting Escalations'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 6–11)',
      weeks: 'Weeks 6–11',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Director of Global Trust & Safety.',
      milestones: [
        'Lead strategic initiative resolving Moderator Psychological Wellness Policies with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 12–18)',
      weeks: 'Weeks 12–18',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Platform Safety & AI Moderation',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'sound_recordist_to_spatial_audio_dolby_atmos_architect',
  industry: 'Immersive Audio Engineering',
  industryCategory: 'Media, Gaming & Content',
  currentRole: 'Sound Recordist',
  targetRole: 'Spatial Audio & Dolby Atmos Architect',
  timeEstimateMonths: 3.5,
  currentAvgCtcLakhs: 3.8,
  targetAvgCtcLakhs: 16.5,
  difficulty: 'Moderate',
  experienceLevel: 'mid',
  topLocations: [
    'Mumbai',
    'Chennai',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Dolby Atmos Renderer 7.1.4 Bed & Object Mixing',
    'Ambisonics & Binaural Audio for VR/Metaverse',
    'Loudness Compliance (EBU R128 / ITU-R BS.1770)',
    'High-End Studio Acoustic Room Tuning'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Spatial Audio & Dolby Atmos Architect.',
      milestones: [
        'Audit and document current operational baseline workflows from Sound Recordist',
        'Complete advanced role certification addressing Dolby Atmos Renderer 7.1.4 Bed & Object Mixing',
        'Deploy initial proof-of-concept project demonstrating Ambisonics & Binaural Audio for VR/Metaverse'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–9)',
      weeks: 'Weeks 5–9',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Spatial Audio & Dolby Atmos Architect.',
      milestones: [
        'Lead strategic initiative resolving Loudness Compliance (EBU R128 / ITU-R BS.1770) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 10–14)',
      weeks: 'Weeks 10–14',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Immersive Audio Engineering',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'operations_business_analyst_to_digital_transformation_delivery_lead',
  industry: 'Enterprise Digital Transformation',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Operations Business Analyst',
  targetRole: 'Digital Transformation Delivery Lead',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6.5,
  targetAvgCtcLakhs: 23,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Bengaluru',
    'Mumbai',
    'Gurugram',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Change Management (Prosci ADKAR) Frameworks',
    'Legacy Core System Modernization Roadmaps',
    'Business Architecture & Process Capability Heatmaps',
    'Executive Steering Committee Facilitation'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Digital Transformation Delivery Lead.',
      milestones: [
        'Audit and document current operational baseline workflows from Operations Business Analyst',
        'Complete advanced role certification addressing Change Management (Prosci ADKAR) Frameworks',
        'Deploy initial proof-of-concept project demonstrating Legacy Core System Modernization Roadmaps'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Digital Transformation Delivery Lead.',
      milestones: [
        'Lead strategic initiative resolving Business Architecture & Process Capability Heatmaps with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Enterprise Digital Transformation',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'strategy_engagement_manager_to_vp_of_corporate_strategy_chief_of_staff',
  industry: 'Corporate Strategy & CEO Office',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Strategy Engagement Manager',
  targetRole: 'VP of Corporate Strategy & Chief of Staff',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 22,
  targetAvgCtcLakhs: 56,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Delhi-NCR',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Annual Strategic Planning & Board Retreats',
    'Corporate Venture Capital (CVC) Deal Pipeline',
    'Cross-Departmental OKR Cascading & Governance',
    'Managing High-Urgency CEO Fire drills'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Corporate Strategy & Chief of Staff.',
      milestones: [
        'Audit and document current operational baseline workflows from Strategy Engagement Manager',
        'Complete advanced role certification addressing Annual Strategic Planning & Board Retreats',
        'Deploy initial proof-of-concept project demonstrating Corporate Venture Capital (CVC) Deal Pipeline'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Corporate Strategy & Chief of Staff.',
      milestones: [
        'Lead strategic initiative resolving Cross-Departmental OKR Cascading & Governance with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Corporate Strategy & CEO Office',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'pmo_project_coordinator_to_vp_of_global_enterprise_pmo',
  industry: 'Strategic Enterprise Governance',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'PMO Project Coordinator',
  targetRole: 'VP of Global Enterprise PMO',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 36,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Bengaluru',
    'Hyderabad',
    'Pune'
  ],
  coreSkillGaps: [
    'Multi-Million Dollar Program Portfolio Budgeting',
    'Agile at Scale (SAFe 6.0) Implementation',
    'Enterprise Risk & Milestone Escalation Matrix',
    'Vendor SLA Accountability Frameworks'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for VP of Global Enterprise PMO.',
      milestones: [
        'Audit and document current operational baseline workflows from PMO Project Coordinator',
        'Complete advanced role certification addressing Multi-Million Dollar Program Portfolio Budgeting',
        'Deploy initial proof-of-concept project demonstrating Agile at Scale (SAFe 6.0) Implementation'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for VP of Global Enterprise PMO.',
      milestones: [
        'Lead strategic initiative resolving Enterprise Risk & Milestone Escalation Matrix with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Strategic Enterprise Governance',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'market_research_exec_to_consumer_insights_strategy_director',
  industry: 'Consumer Intelligence & FMCG Strategy',
  industryCategory: 'Marketing, Growth & D2C',
  currentRole: 'Market Research Exec',
  targetRole: 'Consumer Insights Strategy Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 5.5,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Delhi-NCR',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Conjoint Analysis & Pricing Sensitivity (Van Westendorp)',
    'Ethnographic Qualitative Deep-Dives',
    'Translating Raw Consumer Data into Brand Innovation',
    'Presenting Consumer Trends to Boardrooms'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Consumer Insights Strategy Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Market Research Exec',
        'Complete advanced role certification addressing Conjoint Analysis & Pricing Sensitivity (Van Westendorp)',
        'Deploy initial proof-of-concept project demonstrating Ethnographic Qualitative Deep-Dives'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Consumer Insights Strategy Director.',
      milestones: [
        'Lead strategic initiative resolving Translating Raw Consumer Data into Brand Innovation with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Consumer Intelligence & FMCG Strategy',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'quality_assurance_associate_to_business_excellence_lean_director',
  industry: 'Enterprise Business Excellence',
  industryCategory: 'Core Engineering & Industrial IoT',
  currentRole: 'Quality Assurance Associate',
  targetRole: 'Business Excellence & Lean Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 6,
  targetAvgCtcLakhs: 26,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Pune',
    'Chennai',
    'Bengaluru'
  ],
  coreSkillGaps: [
    'Malcolm Baldrige / CII Business Excellence Model',
    'End-to-End Enterprise Process Re-Engineering',
    'Hoshin Kanri Strategic Policy Deployment',
    'Quantifying Multi-Million Rupee Productivity Gains'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Business Excellence & Lean Director.',
      milestones: [
        'Audit and document current operational baseline workflows from Quality Assurance Associate',
        'Complete advanced role certification addressing Malcolm Baldrige / CII Business Excellence Model',
        'Deploy initial proof-of-concept project demonstrating End-to-End Enterprise Process Re-Engineering'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Business Excellence & Lean Director.',
      milestones: [
        'Lead strategic initiative resolving Hoshin Kanri Strategic Policy Deployment with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Enterprise Business Excellence',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'sustainability_coordinator_to_esg_management_consulting_partner',
  industry: 'ESG Management Consulting',
  industryCategory: 'Energy, CleanTech & Oil/Gas',
  currentRole: 'Sustainability Coordinator',
  targetRole: 'ESG Management Consulting Partner',
  timeEstimateMonths: 5,
  currentAvgCtcLakhs: 7,
  targetAvgCtcLakhs: 44,
  difficulty: 'High Impact',
  experienceLevel: 'executive',
  topLocations: [
    'Gurugram',
    'Mumbai',
    'London / Remote'
  ],
  coreSkillGaps: [
    'Corporate ESG Assurance & BRSR Core Filings',
    'TCFD Climate Scenario Stress Testing',
    'ESG Rating Agency (MSCI/Sustainalytics) Uplift',
    'Structuring Green Bonds & Sustainability-Linked Loans'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–6)',
      weeks: 'Weeks 1–6',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for ESG Management Consulting Partner.',
      milestones: [
        'Audit and document current operational baseline workflows from Sustainability Coordinator',
        'Complete advanced role certification addressing Corporate ESG Assurance & BRSR Core Filings',
        'Deploy initial proof-of-concept project demonstrating TCFD Climate Scenario Stress Testing'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 7–13)',
      weeks: 'Weeks 7–13',
      focus: 'Execute cross-functional projects delivering quantifiable business value for ESG Management Consulting Partner.',
      milestones: [
        'Lead strategic initiative resolving ESG Rating Agency (MSCI/Sustainalytics) Uplift with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 14–20)',
      weeks: 'Weeks 14–20',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in ESG Management Consulting',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
},
  {
  id: 'it_auditor_to_cyber_risk_advisory_director',
  industry: 'Cyber Risk & Third-Party Governance',
  industryCategory: 'Technology, Cloud & AI',
  currentRole: 'IT Auditor',
  targetRole: 'Cyber Risk Advisory Director',
  timeEstimateMonths: 4,
  currentAvgCtcLakhs: 8,
  targetAvgCtcLakhs: 30,
  difficulty: 'Demanding',
  experienceLevel: 'senior',
  topLocations: [
    'Mumbai',
    'Bengaluru',
    'Dubai / UAE'
  ],
  coreSkillGaps: [
    'Vendor Third-Party Cyber Risk Assessments (TPCRM)',
    'NIST Cybersecurity Framework (CSF 2.0) Audits',
    'Cloud Security Posture Management (CSPM)',
    'Board Cyber Governance & Insurance Underwriting'
  ],
  phases: [
    {
      title: 'Phase 1: Functional Mastery & Core Tooling (Weeks 1–4)',
      weeks: 'Weeks 1–4',
      focus: 'Master the specialized methodologies, diagnostics, and tools required for Cyber Risk Advisory Director.',
      milestones: [
        'Audit and document current operational baseline workflows from IT Auditor',
        'Complete advanced role certification addressing Vendor Third-Party Cyber Risk Assessments (TPCRM)',
        'Deploy initial proof-of-concept project demonstrating NIST Cybersecurity Framework (CSF 2.0) Audits'
      ]
    },
    {
      title: 'Phase 2: High-Visibility Scaled Impact (Weeks 5–10)',
      weeks: 'Weeks 5–10',
      focus: 'Execute cross-functional projects delivering quantifiable business value for Cyber Risk Advisory Director.',
      milestones: [
        'Lead strategic initiative resolving Cloud Security Posture Management (CSPM) with measurable business ROI',
        'Author production-grade governance playbook or technical specification',
        'Conduct peer and executive stakeholder reviews validating delivery quality'
      ]
    },
    {
      title: 'Phase 3: Executive Interview Positioning & Placement (Weeks 11–16)',
      weeks: 'Weeks 11–16',
      focus: 'Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.',
      milestones: [
        'Optimize executive resume highlighting quantifiable achievements in Cyber Risk & Third-Party Governance',
        'Pass 3 simulated AI mock interview loops with tailored behavioral challenges',
        'Dispatch verified profile to 30+ verified partner employers on JobMatch OS'
      ]
    }
  ]
}
];

export const generateCustomCareerTransition = (params: {
  currentRole: string;
  currentAvgCtcLakhs: number;
  targetRole: string;
  industryCategory?: TransitionPath['industryCategory'];
  timeEstimateMonths?: number;
}): TransitionPath => {
  const currentCtc = Math.max(1, params.currentAvgCtcLakhs);
  // Realistic Indian senior market upside benchmark (typically 60% to 180% based on role jump)
  const targetCtc = Math.round(currentCtc * 2.2 * 10) / 10;
  const months = params.timeEstimateMonths || 4;
  const category = params.industryCategory || 'HR, People Ops & Talent';

  return {
    id: `custom_${Date.now()}`,
    industry: `${category} Leadership`,
    industryCategory: category,
    currentRole: params.currentRole,
    targetRole: params.targetRole,
    timeEstimateMonths: months,
    currentAvgCtcLakhs: currentCtc,
    targetAvgCtcLakhs: targetCtc,
    difficulty: currentCtc > 15 ? 'High Impact' : 'Demanding',
    coreSkillGaps: [
      `Strategic ${params.targetRole} Execution Frameworks`,
      'Cross-Functional Executive Communication & Stakeholder Buy-In',
      'Advanced Performance Metrics & ROI Data Diagnostics',
      'Team Leadership, Org Architecture & Budget Governance'
    ],
    phases: [
      {
        title: `Phase 1: Baseline Gap Analysis & Strategic Foundations (Weeks 1–${Math.round(months * 1.1)})`,
        weeks: `Weeks 1–${Math.round(months * 1.1)}`,
        focus: `Master the core functional vocabulary, operational tooling, and metrics demanded by senior ${params.targetRole} positions.`,
        milestones: [
          `Audit current workflows from ${params.currentRole} and identify 5 critical delegation boundaries`,
          `Complete deep-dive capability assessment on SkillPods for target ${params.targetRole} mandates`,
          `Build baseline performance tracking dashboard demonstrating data-backed decision making`
        ]
      },
      {
        title: `Phase 2: High-Impact Project Deliverables & Cross-Functional Scale (Weeks ${Math.round(months * 1.1) + 1}–${Math.round(months * 2.5)})`,
        weeks: `Weeks ${Math.round(months * 1.1) + 1}–${Math.round(months * 2.5)}`,
        focus: `Execute quantifiable high-visibility initiatives that directly validate readiness for ${params.targetRole} compensation bands.`,
        milestones: [
          `Lead multi-departmental initiative delivering quantifiable operational cost savings or revenue upside`,
          `Author comprehensive strategic execution document (PRD / Playbook / Financial Model)`,
          `Establish direct mentorship cadence with active industry leaders in target role`
        ]
      },
      {
        title: `Phase 3: Executive Interview Positioning & Market Dispatch (Weeks ${Math.round(months * 2.5) + 1}–${Math.round(months * 4)})`,
        weeks: `Weeks ${Math.round(months * 2.5) + 1}–${Math.round(months * 4)}`,
        focus: `Refine executive narrative, complete STAR mock interview simulations, and activate priority recruiter dispatch.`,
        milestones: [
          `Tailor executive resume with high-impact quantified achievements and verified skill badges`,
          `Pass 3 simulated AI mock interview rounds addressing C-Suite scenario challenges`,
          `Dispatch profile to 30+ verified partner recruiters hiring for ${params.targetRole} on JobMatch OS`
        ]
      }
    ]
  };
};

// Helper functions for search, filtering, and indexing across 150+ transitions
export const CAREER_INDUSTRIES = [
  'All',
  'HR, People Ops & Talent',
  'Sales & Enterprise BD',
  'Corporate Finance, CA & Audit',
  'Finance, Banking & FinTech',
  'Healthcare, Pharma & Biotech',
  'Supply Chain, Logistics & Maritime',
  'Core Engineering & Industrial IoT',
  'Marketing, Growth & D2C',
  'Legal, Governance & Tech Policy',
  'Real Estate & Infrastructure',
  'Energy, CleanTech & Oil/Gas',
  'Telecom, 5G & SpaceTech',
  'Media, Gaming & Content',
  'Product Management & UX',
  'Data Science & Big Data',
  'Technology, Cloud & AI'
] as const;

export const EXPERIENCE_LEVELS = [
  { id: 'all', label: 'All Experience Levels', bracket: '0–20+ Years' },
  { id: 'fresher', label: 'Fresher / Early Career', bracket: '0–2 Years' },
  { id: 'mid', label: 'Mid-Level Professional', bracket: '3–7 Years' },
  { id: 'senior', label: 'Senior Specialist / Lead', bracket: '8–12 Years' },
  { id: 'executive', label: 'Executive / C-Suite', bracket: '12+ Years' }
] as const;

export const LOCATION_TIERS = [
  { 
    id: 'all', 
    label: 'All Locations', 
    multiplier: 1.0, 
    currencyPrefix: '₹', 
    currencySuffix: 'L CTC',
    cities: 'Pan-India & Global',
    badge: 'National & Global'
  },
  { 
    id: 'tier1', 
    label: 'Tier-1 Metros', 
    multiplier: 1.0, 
    currencyPrefix: '₹', 
    currencySuffix: 'L CTC',
    cities: 'Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, Chennai',
    badge: 'Tier-1 Metros'
  },
  { 
    id: 'tier2', 
    label: 'Tier-2 Emerging Hubs', 
    multiplier: 0.75, 
    currencyPrefix: '₹', 
    currencySuffix: 'L CTC',
    cities: 'Ahmedabad, Jaipur, Kochi, Chandigarh, Indore, Coimbatore, Lucknow',
    badge: 'Tier-2 Hubs'
  },
  { 
    id: 'global', 
    label: 'Global / Middle East / Remote', 
    multiplier: 2.8, 
    currencyPrefix: '₹', 
    currencySuffix: 'L Equiv (AED/USD)',
    cities: 'Dubai / UAE, Riyadh, Singapore, London, US Remote',
    badge: 'Global / GCC'
  }
] as const;

export const getAllCareerTransitions = (): TransitionPath[] => {
  return CAREER_TRANSITIONS_CATALOG;
};

export const getTransitionById = (id: string): TransitionPath => {
  const found = CAREER_TRANSITIONS_CATALOG.find(t => t.id === id);
  return found || CAREER_TRANSITIONS_CATALOG[0];
};

export const getTransitionsByCategory = (category: string): TransitionPath[] => {
  if (!category || category === 'All') return CAREER_TRANSITIONS_CATALOG;
  return CAREER_TRANSITIONS_CATALOG.filter(t => t.industryCategory === category || t.industry.includes(category));
};

export const searchCareerTransitions = (query: string): TransitionPath[] => {
  if (!query || query.trim() === '') return CAREER_TRANSITIONS_CATALOG;
  const q = query.toLowerCase().trim();
  return CAREER_TRANSITIONS_CATALOG.filter(t => 
    t.currentRole.toLowerCase().includes(q) ||
    t.targetRole.toLowerCase().includes(q) ||
    t.industry.toLowerCase().includes(q) ||
    t.industryCategory.toLowerCase().includes(q) ||
    t.coreSkillGaps.some(s => s.toLowerCase().includes(q))
  );
};

export const filterCareerTransitionsMultiDimensional = (params: {
  query?: string;
  category?: string;
  experienceLevel?: string;
  location?: string;
}): TransitionPath[] => {
  let list = CAREER_TRANSITIONS_CATALOG;

  // 1. Industry / Category filter
  if (params.category && params.category !== 'All') {
    list = list.filter(t => t.industryCategory === params.category || t.industry.includes(params.category));
  }

  // 2. Experience Level filter
  if (params.experienceLevel && params.experienceLevel !== 'all') {
    list = list.filter(t => {
      if (t.experienceLevel) {
        return t.experienceLevel === params.experienceLevel;
      }
      // Heuristic fallback based on CTC
      if (params.experienceLevel === 'fresher') return t.currentAvgCtcLakhs <= 5;
      if (params.experienceLevel === 'mid') return t.currentAvgCtcLakhs > 5 && t.currentAvgCtcLakhs <= 12;
      if (params.experienceLevel === 'senior') return t.currentAvgCtcLakhs > 12 && t.currentAvgCtcLakhs <= 22;
      if (params.experienceLevel === 'executive') return t.currentAvgCtcLakhs > 22;
      return true;
    });
  }

  // 3. Location filter
  if (params.location && params.location !== 'all') {
    if (params.location === 'global') {
      list = list.filter(t => 
        (t.topLocations && t.topLocations.some(l => l.includes('Dubai') || l.includes('UAE') || l.includes('Singapore') || l.includes('Remote') || l.includes('London'))) ||
        t.targetAvgCtcLakhs >= 25
      );
    } else if (params.location === 'tier2') {
      list = list.filter(t => 
        (t.topLocations && t.topLocations.some(l => l.includes('Ahmedabad') || l.includes('Jaipur') || l.includes('Kochi') || l.includes('Indore') || l.includes('Vadodara') || l.includes('Coimbatore'))) ||
        t.currentAvgCtcLakhs <= 10
      );
    }
  }

  // 4. Text Query filter
  if (params.query && params.query.trim() !== '') {
    const q = params.query.toLowerCase().trim();
    list = list.filter(t => 
      t.currentRole.toLowerCase().includes(q) ||
      t.targetRole.toLowerCase().includes(q) ||
      t.industry.toLowerCase().includes(q) ||
      t.industryCategory.toLowerCase().includes(q) ||
      t.coreSkillGaps.some(s => s.toLowerCase().includes(q))
    );
  }

  return list;
};

