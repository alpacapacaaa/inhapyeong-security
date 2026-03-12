import { Course, Review, User, PointHistory, Inquiry, Notice } from '../types/types';
import { mockCourses, mockReviews, mockUser, mockPointHistory, mockNotices, mockInquiries } from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
export const EMAIL_VERIFIED_KEY = 'email_verified';
export const EMAIL_PENDING_KEY = 'email_pending';
export const SIGNUP_DRAFT_KEY = 'signup_draft';

interface AuthResponse {
  accessToken: string;
  nickname: string;
  points: number;
}

interface SignupPayload {
  email: string;
  password: string;
  nickname: string;
  department: string;
  phoneNumber: string;
}

interface PasswordResetPayload {
  phoneNumber: string;
  newPassword: string;
  newPasswordConfirm: string;
}

const parseErrorMessage = (data: unknown): string => {
  if (!data || typeof data !== 'object') {
    return '요청 처리 중 오류가 발생했습니다.';
  }

  const record = data as Record<string, unknown>;

  if (typeof record.message === 'string') {
    return record.message;
  }

  const firstMessage = Object.values(record).find((value) => typeof value === 'string');
  return typeof firstMessage === 'string' ? firstMessage : '요청 처리 중 오류가 발생했습니다.';
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new Error(parseErrorMessage(errorData));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const saveAuthSession = (token: string, user: User) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const loadStoredUser = (): User | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

const buildSessionUser = (
  auth: AuthResponse,
  overrides: Partial<Pick<User, 'email' | 'department' | 'hasPass' | 'passExpiryDate'>> = {},
): User => ({
  ...mockUser,
  ...overrides,
  id: overrides.email ?? mockUser.id,
  email: overrides.email ?? mockUser.email,
  nickname: auth.nickname,
  department: overrides.department ?? mockUser.department,
  points: auth.points,
  hasPass: overrides.hasPass ?? false,
  passExpiryDate: overrides.passExpiryDate,
});

// In-memory storage for the session (so updates work locally)
let courses = [...mockCourses];
let reviews = [...mockReviews];
let currentUser = { ...mockUser };
let pointHistory = [...mockPointHistory];
let inquiries = [...mockInquiries];
let notices = [...mockNotices];

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    await delay(300);
    return courses;
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    await delay(200);
    return courses.find((c) => c.id === id);
  },

  searchCourses: async (query: string, department?: string, semester?: string): Promise<Course[]> => {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return courses.filter(
      (c) =>
        (c.name.toLowerCase().includes(lowerQuery) ||
          c.professor.toLowerCase().includes(lowerQuery) ||
          c.department.toLowerCase().includes(lowerQuery)) &&
        (!department || department === '전체' || c.department === department)
    );
  },

  getHoneyGE: async (): Promise<Course[]> => {
    await delay(300);
    return courses
      .filter((c) => c.category === '교양' && (c.difficulty === 'easy' || c.rating >= 4.0))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  },

  getMajorRecommended: async (department: string): Promise<Course[]> => {
    await delay(300);
    return courses
      .filter((c) => c.department === department && c.category === '전공')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  },
};

export const reviewService = {
  getReviewsByCourseId: async (courseId: string): Promise<Review[]> => {
    await delay(300);
    return reviews.filter((r) => r.courseId === courseId);
  },

  getReviewsByUserId: async (userId: string): Promise<Review[]> => {
    await delay(300);
    // Since mock reviews don't have userId, we'll assume the current user is the author of all of them for now
    // or better, just return a subset or add userId to mock reviews. 
    // The current mockReviews don't have userId. I should probably add it or filter assuming ownership.
    // For now, let's just return all reviews as if the user wrote them (or the first few).
    // Actually, looking at mockReviews, they don't have author ID.
    // Let's just return the first 3 for demo purposes, as MyPage used slice(0, 3).
    return reviews.slice(0, 3);
  },

  createReview: async (review: Omit<Review, 'id' | 'createdAt' | 'likes' | 'courseName' | 'professorName'>): Promise<Review> => {
    await delay(500);
    const course = courses.find(c => c.id === review.courseId);

    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      likes: 0,
      courseName: course?.name || '',
      professorName: course?.professor || '',
    };

    reviews = [newReview, ...reviews];

    // Update course stats
    if (course) {
      const courseReviews = reviews.filter(r => r.courseId === review.courseId);
      const avgRating = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;

      const updatedCourse = {
        ...course,
        reviewCount: courseReviews.length,
        rating: avgRating
      };

      courses = courses.map(c => c.id === course.id ? updatedCourse : c);
    }

    return newReview;
  },
};

export const userService = {
  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;

    const storedUser = loadStoredUser();
    if (storedUser) {
      currentUser = storedUser;
      return storedUser;
    }

    return currentUser;
  },

  login: async (email: string, password?: string): Promise<User> => {
    const auth = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    currentUser = buildSessionUser(auth, { email });
    saveAuthSession(auth.accessToken, currentUser);

    return currentUser;
  },

  logout: async (): Promise<void> => {
    clearAuthSession();
  },

  signup: async (payload: SignupPayload): Promise<User> => {
    const auth = await apiRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    currentUser = buildSessionUser(auth, {
      email: payload.email,
      department: payload.department,
    });
    saveAuthSession(auth.accessToken, currentUser);

    return currentUser;
  },

  sendVerificationEmail: async (email: string): Promise<void> => {
    await apiRequest<void>('/api/auth/email/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyEmailToken: async (token: string): Promise<void> => {
    const encodedToken = encodeURIComponent(token);
    await apiRequest<void>(`/api/auth/email/verify?token=${encodedToken}`, {
      method: 'GET',
    });
  },

  sendVerificationPhone: async (phone: string): Promise<void> => {
    await apiRequest<void>('/api/auth/phone/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone }),
    });
  },

  verifyPhoneCode: async (phone: string, code: string): Promise<boolean> => {
    await apiRequest<void>('/api/auth/phone/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone, code }),
    });
    return true;
  },

  findPassword: async (email: string, phone: string): Promise<void> => {
    await apiRequest<void>('/api/auth/password/send', {
      method: 'POST',
      body: JSON.stringify({ email, phoneNumber: phone }),
    });
  },

  resetPassword: async (_email: string, newPassword: string, phoneNumber?: string, newPasswordConfirm?: string): Promise<void> => {
    const payload: PasswordResetPayload = {
      phoneNumber: phoneNumber ?? '',
      newPassword,
      newPasswordConfirm: newPasswordConfirm ?? newPassword,
    };

    await apiRequest<void>('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  purchasePass: async (): Promise<User> => {
    await delay(400);
    if (currentUser.points < 50) {
      throw new Error('포인트가 부족합니다.');
    }

    currentUser = {
      ...currentUser,
      points: currentUser.points - 50,
      hasPass: true,
      passExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    // Add history
    const history: PointHistory = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      description: '열람권 구매',
      points: -50,
    };
    pointHistory = [history, ...pointHistory];

    return currentUser;
  },

  addPoints: async (amount: number, description: string): Promise<User> => {
    await delay(300);
    currentUser = {
      ...currentUser,
      points: currentUser.points + amount,
    };

    const history: PointHistory = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      description: description,
      points: amount,
    };
    pointHistory = [history, ...pointHistory];

    return currentUser;
  },

  getPointHistory: async (): Promise<PointHistory[]> => {
    await delay(300);
    return pointHistory;
  },

  updateProfile: async (data: { nickname?: string; department?: string }): Promise<User> => {
    await delay(400);
    currentUser = {
      ...currentUser,
      ...(data.nickname && { nickname: data.nickname }),
      ...(data.department && { department: data.department }),
    };
    return currentUser;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await delay(500);
    if (currentPassword === 'wrong') {
      throw new Error('현재 비밀번호가 틀렸습니다.');
    }
    if (newPassword.length < 4) {
      throw new Error('새 비밀번호는 4자리 이상이어야 합니다.');
    }
    console.log(`Password changed to ${newPassword}`);
  },

  changePhone: async (newPhone: string, verificationCode: string): Promise<User> => {
    await delay(400);
    if (verificationCode !== '111111') {
      throw new Error('인증코드가 일치하지 않습니다.');
    }
    // Phone is stored conceptually (not in User type currently, but we accept it)
    console.log(`Phone changed to ${newPhone}`);
    return currentUser;
  },

  deleteAccount: async (password: string): Promise<void> => {
    await delay(600);
    if (password === 'wrong') {
      throw new Error('비밀번호가 틀렸습니다.');
    }
    clearAuthSession();
    // Reset to initial state
    currentUser = { ...mockUser };
  },

  // --- Inquiry & Notice ---
  submitInquiry: async (data: { category: string; title: string; content: string }): Promise<Inquiry> => {
    await delay(500);
    const newInquiry: Inquiry = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: '접수',
      createdAt: new Date(),
    };
    inquiries = [newInquiry, ...inquiries];
    return newInquiry;
  },

  getMyInquiries: async (): Promise<Inquiry[]> => {
    await delay(300);
    return inquiries;
  },

  getNotices: async (): Promise<Notice[]> => {
    await delay(300);
    return notices;
  },
};
