# CamDHEA Facility Registry — Local Docker Deployment Guide

This guide walks you through deploying the GOFR Cambodia Facility Registry
(CamDHEA) on your own computer using Docker. It is written for users with
**low-to-medium technical experience** — no prior Docker or FHIR knowledge is
required.

By the end of this guide you will have a working CamDHEA registry running at
<http://localhost:4000> seeded with Cambodia's administrative boundaries and
ready for facility data entry.

---

## 1. What you will install

| Component        | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| **Git**          | To download the source code                          |
| **Docker**       | To run the registry without installing dependencies  |
| **Docker Compose** | To start all services together (usually bundled)   |

> Estimated time: **20–40 minutes**, mostly waiting for downloads/builds.
> Disk space required: **~5 GB**.
> RAM required: **8 GB minimum** (16 GB recommended).

---

## 2. Install the prerequisites

### 2.1 Install Git

- **Windows / macOS**: download and run the installer from
  <https://git-scm.com/downloads>.
- **Ubuntu / Debian Linux**:
  ```bash
  sudo apt update
  sudo apt install -y git
  ```

Verify:
```bash
git --version
```
You should see something like `git version 2.40.0`.

### 2.2 Install Docker Desktop (Windows/macOS) or Docker Engine (Linux)

- **Windows / macOS**: install Docker Desktop from
  <https://www.docker.com/products/docker-desktop/>. Launch it once after
  install so the Docker engine starts.
- **Ubuntu / Debian Linux**: follow the official instructions at
  <https://docs.docker.com/engine/install/ubuntu/>. Be sure to add your user to
  the `docker` group so you don't need `sudo` for every command:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

Verify:
```bash
docker --version
docker compose version
```
You should see versions for both.

> **macOS alternative — Homebrew + Colima (no Docker Desktop required)**
>
> If you prefer not to install Docker Desktop, you can use
> [Homebrew](https://brew.sh) and [Colima](https://github.com/abiosoft/colima):
>
> 1. Install Homebrew (requires admin/sudo for the first run):
>    ```bash
>    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
>    ```
> 2. Install the Docker CLI, Docker Compose plugin, buildx plugin, and Colima:
>    ```bash
>    brew install docker docker-compose docker-buildx colima
>    ```
> 3. Register the Compose plugin so `docker compose` works:
>    ```bash
>    mkdir -p ~/.docker
>    # Add cliPluginsExtraDirs to ~/.docker/config.json
>    python3 -c "
>    import json, os
>    path = os.path.expanduser('~/.docker/config.json')
>    cfg = json.load(open(path)) if os.path.exists(path) else {}
>    cfg.setdefault('cliPluginsExtraDirs', []).append('/opt/homebrew/lib/docker/cli-plugins')
>    json.dump(cfg, open(path,'w'), indent=2)
>    "
>    ```
> 4. Start the Docker daemon with enough resources (HAPI FHIR requires at least 6 GiB):
>    ```bash
>    colima start --cpu 4 --memory 8
>    ```
>    On subsequent Mac restarts, run the same command — Colima remembers the
>    settings, but you must start it manually each session.
>    > ⚠️ The default `colima start` (2 GiB) is **not enough**: HAPI FHIR will
>    > appear to start but hang at JVM initialization and never serve requests.
>
> After these steps, `docker --version` and `docker compose version` should both work.

---

## 3. Get the source code

Open a terminal (Terminal on macOS/Linux, PowerShell or Git Bash on Windows)
and run:

```bash
git clone https://github.com/moshonk/gofr.git
cd gofr
git checkout camdhea-features
```

You should now be on the `camdhea-features` branch. Verify with:
```bash
git branch --show-current
```
The output should be `camdhea-features`.

---

## 4. Start the registry

Move into the docker folder:

```bash
cd instant/docker
```

Build and start all services in the background:

```bash
docker compose up -d --build
```

What this does:
1. Builds a custom GOFR image (this includes building the web frontend and
   backend — first run takes 5–15 minutes depending on your machine and
   internet speed).
2. Pulls the supporting service images (PostgreSQL, HAPI FHIR, Redis,
   Keycloak).
3. Starts everything and seeds the FHIR database from
   `instant/docker/initdb/01_seed.sql` (Cambodia administrative boundaries
   and CamDHEA profiles).

When the command finishes, check that everything is running:

```bash
docker compose ps
```

All five services (`gofr`, `hapi-fhir`, `fhir-db`, `redis`, `keycloak`) should
show status `running` or `Up`.

> **Tip:** to watch logs while things start, run
> `docker compose logs -f gofr`. Press `Ctrl+C` to stop watching (this does
> not stop the container).

---

## 5. Open the registry in your browser

Open <http://localhost:4000>.

Sign in with the default administrator account:

| Field    | Value           |
| -------- | --------------- |
| Email    | `root@gofr.org` |
| Password | `gofr`          |

You should land on the GOFR home page. From the side menu you can:

- **Facility Registry → Jurisdictions** — browse Cambodia's provinces,
  districts, ODs, communes and villages (loaded from the seed).
- **Facility Registry → Facilities** — view, search and add facilities.
- **Facility Registry → Add Facility** — open the CamDHEA facility
  questionnaire (HFID auto-generates).

> **Change the password** on first login (top-right user menu → Change
> Password) before exposing the instance to anyone else.

---

## 6. Common operations

### Stop the registry (without deleting data)
```bash
docker compose stop
```

### Start it again
```bash
docker compose start
```

### Restart everything
```bash
docker compose restart
```

### View logs for a single service
```bash
docker compose logs -f gofr
docker compose logs -f fhir
```

### Apply code updates from GitHub
```bash
cd /path/to/gofr
git pull
cd instant/docker
docker compose up -d --build
```

### Remove everything (⚠️ deletes all entered data)
```bash
docker compose down -v
```
The `-v` flag also removes the database volume. Omit it to keep your data.

---

## 7. Troubleshooting

### "Port is already in use"
GOFR uses ports **4000** (UI), **8080** (FHIR), **8084** (Keycloak). If
another program is using one of these:

1. Stop the other program, **or**
2. Edit `instant/docker/docker-compose.yml` and change the left side of the
   `ports:` mapping (e.g. `"4001:4000"` to expose GOFR on port 4001).
3. Run `docker compose up -d` again.

### "Cannot connect to the Docker daemon"
- **Windows / macOS**: make sure Docker Desktop is running (look for the
  whale icon in the system tray / menu bar).
- **Linux**: start the service with `sudo systemctl start docker`.

### Login returns 401 / "invalid credentials"
The first-time bootstrap may not have finished yet. Wait 30–60 seconds and
try again. If it still fails:

```bash
docker compose logs --tail=200 gofr
```

Look for lines containing `defaultSetup` or `loadFSHFiles`. If you see a
stack trace, please open an issue on GitHub with the log output attached.

### Map shows the wrong region
The default map center is Phnom Penh, Cambodia. If you see a different
location, force-refresh the page (Ctrl+Shift+R / Cmd+Shift+R) to clear the
browser cache.

### Build fails with `node-gyp` or `python` errors
This usually means Docker doesn't have enough memory. In Docker Desktop go to
**Settings → Resources** and raise the memory limit to **at least 6 GB**,
then run `docker compose up -d --build` again.

### HAPI FHIR never starts / `localhost:4000` gives `ERR_EMPTY_RESPONSE`
HAPI FHIR requires significant JVM heap. If it starts, pegs a CPU core at
~99 % for more than a few minutes, and its logs stop at
`HHH000400: Using dialect`, the Docker VM doesn't have enough RAM and the JVM
is thrashing garbage collection.

- **Docker Desktop**: Settings → Resources → Memory → set to **at least 6 GB**.
- **Colima**: restart with more memory:

  ```bash
  docker compose down
  colima stop
  colima start --cpu 4 --memory 8
  cd /path/to/gofr/instant/docker
  docker compose up -d
  ```

---

## 8. What's running where

| Service     | URL                              | Purpose                               |
| ----------- | -------------------------------- | ------------------------------------- |
| GOFR UI     | <http://localhost:4000>          | The registry web app                  |
| HAPI FHIR   | <http://localhost:8080/fhir>     | Underlying FHIR R4 server             |
| Keycloak    | <http://localhost:8084>          | Optional identity provider (off by default) |
| PostgreSQL  | (internal, port 5432)            | Database for HAPI FHIR                |
| Redis       | (internal, port 6379)            | Session cache for GOFR                |

For any further questions, see the main repository
[README](../README.md) or open an issue at
<https://github.com/moshonk/gofr/issues>.
