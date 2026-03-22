import { Course, Review, User, PointHistory, Inquiry, Notice, CreateReviewInput } from '../types/types';
import { mockNotices, mockInquiries } from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const PRODUCTION_API_BASE_URL = 'https://api.inha-eval.com';

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  if (typeof window === 'undefined') {
    return DEFAULT_API_BASE_URL;
  }

  const { hostname } = window.location;
  if (hostname === 'inha-eval.com' || hostname === 'www.inha-eval.com' || hostname === 'inha-eval.vercel.app') {
    return PRODUCTION_API_BASE_URL;
  }

  return hostname === 'localhost' ? DEFAULT_API_BASE_URL : window.location.origin;
};

const API_BASE_URL = resolveApiBaseUrl();
const USE_MOCK_AUTH = (import.meta.env.VITE_USE_MOCK_AUTH as string | undefined) === 'true';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
export const EMAIL_VERIFIED_KEY = 'email_verified';
export const EMAIL_PENDING_KEY = 'email_pending';
export const SIGNUP_DRAFT_KEY = 'signup_draft';
const DEFAULT_USER_TEMPLATE: User = {
  id: '',
  email: '',
  nickname: '',
  department: '컴퓨터공학과',
  points: 0,
  hasPass: false,
};

const getStoredAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
};

interface AuthResponse {
  accessToken: string;
  nickname: string;
  points: number;
}

interface CourseResponseDto {
  id: number;
  name: string;
  professor: string;
  department: string;
  credits?: number;
  semester?: string;
  rating: number;
  reviewCount: number;
  category: string;
  type: string;
  difficulty?: string;
  workload?: string;
  attendance?: string;
  grading?: string;
}

interface ReviewResponseDto {
  id: number;
  courseId: number;
  courseName: string;
  professorName: string;
  semester: string;
  rating: number;
  difficulty: string;
  workload: string;
  attendance: string;
  grading: string;
  content: string;
  likes: number;
  createdAt: string;
  isAnonymous: boolean;
  examTypes?: string[];
  assignmentType?: string;
  textbook?: string;
  oneLineTip?: string;
  examInfo?: string;
  examKeywords?: string[];
  recommendFor?: string[];
  notRecommendFor?: string[];
  diffScore?: number;
  teachingScore?: number;
  gradScore?: number;
  workScore?: number;
  prerequisiteScore?: number;
  depthScore?: number;
  timeInvestScore?: number;
  attScore?: number;
  pastExamScore?: number;
}

interface PointHistoryResponseDto {
  id: number;
  date: string;
  description: string;
  points: number;
}

const STRUCTURED_EXAM_INFO_PREFIX = '__INHA_EVAL_EXAM__:';

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

interface MockAuthAccount {
  email: string;
  password: string;
  nickname: string;
  department: string;
  points: number;
  hasPass?: boolean;
}

const MOCK_AUTH_ACCOUNTS: MockAuthAccount[] = [
  {
    email: 'heuka@inha.edu',
    password: 'inha1234',
    nickname: '강의평테스터',
    department: '컴퓨터공학과',
    points: 120,
    hasPass: true,
  },
];

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

const normalizeDifficulty = (value?: string): Course['difficulty'] => {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'medium';
};

const normalizeWorkload = (value?: string): Course['workload'] => {
  if (value === 'light' || value === 'medium' || value === 'heavy') return value;
  return 'medium';
};

const normalizeAttendance = (value?: string): Course['attendance'] => {
  if (value === 'strict' || value === 'medium' || value === 'flexible') return value;
  return 'medium';
};

const normalizeGrading = (value?: string): Course['grading'] => {
  if (value === 'generous' || value === 'medium' || value === 'strict') return value;
  return 'medium';
};

const parseStructuredExamInfo = (examInfo?: string) => {
  if (!examInfo || !examInfo.startsWith(STRUCTURED_EXAM_INFO_PREFIX)) {
    return null;
  }

  try {
    return JSON.parse(examInfo.slice(STRUCTURED_EXAM_INFO_PREFIX.length)) as {
      pastExamHelpfulness?: string;
      scopePredictability?: string;
      studyResources?: string[];
      examPrepTip?: string;
    };
  } catch {
    return null;
  }
};

const encodeStructuredExamInfo = (review: Pick<CreateReviewInput, 'pastExamHelpfulness' | 'scopePredictability' | 'studyResources' | 'examPrepTip'>) => {
  const hasStructuredInfo = Boolean(review.pastExamHelpfulness) ||
    Boolean(review.scopePredictability) ||
    (review.studyResources?.length ?? 0) > 0 ||
    Boolean(review.examPrepTip?.trim());

  if (!hasStructuredInfo) {
    return undefined;
  }

  return `${STRUCTURED_EXAM_INFO_PREFIX}${JSON.stringify({
    pastExamHelpfulness: review.pastExamHelpfulness,
    scopePredictability: review.scopePredictability,
    studyResources: review.studyResources ?? [],
    examPrepTip: review.examPrepTip?.trim() || '',
  })}`;
};

const mapCourseResponse = (course: CourseResponseDto): Course => ({
  id: String(course.id),
  name: course.name,
  professor: course.professor,
  department: course.department,
  credits: course.credits,
  rating: course.rating ?? 0,
  reviewCount: course.reviewCount ?? 0,
  difficulty: normalizeDifficulty(course.difficulty),
  workload: normalizeWorkload(course.workload),
  attendance: normalizeAttendance(course.attendance),
  grading: normalizeGrading(course.grading),
  category: course.category === '전공' ? '전공' : '교양',
  type: course.type ?? '',
});

const mapReviewResponse = (review: ReviewResponseDto): Review => {
  const structuredExamInfo = parseStructuredExamInfo(review.examInfo);

  return {
    id: String(review.id),
    courseId: String(review.courseId),
    courseName: review.courseName,
    professorName: review.professorName,
    semester: review.semester,
    rating: review.rating ?? 0,
    difficulty: normalizeDifficulty(review.difficulty),
    workload: normalizeWorkload(review.workload),
    attendance: normalizeAttendance(review.attendance),
    grading: normalizeGrading(review.grading),
    content: review.content,
    likes: review.likes ?? 0,
    createdAt: new Date(review.createdAt),
    isAnonymous: review.isAnonymous,
    examTypes: review.examTypes ?? [],
    assignmentType: review.assignmentType,
    textbook: review.textbook,
    oneLineTip: review.oneLineTip,
    examInfo: review.examInfo,
    examKeywords: review.examKeywords ?? [],
    pastExamHelpfulness: structuredExamInfo?.pastExamHelpfulness,
    scopePredictability: structuredExamInfo?.scopePredictability,
    studyResources: structuredExamInfo?.studyResources ?? review.examKeywords ?? [],
    examPrepTip: structuredExamInfo?.examPrepTip ?? review.oneLineTip,
    recommendFor: review.recommendFor ?? [],
    notRecommendFor: review.notRecommendFor ?? [],
    diffScore: review.diffScore,
    teachingScore: review.teachingScore,
    gradScore: review.gradScore,
    workScore: review.workScore,
    prerequisiteScore: review.prerequisiteScore,
    depthScore: review.depthScore,
    timeInvestScore: review.timeInvestScore,
    attScore: review.attScore,
    pastExamScore: review.pastExamScore,
  };
};

const mapPointHistoryResponse = (history: PointHistoryResponseDto): PointHistory => ({
  id: String(history.id),
  date: new Date(history.date),
  description: history.description,
  points: history.points,
});

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const authToken = getStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
  ...DEFAULT_USER_TEMPLATE,
  ...overrides,
  id: overrides.email ?? DEFAULT_USER_TEMPLATE.id,
  email: overrides.email ?? DEFAULT_USER_TEMPLATE.email,
  nickname: auth.nickname,
  department: overrides.department ?? DEFAULT_USER_TEMPLATE.department,
  points: auth.points,
  hasPass: overrides.hasPass ?? false,
  passExpiryDate: overrides.passExpiryDate,
});

const buildMockSessionUser = (account: MockAuthAccount): User => ({
  ...DEFAULT_USER_TEMPLATE,
  id: account.email,
  email: account.email,
  nickname: account.nickname,
  department: account.department,
  points: account.points,
  hasPass: account.hasPass ?? true,
  passExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

const requireCurrentUser = (): User => {
  if (!currentUser) {
    throw new Error('로그인이 필요합니다.');
  }

  return currentUser;
};

let currentUser: User | null = null;
let pointHistory: PointHistory[] = [];
let inquiries = [...mockInquiries];
let notices = [...mockNotices];

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const results = await apiRequest<CourseResponseDto[]>('/api/courses');
    return results.map(mapCourseResponse);
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    const result = await apiRequest<CourseResponseDto>(`/api/courses/${id}`);
    return mapCourseResponse(result);
  },

  searchCourses: async (query: string, department?: string, semester?: string): Promise<Course[]> => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (department && department !== '전체') params.set('department', department);
    if (semester && semester !== '전체') params.set('semester', semester);

    const searchPath = params.toString() ? `/api/courses/search?${params.toString()}` : '/api/courses/search';
    const results = await apiRequest<CourseResponseDto[]>(searchPath);
    return results.map(mapCourseResponse);
  },

  getHoneyGE: async (): Promise<Course[]> => {
    const results = await apiRequest<CourseResponseDto[]>('/api/courses/honey-ge');
    return results.map(mapCourseResponse);
  },

  getMajorRecommended: async (department: string): Promise<Course[]> => {
    const courses = await courseService.getAllCourses();
    return courses
      .filter((c) => c.department === department && c.category === '전공')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  },
};

export const reviewService = {
  getReviewsByCourseId: async (courseId: string): Promise<Review[]> => {
    const results = await apiRequest<ReviewResponseDto[]>(`/api/reviews/course/${courseId}`);
    return results.map(mapReviewResponse);
  },

  getReviewsByUserId: async (_userId: string): Promise<Review[]> => {
    const results = await apiRequest<ReviewResponseDto[]>('/api/reviews/my');
    return results.map(mapReviewResponse);
  },

  createReview: async (review: CreateReviewInput): Promise<Review> => {
    const structuredExamInfo = encodeStructuredExamInfo(review);

    const reviewId = await apiRequest<number>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        courseId: Number(review.courseId),
        semester: review.semester,
        rating: review.rating,
        difficulty: review.difficulty,
        workload: review.workload,
        attendance: review.attendance,
        grading: review.grading,
        content: review.content,
        isAnonymous: review.isAnonymous,
        examTypes: review.examTypes ?? [],
        assignmentType: review.assignmentType,
        textbook: review.textbook,
        oneLineTip: review.examPrepTip?.trim() || undefined,
        examInfo: structuredExamInfo,
        examKeywords: review.studyResources ?? [],
        recommendFor: review.recommendFor ?? [],
        notRecommendFor: review.notRecommendFor ?? [],
        diffScore: review.diffScore,
        teachingScore: review.teachingScore,
        gradScore: review.gradScore,
        workScore: review.workScore,
        prerequisiteScore: review.prerequisiteScore,
        depthScore: review.depthScore,
        timeInvestScore: review.timeInvestScore,
        attScore: review.attScore,
        pastExamScore: review.pastExamScore,
      }),
    });

    return {
      ...review,
      id: String(reviewId),
      courseName: '',
      professorName: '',
      likes: 0,
      createdAt: new Date(),
    };
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiRequest<void>(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
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
    if (USE_MOCK_AUTH) {
      await delay(200);
      const account = MOCK_AUTH_ACCOUNTS.find(
        (candidate) => candidate.email === email && candidate.password === password,
      );

      if (!account) {
        throw new Error('목 로그인 계정이 아니거나 비밀번호가 올바르지 않습니다.');
      }

      currentUser = buildMockSessionUser(account);
      saveAuthSession(`mock-token-${account.email}`, currentUser);
      return currentUser;
    }

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
    currentUser = null;
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
    const user = requireCurrentUser();

    if (user.points < 50) {
      throw new Error('포인트가 부족합니다.');
    }

    currentUser = {
      ...user,
      points: user.points - 50,
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

    return requireCurrentUser();
  },

  addPoints: async (amount: number, description: string): Promise<User> => {
    await delay(300);
    const user = requireCurrentUser();

    currentUser = {
      ...user,
      points: user.points + amount,
    };

    const history: PointHistory = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      description: description,
      points: amount,
    };
    pointHistory = [history, ...pointHistory];

    return requireCurrentUser();
  },

  getPointHistory: async (): Promise<PointHistory[]> => {
    const results = await apiRequest<PointHistoryResponseDto[]>('/api/points/history');
    pointHistory = results.map(mapPointHistoryResponse);
    return pointHistory;
  },

  updateProfile: async (data: { nickname?: string; department?: string }): Promise<User> => {
    await delay(400);
    const user = requireCurrentUser();

    currentUser = {
      ...user,
      ...(data.nickname && { nickname: data.nickname }),
      ...(data.department && { department: data.department }),
    };
    return requireCurrentUser();
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
    return requireCurrentUser();
  },

  deleteAccount: async (password: string): Promise<void> => {
    await delay(600);
    if (password === 'wrong') {
      throw new Error('비밀번호가 틀렸습니다.');
    }
    clearAuthSession();
    currentUser = null;
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
