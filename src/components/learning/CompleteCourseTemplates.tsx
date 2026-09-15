// Complete course templates with full content, assessments, and examples

export const completeCourseTemplates = [
  {
    id: 'aws-cloud-mastery',
    title: 'Complete AWS Cloud Computing Mastery',
    category: 'cloud-computing',
    difficulty: 'beginner',
    duration_hours: 10,
    price: 0,
    is_free: true,
    instructor_name: 'TalentXcel Academy',
    description: 'Master AWS cloud computing from fundamentals to advanced deployment strategies. Build real-world projects and earn industry-recognized certification.',
    skills_taught: [
      'AWS Core Services',
      'EC2 & Auto Scaling',
      'VPC & Networking',
      'S3 & Storage Solutions',
      'RDS & Database Management',
      'IAM & Security',
      'CloudFormation',
      'Monitoring & Optimization'
    ],
    learning_objectives: [
      'Understand cloud computing fundamentals and AWS architecture',
      'Deploy and manage scalable web applications on AWS',
      'Implement security best practices using IAM and VPC',
      'Automate infrastructure deployment with CloudFormation',
      'Monitor and optimize AWS resources for cost and performance',
      'Build a complete 3-tier web application on AWS'
    ],
    prerequisites: [
      'Basic understanding of web technologies',
      'Familiarity with command line interface',
      'No prior cloud experience required'
    ],
    target_audience: [
      'Developers transitioning to cloud',
      'IT professionals',
      'Students learning cloud computing',
      'DevOps engineers'
    ],
    modules: [
      {
        id: 'module-1',
        title: 'AWS Fundamentals & Core Services',
        description: 'Introduction to cloud computing, AWS global infrastructure, and essential services',
        duration_hours: 1.5,
        order: 1,
        objectives: [
          'Understand cloud computing models (IaaS, PaaS, SaaS)',
          'Navigate AWS Management Console',
          'Identify AWS global infrastructure components',
          'Explore AWS core services overview'
        ],
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Introduction to Cloud Computing',
            description: 'Learn the fundamentals of cloud computing and why businesses are migrating to the cloud.',
            content_type: 'video',
            duration_minutes: 15,
            order: 1,
            content_text: `
              <h2>What is Cloud Computing?</h2>
              <p>Cloud computing is the delivery of computing services over the internet, including servers, storage, databases, networking, software, analytics, and intelligence.</p>
              
              <h3>Key Benefits:</h3>
              <ul>
                <li><strong>Cost Efficiency:</strong> Pay only for what you use</li>
                <li><strong>Scalability:</strong> Scale up or down based on demand</li>
                <li><strong>Flexibility:</strong> Access resources from anywhere</li>
                <li><strong>Reliability:</strong> Built-in redundancy and backup</li>
              </ul>
              
              <h3>Service Models:</h3>
              <p><strong>Infrastructure as a Service (IaaS):</strong> Virtual machines, storage, networks</p>
              <p><strong>Platform as a Service (PaaS):</strong> Development platforms and tools</p>
              <p><strong>Software as a Service (SaaS):</strong> Complete applications</p>
              
              <h3>Deployment Models:</h3>
              <ul>
                <li>Public Cloud</li>
                <li>Private Cloud</li>
                <li>Hybrid Cloud</li>
                <li>Multi-Cloud</li>
              </ul>
            `,
            resources: [
              {
                id: 'res-1-1-1',
                title: 'Cloud Computing Basics PDF',
                type: 'pdf',
                url: '/resources/cloud-computing-basics.pdf',
                description: 'Comprehensive guide to cloud computing fundamentals'
              }
            ]
          },
          {
            id: 'lesson-1-2',
            title: 'AWS Global Infrastructure',
            description: 'Explore AWS regions, availability zones, and edge locations.',
            content_type: 'video',
            duration_minutes: 12,
            order: 2,
            content_text: `
              <h2>AWS Global Infrastructure</h2>
              <p>AWS has the most extensive, reliable, and secure global cloud infrastructure.</p>
              
              <h3>Regions</h3>
              <p>AWS Regions are separate geographic areas with multiple data centers. Each region is completely independent and isolated from other regions.</p>
              
              <h3>Availability Zones (AZs)</h3>
              <p>Each region has multiple Availability Zones - isolated locations within a region that provide redundancy.</p>
              
              <h3>Edge Locations</h3>
              <p>Edge locations are AWS content delivery network (CDN) endpoints for CloudFront, located closer to users.</p>
              
              <h3>Choosing a Region</h3>
              <ul>
                <li>Latency to your users</li>
                <li>Data sovereignty requirements</li>
                <li>Available services</li>
                <li>Cost considerations</li>
              </ul>
            `
          },
          {
            id: 'lesson-1-3',
            title: 'AWS Management Console Navigation',
            description: 'Learn to navigate the AWS Management Console effectively.',
            content_type: 'interactive',
            duration_minutes: 18,
            order: 3,
            content_text: `
              <h2>AWS Management Console</h2>
              <p>The AWS Management Console is a web-based interface for accessing and managing AWS services.</p>
              
              <h3>Key Components:</h3>
              <ul>
                <li><strong>Services Menu:</strong> Access all AWS services</li>
                <li><strong>Console Home:</strong> Recently visited services</li>
                <li><strong>Resource Groups:</strong> Organize and manage resources</li>
                <li><strong>CloudShell:</strong> Browser-based shell</li>
              </ul>
              
              <h3>Navigation Tips:</h3>
              <ul>
                <li>Use the search bar to quickly find services</li>
                <li>Pin frequently used services</li>
                <li>Use browser bookmarks for direct service access</li>
                <li>Leverage the mobile app for monitoring</li>
              </ul>
            `
          },
          {
            id: 'lesson-1-4',
            title: 'AWS Core Services Overview',
            description: 'Introduction to the most important AWS services you will use.',
            content_type: 'text',
            duration_minutes: 20,
            order: 4,
            content_text: `
              <h2>Essential AWS Services</h2>
              
              <h3>Compute Services</h3>
              <p><strong>EC2 (Elastic Compute Cloud):</strong> Virtual servers in the cloud</p>
              <p><strong>Lambda:</strong> Serverless compute service</p>
              <p><strong>ECS/EKS:</strong> Container services</p>
              
              <h3>Storage Services</h3>
              <p><strong>S3 (Simple Storage Service):</strong> Object storage</p>
              <p><strong>EBS (Elastic Block Store):</strong> Block storage for EC2</p>
              <p><strong>EFS (Elastic File System):</strong> Managed file storage</p>
              
              <h3>Database Services</h3>
              <p><strong>RDS (Relational Database Service):</strong> Managed relational databases</p>
              <p><strong>DynamoDB:</strong> NoSQL database service</p>
              <p><strong>Redshift:</strong> Data warehouse service</p>
              
              <h3>Networking</h3>
              <p><strong>VPC (Virtual Private Cloud):</strong> Isolated cloud resources</p>
              <p><strong>CloudFront:</strong> Content delivery network</p>
              <p><strong>Route 53:</strong> DNS service</p>
              
              <h3>Security & Identity</h3>
              <p><strong>IAM (Identity and Access Management):</strong> User and permission management</p>
              <p><strong>Cognito:</strong> User authentication service</p>
              <p><strong>KMS (Key Management Service):</strong> Encryption key management</p>
            `
          },
          {
            id: 'lesson-1-quiz',
            title: 'Module 1 Assessment',
            description: 'Test your understanding of AWS fundamentals.',
            content_type: 'quiz',
            duration_minutes: 10,
            order: 5
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Compute Services Mastery',
        description: 'Deep dive into EC2, Auto Scaling, Load Balancers, and compute optimization',
        duration_hours: 2,
        order: 2,
        objectives: [
          'Launch and configure EC2 instances',
          'Implement Auto Scaling for high availability',
          'Set up Load Balancers for traffic distribution',
          'Optimize compute costs and performance'
        ],
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'EC2 Instance Types and Sizing',
            description: 'Choose the right EC2 instance for your workload.',
            content_type: 'video',
            duration_minutes: 25,
            order: 1,
            content_text: `
              <h2>EC2 Instance Types</h2>
              <p>Amazon EC2 provides different instance types optimized for different use cases.</p>
              
              <h3>General Purpose</h3>
              <ul>
                <li><strong>t3/t4g:</strong> Burstable performance (web servers, small databases)</li>
                <li><strong>m5/m6i:</strong> Balanced compute, memory, and networking</li>
              </ul>
              
              <h3>Compute Optimized</h3>
              <ul>
                <li><strong>c5/c6i:</strong> High-performance processors (HPC, gaming)</li>
              </ul>
              
              <h3>Memory Optimized</h3>
              <ul>
                <li><strong>r5/r6i:</strong> Memory-intensive applications</li>
                <li><strong>x1e:</strong> High memory-to-vCPU ratio</li>
              </ul>
              
              <h3>Storage Optimized</h3>
              <ul>
                <li><strong>i3/i4i:</strong> High sequential read/write to local storage</li>
                <li><strong>d3:</strong> Distributed file systems</li>
              </ul>
              
              <h3>Sizing Best Practices</h3>
              <ul>
                <li>Start small and scale up</li>
                <li>Monitor CPU, memory, and network utilization</li>
                <li>Use CloudWatch metrics for rightsizing</li>
                <li>Consider Reserved Instances for predictable workloads</li>
              </ul>
            `
          },
          {
            id: 'lesson-2-2',
            title: 'Launching Your First EC2 Instance',
            description: 'Step-by-step guide to launching and configuring EC2 instances.',
            content_type: 'interactive',
            duration_minutes: 30,
            order: 2,
            content_text: `
              <h2>Launching EC2 Instances</h2>
              
              <h3>Step 1: Choose AMI (Amazon Machine Image)</h3>
              <p>Select the operating system and software configuration:</p>
              <ul>
                <li>Amazon Linux 2 (recommended for beginners)</li>
                <li>Ubuntu Server</li>
                <li>Windows Server</li>
                <li>Custom AMIs</li>
              </ul>
              
              <h3>Step 2: Choose Instance Type</h3>
              <p>For learning: t3.micro (free tier eligible)</p>
              
              <h3>Step 3: Configure Instance</h3>
              <ul>
                <li>Number of instances</li>
                <li>Network (VPC)</li>
                <li>Subnet</li>
                <li>Auto-assign Public IP</li>
                <li>IAM Role</li>
                <li>User Data (bootstrap scripts)</li>
              </ul>
              
              <h3>Step 4: Add Storage</h3>
              <ul>
                <li>Root volume (EBS)</li>
                <li>Additional volumes</li>
                <li>Storage type (gp3, io2, etc.)</li>
                <li>Encryption</li>
              </ul>
              
              <h3>Step 5: Configure Security Groups</h3>
              <ul>
                <li>SSH (port 22) for Linux</li>
                <li>RDP (port 3389) for Windows</li>
                <li>HTTP (port 80) for web servers</li>
                <li>HTTPS (port 443) for secure web</li>
              </ul>
              
              <h3>Step 6: Key Pairs</h3>
              <p>Create or select existing key pair for secure access.</p>
            `
          }
        ]
      }
    ],
    assessments: [
      {
        id: 'final-assessment',
        title: 'AWS Cloud Computing Final Assessment',
        description: 'Comprehensive test covering all course modules',
        duration_minutes: 45,
        passing_score: 80,
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'What is the main benefit of using AWS Auto Scaling?',
            options: [
              'Reduced costs only',
              'Automatic capacity adjustment based on demand',
              'Better security',
              'Faster internet speeds'
            ],
            correct_answers: ['Automatic capacity adjustment based on demand'],
            explanation: 'Auto Scaling automatically adjusts the number of EC2 instances based on demand, ensuring optimal performance and cost efficiency.',
            difficulty: 'medium',
            points: 10
          },
          {
            id: 'q2',
            type: 'multiple_select',
            question: 'Which of the following are AWS storage services? (Select all that apply)',
            options: ['S3', 'EC2', 'EBS', 'RDS', 'EFS'],
            correct_answers: ['S3', 'EBS', 'EFS'],
            explanation: 'S3 is object storage, EBS provides block storage for EC2, and EFS is a managed file system. EC2 is compute and RDS is database.',
            difficulty: 'easy',
            points: 15
          },
          {
            id: 'q3',
            type: 'coding',
            question: 'Write a CloudFormation template snippet to create an S3 bucket with versioning enabled.',
            code_template: `Resources:
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      # Add versioning configuration here`,
            expected_output: `Resources:
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      VersioningConfiguration:
        Status: Enabled`,
            correct_answers: ['VersioningConfiguration with Status: Enabled'],
            explanation: 'CloudFormation uses VersioningConfiguration property with Status set to Enabled to enable S3 bucket versioning.',
            difficulty: 'hard',
            points: 20
          }
        ]
      }
    ]
  },
  
  {
    id: 'react-development-pro',
    title: 'Professional React Development',
    category: 'development',
    difficulty: 'intermediate',
    duration_hours: 8,
    price: 0,
    is_free: true,
    instructor_name: 'TalentXcel Academy',
    description: 'Master modern React development with hooks, state management, testing, and production deployment.',
    skills_taught: [
      'React Hooks',
      'State Management (Redux, Zustand)',
      'Performance Optimization',
      'Testing (Jest, React Testing Library)',
      'TypeScript with React',
      'Next.js Framework'
    ],
    modules: [
      {
        id: 'react-module-1',
        title: 'Advanced React Patterns',
        description: 'Master advanced React patterns and custom hooks',
        duration_hours: 2,
        order: 1,
        lessons: [
          {
            id: 'react-lesson-1-1',
            title: 'Custom Hooks Deep Dive',
            description: 'Learn to create reusable custom hooks for common patterns.',
            content_type: 'video',
            duration_minutes: 30,
            order: 1,
            content_text: `
              <h2>Custom Hooks</h2>
              <p>Custom hooks are JavaScript functions that start with "use" and can call other hooks.</p>
              
              <h3>Example: useLocalStorage Hook</h3>
              <pre><code>
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
              </code></pre>
              
              <h3>Benefits of Custom Hooks</h3>
              <ul>
                <li>Reusable logic across components</li>
                <li>Cleaner component code</li>
                <li>Easier testing</li>
                <li>Better separation of concerns</li>
              </ul>
            `
          }
        ]
      }
    ]
  },

  {
    id: 'python-data-science',
    title: 'Complete Python Data Science',
    category: 'data-science',
    difficulty: 'beginner',
    duration_hours: 12,
    price: 0,
    is_free: true,
    instructor_name: 'TalentXcel Academy',
    description: 'Learn data science with Python from basics to machine learning deployment.',
    skills_taught: [
      'Python Programming',
      'NumPy & Pandas',
      'Data Visualization',
      'Statistical Analysis',
      'Machine Learning',
      'Model Deployment'
    ],
    modules: [
      {
        id: 'ds-module-1',
        title: 'Python for Data Science Fundamentals',
        description: 'Learn Python essentials for data science',
        duration_hours: 2,
        order: 1,
        lessons: [
          {
            id: 'ds-lesson-1-1',
            title: 'NumPy Arrays and Operations',
            description: 'Master NumPy for numerical computing in data science.',
            content_type: 'video',
            duration_minutes: 25,
            order: 1,
            content_text: `
              <h2>NumPy Fundamentals</h2>
              <p>NumPy is the foundation of the Python data science ecosystem.</p>
              
              <h3>Creating Arrays</h3>
              <pre><code>
import numpy as np

# From list
arr = np.array([1, 2, 3, 4, 5])

# Zeros and ones
zeros = np.zeros((3, 4))
ones = np.ones((2, 3))

# Range
range_arr = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]

# Random
random_arr = np.random.rand(3, 3)
              </code></pre>
              
              <h3>Array Operations</h3>
              <pre><code>
# Element-wise operations
arr1 = np.array([1, 2, 3])
arr2 = np.array([4, 5, 6])

addition = arr1 + arr2  # [5, 7, 9]
multiplication = arr1 * arr2  # [4, 10, 18]

# Mathematical functions
sqrt_arr = np.sqrt(arr1)
sin_arr = np.sin(arr1)
              </code></pre>
            `
          }
        ]
      }
    ]
  },

  {
    id: 'ui-ux-complete',
    title: 'Complete UI/UX Design Masterclass',
    category: 'design',
    difficulty: 'beginner',
    duration_hours: 9,
    price: 0,
    is_free: true,
    instructor_name: 'TalentXcel Academy',
    description: 'Master user experience design from research to prototyping and testing.',
    skills_taught: [
      'User Research',
      'Wireframing',
      'Prototyping',
      'Visual Design',
      'Usability Testing',
      'Design Systems'
    ]
  },

  {
    id: 'digital-marketing',
    title: 'Digital Marketing Mastery',
    category: 'marketing',
    difficulty: 'beginner',
    duration_hours: 8,
    price: 0,
    is_free: true,
    instructor_name: 'TalentXcel Academy',
    description: 'Complete digital marketing course covering SEO, social media, paid advertising, and analytics.'
  },

  {
    id: 'cybersecurity-essentials',
    title: 'Cybersecurity Essentials',
    category: 'security',
    difficulty: 'intermediate',
    duration_hours: 10,
    price: 0,
    is_free: true,
    instructor_name: 'TalentXcel Academy',
    description: 'Learn cybersecurity fundamentals, threat detection, and incident response.'
  }
];

export default completeCourseTemplates;