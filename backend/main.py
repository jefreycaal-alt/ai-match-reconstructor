from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

from granite_client import get_package_with_fallback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/timeline")
def get_timeline(fresh: bool = False):
    # Reuse the saved backup unless ?fresh=true, to conserve watsonx tokens.
    if not fresh and os.path.exists("match_package_backup.json"):
        with open("match_package_backup.json", "r") as f:
            return json.load(f)

    with open("match_data.json", "r") as f:
        match_data = json.load(f)

    package = get_package_with_fallback(match_data)

    with open("match_package_backup.json", "w") as f:
        json.dump(package, f, indent=2)

    return package
