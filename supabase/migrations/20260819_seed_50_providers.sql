-- ============================================================================
-- TALENTXCEL LEARNING — 50+ RECOGNIZED PROVIDERS TAXONOMY MIGRATION
-- Copy & Paste into Supabase SQL Editor and click "Run"
-- ============================================================================

INSERT INTO public.learning_providers (id, name, slug, website, logo, description, provider_type, trust_level, country, verified, course_count)
VALUES
  -- 4 Verified Flagship Providers
  ('microsoft-learn', 'Microsoft Learn', 'microsoft-learn', 'https://learn.microsoft.com/en-us/training/', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg', 'Official interactive learning paths for Microsoft Azure, Power BI, Python, Data Engineering, and C#.', 'Tech Company', 'Official', 'USA', true, 1),
  ('mit-ocw', 'MIT OpenCourseWare', 'mit-ocw', 'https://ocw.mit.edu', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg', 'Free, open publication of material from thousands of MIT courses covering CS, AI, Math, and Engineering.', 'University', 'Official', 'USA', true, 1),
  ('ibm-skillsbuild', 'IBM SkillsBuild', 'ibm-skillsbuild', 'https://skillsbuild.org', 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', 'Free learning, credentials, and coaching in AI, Cybersecurity, Cloud, and Data Analytics.', 'Tech Company', 'Official', 'USA', true, 1),
  ('freecodecamp', 'freeCodeCamp', 'freecodecamp', 'https://www.freecodecamp.org', 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.svg', 'Renowned non-profit platform offering thousands of free interactive programming and web dev certifications.', 'Non-Profit', 'Official', 'USA', true, 1),

  -- 46 In-Review / Discovered Ecosystem Providers (verified = false, course_count = 0)
  ('aws-training', 'AWS Training & Certification', 'aws-training', 'https://aws.amazon.com/training/', NULL, 'Official Amazon Web Services cloud computing and architecture courses.', 'Tech Company', 'Official', 'USA', false, 0),
  ('google-cloud-boost', 'Google Cloud Skills Boost', 'google-cloud-boost', 'https://www.cloudskillsboost.google', NULL, 'Official Google Cloud hands-on labs and certification learning paths.', 'Tech Company', 'Official', 'USA', false, 0),
  ('cisco-networking', 'Cisco Networking Academy', 'cisco-networking', 'https://www.netacad.com', NULL, 'Official Cisco networking, cybersecurity, and IoT training courses.', 'Tech Company', 'Official', 'USA', false, 0),
  ('salesforce-trailhead', 'Salesforce Trailhead', 'salesforce-trailhead', 'https://trailhead.salesforce.com', NULL, 'Interactive gamified learning for Salesforce CRM, Admin, and Developer skills.', 'Tech Company', 'Official', 'USA', false, 0),
  ('harvard-online', 'Harvard Online', 'harvard-online', 'https://online-learning.harvard.edu', NULL, 'Free and open online courses from Harvard University.', 'University', 'Official', 'USA', false, 0),
  ('stanford-online', 'Stanford Online', 'stanford-online', 'https://online.stanford.edu', NULL, 'Professional development and academic courses from Stanford University.', 'University', 'Official', 'USA', false, 0),
  ('nvidia-dli', 'NVIDIA Deep Learning Institute', 'nvidia-dli', 'https://www.nvidia.com/en-us/training/', NULL, 'Hands-on training in AI, computer vision, and accelerated computing from NVIDIA.', 'Tech Company', 'Official', 'USA', false, 0),
  ('hubspot-academy', 'HubSpot Academy', 'hubspot-academy', 'https://academy.hubspot.com', NULL, 'Free online training and certifications in inbound marketing, sales, and customer service.', 'Tech Company', 'Official', 'USA', false, 0),
  ('oracle-university', 'Oracle University', 'oracle-university', 'https://education.oracle.com', NULL, 'Official Oracle Cloud Infrastructure and database training solutions.', 'Tech Company', 'Official', 'USA', false, 0),
  ('sap-learning', 'SAP Learning', 'sap-learning', 'https://learning.sap.com', NULL, 'Official training for SAP S/4HANA, ERP, and enterprise software.', 'Tech Company', 'Official', 'Germany', false, 0),
  ('unity-learn', 'Unity Learn', 'unity-learn', 'https://learn.unity.com', NULL, 'Free tutorials and guided learning for 3D game development and real-time graphics.', 'Tech Company', 'Official', 'USA', false, 0),
  ('meta-blueprint', 'Meta Blueprint', 'meta-blueprint', 'https://www.facebook.com/business/learn', NULL, 'Official digital marketing and advertising training for Facebook, Instagram, and WhatsApp.', 'Tech Company', 'Official', 'USA', false, 0),
  ('khan-academy', 'Khan Academy', 'khan-academy', 'https://www.khanacademy.org', NULL, 'Free world-class education for anyone, anywhere in math, science, and computing.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('openlearn', 'OpenLearn (The Open University)', 'openlearn', 'https://www.open.edu/openlearn/', NULL, 'Free learning from The Open University covering business, science, and humanities.', 'University', 'Official', 'UK', false, 0),
  ('coursera', 'Coursera (Partner Aggregated)', 'coursera', 'https://www.coursera.org', NULL, 'Global online learning platform partnering with universities and tech companies.', 'Aggregator', 'Official', 'USA', false, 0),
  ('edx', 'edX (Partner Aggregated)', 'edx', 'https://www.edx.org', NULL, 'Open online course provider created by Harvard and MIT.', 'Aggregator', 'Official', 'USA', false, 0),
  ('udemy', 'Udemy (Partner Aggregated)', 'udemy', 'https://www.udemy.com', NULL, 'Global marketplace for learning and teaching online.', 'Aggregator', 'Official', 'USA', false, 0),
  ('pluralsight', 'Pluralsight', 'pluralsight', 'https://www.pluralsight.com', NULL, 'Technology workforce development and skill assessment platform.', 'Tech Company', 'Official', 'USA', false, 0),
  ('linkedin-learning', 'LinkedIn Learning', 'linkedin-learning', 'https://www.linkedin.com/learning/', NULL, 'Skill-based courses in business, technology, and creative domains.', 'Tech Company', 'Official', 'USA', false, 0),
  ('skillshare', 'Skillshare', 'skillshare', 'https://www.skillshare.com', NULL, 'Online learning community for creative and curious people.', 'Marketplace', 'Official', 'USA', false, 0),
  ('futurelearn', 'FutureLearn', 'futurelearn', 'https://www.futurelearn.com', NULL, 'Online courses from top universities and specialist organizations.', 'University', 'Official', 'UK', false, 0),
  ('saylor-academy', 'Saylor Academy', 'saylor-academy', 'https://www.saylor.org', NULL, 'Free open online courses providing tuition-free college credit opportunities.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('alison', 'Alison Free Learning', 'alison', 'https://alison.com', NULL, 'Free online courses with certificates and diplomas across global industries.', 'Non-Profit', 'Official', 'Ireland', false, 0),
  ('datacamp', 'DataCamp', 'datacamp', 'https://www.datacamp.com', NULL, 'Interactive data science, Python, R, and SQL learning platform.', 'Tech Company', 'Official', 'USA', false, 0),
  ('codecademy', 'Codecademy', 'codecademy', 'https://www.codecademy.com', NULL, 'Interactive coding and technical education platform.', 'Tech Company', 'Official', 'USA', false, 0),
  ('scrimba', 'Scrimba', 'scrimba', 'https://scrimba.com', NULL, 'Interactive screencast coding environment for frontend development.', 'Tech Company', 'Official', 'Norway', false, 0),
  ('odin-project', 'The Odin Project', 'odin-project', 'https://www.theodinproject.com', NULL, 'Tuition-free open-source full-stack web development curriculum.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('fullstack-open', 'Full Stack Open (University of Helsinki)', 'fullstack-open', 'https://fullstackopen.com/en/', NULL, 'Deep dive into modern web development with React, Redux, Node.js, and GraphQL.', 'University', 'Official', 'Finland', false, 0),
  ('fast-ai', 'fast.ai', 'fast-ai', 'https://www.fast.ai', NULL, 'Making neural nets uncool again: deep learning research and practical courses.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('deeplearning-ai', 'DeepLearning.AI', 'deeplearning-ai', 'https://www.deeplearning.ai', NULL, 'Founded by Andrew Ng to provide world-class AI education.', 'Tech Company', 'Official', 'USA', false, 0),
  ('kaggle-learn', 'Kaggle Learn', 'kaggle-learn', 'https://www.kaggle.com/learn', NULL, 'Micro-courses covering data science, machine learning, and computer vision.', 'Tech Company', 'Official', 'USA', false, 0),
  ('google-act-digital', 'Google Digital Unlocked / Garage', 'google-act-digital', 'https://skillshop.exceedlms.com', NULL, 'Free digital marketing, data analytics, and career skills from Google.', 'Tech Company', 'Official', 'USA', false, 0),
  ('pmi-learning', 'Project Management Institute (PMI)', 'pmi-learning', 'https://www.pmi.org/learning', NULL, 'Official project management certifications and continuing education.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('scrum-org', 'Scrum.org', 'scrum-org', 'https://www.scrum.org/resources', NULL, 'Official Scrum resources, learning series, and Agile training.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('isaca-learning', 'ISACA Cybersecurity', 'isaca-learning', 'https://www.isaca.org/resources', NULL, 'Cybersecurity audit, governance, risk, and privacy training.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('comptia-choice', 'CompTIA Learning', 'comptia-choice', 'https://www.comptia.org/training', NULL, 'IT fundamental, Network+, Security+, and Cloud+ certification training.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('redhat-academy', 'Red Hat Academy', 'redhat-academy', 'https://www.redhat.com/en/services/training/red-hat-academy', NULL, 'Official enterprise Linux, Ansible, and OpenShift container training.', 'Tech Company', 'Official', 'USA', false, 0),
  ('docker-training', 'Docker Training', 'docker-training', 'https://www.docker.com/101-tutorial/', NULL, 'Official containerization, Docker Compose, and Kubernetes tutorials.', 'Tech Company', 'Official', 'USA', false, 0),
  ('kubernetes-training', 'Linux Foundation / Kubernetes', 'kubernetes-training', 'https://training.linuxfoundation.org', NULL, 'Official Linux Foundation open source and CKA/CKAD certification courses.', 'Non-Profit', 'Official', 'USA', false, 0),
  ('gitlab-university', 'GitLab Learn', 'gitlab-university', 'https://about.gitlab.com/handbook/customer-success/professional-services-engineering/education-services/', NULL, 'DevOps, CI/CD pipelines, and Git version control training.', 'Tech Company', 'Official', 'USA', false, 0),
  ('hashicorp-learn', 'HashiCorp Developer', 'hashicorp-learn', 'https://developer.hashicorp.com', NULL, 'Official Terraform, Vault, Consul, and Nomad infrastructure as code tutorials.', 'Tech Company', 'Official', 'USA', false, 0),
  ('mongodb-university', 'MongoDB University', 'mongodb-university', 'https://learn.mongodb.com', NULL, 'Official NoSQL database, aggregation framework, and Atlas cloud training.', 'Tech Company', 'Official', 'USA', false, 0),
  ('neo4j-graphacademy', 'Neo4j GraphAcademy', 'neo4j-graphacademy', 'https://graphacademy.neo4j.com', NULL, 'Free hands-on graph database, Cypher query language, and graph data science courses.', 'Tech Company', 'Official', 'USA', false, 0),
  ('snowflake-university', 'Snowflake University', 'snowflake-university', 'https://learn.snowflake.com', NULL, 'Official cloud data warehousing and Data Cloud engineering training.', 'Tech Company', 'Official', 'USA', false, 0),
  ('databricks-academy', 'Databricks Academy', 'databricks-academy', 'https://www.databricks.com/learn', NULL, 'Apache Spark, Delta Lake, and Lakehouse architecture training.', 'Tech Company', 'Official', 'USA', false, 0),
  ('atlassian-university', 'Atlassian University', 'atlassian-university', 'https://university.atlassian.com', NULL, 'Jira, Confluence, and Agile project management training.', 'Tech Company', 'Official', 'Australia', false, 0),
  ('figma-learn', 'Figma Design Academy', 'figma-learn', 'https://help.figma.com/hc/en-us/categories/360002045334-Figma-Design', NULL, 'Official UI/UX design, component systems, and prototyping tutorials.', 'Tech Company', 'Official', 'USA', false, 0),
  ('canva-design-school', 'Canva Design School', 'canva-design-school', 'https://www.canva.com/designschool/', NULL, 'Free graphic design, branding, and presentation micro-courses.', 'Tech Company', 'Official', 'Australia', false, 0),
  ('duolingo-for-schools', 'Duolingo Language', 'duolingo-for-schools', 'https://www.duolingo.com', NULL, 'Interactive language learning in English, Spanish, French, and 40+ languages.', 'Tech Company', 'Official', 'USA', false, 0)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
