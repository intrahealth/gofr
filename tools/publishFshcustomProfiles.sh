#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./publishFshcustomProfiles.sh --server http://localhost:8080/fhir [options]

Options:
  --partition DEFAULT         Target FHIR partition. Defaults to DEFAULT.
  --fshDir /path/to/fshcustom FSH package directory. Defaults to ../fshcustom.
  --resourceMode mode         Resource upload mode: pages or all-non-profiles. Defaults to pages.
  --pageGlob pattern          Non-profile page files to load. Defaults to Basic-gofr-page-*.json.
  --username user             Optional basic auth username.
  --password pass             Optional basic auth password.
  --updatePublisher           Force download of the latest publisher.jar.
  --skipSushi                 Skip the SUSHI generation step.
  --skipProfiles              Skip snapshot StructureDefinition upload.
  --skipPages                 Skip loading page Basic resources.
  --dryRun                    Print commands instead of executing them.
  --help                      Show this help.
EOF
}

print_command() {
  printf '+ '
  printf '%q ' "$@"
  printf '\n'
}

run_command() {
  if [[ "$dry_run" == true ]]; then
    print_command "$@"
  else
    "$@"
  fi
}

run_in_dir() {
  local dir="$1"
  shift
  if [[ "$dry_run" == true ]]; then
    printf '+ (cd %q && ' "$dir"
    printf '%q ' "$@"
    printf ')\n'
  else
    (
      cd "$dir"
      "$@"
    )
  fi
}

append_partition() {
  local base="${1%/}"
  local part="$2"
  if [[ -z "$part" ]]; then
    printf '%s\n' "$base"
  elif [[ "$base" == */"$part" ]]; then
    printf '%s\n' "$base"
  else
    printf '%s/%s\n' "$base" "$part"
  fi
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_dir="$(cd "$script_dir/.." && pwd)"

server=""
partition="DEFAULT"
fsh_dir="$repo_dir/fshcustom"
resource_mode="pages"
page_glob='Basic-gofr-page-*.json'
username=""
password=""
dry_run=false
update_publisher=false
skip_sushi=false
skip_profiles=false
skip_pages=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --server)
      server="$2"
      shift 2
      ;;
    --partition)
      partition="$2"
      shift 2
      ;;
    --fshDir)
      fsh_dir="$2"
      shift 2
      ;;
    --resourceMode)
      resource_mode="$2"
      shift 2
      ;;
    --pageGlob)
      page_glob="$2"
      shift 2
      ;;
    --username)
      username="$2"
      shift 2
      ;;
    --password)
      password="$2"
      shift 2
      ;;
    --updatePublisher)
      update_publisher=true
      shift
      ;;
    --skipSushi)
      skip_sushi=true
      shift
      ;;
    --skipProfiles)
      skip_profiles=true
      shift
      ;;
    --skipPages)
      skip_pages=true
      shift
      ;;
    --dryRun)
      dry_run=true
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$server" ]]; then
  echo "--server is required"
  usage
  exit 1
fi

if [[ ( -n "$username" && -z "$password" ) || ( -n "$password" && -z "$username" ) ]]; then
  echo "--username and --password must be provided together"
  exit 1
fi

if [[ "$resource_mode" != "pages" && "$resource_mode" != "all-non-profiles" ]]; then
  echo "--resourceMode must be one of: pages, all-non-profiles"
  exit 1
fi

fsh_dir="$(cd "$fsh_dir" && pwd)"
resource_dir="$fsh_dir/fsh-generated/resources"
publisher_jar="$fsh_dir/input-cache/publisher.jar"
page_server="$(append_partition "$server" "$partition")"

if [[ "$dry_run" == false ]]; then
  require_command node
  if [[ "$skip_sushi" == false ]]; then
    require_command sushi
  fi
  require_command java
fi

echo "Publishing from $fsh_dir"
echo "Resource directory: $resource_dir"
echo "FHIR server: $server"
echo "Partition: $partition"
echo "Resource mode: $resource_mode"

if [[ "$skip_sushi" == false ]]; then
  echo "Step 1: Generating FHIR resources with SUSHI"
  run_in_dir "$fsh_dir" sushi .
else
  echo "Step 1: Skipping SUSHI generation"
fi

if [[ "$update_publisher" == true || ! -f "$publisher_jar" ]]; then
  echo "Step 2: Refreshing IG Publisher"
  run_in_dir "$fsh_dir" ./_updatePublisher.sh -y
else
  echo "Step 2: Reusing existing IG Publisher at $publisher_jar"
fi

echo "Step 3: Generating snapshots with IG Publisher"
run_in_dir "$fsh_dir" ./_genonce.sh

if [[ "$skip_profiles" == false ]]; then
  echo "Step 4: Uploading snapshot-bearing StructureDefinitions"
  profile_command=(
    "$script_dir/publishSnapshotStructureDefinitions.js"
    --server "$server"
    --partition "$partition"
    --dir "$resource_dir"
  )
  if [[ -n "$username" ]]; then
    profile_command+=(--username "$username" --password "$password")
  fi
  if [[ "$dry_run" == true ]]; then
    profile_command+=(--dryRun)
  fi
  run_command "${profile_command[@]}"
else
  echo "Step 4: Skipping StructureDefinition upload"
fi

if [[ "$skip_pages" == false ]]; then
  echo "Step 5: Loading generated non-profile resources"
  load_description="page resources"
  if [[ "$resource_mode" == "pages" ]]; then
    mapfile -t resource_files < <(find "$resource_dir" -maxdepth 1 -type f -name "$page_glob" | sort)
    match_hint="$page_glob"
  else
    mapfile -t resource_files < <(find "$resource_dir" -maxdepth 1 -type f -name '*.json' ! -name 'StructureDefinition-*.json' | sort)
    match_hint='all non-StructureDefinition JSON resources'
    load_description='all non-profile generated resources'
  fi
  if [[ ${#resource_files[@]} -eq 0 ]]; then
    echo "No ${load_description} matched ${match_hint}"
  else
    echo "Matched ${#resource_files[@]} ${load_description}"
    load_command=(node "$script_dir/load.js" --server "$page_server")
    if [[ -n "$username" ]]; then
      load_command+=(--username "$username" --password "$password")
    fi
    load_command+=("${resource_files[@]}")
    run_command "${load_command[@]}"
  fi
else
  echo "Step 5: Skipping non-profile resource upload"
fi

echo "Publish flow complete"