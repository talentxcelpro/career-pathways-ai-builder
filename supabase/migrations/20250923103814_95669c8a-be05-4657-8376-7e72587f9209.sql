-- Populate course modules and lessons for existing courses
-- This will add comprehensive content to the courses that currently exist

-- First, let's add modules and lessons for the Full Stack Web Development course
INSERT INTO course_modules (
  course_id,
  title,
  description,
  module_order,
  duration_hours,
  learning_objectives
) VALUES 
  (
    'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b',
    'Frontend Foundations with React',
    'Master React fundamentals and build dynamic user interfaces',
    1,
    8,
    ARRAY['Understand React fundamentals and virtual DOM', 'Build reusable components with props and state', 'Master React hooks and lifecycle methods', 'Implement event handling and form management']
  ),
  (
    'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b',
    'Backend Development with Node.js',
    'Build robust backend APIs with Node.js and Express',
    2,
    10,
    ARRAY['Set up Node.js development environment', 'Build RESTful APIs with Express.js', 'Integrate MongoDB database', 'Implement authentication and security']
  ),
  (
    'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b',
    'Full Stack Integration & Deployment',
    'Connect frontend to backend and deploy to production',
    3,
    7,
    ARRAY['Connect React to Express API', 'Implement state management', 'Handle errors and testing', 'Deploy to cloud platforms']
  );

-- Get the module IDs for adding lessons
-- Add lessons for Module 1: Frontend Foundations
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1),
    'React Fundamentals & JSX',
    '<h2>Welcome to React Development</h2>
    <p>React is a powerful JavaScript library for building user interfaces. In this lesson, you will learn:</p>
    <ul>
      <li>What is React and why use it</li>
      <li>Understanding the Virtual DOM</li>
      <li>JSX syntax and best practices</li>
      <li>Creating your first React component</li>
    </ul>
    <h3>Key Concepts:</h3>
    <p><strong>Virtual DOM:</strong> A JavaScript representation of the actual DOM that allows React to efficiently update the UI.</p>
    <p><strong>JSX:</strong> A syntax extension that allows you to write HTML-like code in your JavaScript files.</p>
    <div class="code-example">
      <pre><code>function Welcome(props) {
  return &lt;h1&gt;Hello, {props.name}!&lt;/h1&gt;;
}</code></pre>
    </div>',
    1,
    45,
    'video',
    'https://www.youtube.com/embed/bMknfKXIFA8',
    true
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1),
    'Components & Props',
    '<h2>Building Reusable Components</h2>
    <p>Learn how to create and use React components effectively:</p>
    <ul>
      <li>Functional vs Class Components</li>
      <li>Props and prop validation</li>
      <li>Component composition</li>
      <li>Best practices for component design</li>
    </ul>
    <h3>Project: Product Card Component</h3>
    <p>Build a reusable product card that displays:</p>
    <ul>
      <li>Product image</li>
      <li>Product name and description</li>
      <li>Price and rating</li>
      <li>Add to cart functionality</li>
    </ul>',
    2,
    60,
    'video',
    'https://www.youtube.com/embed/f2mMOiCSj5c',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1),
    'State & Event Handling',
    '<h2>Interactive React Components</h2>
    <p>Make your components dynamic with state and events:</p>
    <ul>
      <li>Understanding state in React</li>
      <li>useState hook</li>
      <li>Event handling patterns</li>
      <li>Controlled vs uncontrolled components</li>
    </ul>
    <h3>Interactive Project: To-Do List</h3>
    <p>Build a fully functional to-do list with:</p>
    <ul>
      <li>Add new tasks</li>
      <li>Mark tasks as complete</li>
      <li>Delete tasks</li>
      <li>Filter tasks by status</li>
    </ul>',
    3,
    75,
    'video',
    'https://www.youtube.com/embed/4pO-HcG2igk',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 1),
    'React Hooks Deep Dive',
    '<h2>Advanced React Hooks</h2>
    <p>Master React hooks for professional development:</p>
    <ul>
      <li>useEffect for side effects</li>
      <li>useContext for state sharing</li>
      <li>useReducer for complex state</li>
      <li>Creating custom hooks</li>
    </ul>
    <h3>Advanced Project: Custom Hook Library</h3>
    <p>Create reusable custom hooks:</p>
    <ul>
      <li>useLocalStorage hook</li>
      <li>useFetch hook for API calls</li>
      <li>useToggle hook for boolean state</li>
      <li>useForm hook for form handling</li>
    </ul>',
    4,
    90,
    'video',
    'https://www.youtube.com/embed/TNhaISOUy6Q',
    false
  );

-- Add lessons for Module 2: Backend Development
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2),
    'Node.js Fundamentals',
    '<h2>Introduction to Node.js</h2>
    <p>Learn the foundation of server-side JavaScript:</p>
    <ul>
      <li>What is Node.js and why use it</li>
      <li>Node.js runtime environment</li>
      <li>NPM package management</li>
      <li>Building your first server</li>
    </ul>
    <h3>Key Topics:</h3>
    <p><strong>Event Loop:</strong> Understanding how Node.js handles asynchronous operations</p>
    <p><strong>Modules:</strong> CommonJS and ES6 module systems</p>
    <div class="code-example">
      <pre><code>const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World!");
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});</code></pre>
    </div>',
    1,
    60,
    'video',
    'https://www.youtube.com/embed/TlB_eWDSMt4',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2),
    'Express.js Framework',
    '<h2>Building Web Servers with Express</h2>
    <p>Master the most popular Node.js web framework:</p>
    <ul>
      <li>Setting up Express server</li>
      <li>Routing and route parameters</li>
      <li>Middleware functions</li>
      <li>Error handling</li>
    </ul>
    <h3>Project: REST API with CRUD Operations</h3>
    <p>Build a complete API with:</p>
    <ul>
      <li>GET /api/users - Get all users</li>
      <li>GET /api/users/:id - Get user by ID</li>
      <li>POST /api/users - Create new user</li>
      <li>PUT /api/users/:id - Update user</li>
      <li>DELETE /api/users/:id - Delete user</li>
    </ul>',
    2,
    75,
    'video',
    'https://www.youtube.com/embed/L72fhGm1tfE',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2),
    'Database Integration with MongoDB',
    '<h2>Working with MongoDB and Mongoose</h2>
    <p>Learn database operations and modeling:</p>
    <ul>
      <li>MongoDB basics and setup</li>
      <li>Mongoose ODM</li>
      <li>Schema design and validation</li>
      <li>CRUD operations with Mongoose</li>
    </ul>
    <h3>Advanced Project: User Management System</h3>
    <p>Build a complete user system with:</p>
    <ul>
      <li>User registration and profiles</li>
      <li>Data validation and sanitization</li>
      <li>Relationships between collections</li>
      <li>Advanced querying and aggregation</li>
    </ul>',
    3,
    120,
    'video',
    'https://www.youtube.com/embed/ofme2o29ngU',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 2),
    'Authentication & Security',
    '<h2>Secure API Development</h2>
    <p>Implement professional-grade security:</p>
    <ul>
      <li>JWT authentication</li>
      <li>Password hashing with bcrypt</li>
      <li>API security best practices</li>
      <li>Rate limiting and CORS</li>
    </ul>
    <h3>Security Project: Secure Authentication System</h3>
    <p>Build enterprise-level auth with:</p>
    <ul>
      <li>User registration and login</li>
      <li>Email verification</li>
      <li>Password reset functionality</li>
      <li>Role-based access control</li>
    </ul>',
    4,
    105,
    'video',
    'https://www.youtube.com/embed/mbsmsi7l3r4',
    false
  );

-- Add lessons for Module 3: Full Stack Integration
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 3),
    'Connecting React to Express API',
    '<h2>Full Stack Integration</h2>
    <p>Connect your frontend and backend seamlessly:</p>
    <ul>
      <li>Making HTTP requests from React</li>
      <li>Using fetch and axios</li>
      <li>Handling async operations</li>
      <li>Managing loading and error states</li>
    </ul>
    <h3>Capstone Project: Full Stack Task Manager</h3>
    <p>Build a complete application with:</p>
    <ul>
      <li>User authentication flow</li>
      <li>Task CRUD operations</li>
      <li>Real-time updates</li>
      <li>Responsive design</li>
    </ul>',
    1,
    90,
    'video',
    'https://www.youtube.com/embed/cuHDQhDhvPE',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 3),
    'Advanced State Management',
    '<h2>Scaling React Applications</h2>
    <p>Manage complex application state:</p>
    <ul>
      <li>Context API for global state</li>
      <li>Redux fundamentals</li>
      <li>Choosing the right solution</li>
      <li>Performance optimization</li>
    </ul>
    <h3>Advanced Project: Shopping Cart with Context API</h3>
    <p>Build a professional e-commerce cart:</p>
    <ul>
      <li>Product catalog</li>
      <li>Cart management</li>
      <li>Checkout process</li>
      <li>Order history</li>
    </ul>',
    2,
    75,
    'video',
    'https://www.youtube.com/embed/5LrDIWkK_Bc',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 3),
    'Testing & Quality Assurance',
    '<h2>Professional Testing Strategies</h2>
    <p>Ensure code quality with comprehensive testing:</p>
    <ul>
      <li>Unit testing with Jest</li>
      <li>Integration testing</li>
      <li>React Testing Library</li>
      <li>API testing with Supertest</li>
    </ul>
    <h3>Testing Project: Comprehensive Test Suite</h3>
    <p>Implement testing for:</p>
    <ul>
      <li>React components</li>
      <li>API endpoints</li>
      <li>Database operations</li>
      <li>End-to-end workflows</li>
    </ul>',
    3,
    60,
    'video',
    'https://www.youtube.com/embed/8vfQ6SWBZ-U',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b' AND module_order = 3),
    'Deployment & Production',
    '<h2>Deploy to Production</h2>
    <p>Launch your application to the world:</p>
    <ul>
      <li>Environment configuration</li>
      <li>Deployment strategies</li>
      <li>Heroku and Vercel deployment</li>
      <li>Monitoring and maintenance</li>
    </ul>
    <h3>Final Project: Production Deployment</h3>
    <p>Deploy your full stack application:</p>
    <ul>
      <li>Frontend deployment on Vercel</li>
      <li>Backend deployment on Heroku</li>
      <li>Database hosting on MongoDB Atlas</li>
      <li>Custom domain setup</li>
    </ul>',
    4,
    45,
    'video',
    'https://www.youtube.com/embed/MxfxiO8vsOM',
    false
  );

-- Add some modules and lessons for the Personal Branding course
INSERT INTO course_modules (
  course_id,
  title,
  description,
  module_order,
  duration_hours,
  learning_objectives
) VALUES 
  (
    '365d548f-695e-41f4-9bd5-96f153318700',
    'Building Your Personal Brand Foundation',
    'Establish your unique professional identity and value proposition',
    1,
    2,
    ARRAY['Define your personal brand', 'Identify your unique value proposition', 'Create a brand statement', 'Develop brand consistency']
  ),
  (
    '365d548f-695e-41f4-9bd5-96f153318700',
    'LinkedIn Optimization & Professional Networking',
    'Maximize your LinkedIn presence and build meaningful connections',
    2,
    2,
    ARRAY['Optimize LinkedIn profile', 'Create engaging content', 'Network strategically', 'Build industry relationships']
  ),
  (
    '365d548f-695e-41f4-9bd5-96f153318700',
    'Digital Presence & Content Strategy',
    'Create and maintain your professional online presence',
    3,
    1,
    ARRAY['Audit digital footprint', 'Create content calendar', 'Engage with industry content', 'Measure brand impact']
  );

-- Add lessons for Personal Branding Module 1
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 1),
    'What Is Personal Branding?',
    '<h2>Understanding Personal Branding</h2>
    <p>Personal branding is how you present and promote yourself professionally. In this lesson, you will learn:</p>
    <ul>
      <li>The importance of personal branding in today''s market</li>
      <li>How personal brands impact career opportunities</li>
      <li>Common personal branding mistakes to avoid</li>
      <li>Examples of successful personal brands</li>
    </ul>
    <h3>Key Questions to Consider:</h3>
    <ul>
      <li>What makes you unique in your field?</li>
      <li>What value do you bring to employers or clients?</li>
      <li>How do you want to be perceived professionally?</li>
    </ul>',
    1,
    30,
    'video',
    'https://www.youtube.com/embed/DIsmPyGN6S4',
    true
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 1),
    'Discovering Your Unique Value Proposition',
    '<h2>Define What Makes You Special</h2>
    <p>Your value proposition is the unique combination of skills, experience, and personality that you bring to the table:</p>
    <ul>
      <li>Identify your core strengths and skills</li>
      <li>Analyze your professional experiences</li>
      <li>Understand your target audience</li>
      <li>Craft a compelling value statement</li>
    </ul>
    <h3>Exercise: Value Proposition Canvas</h3>
    <p>Complete the worksheet to map out:</p>
    <ul>
      <li>Your skills and expertise</li>
      <li>Your achievements and results</li>
      <li>Your personality and work style</li>
      <li>What you want to be known for</li>
    </ul>',
    2,
    45,
    'video',
    'https://www.youtube.com/embed/2Nt9Z9ZnNZ8',
    false
  );

-- Add lessons for Personal Branding Module 2
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  lesson_order,
  duration_minutes,
  lesson_type,
  video_url,
  is_free
) VALUES 
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 2),
    'LinkedIn Profile Optimization',
    '<h2>Create a Powerful LinkedIn Presence</h2>
    <p>Your LinkedIn profile is often the first impression you make professionally. Learn to optimize every section:</p>
    <ul>
      <li>Craft a compelling headline</li>
      <li>Write an engaging summary</li>
      <li>Optimize your experience section</li>
      <li>Choose the right profile photo</li>
    </ul>
    <h3>LinkedIn Profile Checklist:</h3>
    <ul>
      <li>Professional profile photo</li>
      <li>Keyword-optimized headline</li>
      <li>Compelling summary with call-to-action</li>
      <li>Detailed experience with achievements</li>
      <li>Skills and endorsements</li>
      <li>Recommendations from colleagues</li>
    </ul>',
    1,
    60,
    'video',
    'https://www.youtube.com/embed/KOgF1m2EAFI',
    false
  ),
  (
    (SELECT id FROM course_modules WHERE course_id = '365d548f-695e-41f4-9bd5-96f153318700' AND module_order = 2),
    'Strategic Networking',
    '<h2>Build Meaningful Professional Relationships</h2>
    <p>Networking is about building genuine relationships, not just collecting contacts:</p>
    <ul>
      <li>Identify your networking goals</li>
      <li>Find the right networking opportunities</li>
      <li>Master the art of conversation</li>
      <li>Follow up effectively</li>
    </ul>
    <h3>Networking Action Plan:</h3>
    <ul>
      <li>Set monthly networking goals</li>
      <li>Research industry events and groups</li>
      <li>Prepare your elevator pitch</li>
      <li>Create a follow-up system</li>
    </ul>',
    2,
    45,
    'video',
    'https://www.youtube.com/embed/W65dTikwJWA',
    false
  );

-- Update course with learning outcomes
UPDATE courses 
SET learning_outcomes = ARRAY[
  'Build modern web applications with React and Node.js',
  'Create responsive user interfaces with React components',
  'Develop secure REST APIs with Express and MongoDB',
  'Implement user authentication and authorization',
  'Deploy full-stack applications to production',
  'Apply best practices for code quality and testing'
]
WHERE id = 'a9fa2428-7a38-4ef1-bcf0-30bd2a11761b';

UPDATE courses 
SET learning_outcomes = ARRAY[
  'Define and articulate your unique value proposition',
  'Create a professional brand identity and messaging',
  'Optimize your LinkedIn profile for maximum impact',
  'Build and maintain strategic professional relationships',
  'Develop a consistent online presence across platforms',
  'Measure and improve your personal brand effectiveness'
]
WHERE id = '365d548f-695e-41f4-9bd5-96f153318700';