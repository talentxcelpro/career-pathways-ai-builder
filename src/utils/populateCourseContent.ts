
import { supabase } from '@/integrations/supabase/client';

export const populateCourseContent = async () => {
  try {
    // Get all courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .limit(10);

    if (!courses) return;

    for (const course of courses) {
      // Create modules for each course
      const moduleData = getCourseModules(course.title);
      
      for (const moduleInfo of moduleData) {
        const { data: module } = await supabase
          .from('course_modules')
          .insert({
            course_id: course.id,
            title: moduleInfo.title,
            description: moduleInfo.description,
            module_order: moduleInfo.order,
            duration_minutes: moduleInfo.duration
          })
          .select()
          .single();

        if (module) {
          // Create lessons for each module
          for (const lessonInfo of moduleInfo.lessons) {
            await supabase
              .from('course_lessons')
              .insert({
                module_id: module.id,
                title: lessonInfo.title,
                content: lessonInfo.content,
                lesson_type: lessonInfo.type,
                video_url: lessonInfo.video_url, // Fixed property name
                duration_minutes: lessonInfo.duration,
                lesson_order: lessonInfo.order,
                is_free: lessonInfo.isFree
              });
          }
        }
      }

      // Create assessment for each course
      const assessmentData = getCourseAssessment(course.title);
      await supabase
        .from('course_assessments')
        .insert({
          course_id: course.id,
          title: assessmentData.title,
          description: assessmentData.description,
          questions: assessmentData.questions,
          passing_score: assessmentData.passingScore,
          time_limit_minutes: assessmentData.timeLimit,
          max_attempts: 3
        });
    }

    console.log('Course content populated successfully!');
  } catch (error) {
    console.error('Error populating course content:', error);
  }
};

const getCourseModules = (courseTitle: string) => {
  const commonModules = {
    'Full Stack Web Development with React & Node.js': [
      {
        title: 'Introduction to Web Development',
        description: 'Overview of modern web development, tools, and ecosystem',
        order: 1,
        duration: 180,
        lessons: [
          { title: 'Welcome to Full Stack Development', content: 'Course overview, learning path, and career opportunities in full-stack development. Understanding the modern web development landscape.', type: 'video', video_url: 'https://example.com/intro', duration: 20, order: 1, isFree: true },
          { title: 'Setting Up Your Development Environment', content: 'Installing Node.js, VS Code, Git, and essential extensions. Configuring your workspace for maximum productivity.', type: 'video', video_url: 'https://example.com/setup', duration: 45, order: 2, isFree: true },
          { title: 'Introduction to Version Control with Git', content: 'Git basics, GitHub workflow, branching strategies, and collaborative development practices.', type: 'video', video_url: 'https://example.com/git', duration: 60, order: 3, isFree: false },
          { title: 'Command Line Mastery', content: 'Essential terminal commands, shell scripting basics, and workflow automation.', type: 'text', video_url: null, duration: 40, order: 4, isFree: false },
          { title: 'Module Project: Setup Personal Portfolio Repository', content: 'Hands-on project to apply version control concepts.', type: 'quiz', video_url: null, duration: 15, order: 5, isFree: false }
        ]
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Master modern JavaScript ES6+ features and core concepts',
        order: 2,
        duration: 300,
        lessons: [
          { title: 'JavaScript Basics and ES6+ Syntax', content: 'Variables, data types, operators, and modern syntax including let, const, and template literals.', type: 'video', video_url: 'https://example.com/js-basics', duration: 50, order: 1, isFree: false },
          { title: 'Functions and Arrow Functions', content: 'Function declarations, expressions, arrow functions, and their differences in scope and this binding.', type: 'video', video_url: 'https://example.com/functions', duration: 45, order: 2, isFree: false },
          { title: 'Objects and Destructuring', content: 'Object manipulation, destructuring assignments, spread/rest operators, and object methods.', type: 'video', video_url: 'https://example.com/objects', duration: 55, order: 3, isFree: false },
          { title: 'Arrays and Array Methods', content: 'Array manipulation with map, filter, reduce, forEach, and modern array methods.', type: 'video', video_url: 'https://example.com/arrays', duration: 50, order: 4, isFree: false },
          { title: 'Asynchronous JavaScript: Promises', content: 'Understanding asynchronous programming, callbacks, promises, and error handling.', type: 'video', video_url: 'https://example.com/promises', duration: 55, order: 5, isFree: false },
          { title: 'Async/Await and API Calls', content: 'Modern async syntax, fetch API, handling HTTP requests, and working with JSON.', type: 'video', video_url: 'https://example.com/async', duration: 45, order: 6, isFree: false }
        ]
      },
      {
        title: 'React Fundamentals',
        description: 'Build modern user interfaces with React',
        order: 3,
        duration: 360,
        lessons: [
          { title: 'Introduction to React and JSX', content: 'React philosophy, virtual DOM, components, and JSX syntax fundamentals.', type: 'video', video_url: 'https://example.com/react-intro', duration: 50, order: 1, isFree: false },
          { title: 'Components and Props', content: 'Functional components, props, prop types, and component composition patterns.', type: 'video', video_url: 'https://example.com/components', duration: 60, order: 2, isFree: false },
          { title: 'State Management with useState', content: 'Managing component state, state updates, and understanding re-renders.', type: 'video', video_url: 'https://example.com/state', duration: 55, order: 3, isFree: false },
          { title: 'useEffect and Lifecycle', content: 'Side effects, data fetching, cleanup functions, and dependency arrays.', type: 'video', video_url: 'https://example.com/effects', duration: 60, order: 4, isFree: false },
          { title: 'Event Handling and Forms', content: 'Handling user input, controlled components, form validation, and submission.', type: 'video', video_url: 'https://example.com/forms', duration: 50, order: 5, isFree: false },
          { title: 'React Router and Navigation', content: 'Client-side routing, route parameters, nested routes, and navigation patterns.', type: 'video', video_url: 'https://example.com/routing', duration: 55, order: 6, isFree: false },
          { title: 'Project: Build a Task Management App', content: 'Comprehensive project combining all React fundamentals learned so far.', type: 'quiz', video_url: null, duration: 30, order: 7, isFree: false }
        ]
      },
      {
        title: 'Advanced React Patterns',
        description: 'Master advanced React concepts and patterns',
        order: 4,
        duration: 280,
        lessons: [
          { title: 'Context API and Global State', content: 'Creating context, providers, consumers, and managing global application state.', type: 'video', video_url: 'https://example.com/context', duration: 55, order: 1, isFree: false },
          { title: 'Custom Hooks', content: 'Creating reusable hooks, hook composition, and best practices for custom hooks.', type: 'video', video_url: 'https://example.com/custom-hooks', duration: 50, order: 2, isFree: false },
          { title: 'Performance Optimization', content: 'useMemo, useCallback, React.memo, code splitting, and lazy loading techniques.', type: 'video', video_url: 'https://example.com/optimization', duration: 60, order: 3, isFree: false },
          { title: 'Error Boundaries and Error Handling', content: 'Implementing error boundaries, fallback UI, and robust error handling strategies.', type: 'video', video_url: 'https://example.com/errors', duration: 45, order: 4, isFree: false },
          { title: 'Testing React Applications', content: 'Jest, React Testing Library, writing unit and integration tests for components.', type: 'video', video_url: 'https://example.com/testing', duration: 70, order: 5, isFree: false }
        ]
      },
      {
        title: 'Node.js and Express Backend',
        description: 'Build robust backend APIs with Node.js',
        order: 5,
        duration: 340,
        lessons: [
          { title: 'Introduction to Node.js', content: 'Node.js architecture, event loop, modules, and npm ecosystem.', type: 'video', video_url: 'https://example.com/nodejs', duration: 45, order: 1, isFree: false },
          { title: 'Express.js Fundamentals', content: 'Setting up Express server, routing, middleware, and request/response handling.', type: 'video', video_url: 'https://example.com/express', duration: 60, order: 2, isFree: false },
          { title: 'RESTful API Design', content: 'REST principles, HTTP methods, status codes, and API best practices.', type: 'video', video_url: 'https://example.com/rest', duration: 55, order: 3, isFree: false },
          { title: 'Database Integration with MongoDB', content: 'MongoDB basics, Mongoose ODM, schemas, models, and CRUD operations.', type: 'video', video_url: 'https://example.com/mongodb', duration: 70, order: 4, isFree: false },
          { title: 'Authentication and Authorization', content: 'JWT tokens, password hashing, session management, and securing API endpoints.', type: 'video', video_url: 'https://example.com/auth', duration: 65, order: 5, isFree: false },
          { title: 'Error Handling and Validation', content: 'Input validation, error middleware, logging, and debugging techniques.', type: 'video', video_url: 'https://example.com/validation', duration: 45, order: 6, isFree: false }
        ]
      },
      {
        title: 'Full Stack Integration',
        description: 'Connect frontend and backend for complete applications',
        order: 6,
        duration: 300,
        lessons: [
          { title: 'API Integration in React', content: 'Axios, fetch, API service layers, and handling async data in React.', type: 'video', video_url: 'https://example.com/api-integration', duration: 60, order: 1, isFree: false },
          { title: 'State Management with React Query', content: 'Server state management, caching, mutations, and optimistic updates.', type: 'video', video_url: 'https://example.com/react-query', duration: 65, order: 2, isFree: false },
          { title: 'File Upload and Storage', content: 'Handling file uploads, cloud storage integration, and image optimization.', type: 'video', video_url: 'https://example.com/uploads', duration: 55, order: 3, isFree: false },
          { title: 'Real-time Features with WebSockets', content: 'Socket.io setup, real-time notifications, chat features, and live updates.', type: 'video', video_url: 'https://example.com/websockets', duration: 60, order: 4, isFree: false },
          { title: 'Deployment and DevOps', content: 'CI/CD pipelines, Docker basics, deploying to cloud platforms, and monitoring.', type: 'video', video_url: 'https://example.com/deployment', duration: 60, order: 5, isFree: false }
        ]
      },
      {
        title: 'Capstone Project',
        description: 'Build a complete full-stack social media application',
        order: 7,
        duration: 400,
        lessons: [
          { title: 'Project Planning and Architecture', content: 'Requirements gathering, database design, API planning, and project setup.', type: 'video', video_url: 'https://example.com/planning', duration: 60, order: 1, isFree: false },
          { title: 'Building the Backend API', content: 'Implementing all backend routes, authentication, and database operations.', type: 'video', video_url: 'https://example.com/backend-build', duration: 90, order: 2, isFree: false },
          { title: 'Creating the Frontend UI', content: 'Building responsive React components, routing, and state management.', type: 'video', video_url: 'https://example.com/frontend-build', duration: 90, order: 3, isFree: false },
          { title: 'Integrating Frontend and Backend', content: 'Connecting all features, testing integration, and fixing bugs.', type: 'video', video_url: 'https://example.com/integration', duration: 80, order: 4, isFree: false },
          { title: 'Testing and Deployment', content: 'Writing tests, optimizing performance, and deploying to production.', type: 'video', video_url: 'https://example.com/final-deploy', duration: 80, order: 5, isFree: false }
        ]
      }
    ],
    'Data Science & Machine Learning with Python': [
      {
        title: 'Python for Data Science',
        description: 'Master Python programming for data analysis',
        order: 1,
        duration: 280,
        lessons: [
          { title: 'Python Basics and Environment Setup', content: 'Installing Python, Jupyter notebooks, Anaconda, and essential tools for data science.', type: 'video', video_url: 'https://example.com/python-setup', duration: 40, order: 1, isFree: true },
          { title: 'Python Data Types and Structures', content: 'Lists, tuples, dictionaries, sets, and when to use each data structure.', type: 'video', video_url: 'https://example.com/datatypes', duration: 50, order: 2, isFree: true },
          { title: 'Control Flow and Functions', content: 'Loops, conditionals, function definitions, lambda functions, and comprehensions.', type: 'video', video_url: 'https://example.com/control-flow', duration: 55, order: 3, isFree: false },
          { title: 'Object-Oriented Programming in Python', content: 'Classes, objects, inheritance, and OOP principles for data science applications.', type: 'video', video_url: 'https://example.com/oop', duration: 60, order: 4, isFree: false },
          { title: 'File Handling and Data Import', content: 'Reading CSV, JSON, Excel files, and working with different data formats.', type: 'video', video_url: 'https://example.com/files', duration: 45, order: 5, isFree: false },
          { title: 'Python Best Practices', content: 'PEP 8, code organization, virtual environments, and documentation.', type: 'text', video_url: null, duration: 30, order: 6, isFree: false }
        ]
      },
      {
        title: 'NumPy for Numerical Computing',
        description: 'Master array operations and numerical computing',
        order: 2,
        duration: 240,
        lessons: [
          { title: 'Introduction to NumPy Arrays', content: 'Creating arrays, array attributes, and basic array operations.', type: 'video', video_url: 'https://example.com/numpy-intro', duration: 45, order: 1, isFree: false },
          { title: 'Array Indexing and Slicing', content: 'Advanced indexing techniques, boolean indexing, and fancy indexing.', type: 'video', video_url: 'https://example.com/indexing', duration: 50, order: 2, isFree: false },
          { title: 'Mathematical Operations', content: 'Universal functions, broadcasting, linear algebra operations, and statistics.', type: 'video', video_url: 'https://example.com/math-ops', duration: 60, order: 3, isFree: false },
          { title: 'Array Manipulation', content: 'Reshaping, stacking, splitting arrays, and memory-efficient operations.', type: 'video', video_url: 'https://example.com/manipulation', duration: 50, order: 4, isFree: false },
          { title: 'NumPy in Practice', content: 'Real-world examples and performance optimization techniques.', type: 'quiz', video_url: null, duration: 35, order: 5, isFree: false }
        ]
      },
      {
        title: 'Pandas for Data Analysis',
        description: 'Data manipulation and analysis with Pandas',
        order: 3,
        duration: 360,
        lessons: [
          { title: 'Pandas Series and DataFrames', content: 'Creating and manipulating Series and DataFrames, the core pandas structures.', type: 'video', video_url: 'https://example.com/pandas-basics', duration: 55, order: 1, isFree: false },
          { title: 'Data Selection and Filtering', content: 'loc, iloc, boolean masking, and query methods for data selection.', type: 'video', video_url: 'https://example.com/selection', duration: 60, order: 2, isFree: false },
          { title: 'Data Cleaning and Preprocessing', content: 'Handling missing data, duplicates, data type conversions, and outliers.', type: 'video', video_url: 'https://example.com/cleaning', duration: 65, order: 3, isFree: false },
          { title: 'GroupBy and Aggregations', content: 'Grouping data, aggregation functions, pivot tables, and cross-tabulation.', type: 'video', video_url: 'https://example.com/groupby', duration: 60, order: 4, isFree: false },
          { title: 'Merging and Joining DataFrames', content: 'Combining datasets with merge, join, concat, and handling different join types.', type: 'video', video_url: 'https://example.com/merging', duration: 55, order: 5, isFree: false },
          { title: 'Time Series Analysis', content: 'Working with datetime data, resampling, rolling windows, and time-based operations.', type: 'video', video_url: 'https://example.com/timeseries', duration: 65, order: 6, isFree: false }
        ]
      },
      {
        title: 'Data Visualization',
        description: 'Create compelling visualizations with Matplotlib and Seaborn',
        order: 4,
        duration: 280,
        lessons: [
          { title: 'Matplotlib Fundamentals', content: 'Figure and axes objects, basic plots, customization, and styling.', type: 'video', video_url: 'https://example.com/matplotlib', duration: 60, order: 1, isFree: false },
          { title: 'Advanced Matplotlib Techniques', content: 'Subplots, multiple axes, 3D plots, and complex visualizations.', type: 'video', video_url: 'https://example.com/advanced-mpl', duration: 55, order: 2, isFree: false },
          { title: 'Seaborn for Statistical Visualization', content: 'Statistical plots, distribution plots, categorical plots, and themes.', type: 'video', video_url: 'https://example.com/seaborn', duration: 60, order: 3, isFree: false },
          { title: 'Interactive Visualizations with Plotly', content: 'Creating interactive charts, dashboards, and web-based visualizations.', type: 'video', video_url: 'https://example.com/plotly', duration: 55, order: 4, isFree: false },
          { title: 'Visualization Best Practices', content: 'Color theory, accessibility, storytelling with data, and chart selection.', type: 'text', video_url: null, duration: 50, order: 5, isFree: false }
        ]
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning concepts and algorithms',
        order: 5,
        duration: 340,
        lessons: [
          { title: 'Introduction to Machine Learning', content: 'ML concepts, types of learning, supervised vs unsupervised, and ML workflow.', type: 'video', video_url: 'https://example.com/ml-intro', duration: 50, order: 1, isFree: false },
          { title: 'Data Preprocessing for ML', content: 'Feature scaling, encoding categorical variables, train-test split, and cross-validation.', type: 'video', video_url: 'https://example.com/preprocessing', duration: 65, order: 2, isFree: false },
          { title: 'Linear Regression', content: 'Simple and multiple linear regression, cost functions, and gradient descent.', type: 'video', video_url: 'https://example.com/linear-reg', duration: 60, order: 3, isFree: false },
          { title: 'Logistic Regression and Classification', content: 'Binary and multiclass classification, decision boundaries, and evaluation metrics.', type: 'video', video_url: 'https://example.com/logistic', duration: 55, order: 4, isFree: false },
          { title: 'Decision Trees and Random Forests', content: 'Tree-based models, ensemble methods, feature importance, and overfitting.', type: 'video', video_url: 'https://example.com/trees', duration: 60, order: 5, isFree: false },
          { title: 'Model Evaluation and Selection', content: 'Confusion matrix, precision, recall, F1-score, ROC curves, and hyperparameter tuning.', type: 'video', video_url: 'https://example.com/evaluation', duration: 50, order: 6, isFree: false }
        ]
      },
      {
        title: 'Advanced Machine Learning',
        description: 'Deep dive into advanced ML algorithms',
        order: 6,
        duration: 320,
        lessons: [
          { title: 'Support Vector Machines', content: 'SVM theory, kernel tricks, and applications for classification and regression.', type: 'video', video_url: 'https://example.com/svm', duration: 60, order: 1, isFree: false },
          { title: 'K-Means Clustering', content: 'Unsupervised learning, clustering algorithms, elbow method, and applications.', type: 'video', video_url: 'https://example.com/clustering', duration: 55, order: 2, isFree: false },
          { title: 'Principal Component Analysis', content: 'Dimensionality reduction, PCA theory, and feature extraction techniques.', type: 'video', video_url: 'https://example.com/pca', duration: 60, order: 3, isFree: false },
          { title: 'Natural Language Processing', content: 'Text preprocessing, TF-IDF, sentiment analysis, and text classification.', type: 'video', video_url: 'https://example.com/nlp', duration: 70, order: 4, isFree: false },
          { title: 'Introduction to Neural Networks', content: 'Neural network basics, activation functions, backpropagation, and Keras.', type: 'video', video_url: 'https://example.com/neural-nets', duration: 75, order: 5, isFree: false }
        ]
      },
      {
        title: 'Capstone: End-to-End ML Project',
        description: 'Complete machine learning project from data to deployment',
        order: 7,
        duration: 380,
        lessons: [
          { title: 'Project Setup and Data Collection', content: 'Defining the problem, gathering data, and setting up the project structure.', type: 'video', video_url: 'https://example.com/project-setup', duration: 60, order: 1, isFree: false },
          { title: 'Exploratory Data Analysis', content: 'Comprehensive EDA, finding patterns, and generating insights from data.', type: 'video', video_url: 'https://example.com/eda', duration: 80, order: 2, isFree: false },
          { title: 'Feature Engineering', content: 'Creating new features, feature selection, and improving model performance.', type: 'video', video_url: 'https://example.com/features', duration: 70, order: 3, isFree: false },
          { title: 'Model Training and Optimization', content: 'Training multiple models, hyperparameter tuning, and ensemble methods.', type: 'video', video_url: 'https://example.com/training', duration: 80, order: 4, isFree: false },
          { title: 'Model Deployment and API', content: 'Creating Flask API, containerization, and deploying ML models to production.', type: 'video', video_url: 'https://example.com/deploy', duration: 90, order: 5, isFree: false }
        ]
      }
    ]
  };

  return commonModules[courseTitle as keyof typeof commonModules] || [
    {
      title: 'Introduction',
      description: 'Course introduction and overview',
      order: 1,
      duration: 60,
      lessons: [
        {
          title: 'Welcome to the Course',
          content: 'Course introduction and what you will learn...',
          type: 'video',
          video_url: 'https://example.com/welcome',
          duration: 15,
          order: 1,
          isFree: true
        }
      ]
    }
  ];
};

const getCourseAssessment = (courseTitle: string) => {
  const assessments = {
    'Full Stack Web Development with React & Node.js': {
      title: 'Full Stack Development Assessment',
      description: 'Test your knowledge of React, Node.js, and web development concepts',
      passingScore: 75,
      timeLimit: 60,
      questions: [
        {
          id: '1',
          question: 'Which of the following is a React Hook for managing state?',
          type: 'single',
          options: ['useState', 'componentDidMount', 'render', 'constructor'],
          correct_answers: [0],
          points: 10
        },
        {
          id: '2',
          question: 'Select all valid HTTP methods: (Multiple answers)',
          type: 'multiple',
          options: ['GET', 'POST', 'DELETE', 'FETCH'],
          correct_answers: [0, 1, 2],
          points: 15
        }
      ]
    }
  };

  return assessments[courseTitle as keyof typeof assessments] || {
    title: 'Course Assessment',
    description: 'Test your knowledge from this course',
    passingScore: 70,
    timeLimit: 45,
    questions: [
      {
        id: '1',
        question: 'What is the main topic of this course?',
        type: 'single',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answers: [0],
        points: 20
      }
    ]
  };
};
