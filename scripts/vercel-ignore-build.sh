#!/usr/bin/env bash
# ==============================================================================
# TalentXcel Vercel FinOps Ignore Build Step
# Script: scripts/vercel-ignore-build.sh
# Mission: TXC-SI-FINOPS-002 (Stage 9.4)
#
# PURPOSE:
# Automatically cancels redundant Vercel preview/production builds when a commit
# only touches documentation, markdown reports, or non-functional audit files.
#
# VERCEL EXIT CODE CONTRACT:
# - exit 0: CANCEL / SKIP the build (Conserves 5.2 Build CPU minutes)
# - exit 1: PROCEED with the build (Runs full build pipeline)
#
# FAIL-SAFE PRINCIPLE:
# Any error, missing variable, unrecognized file, or git command failure MUST
# exit with code 1 (PROCEED) to ensure zero silent deployment failures.
# ==============================================================================

set -o pipefail

echo "================================================================="
echo "🛡️  TALENTXCEL VERCEL FINOPS: IGNORE BUILD STEP AUDIT"
echo "================================================================="

# Step 1: Detect Commit Range
HEAD_SHA="${VERCEL_GIT_COMMIT_SHA:-HEAD}"
PREV_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"

echo "[vercel-ignore-build] Target commit: ${HEAD_SHA}"
if [ -n "${PREV_SHA}" ]; then
  echo "[vercel-ignore-build] Previous commit: ${PREV_SHA}"
fi

# Step 2: Validate Git Availability
if ! command -v git >/dev/null 2>&1; then
  echo "⚠️ [vercel-ignore-build] Git binary not found. Proceeding with build for safety."
  exit 1
fi

# Step 3: Determine Base Commit for Diff
BASE_REF=""

# Check if PREV_SHA is valid and not all zeros (initial push)
if [ -n "${PREV_SHA}" ] && [ "${PREV_SHA}" != "0000000000000000000000000000000000000000" ]; then
  if git cat-file -e "${PREV_SHA}^{commit}" >/dev/null 2>&1; then
    BASE_REF="${PREV_SHA}"
  fi
fi

# Fallback: Check HEAD^ if PREV_SHA is unavailable or invalid
if [ -z "${BASE_REF}" ]; then
  if git rev-parse --verify "${HEAD_SHA}^" >/dev/null 2>&1; then
    BASE_REF="${HEAD_SHA}^"
  else
    echo "⚠️ [vercel-ignore-build] No parent commit found for ${HEAD_SHA} (shallow clone or initial commit)."
    echo "➡️ [vercel-ignore-build] Proceeding with build."
    exit 1
  fi
fi

echo "[vercel-ignore-build] Comparing diff: ${BASE_REF} ... ${HEAD_SHA}"

# Step 4: Extract Changed Files
CHANGED_FILES=""
if ! CHANGED_FILES=$(git diff --name-only "${BASE_REF}" "${HEAD_SHA}" 2>/dev/null); then
  echo "⚠️ [vercel-ignore-build] 'git diff' command failed. Proceeding with build for safety."
  exit 1
fi

if [ -z "${CHANGED_FILES}" ]; then
  echo "⚠️ [vercel-ignore-build] No changed files detected in diff. Proceeding with build."
  exit 1
fi

# Step 5: Classify Changed Files
TOTAL_FILES=0
DOCS_ONLY_COUNT=0

# Critical pattern check: If any file matches application, config, or build assets, PROCEED IMMEDIATELY
while IFS= read -r file; do
  [ -z "$file" ] && continue

  # Strip leading and trailing quotes if Git quoted filename
  file="${file%\"}"
  file="${file#\"}"

  TOTAL_FILES=$((TOTAL_FILES + 1))

  # 1. Critical Application Files (MUST ALWAYS BUILD)
  case "$file" in
    src/*|public/*|api/*|supabase/*|scripts/*|.github/*)
      echo "➡️ [vercel-ignore-build] Critical path modified: '${file}'"
      echo "🚀 [vercel-ignore-build] PROCEEDING WITH BUILD (Exit 1)"
      exit 1
      ;;
    package.json|package-lock.json|pnpm-lock.yaml|yarn.lock|bun.lockb)
      echo "➡️ [vercel-ignore-build] Dependency manifest modified: '${file}'"
      echo "🚀 [vercel-ignore-build] PROCEEDING WITH BUILD (Exit 1)"
      exit 1
      ;;
    vercel.json|vite.config.*|tsconfig*|tailwind.config.*|postcss.config.*|index.html)
      echo "➡️ [vercel-ignore-build] Core build configuration modified: '${file}'"
      echo "🚀 [vercel-ignore-build] PROCEEDING WITH BUILD (Exit 1)"
      exit 1
      ;;
    *.ts|*.tsx|*.js|*.jsx|*.cjs|*.mjs|*.sql|*.json|*.css|*.html)
      # If code or config file is NOT in docs/ or reports/, it MUST build
      case "$file" in
        docs/*|reports/*)
          ;;
        *)
          echo "➡️ [vercel-ignore-build] Code asset modified: '${file}'"
          echo "🚀 [vercel-ignore-build] PROCEEDING WITH BUILD (Exit 1)"
          exit 1
          ;;
      esac
      ;;
  esac

  # 2. Whitelisted Documentation Paths
  case "$file" in
    docs/*|reports/*|scratch/*|.system_generated/*)
      DOCS_ONLY_COUNT=$((DOCS_ONLY_COUNT + 1))
      ;;
    *.md|*.markdown|LICENSE|CHANGELOG*|CONTRIBUTING*)
      DOCS_ONLY_COUNT=$((DOCS_ONLY_COUNT + 1))
      ;;
    *)
      # Any unclassified file defaults to PROCEED
      echo "➡️ [vercel-ignore-build] Unclassified file modified: '${file}'"
      echo "🚀 [vercel-ignore-build] PROCEEDING WITH BUILD for safety (Exit 1)"
      exit 1
      ;;
  esac
done <<< "$CHANGED_FILES"

# Step 6: Final Verification
if [ "${TOTAL_FILES}" -gt 0 ] && [ "${TOTAL_FILES}" -eq "${DOCS_ONLY_COUNT}" ]; then
  echo "✅ [vercel-ignore-build] All ${TOTAL_FILES} changed file(s) are documentation/reports."
  echo "🛑 [vercel-ignore-build] SKIPPING VERCEL BUILD (Exit 0) — Conserving 5.2 Build CPU minutes!"
  exit 0
fi

# Fallback: proceed
echo "➡️ [vercel-ignore-build] Diff contains mixed or non-doc files. Proceeding with build."
exit 1
