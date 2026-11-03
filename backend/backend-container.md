# 🏭 Industrial Intelligence Backend

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

This is the core tracking engine and API for the Industrial Intelligence platform. It uses **FastAPI**, **SQLModel**, and **PostgreSQL** (running in Docker).

## 🚀 How to Run

### 1. Start the Database (Docker)

Ensure Docker Desktop is running. This starts the PostgreSQL engine in the background.

```bash
docker compose up -d

```

*The `-d` flag runs it in "detached" mode so it stays alive after you close the terminal.*

### 2. Start the Backend (Python/WSL)

In your WSL terminal, navigate to the `backend` folder and use `uv` to start the development server:

```bash
cd backend
uv run uvicorn app.main:app --reload

```

* **API Docs:** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)
* **Base URL:** `http://localhost:8000/v1`

---

## 🛑 How to Stop

### Stop the Backend

In the terminal where Uvicorn is running, press:
`Ctrl + C`

### Stop the Database

To stop the background Postgres container without deleting your data:

```bash
docker compose stop

```

### Complete Reset (Warning: Wipes Data)

To stop the containers and delete the database volumes (starting from scratch):

```bash
docker compose down -v

```

---

## 🚢 Deployment (Railway / VPS)

When you are ready to go live, follow these steps:

### 1. Environment Variables

Ensure the following variables are set in your production environment (e.g., Railway Dashboard):

* `DATABASE_URL`: Your production Postgres connection string.
* `ENVIRONMENT`: `production`
* `CORS_ORIGINS`: `["https://your-site.com"]`

### 2. The Dockerfile

Your `Dockerfile` in the project root should look like this:

```dockerfile
FROM ghcr.io/astral-sh/uv:python3.12-alpine

WORKDIR /app
COPY . .

# Install dependencies using uv
RUN uv sync --frozen

# Start the application
CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port \"$PORT\""]

```

### 3. Deploy Command

If using a CLI for deployment:

```bash
# Example for Railway
railway up

```

---

## 🚀 Deployment (Render.com)

### 1. Database Setup

* Create a **New PostgreSQL** database on Render.
* Once created, copy the **Internal Database URL** (for the backend) and the **External Database URL** (for local migrations).

### 2. Backend Service

* Create a **New Web Service** and connect your GitHub repository.
* **Environment:** `Python 3` (Render will detect your `pyproject.toml` if using the `uv` build provider).
* **Build Command:**
```bash
pip install uv && uv sync --frozen

```


* **Start Command:**
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT

```



### 3. Environment Variables

In the Render dashboard, add these under **Environment**:

* `DATABASE_URL`: (Paste your Render PostgreSQL URL)
* `ENVIRONMENT`: `production`
* `PYTHON_VERSION`: `3.12`

---

## 🛠️ The "Local Test" (Final Check)

Since everything is back up and running, let's verify the **`test_tracker.html`** works. This confirms that your `tracker.js` can talk to the database before you push it to production.

1. **Open the file:** Drag `test_tracker.html` into your browser.
2. **Check the logs:** Look at your VS Code terminal. You should see:
`INFO: 127.0.0.1:XXXX - "POST /v1/track/ HTTP/1.1" 200 OK`
3. **Confirm in DB:**
```bash
docker exec -it industrial_db_container psql -U postgres -d industrial_db -c "SELECT * FROM visit;"

```



### One quick Render tip:

Render's **Free Tier** for Web Services "spins down" (goes to sleep) after 15 minutes of inactivity. This means your first tracking ping of the day might take 30 seconds to wake up the server. For a tracker, you might eventually want their **Starter** plan ($7/mo) to keep it "always on" so you don't miss any hits.


---

## 🛠️ Database Maintenance

To look inside the running database container:

```bash
docker exec -it industrial_db_container psql -U postgres -d industrial_db

```

---

## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.
