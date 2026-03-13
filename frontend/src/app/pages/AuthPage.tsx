import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { departments } from '../data/mockData';
import { EMAIL_PENDING_KEY, EMAIL_VERIFIED_KEY, SIGNUP_DRAFT_KEY, userService } from '../api/api';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, GraduationCap, Loader2, Lock, Mail } from 'lucide-react';

interface AuthPageProps {
  onLogin?: () => void;
}

type AuthMode = 'login' | 'signup' | 'find-password';

interface SignupDraft {
  email: string;
  nickname: string;
  department: string;
  phone: string;
}

const normalizePhoneNumber = (value: string) => value.replace(/[^0-9]/g, '').slice(0, 11);

const formatPhoneNumber = (value: string) => {
  const digits = normalizePhoneNumber(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const getPasswordValidationMessage = (value: string) => {
  if (!value) {
    return '비밀번호는 8자 이상, 영문과 숫자를 모두 포함해야 합니다.';
  }

  if (value.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return '영문과 숫자를 모두 포함해주세요.';
  }

  return '';
};

export function AuthPage({ onLogin }: AuthPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';
  const initialSignupDraft: SignupDraft =
    typeof window !== 'undefined'
      ? (() => {
          const raw = localStorage.getItem(SIGNUP_DRAFT_KEY);
          if (!raw) {
            return { email: '', nickname: '', department: '', phone: '' };
          }

          try {
            const parsed = JSON.parse(raw) as Partial<SignupDraft>;
            return {
              email: parsed.email ?? '',
              nickname: parsed.nickname ?? '',
              department: parsed.department ?? '',
              phone: parsed.phone ?? '',
            };
          } catch {
            localStorage.removeItem(SIGNUP_DRAFT_KEY);
            return { email: '', nickname: '', department: '', phone: '' };
          }
        })()
      : { email: '', nickname: '', department: '', phone: '' };
  const initialStoredSignupEmail =
    typeof window !== 'undefined' && initialMode === 'signup'
      ? localStorage.getItem(EMAIL_PENDING_KEY) ?? localStorage.getItem(EMAIL_VERIFIED_KEY) ?? initialSignupDraft.email
      : '';
  const initialVerifiedEmail = typeof window !== 'undefined' ? localStorage.getItem(EMAIL_VERIFIED_KEY) ?? '' : '';
  const initialEmailVerified = !!initialStoredSignupEmail && initialVerifiedEmail === initialStoredSignupEmail;

  const [email, setEmail] = useState(initialStoredSignupEmail);
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(initialSignupDraft.nickname);
  const [department, setDepartment] = useState(initialSignupDraft.department);
  const [phone, setPhone] = useState(initialSignupDraft.phone);
  const [isLoading, setIsLoading] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(initialEmailVerified);
  const [isEmailSent, setIsEmailSent] = useState(initialEmailVerified);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isPhoneCodeSent, setIsPhoneCodeSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState('');

  const [findPwdStep, setFindPwdStep] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [signupStep, setSignupStep] = useState(1);
  const [signupPasswordTouched, setSignupPasswordTouched] = useState(false);

  const isLogin = initialMode === 'login';
  const isSignup = initialMode === 'signup';
  const isFindPwd = initialMode === 'find-password';
  const signupPasswordValidationMessage = getPasswordValidationMessage(password);
  const showSignupPasswordError = signupStep === 2 && signupPasswordTouched && !!signupPasswordValidationMessage;

  const resetStates = () => {
    setEmail('');
    setPassword('');
    setNickname('');
    setDepartment('');
    setPhone('');
    setIsLoading(false);
    localStorage.removeItem(EMAIL_VERIFIED_KEY);
    localStorage.removeItem(EMAIL_PENDING_KEY);
    localStorage.removeItem(SIGNUP_DRAFT_KEY);
    setIsEmailVerified(false);
    setIsEmailSent(false);
    setIsPhoneVerified(false);
    setIsPhoneCodeSent(false);
    setPhoneCode('');
    setFindPwdStep(1);
    setNewPassword('');
    setNewPasswordConfirm('');
    setSignupStep(1);
    setSignupPasswordTouched(false);
  };

  useEffect(() => {
    if (!isSignup) {
      return;
    }

    const draft: SignupDraft = {
      email,
      nickname,
      department,
      phone,
    };

    const hasValue = Object.values(draft).some(Boolean);
    if (!hasValue) {
      localStorage.removeItem(SIGNUP_DRAFT_KEY);
      return;
    }

    localStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
  }, [department, email, isSignup, nickname, phone]);

  const changeMode = (mode: AuthMode) => {
    resetStates();
    navigate(`/auth?mode=${mode}`);
  };

  const requireInhaEmail = () => {
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('이메일 형식이 올바르지 않습니다.');
      return false;
    }

    if (!email.endsWith('@inha.edu')) {
      toast.error('인하대 이메일(@inha.edu) 형식이 아닙니다.');
      return false;
    }
    return true;
  };

  const requirePhoneNumber = () => {
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
      toast.error('전화번호를 입력해주세요.');
      return false;
    }

    if (normalizedPhone.length < 10) {
      toast.error('전화번호를 끝까지 입력해주세요.');
      return false;
    }

    if (!/^01[0-9]{8,9}$/.test(normalizedPhone)) {
      toast.error('전화번호 형식이 올바르지 않습니다.');
      return false;
    }
    return true;
  };

  const handleSendEmailVerification = async () => {
    if (!requireInhaEmail()) {
      return;
    }

    localStorage.removeItem(EMAIL_VERIFIED_KEY);
    localStorage.setItem(EMAIL_PENDING_KEY, email);
    setIsEmailVerified(false);
    setIsLoading(true);
    try {
      await userService.sendVerificationEmail(email);
      setIsEmailSent(true);
      toast.success('인증 메일을 발송했습니다. 메일함에서 링크를 클릭한 뒤 다음 단계로 진행해주세요.');
    } catch (error: any) {
      toast.error(error.message || '인증 메일 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const syncEmailVerificationState = () => {
      const isVerified = !!email && localStorage.getItem(EMAIL_VERIFIED_KEY) === email;
      setIsEmailVerified(isVerified);
      setIsEmailSent(!!email && localStorage.getItem(EMAIL_PENDING_KEY) === email);
    };

    const syncEmailVerification = (event: StorageEvent) => {
      if (event.key !== EMAIL_VERIFIED_KEY && event.key !== EMAIL_PENDING_KEY) {
        return;
      }

      const isVerified = !!email && localStorage.getItem(EMAIL_VERIFIED_KEY) === email;
      setIsEmailVerified(isVerified);
      setIsEmailSent(!!email && localStorage.getItem(EMAIL_PENDING_KEY) === email);
    };

    syncEmailVerificationState();
    window.addEventListener('storage', syncEmailVerification);
    window.addEventListener('focus', syncEmailVerificationState);
    document.addEventListener('visibilitychange', syncEmailVerificationState);
    return () => {
      window.removeEventListener('storage', syncEmailVerification);
      window.removeEventListener('focus', syncEmailVerificationState);
      document.removeEventListener('visibilitychange', syncEmailVerificationState);
    };
  }, [email]);

  const handleSendPhoneCode = async () => {
    if (!requirePhoneNumber()) {
      return;
    }

    setIsLoading(true);
    try {
      await userService.sendVerificationPhone(normalizePhoneNumber(phone));
      setIsPhoneCodeSent(true);
      toast.success('휴대폰 인증번호를 발송했습니다.');
    } catch (error: any) {
      toast.error(error.message || '인증번호 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!phoneCode) {
      toast.error('인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await userService.verifyPhoneCode(normalizePhoneNumber(phone), phoneCode);
      setIsPhoneVerified(true);
      toast.success('휴대폰 인증이 완료되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '휴대폰 인증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindPassword = async () => {
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    if (!requireInhaEmail()) {
      return;
    }

    if (!phone.trim()) {
      toast.error('전화번호를 입력해주세요.');
      return;
    }

    if (!requirePhoneNumber()) {
      return;
    }

    setIsLoading(true);
    try {
      await userService.findPassword(email, normalizePhoneNumber(phone));
      setFindPwdStep(2);
      toast.success('회원 정보 확인이 완료되었습니다. 발송된 인증번호를 입력해주세요.');
    } catch (error: any) {
      toast.error(error.message || '일치하는 회원 정보가 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindPwdVerifyPhone = async () => {
    if (!phoneCode) {
      toast.error('인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await userService.verifyPhoneCode(normalizePhoneNumber(phone), phoneCode);
      setFindPwdStep(3);
      toast.success('인증 성공. 새 비밀번호를 입력해주세요.');
    } catch (error: any) {
      toast.error(error.message || '인증번호 검증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const passwordValidationMessage = getPasswordValidationMessage(newPassword);
    if (passwordValidationMessage) {
      toast.error(passwordValidationMessage);
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await userService.resetPassword(email, newPassword, normalizePhoneNumber(phone), newPasswordConfirm);
      toast.success('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      changeMode('login');
    } catch (error: any) {
      toast.error(error.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isSignup && signupStep === 1) {
      if (!isEmailVerified || !isPhoneVerified) {
        toast.error('이메일과 휴대폰 인증을 완료해주세요.');
        return;
      }

      setSignupStep(2);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          toast.error('이메일과 비밀번호를 입력해주세요.');
          return;
        }

        await userService.login(email, password);
        onLogin?.();
        toast.success('로그인되었습니다.');
        navigate('/');
        return;
      }

      if (isSignup) {
        if (!email || !password || !nickname || !department || !phone) {
          toast.error('모든 항목을 입력해주세요.');
          return;
        }

        if (signupPasswordValidationMessage) {
          setSignupPasswordTouched(true);
          toast.error(signupPasswordValidationMessage);
          return;
        }

        await userService.signup({
          email,
          password,
          nickname,
          department,
          phoneNumber: normalizePhoneNumber(phone),
        });
        localStorage.removeItem(EMAIL_VERIFIED_KEY);
        localStorage.removeItem(EMAIL_PENDING_KEY);
        localStorage.removeItem(SIGNUP_DRAFT_KEY);
        onLogin?.();
        toast.success('회원가입이 완료되었습니다.');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 blur-3xl opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-sky-100 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-100 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-3 shadow-lg shadow-indigo-100">
            {isFindPwd ? <Lock className="w-7 h-7 text-white" /> : <GraduationCap className="w-7 h-7 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? '다시 만나서 반가워요' : isSignup ? (signupStep === 1 ? '인하대생 인증하기' : '기본 정보 입력') : '비밀번호 찾기'}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {isLogin
              ? '서비스를 이용하려면 로그인해주세요'
              : isSignup
                ? (signupStep === 1 ? '메일 링크 인증과 휴대폰 인증을 완료해주세요' : '가입에 필요한 정보를 입력해주세요')
                : '등록된 이메일과 전화번호로 본인 확인을 진행합니다'}
          </p>
        </div>

        {isSignup && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${signupStep === 1 ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-50' : 'bg-emerald-100 text-emerald-600'}`}>
              {signupStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <div className={`h-0.5 w-10 transition-all ${signupStep > 1 ? 'bg-emerald-200' : 'bg-slate-100'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${signupStep === 2 ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-50' : 'bg-slate-100 text-slate-400'}`}>
              2
            </div>
          </div>
        )}

        <form onSubmit={isFindPwd ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {isFindPwd && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5">
                {findPwdStep === 1 && (
                  <>
                    <div className="space-y-1.5 font-bold">
                      <Label htmlFor="find-email" className="text-sm text-slate-700 ml-1">이메일</Label>
                      <Input
                        id="find-email"
                        type="email"
                        placeholder="example@inha.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-xl h-12 px-4 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5 font-bold">
                      <Label htmlFor="find-phone" className="text-sm text-slate-700 ml-1">전화번호</Label>
                        <Input
                          id="find-phone"
                          type="tel"
                          placeholder="010-1234-5678"
                          value={phone}
                          onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                          className="bg-gray-50 border-gray-200 rounded-xl h-12 px-4 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <Button
                      type="button"
                      onClick={handleFindPassword}
                      disabled={isLoading}
                      className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all mt-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : '인증번호 받기'}
                    </Button>
                  </>
                )}

                {findPwdStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-xs text-center text-slate-500 font-bold bg-slate-50 py-3 rounded-xl">
                      휴대폰({phone})으로 전송된 인증번호 6자리를 입력해주세요.
                    </p>
                    <Input
                      type="text"
                      placeholder="인증코드 6자리"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="bg-white/50 border-slate-200 rounded-xl h-12 text-center text-lg tracking-widest font-black"
                    />
                    <Button
                      type="button"
                      onClick={handleFindPwdVerifyPhone}
                      disabled={isLoading}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
                    >
                      인증하기
                    </Button>
                  </div>
                )}

                {findPwdStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5 font-bold">
                      <Label className="text-sm text-slate-700 ml-1">새 비밀번호</Label>
                      <Input
                        type="password"
                        placeholder="8자 이상"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/50 border-slate-200 rounded-xl h-12 px-4"
                      />
                    </div>
                    <div className="space-y-1.5 font-bold">
                      <Label className="text-sm text-slate-700 ml-1">새 비밀번호 확인</Label>
                      <Input
                        type="password"
                        placeholder="비밀번호 다시 입력"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        className="bg-white/50 border-slate-200 rounded-xl h-12 px-4"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isLoading}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-100"
                    >
                      비밀번호 변경 완료
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isLogin && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">이메일</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@inha.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-11 bg-gray-50 border-gray-200 focus:border-indigo-600 focus:ring-indigo-500/20 focus:ring-2 transition-all rounded-xl h-12 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-sm font-bold text-slate-700">비밀번호</Label>
                    <button
                      type="button"
                      onClick={() => changeMode('find-password')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-gray-50 border-gray-200 focus:border-indigo-600 focus:ring-indigo-500/20 focus:ring-2 transition-all rounded-xl h-12 font-medium"
                  />
                </div>
              </div>
            )}

            {isSignup && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                {signupStep === 1 && (
                  <>
                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <Label htmlFor="signup-email" className="text-sm font-bold text-slate-700">학교 이메일</Label>
                      <div className="flex gap-2">
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="example@inha.edu"
                          value={email}
                          onChange={(e) => {
                            const nextEmail = e.target.value;
                            setEmail(nextEmail);
                            setIsEmailSent(false);
                            if (localStorage.getItem(EMAIL_VERIFIED_KEY) !== nextEmail) {
                              localStorage.removeItem(EMAIL_VERIFIED_KEY);
                            }
                            localStorage.removeItem(EMAIL_PENDING_KEY);
                            setIsEmailVerified(false);
                          }}
                          disabled={isLoading}
                          className="flex-1 bg-white border-slate-200 rounded-xl h-12 px-4"
                        />
                        <Button
                          type="button"
                          onClick={handleSendEmailVerification}
                          disabled={isLoading || !email}
                          className="bg-slate-900 text-white rounded-xl h-12 px-4 text-xs font-bold shrink-0"
                        >
                          {isEmailSent ? '재발송' : '메일발송'}
                        </Button>
                      </div>
                      {isEmailSent && (
                        <div className="space-y-3 rounded-xl bg-white p-3 border border-indigo-100">
                          {!isEmailVerified ? (
                            <p className="text-xs leading-5 text-slate-600">
                              메일의 인증 링크를 누르면 이 화면이 자동으로 갱신됩니다. 인증 후 원래 창으로 돌아와주세요.
                            </p>
                          ) : (
                            <p className="text-xs font-semibold text-emerald-600">이메일 인증이 완료되었습니다.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <Label htmlFor="signup-phone" className="text-sm font-bold text-slate-700">휴대폰 번호</Label>
                      <div className="flex gap-2">
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="010-1234-5678"
                          value={phone}
                          onChange={(e) => {
                            setPhone(formatPhoneNumber(e.target.value));
                            setIsPhoneCodeSent(false);
                            setIsPhoneVerified(false);
                            setPhoneCode('');
                          }}
                          disabled={isLoading}
                          className="flex-1 bg-white border-slate-200 rounded-xl h-12 px-4"
                        />
                        <Button
                          type="button"
                          onClick={handleSendPhoneCode}
                          disabled={isLoading || !phone || !isEmailVerified}
                          className="bg-slate-900 text-white rounded-xl h-12 px-4 text-xs font-bold shrink-0"
                        >
                          {isPhoneCodeSent ? '재발송' : '인증발송'}
                        </Button>
                      </div>
                      {isPhoneCodeSent && !isPhoneVerified && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="인증코드 6자리"
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="flex-1 bg-indigo-50/50 border-indigo-100 rounded-xl h-12 px-4 font-bold text-center tracking-widest"
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyPhoneCode}
                            className="bg-indigo-600 text-white rounded-xl h-12 px-4 text-xs font-bold"
                          >
                            코드확인
                          </Button>
                        </div>
                      )}
                      {isPhoneVerified && (
                        <p className="text-xs font-semibold text-emerald-600">휴대폰 인증이 완료되었습니다.</p>
                      )}
                    </div>
                  </>
                )}

                {signupStep === 2 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-2"
                    >
                      <ArrowRight className="w-3 h-3 rotate-180" /> 이전 인증 단계로
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="password-signup" className="text-sm font-bold text-slate-700 ml-1">비밀번호</Label>
                        <Input
                          id="password-signup"
                          type="password"
                          placeholder="영문+숫자 포함 8자 이상"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => setSignupPasswordTouched(true)}
                          className={`bg-white/50 rounded-xl h-12 px-4 focus:ring-2 ${
                            showSignupPasswordError
                              ? 'border-red-400 focus:ring-red-200'
                              : 'border-slate-200 focus:ring-indigo-500'
                          }`}
                        />
                        <p className={`text-xs ml-1 ${showSignupPasswordError ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                          {showSignupPasswordError ? signupPasswordValidationMessage : '영문과 숫자를 포함한 8자 이상으로 입력해주세요.'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="nickname" className="text-sm font-bold text-slate-700 ml-1">닉네임</Label>
                        <Input
                          id="nickname"
                          type="text"
                          placeholder="닉네임"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="bg-white/50 border-slate-200 rounded-xl h-12 px-4 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="department" className="text-sm font-bold text-slate-700 ml-1">소속 학과</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger className="bg-white/50 border-slate-200 rounded-xl h-12 px-4 w-full font-medium focus:ring-2 focus:ring-indigo-500 text-left">
                          <SelectValue placeholder="학과를 선택해주세요" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] rounded-2xl shadow-xl border-slate-200">
                          {departments.filter((d) => d !== '전체').map((dept) => (
                            <SelectItem key={dept} value={dept} className="font-medium">
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {(isLogin || isSignup) && (
            <Button
              type="submit"
              disabled={isLoading || (isSignup && signupStep === 1 && (!isEmailVerified || !isPhoneVerified))}
              className={`w-full h-14 mt-4 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 ${isSignup && signupStep === 1 ? 'bg-slate-900 hover:bg-black shadow-slate-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  처리 중...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? '로그인하기' : signupStep === 1 ? '다음 단계로' : '가입 완료하기'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          )}

          <div className="text-center pt-4 border-t border-slate-100">
            {isLogin ? (
              <p className="text-sm text-slate-600 font-semibold">
                아직 회원이 아니신가요?{' '}
                <button
                  type="button"
                  onClick={() => changeMode('signup')}
                  className="text-indigo-600 font-bold hover:underline underline-offset-4 ml-1"
                >
                  새로 가입하기
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-600 font-semibold">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => changeMode('login')}
                  className="text-indigo-600 font-bold hover:underline underline-offset-4 ml-1"
                >
                  로그인하기
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
