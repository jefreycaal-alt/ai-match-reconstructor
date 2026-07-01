import requests
import os
from dotenv import load_dotenv

load_dotenv("../../.env")

FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY")
BASE_URL = "https://api.football-data.org/v4"


def get_match_events(team_a: str, team_b: str, date: str) -> dict:
    headers = {"X-Auth-Token": FOOTBALL_API_KEY}
    params = {"dateFrom": date, "dateTo": date}
    response = requests.get(f"{BASE_URL}/matches", headers=headers, params=params)
    matches = response.json().get("matches", [])

    target_match = None
    for match in matches:
        home = match["homeTeam"]["name"].lower()
        away = match["awayTeam"]["name"].lower()
        if team_a.lower() in home or team_a.lower() in away:
            if team_b.lower() in home or team_b.lower() in away:
                target_match = match
                break

    if not target_match:
        return {"error": "Match not found", "events": []}

    match_id = target_match["id"]
    detail = requests.get(f"{BASE_URL}/matches/{match_id}", headers=headers).json()
    return detail


if __name__ == "__main__":
    headers = {"X-Auth-Token": FOOTBALL_API_KEY}
    response = requests.get(f"{BASE_URL}/competitions/2021/matches?status=FINISHED", headers=headers)
    matches = response.json().get("matches", [])
    for m in matches[:10]:
        print(m["utcDate"], m["homeTeam"]["name"], "vs", m["awayTeam"]["name"])

if __name__ == "__main__":
    headers = {"X-Auth-Token": FOOTBALL_API_KEY}
    response = requests.get(
        f"{BASE_URL}/competitions/2021/matches?status=FINISHED",
        headers=headers,
        verify=False
    )
    matches = response.json().get("matches", [])
    for m in matches[:10]:
        print(m["utcDate"], m["homeTeam"]["name"], "vs", m["awayTeam"]["name"])

if __name__ == "__main__":
    headers = {"X-Auth-Token": FOOTBALL_API_KEY}
    response = requests.get(
        f"{BASE_URL}/competitions/2021/matches?status=FINISHED",
        headers=headers,
        verify=False
    )
    print(response.status_code)
    print(response.json())

if __name__ == "__main__":
    headers = {"X-Auth-Token": FOOTBALL_API_KEY}
    response = requests.get(f"{BASE_URL}/matches?status=FINISHED", headers=headers, verify=False)
    print(response.status_code)
    matches = response.json().get("matches", [])
    for m in matches[:10]:
        print(m["utcDate"], m["homeTeam"]["name"], "vs", m["awayTeam"]["name"])