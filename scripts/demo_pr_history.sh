#!/usr/bin/env bash
# PR #4~#7 각각의 before/after 커밋을 git worktree로 체크아웃해서
# 그 시점에 실제로 존재했던 테스트를 그대로 돌려본다.
# 테스트 파일은 절대 수정하지 않는다 — 해당 커밋에 있던 그대로 실행해야
# "그 시점에 실제로 무엇이 보였는지"를 정직하게 보여줄 수 있다.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_ROOT="/tmp/inhapyeong-pr-demo"
rm -rf "$WORK_ROOT"
mkdir -p "$WORK_ROOT"

cleanup() {
  for dir in "$WORK_ROOT"/*/; do
    [ -d "$dir" ] || continue
    git -C "$REPO_ROOT" worktree remove "$dir" --force >/dev/null 2>&1 || true
  done
  rm -rf "$WORK_ROOT"
}
trap cleanup EXIT

# run_at <label> <sha> <gradle-test-pattern>
run_at() {
  local label="$1" sha="$2" pattern="$3"
  local dir="$WORK_ROOT/${sha}"
  git -C "$REPO_ROOT" worktree add -q --detach "$dir" "$sha"
  echo
  echo "================================================================"
  echo "  $label"
  echo "  commit: $(git -C "$REPO_ROOT" log -1 --format='%h %s' "$sha")"
  echo "================================================================"
  ( cd "$dir/backend" && ./gradlew test --tests "$pattern" 2>&1 \
      | grep -E "FAILED|completed|BUILD (SUCCESSFUL|FAILED)" ) || true
  git -C "$REPO_ROOT" worktree remove "$dir" --force >/dev/null 2>&1 || true
}

echo "######################################################################"
echo "# PR #5 — 네트워크·원자성 방어 (jti 블랙리스트, SSL Pinning)"
echo "# before: JtiBlacklistTest 자체가 존재하지 않음 (PR#5에서 신규 추가됨)"
echo "######################################################################"
run_at "PR #5 after — jti 블랙리스트 적용 후" 6a486e0 \
  "com.inhaeval.backend.service.JtiBlacklistTest"

echo
echo "######################################################################"
echo "# PR #4 — Issue #1 취약점 재현 (Before 상태 증명)"
echo "# 이 PR은 프로덕션 코드를 바꾸지 않고 '취약점이 존재한다'는 증거만 추가한다"
echo "# 기대 결과: 취약점 2, 3 테스트가 통과해야 정상 (= 버그가 실제로 있다는 뜻)"
echo "######################################################################"
run_at "PR #4 — 취약점 재현 테스트" 0c8693e \
  "com.inhaeval.backend.service.RefreshTokenVulnerabilityTest"

echo
echo "######################################################################"
echo "# PR #6 — 동시성 방어 (ReentrantLock)"
echo "# before: 락 없음 → 위 PR#4 결과가 곧 '동시성 방어 적용 전' 상태"
echo "# after : self 프록시 도입으로 Mockito 단위 테스트는 전부 NPE가 난다."
echo "#         (이건 락이 안 먹혀서가 아니라, Spring 컨텍스트 없는 순수 Mockito"
echo "#          테스트가 self 필드를 주입 못 해서 생기는 '테스트 한계'다.)"
echo "######################################################################"
run_at "PR #6 after — self 프록시 도입 후 (Mockito 한계로 NPE 예상)" 04c8cfe \
  "com.inhaeval.backend.service.RefreshTokenVulnerabilityTest"

echo
echo "######################################################################"
echo "# PR #7 — Refresh Token Reuse Detection"
echo "# before: PR#6의 self 이슈가 이미 있어서 같은 한계로 NPE/AssertionError"
echo "# after : 신규 테스트 RefreshTokenReuseDetectionTest도 같은 한계로 깨짐"
echo "######################################################################"
run_at "PR #7 before (=PR#6 after)" 04c8cfe \
  "com.inhaeval.backend.service.RefreshTokenVulnerabilityTest"
run_at "PR #7 after — Reuse Detection 추가 후" c554144 \
  "com.inhaeval.backend.service.RefreshTokenReuseDetectionTest"

cat <<'EOF'

######################################################################
# 요약
######################################################################
- PR #5, PR #4: 기존 테스트로 깨끗하게 before/after 증명 가능.
- PR #6, #7   : self 프록시 도입 이후 Mockito 단위 테스트가 전부 깨진다.
                이는 동시성 방어/Reuse Detection이 안 먹혀서가 아니라,
                @InjectMocks가 self 필드를 채워주지 못해서 생기는
                "테스트 하니스 한계"다 (실제 운영 코드는 Spring 컨텍스트에서
                정상적으로 self 프록시를 통해 동작한다).
- PR #6/#7가 "진짜로" 방어되는지 보려면:
    1) 로컬에 백엔드를 실제로 띄우고 (MySQL/Redis 필요)
    2) scripts/race_condition_case1.py, race_condition_case2.py,
       rotation_blind_spot.py 를 그 서버에 실행
  이 방식은 README에 적힌 데모 도구(Proxyman/VisualVM/MySQL Workbench)와
  동일한 경로이며, self 프록시를 포함한 실제 Spring 빈 그래프를 그대로 탄다.
EOF
