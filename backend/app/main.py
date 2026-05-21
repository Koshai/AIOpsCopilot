from fastapi import FastAPI

app = FastAPI(title="AI Ops Copilot")


@app.get("/")
async def root():
    return {"message": "AI Ops Copilot Backend Running"}