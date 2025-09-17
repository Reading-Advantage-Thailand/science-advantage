#!/usr/bin/env bash
set -euo pipefail

# Seed GitHub issues from a sprint markdown file.
#
# Usage:
#   scripts/seed-issues.sh docs/sprint/S0.md "S0 – Skeleton + Auth" [--apply]
#
# Env (optional):
#   ASSIGNEE=@me                 # Assign created issues to a user
#   EXTRA_LABELS="priority:P1"   # Space-separated extra labels applied to every issue
#

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI 'gh' is not installed." >&2
  exit 1
fi

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <sprint-markdown> <milestone-name> [--apply]" >&2
  exit 1
fi

FILE="$1"
MILESTONE="$2"
APPLY=false
if [[ "${3:-}" == "--apply" ]]; then
  APPLY=true
fi

ASSIGNEE_ARG=()
if [[ -n "${ASSIGNEE:-}" ]]; then
  ASSIGNEE_ARG=(--assignee "$ASSIGNEE")
fi

EXTRA_LABELS_STR="${EXTRA_LABELS:-}"

if [[ ! -f "$FILE" ]]; then
  echo "Error: file not found: $FILE" >&2
  exit 1
fi

TOTAL_LINES=$(wc -l < "$FILE" | tr -d ' ')

# Gather start lines of each story header (lines beginning with '## ')
mapfile -t STARTS < <(grep -n "^## " "$FILE" || true)

if [[ ${#STARTS[@]} -eq 0 ]]; then
  echo "No stories found (expected '## ' headers) in $FILE" >&2
  exit 1
fi

echo "Sprint file: $FILE"
echo "Milestone:   $MILESTONE"
echo "Assignee:    ${ASSIGNEE:-<none>}"
echo "ExtraLabels: ${EXTRA_LABELS_STR:-<none>}"
echo "Mode:        $([[ $APPLY == true ]] && echo APPLY || echo DRY-RUN)"
echo

issue_count=0

for (( i=0; i<${#STARTS[@]}; i++ )); do
  start_line=$(echo "${STARTS[$i]}" | cut -d: -f1)
  title_line=$(sed -n "${start_line}p" "$FILE")
  title=${title_line#"## "}

  if (( i+1 < ${#STARTS[@]} )); then
    next_start=$(echo "${STARTS[$((i+1))]}" | cut -d: -f1)
    end_line=$((next_start-1))
  else
    end_line=$TOTAL_LINES
  fi

  # Extract body (lines after the title line up to end_line)
  body=$(sed -n "$((start_line+1)),$((end_line))p" "$FILE")

  # Extract Labels: line from body (comma-separated), remove from body
  labels_line=$(printf "%s\n" "$body" | sed -n 's/^Labels:[[:space:]]*//p' | head -n1 || true)
  body_clean=$(printf "%s\n" "$body" | sed '/^Labels:[[:space:]]*/d')

  # Build --label args
  label_args=()
  if [[ -n "$labels_line" ]]; then
    # Convert comma-separated into array
    IFS=',' read -r -a parts <<< "$labels_line"
    for raw in "${parts[@]}"; do
      lab=$(echo "$raw" | xargs) # trim
      [[ -n "$lab" ]] && label_args+=(--label "$lab")
    done
  fi
  # Add extra labels if provided (space-separated)
  if [[ -n "$EXTRA_LABELS_STR" ]]; then
    for lab in $EXTRA_LABELS_STR; do
      [[ -n "$lab" ]] && label_args+=(--label "$lab")
    done
  fi

  echo "[Story] $title"
  if [[ $APPLY == true ]]; then
    tmpfile=$(mktemp)
    printf "%s\n" "$body_clean" > "$tmpfile"
    num=$(gh issue create \
      --title "$title" \
      --body-file "$tmpfile" \
      --milestone "$MILESTONE" \
      "${label_args[@]}" \
      "${ASSIGNEE_ARG[@]}" \
      --json number --jq .number)
    rm -f "$tmpfile"
    echo "  -> Created issue #$num"
  else
    echo "  -> DRY-RUN would create with milestone '$MILESTONE' and labels: ${label_args[*]//--label /}"
  fi
  echo
  ((issue_count++))
done

echo "Processed $issue_count stories."

