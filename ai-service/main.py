from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from pathlib import Path
from dotenv import load_dotenv
import uvicorn

# Load environment variables before anything else
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
if not os.getenv("DATABASE_URL"):
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

from core.database import create_tables, close_pool
from routes.review import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown — close all pooled connections
    close_pool()


app = FastAPI(
    title="CodeReview AI",
    description="AI-powered code review service backed by Google Gemini and Supabase.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:80",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Routes
app.include_router(router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
