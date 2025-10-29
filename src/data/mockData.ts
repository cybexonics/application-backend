
export interface LiveSession {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  duration: number; // in minutes
  description?: string;
}

export interface CourseContent {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  duration?: number; // in minutes, for videos
  url?: string;
  content?: string; // for text content
}

export interface Course {
  id: string;
  title: string;
  shortName: string;
  description: string;
  price: number;
  instructor: string;
  enrolledCount?: number;
  progress?: number;
  content?: CourseContent[];
  upcomingLiveSessions?: LiveSession[];
  isPurchased?: boolean;
}

// Mock data for enrolled courses (student view)
export const mockEnrolledCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    shortName: 'WD',
    description: 'Learn the fundamentals of web development with HTML, CSS, and JavaScript',
    price: 2999,
    instructor: 'John Smith',
    progress: 65,
    upcomingLiveSessions: [
      {
        id: 'session1',
        title: 'JavaScript Fundamentals',
        course: 'Introduction to Web Development',
        date: '2025-05-15',
        time: '10:00 AM',
        duration: 60,
        description: 'Understanding JavaScript basics and how to manipulate the DOM'
      }
    ]
  },
  {
    id: '2',
    title: 'Mobile App Design Fundamentals',
    shortName: 'AD',
    description: 'Master the principles of mobile UI/UX design',
    price: 3499,
    instructor: 'Sarah Johnson',
    progress: 30,
    upcomingLiveSessions: [
      {
        id: 'session2',
        title: 'Prototyping with Figma',
        course: 'Mobile App Design Fundamentals',
        date: '2025-05-18',
        time: '2:00 PM',
        duration: 90,
        description: 'Learn how to create interactive prototypes using Figma'
      }
    ]
  }
];

// Mock data for teacher courses
export const mockTeacherCourses: Course[] = [
  {
    id: '3',
    title: 'Advanced Data Structures',
    shortName: 'DS',
    description: 'Master complex data structures and algorithms',
    price: 3999,
    instructor: 'Teacher Demo',
    enrolledCount: 45,
    upcomingLiveSessions: [
      {
        id: 'ls3',
        title: 'Graph Algorithms',
        course: 'Advanced Data Structures',
        date: '2025-05-14',
        time: '11:00 AM',
        duration: 75,
        description: 'Understanding graph traversal algorithms and their applications'
      }
    ]
  },
  {
    id: '4',
    title: 'Machine Learning Basics',
    shortName: 'ML',
    description: 'Introduction to machine learning concepts and techniques',
    price: 4999,
    instructor: 'Teacher Demo',
    enrolledCount: 32,
    upcomingLiveSessions: [
      {
        id: 'ls4',
        title: 'Supervised Learning',
        course: 'Machine Learning Basics',
        date: '2025-05-16',
        time: '3:00 PM',
        duration: 90,
        description: 'Classification and regression techniques in machine learning'
      }
    ]
  }
];

// Mock data for available courses (not yet purchased)
export const mockAvailableCourses: Course[] = [
  ...mockTeacherCourses,
  {
    id: '5',
    title: 'Digital Marketing Strategy',
    shortName: 'DM',
    description: 'Comprehensive guide to digital marketing techniques',
    price: 2499,
    instructor: 'Mike Wilson',
    enrolledCount: 89
  },
  {
    id: '6',
    title: 'Python Programming',
    shortName: 'PY',
    description: 'Master Python programming from basics to advanced concepts',
    price: 3299,
    instructor: 'Emily Chen',
    enrolledCount: 120
  }
];
