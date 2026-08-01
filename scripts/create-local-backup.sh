#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
workspace_root="$(cd "${repo_root}/.." && pwd)"
backup_root="${GLORYSTARPACK_BACKUP_DIR:-${workspace_root}/backups/glorystarpacking}"
timestamp="$(date +%Y%m%d-%H%M%S)"
commit="$(git -C "${repo_root}" rev-parse --short HEAD)"
bundle_path="${backup_root}/glorystarpacking-${timestamp}-${commit}.bundle"

mkdir -p "${backup_root}"
git -C "${repo_root}" bundle create "${bundle_path}" --all
git bundle verify "${bundle_path}" >/dev/null
printf '%s\n' "${bundle_path}"
