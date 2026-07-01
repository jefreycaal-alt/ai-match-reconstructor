import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")


def get_iam_token():
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": WATSONX_API_KEY,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    return response.json()["access_token"]


def generate_match_package(match_data: dict) -> dict:
    """
    Single Granite call returning match_summary, fan_reactions (both sides),
    and the event timeline together, to conserve free-tier tokens.
    """
    token = get_iam_token()

    system_prompt = """
You are a football match reconstructor AI. You will be given structured
match data and news context. Output ONLY a single valid JSON object with
exactly these three top-level keys. No other text. No markdown. No
explanation.

{
  "match_summary": "2-3 sentences. A sports-historian-style overview of the
    whole match: what happened and why it mattered.",
  "fan_reactions": {
    "argentina": "2-3 sentences capturing how Argentina supporters
      experienced this match emotionally.",
    "france": "2-3 sentences capturing how France supporters experienced
      this match emotionally."
  },
  "timeline": [
    {
      "minute": 23,
      "event_type": "GOAL | YELLOW_CARD | RED_CARD | SUBSTITUTION | KEY_MOMENT",
      "team": "team name",
      "player": "player name",
      "narrative": "2-3 sentences, emotionally engaging, like a live commentator",
      "video_file": "clip1.mp4 ... clip5.mp4 assigned in order to the most
        important 4-5 events, then null for the rest"
    }
  ]
}

Use the actual lowercase team names as the fan_reactions keys.
Sort timeline by minute ascending.
"""

    user_message = f"""
Here is the match data:
{json.dumps(match_data, indent=2)}

Generate the full JSON object as specified: match_summary, fan_reactions for
both teams, and the complete timeline.
"""

    response = requests.post(
        "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "model_id": "ibm/granite-3-8b-instruct",
            "input": f"<|system|>{system_prompt}<|user|>{user_message}<|assistant|>",
            "parameters": {"max_new_tokens": 2800, "temperature": 0.7},
            "project_id": WATSONX_PROJECT_ID,
        },
    )

    result_text = response.json()["results"][0]["generated_text"]

    # Clean up in case Granite adds markdown fences
    clean = result_text.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip().rstrip("```").strip()

    package = json.loads(clean)
    return package


def get_package_with_fallback(match_data: dict) -> dict:
    """
    Try Granite. If anything fails (network, token, bad JSON), fall back to a
    baked-in package so the demo NEVER shows a blank screen.
    """
    try:
        pkg = generate_match_package(match_data)
        # sanity check the shape
        assert "match_summary" in pkg and "timeline" in pkg
        pkg["_source"] = "granite"
        return pkg
    except Exception as e:
        print(f"[WARN] Granite call failed ({e}). Using fallback package.")
        fb = _fallback_package()
        fb["_source"] = "fallback"
        return fb


def _fallback_package() -> dict:
    return {
        "match_summary": (
            "Argentina beat France on penalties in the 2022 World Cup Final after "
            "a 3-3 thriller widely called the greatest final ever. Lionel Messi "
            "claimed the one trophy that had eluded him, while Kylian Mbappe's "
            "hat-trick made him only the second man to score three in a final."
        ),
        "fan_reactions": {
            "argentina": (
                "For Argentina fans it was catharsis decades in the making, dragging "
                "Messi to the summit at last. The penalty shootout was unbearable, "
                "and Montiel's winner unleashed pure delirium."
            ),
            "france": (
                "France supporters watched a dead game reborn through Mbappe's "
                "brilliance, only to fall agonizingly short. Pride and heartbreak in "
                "equal measure after coming so close to back-to-back titles."
            ),
        },
        "timeline": [
            {"minute": 23, "event_type": "GOAL", "team": "Argentina", "player": "Lionel Messi",
             "narrative": "Messi steps up and buries the penalty. The favorites strike first and the Argentine end of the stadium erupts.",
             "video_file": "clip1.mp4"},
            {"minute": 36, "event_type": "GOAL", "team": "Argentina", "player": "Angel Di Maria",
             "narrative": "A flowing team move ends with Di Maria sweeping it home. Argentina are flying and France look stunned.",
             "video_file": "clip2.mp4"},
            {"minute": 41, "event_type": "SUBSTITUTION", "team": "France", "player": "Olivier Giroud",
             "narrative": "Deschamps acts early, pulling Giroud and Dembele. France are desperate for a foothold.",
             "video_file": None},
            {"minute": 80, "event_type": "GOAL", "team": "France", "player": "Kylian Mbappe",
             "narrative": "Out of nowhere, Mbappe converts from the spot. Suddenly there's a pulse, and the final has a heartbeat again.",
             "video_file": "clip3.mp4"},
            {"minute": 81, "event_type": "GOAL", "team": "France", "player": "Kylian Mbappe",
             "narrative": "Ninety seconds later, a thunderous volley. Mbappe has dragged France level and turned the night upside down.",
             "video_file": "clip4.mp4"},
            {"minute": 108, "event_type": "GOAL", "team": "Argentina", "player": "Lionel Messi",
             "narrative": "Messi pokes home in extra time. Surely this is the moment that defines destiny.",
             "video_file": None},
            {"minute": 118, "event_type": "GOAL", "team": "France", "player": "Kylian Mbappe",
             "narrative": "Mbappe again, ice cold from the spot, completing his hat-trick. 3-3. Penalties await.",
             "video_file": None},
            {"minute": 120, "event_type": "KEY_MOMENT", "team": "Argentina", "player": "Emiliano Martinez",
             "narrative": "Martinez stretches and saves from Coman. The keeper becomes the hero the moment demanded.",
             "video_file": "clip5.mp4"},
            {"minute": 120, "event_type": "KEY_MOMENT", "team": "Argentina", "player": "Gonzalo Montiel",
             "narrative": "Montiel steps up and scores. Argentina are champions of the world. Messi has his crown.",
             "video_file": None},
        ],
    }


if __name__ == "__main__":
    with open("match_data.json", "r") as f:
        match_data = json.load(f)

    print("Sending to Granite...")
    package = get_package_with_fallback(match_data)
    print(f"Source: {package.get('_source')}")
    print(json.dumps(package, indent=2))

    with open("match_package_backup.json", "w") as f:
        json.dump(package, f, indent=2)
    print("\nSaved backup to match_package_backup.json")
