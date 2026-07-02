from anthropic import Anthropic
from typing import List, Dict
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = Anthropic()


# ─── JOB SUMMARIZATION (HAIKU) ────────────────────────────────

def summarize_job(job_title: str, job_description: str) -> Dict:
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

        response_text = message.content[0].text

        # Strip markdown code blocks if present
        response_text = response_text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()

        result = json.loads(response_text)
        return result

    except Exception as e:
        print(f"Error in job summarization: {e}")
        return {
            "skills": [],
            "complexity": "medium",
            "domain": "other",
            "must_haves": "",
            "nice_to_haves": ""
        }


# ─── FREELANCER MATCHING (SONNET) ────────────────────────────

def match_freelancers(
    job_id: int,
    job_title: str,
    job_skills: List[str],
    job_complexity: str,
    job_budget: float,
    freelancers: List[Dict]
) -> List[Dict]:

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

        response_text = message.content[0].text

        # Strip markdown code blocks if present
        response_text = response_text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()

        result = json.loads(response_text)
        result.sort(key=lambda x: x["match_score"], reverse=True)
        return result

    except Exception as e:
        print(f"Error in freelancer matching: {e}")
        return []