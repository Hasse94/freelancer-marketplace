from anthropic import Anthropic
from typing import List, Dict
import json
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

client = Anthropic()


def _extract_json(response_text: str) -> str:
    """Claude occasionally wraps its answer in a ```json fence despite instructions."""
    response_text = response_text.strip()
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]
    return response_text.strip()


def summarize_job(job_title: str, job_description: str) -> Dict:
    """Extract structured fields (skills, complexity, domain) from a raw job post.

    Uses Haiku — the task is simple extraction, so the cheaper model is plenty.
    Falls back to neutral defaults if the call or parsing fails.
    """
    prompt = f"""You are a job analysis expert. Extract and structure this job posting.

Job Title: {job_title}
Job Description: {job_description}

Extract:
1. Key technical skills required (list max 5)
2. Project complexity: easy/medium/hard
3. Domain: web/mobile/data/devops/design/other
4. Must-have requirements (list)
5. Nice-to-have requirements (list)

Respond ONLY with valid JSON, no markdown:
{{
    "skills": ["skill1", "skill2"],
    "complexity": "medium",
    "domain": "web",
    "must_haves": "requirement1, requirement2",
    "nice_to_haves": "requirement1, requirement2"
}}"""

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return json.loads(_extract_json(message.content[0].text))

    except Exception:
        logger.exception("Job summarization failed")
        return {
            "skills": [],
            "complexity": "medium",
            "domain": "other",
            "must_haves": "",
            "nice_to_haves": ""
        }


def match_freelancers(
    job_title: str,
    job_skills: List[str],
    job_complexity: str,
    job_budget: float,
    freelancers: List[Dict]
) -> List[Dict]:
    """Rank freelancers against a job, best match first.

    Uses Sonnet — ranking across several profiles needs more judgment
    than extraction. Returns [] if the call or parsing fails.
    """
    freelancers_text = "\n".join([
        f"ID: {f['id']}, Name: {f['name']}, Skills: {f['skills']}, Rate: ${f['hourly_rate']}/hr, Bio: {f['bio']}"
        for f in freelancers
    ])

    prompt = f"""You are an expert at matching freelancers to jobs.

Job Details:
- Title: {job_title}
- Required Skills: {', '.join(job_skills)}
- Complexity: {job_complexity}
- Budget: ${job_budget}

Freelancers:
{freelancers_text}

Rank these freelancers by match score (0-100) considering:
1. Skill match (do they have required skills?)
2. Budget fit (is their rate within budget?)
3. Experience level (complexity match)
4. Profile quality (professionalism in bio)

Respond ONLY with valid JSON array, no markdown:
[
    {{"freelancer_id": 1, "match_score": 85}},
    {{"freelancer_id": 2, "match_score": 72}}
]"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        result = json.loads(_extract_json(message.content[0].text))
        result.sort(key=lambda x: x["match_score"], reverse=True)
        return result

    except Exception:
        logger.exception("Freelancer matching failed")
        return []
