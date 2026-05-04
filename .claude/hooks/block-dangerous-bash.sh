#!/usr/bin/env bash
set -euo pipefail

INPUT="$(cat)"

# Extract command using grep/sed instead of jq
CMD="$(printf '%s' "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"command"[[:space:]]*:[[:space:]]*"//;s/"$//' || echo "")"

if echo "$CMD" | grep -Eq '(^|[[:space:]])rm[[:space:]]+-rf([[:space:]]|$)'; then
  cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Đã chặn lệnh Bash có dấu hiệu xóa dữ liệu nguy hiểm: rm -rf"}}
EOF
  exit 0
fi

if echo "$CMD" | grep -Fq ':(){ :|:& };:'; then
  cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Đã chặn fork bomb"}}
EOF
  exit 0
fi

exit 0
