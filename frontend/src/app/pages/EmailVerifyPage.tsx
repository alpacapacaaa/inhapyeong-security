import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import { Button } from '../components/ui/button';
import { EMAIL_VERIFIED_KEY, userService } from '../api/api';

type VerifyStatus = 'loading' | 'success' | 'error';

export function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [message, setMessage] = useState('이메일 인증을 확인하고 있습니다.');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('인증 토큰이 없습니다. 메일의 링크를 다시 확인해주세요.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await userService.verifyEmailToken(token);
        sessionStorage.setItem(EMAIL_VERIFIED_KEY, 'true');
        setStatus('success');
        setMessage('이메일 인증이 완료되었습니다. 회원가입을 계속 진행해주세요.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || '이메일 인증에 실패했습니다. 링크가 만료되었는지 확인해주세요.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          {status === 'loading' && <Loader2 className="h-7 w-7 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="h-7 w-7" />}
          {status === 'error' && <MailWarning className="h-7 w-7" />}
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {status === 'loading' && '이메일 인증 중'}
          {status === 'success' && '이메일 인증 완료'}
          {status === 'error' && '이메일 인증 실패'}
        </h1>

        <p className="mb-6 text-sm font-medium leading-6 text-slate-500">{message}</p>

        <Button
          type="button"
          onClick={() => navigate('/auth?mode=signup')}
          className="w-full rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
        >
          회원가입으로 이동
        </Button>
      </div>
    </div>
  );
}
