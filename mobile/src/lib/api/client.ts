// SSL Pinning 적용 시: react-native-ssl-pinning 라이브러리 필요
// 프로덕션에서는 fetch 대신 아래처럼 교체해 MITM을 차단한다.
//
//   import { fetch as pinnedFetch } from 'react-native-ssl-pinning';
//   pinnedFetch(url, { ...init, sslPinning: { certs: ['api.inha-eval.com'] } })
//
// 개발 환경(Proxyman/Charles)에서는 핀을 제거해야 하므로
// EXPO_PUBLIC_DISABLE_SSL_PINNING=true 환경변수로 on/off를 분리한다.
import { apiConfig } from './config';
import { getAccessToken } from '../storage/tokenStorage';

const DEFAULT_ERROR_MESSAGE = '요청 처리 중 오류가 발생했습니다.';
let unauthorizedHandler: (() => Promise<void> | void) | null = null;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function setUnauthorizedHandler(handler: (() => Promise<void> | void) | null) {
  unauthorizedHandler = handler;
}

function parseErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return DEFAULT_ERROR_MESSAGE;
  }

  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string') {
    return record.message;
  }

  const firstText = Object.values(record).find((value) => typeof value === 'string');
  return typeof firstText === 'string' ? firstText : DEFAULT_ERROR_MESSAGE;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestUrl = `${apiConfig.baseUrl}${path}`;
  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Network request failed')) {
      throw new Error(
        `서버에 연결하지 못했습니다. 현재 주소: ${apiConfig.baseUrl}. Expo를 완전히 다시 시작했는지 확인해주세요.`,
      );
    }

    throw error;
  }

  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    const message = parseErrorMessage(errorData);

    if (response.status === 401 && unauthorizedHandler) {
      await unauthorizedHandler();
    }

    throw new ApiError(response.status, message);
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
