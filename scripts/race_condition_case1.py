import threading
import urllib.request
import urllib.error
import json
import ssl
import time

BASE_URL = "https://api.inha-eval.com"
DELAY = 0.2  # T2 지연 200ms — T1 커밋 완료 후 T2 도달 유도

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

def refresh(token, label, results, delay=0.0):
    time.sleep(delay)
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
        if e.code == 401:
            print(f"[{label}] 401 Unauthorized  → T1 커밋 후 도달, 토큰 이미 삭제됨 → 강제 로그아웃")
        else:
            print(f"[{label}] {e.code} 오류")
    except Exception as e:
        print(f"[{label}] 연결 오류: {e}")

if __name__ == "__main__":
    print("=" * 55)
    print("  취약점 2 — Race Condition 재현 (케이스 1)")
    print("  T1 즉시 출발, T2는 200ms 후 도달 → 200 + 401")
    print("=" * 55)
    token = input("\nRefresh Token: ").strip()

    results = {}
    t1 = threading.Thread(target=refresh, args=(token, "T1", results, 0.0))
    t2 = threading.Thread(target=refresh, args=(token, "T2", results, DELAY))

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
            print(f"  {label}: {code} Unauthorized  → 강제 로그아웃")

    if results.get("T1") == 200 and results.get("T2") == 401:
        print("\n  ✓ 케이스 1 재현 성공")
        print("  T1 커밋 완료 후 T2 도달 → 토큰 이미 삭제 → 강제 로그아웃")
    else:
        print("\n  케이스 1 미발생 — 새 토큰으로 다시 실행해보세요.")
    print("=" * 55)
