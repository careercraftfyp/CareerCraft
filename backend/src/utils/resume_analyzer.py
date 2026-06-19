import re
import pdfplumber
from collections import Counter

ACTION_VERBS = {
    # Original list
    "achieved", "improved", "trained", "mentored", "managed",
    "created", "resolved", "volunteered", "influenced",
    "increased", "decreased", "negotiated", "launched",
    "optimized", "developed", "led", "designed",
    "spearheaded", "orchestrated", "built",
    "transformed", "delivered", "generated",
    "maximized", "minimized", "streamlined",
    "implemented", "engineered", "executed",
    "coordinated", "directed", "automated",
    
    # Common resume action verbs additions
    "collaborated", "supported", "handled", "assisted", "facilitated",
    "analyzed", "maintained", "administered", "established", "organized",
    "supervised", "conducted", "contributed", "partnered", "monitored",
    "updated", "troubleshot", "evaluated", "provided", "served",
    "participated", "performed", "formulated", "conceptualized", "devised",
    "drafted", "authored", "compiled", "researched", "investigated",
    "inspected", "examined", "audited", "reviewed", "verified",
    "tested", "debugged", "programmed", "coded", "configured",
    "installed", "deployed", "integrated"
}

SECTION_PATTERNS = {
    "education": [
        "education",
        "academic background",
        "qualifications"
    ],
    "experience": [
        "experience",
        "employment",
        "work history",
        "professional experience"
    ],
    "skills": [
        "skills",
        "technical skills",
        "core competencies",
        "technologies"
    ],
    "projects": [
        "projects",
        "personal projects"
    ],
    "summary": [
        "summary",
        "professional summary",
        "profile",
        "objective"
    ]
}

COMMON_SKILLS = {
    "python", "java", "javascript", "typescript",
    "react", "next.js", "node.js", "express",
    "sql", "postgresql", "mysql", "mongodb",
    "aws", "azure", "gcp", "docker", "kubernetes",
    "git", "github",
    "agile", "scrum",
    "excel", "power bi",
    "tableau",
    "machine learning",
    "data analysis",
    "tensorflow",
    "pytorch",
    "seo",
    "marketing",
    "salesforce",
    "project management"
}


class ResumeAnalyzer:

    def extract_text(self, pdf_path):
        text = ""

        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                width = page.width
                height = page.height

                # Split page vertically at 68% of the width
                split_x = width * 0.68

                left_bbox = (0, 0, split_x, height)
                right_bbox = (split_x, 0, width, height)

                left_text = page.crop(left_bbox).extract_text() or ""
                right_text = page.crop(right_bbox).extract_text() or ""

                if left_text.strip() or right_text.strip():
                    page_text = left_text + "\n" + right_text
                else:
                    page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

        return text.strip()

    def find_contact_info(self, text):

        email = None
        phone = None
        linkedin = None
        github = None

        email_match = re.search(
            r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
            text
        )

        if email_match:
            email = email_match.group(1)

        phone_match = re.search(
            r'(\+?\d[\d\s().-]{8,}\d)',
            text
        )

        if phone_match:
            phone = phone_match.group(1)

        linkedin_match = re.search(
            r'linkedin\.com/in/[A-Za-z0-9_-]+',
            text,
            re.I
        )

        github_match = re.search(
            r'github\.com/[A-Za-z0-9_-]+',
            text,
            re.I
        )

        if linkedin_match:
            linkedin = linkedin_match.group(0)

        if github_match:
            github = github_match.group(0)

        return {
            "email": email,
            "phone": phone,
            "linkedin": linkedin,
            "github": github
        }

    def detect_sections(self, text):

        lower = text.lower()

        found = {}

        for section, keywords in SECTION_PATTERNS.items():
            found[section] = any(
                keyword in lower
                for keyword in keywords
            )

        return found

    def extract_skills(self, text):

        lower = text.lower()

        skills = []

        for skill in COMMON_SKILLS:
            if skill in lower:
                skills.append(skill)

        return sorted(skills)

    def infer_field(self, text):

        lower = text.lower()

        if re.search(
            r'python|java|javascript|react|node|sql|aws|docker',
            lower
        ):
            return "Software Engineering"

        if re.search(
            r'marketing|seo|campaign|lead generation|revenue',
            lower
        ):
            return "Marketing"

        if re.search(
            r'finance|audit|tax|accounting|portfolio',
            lower
        ):
            return "Finance"

        if re.search(
            r'data analysis|machine learning|analytics',
            lower
        ):
            return "Data Analytics"

        return "General Professional"

    def extract_bullets(self, text):

        bullets = []
        bullet_pattern = re.compile(r"^[•●▪■◦○*\-–—\uf0b7\u2022\u2023\u2043\u25cb\u25cf\u25d8\u25e6\u25c6\u25c8\u25a0\u25a1\u25b2\u25ba]")

        for line in text.splitlines():

            line = line.strip()
            if not line:
                continue

            if bullet_pattern.match(line):
                bullets.append(line)
            else:
                # Append continuation lines to the last bullet if they are not headings or dates
                if bullets and not any(header in line.lower() for header in ["education", "experience", "skills", "contact", "objective", "summary", "projects", "interest"]):
                    if "|" not in line and not re.search(r'\b(19|20)\d{2}\b', line):
                        bullets[-1] = bullets[-1] + " " + line

        return bullets

    def score_impact(self, bullets):

        if not bullets:
            return 0

        metric_pattern = re.compile(
            r'(\$[\d,]+|\d+%|\b\d+\b)'
        )

        metric_count = 0

        for bullet in bullets:
            if metric_pattern.search(bullet):
                metric_count += 1

        ratio = metric_count / len(bullets)

        return round(min(100, ratio * 180))

    def score_action_verbs(self, bullets):

        if not bullets:
            return 0

        count = 0

        for bullet in bullets:

            match = re.match(
                r'^[•●▪■◦○*\-–—\uf0b7\u2022\u2023\u2043\u25cb\u25cf\u25d8\u25e6\u25c6\u25c8\u25a0\u25a1\u25b2\u25ba]\s*([A-Za-z]+)',
                bullet
            )

            if not match:
                continue

            first_word = match.group(1).lower()

            if first_word in ACTION_VERBS:
                count += 1

        ratio = count / len(bullets)

        return round(min(100, ratio * 170))

    def score_ats(self, contact, sections, text):

        score = 100

        errors = []
        warnings = []

        if not contact["email"]:
            score -= 15
            errors.append({
                "issue": "Missing Email",
                "fix": "Add a professional email address."
            })

        if not contact["phone"]:
            score -= 10
            errors.append({
                "issue": "Missing Phone",
                "fix": "Add a phone number."
            })

        if not sections["experience"]:
            score -= 20
            errors.append({
                "issue": "Missing Experience Section",
                "fix": "Add a clear Experience section."
            })

        if not sections["education"]:
            score -= 10
            warnings.append(
                "Education section not detected."
            )

        if not sections["skills"]:
            score -= 8
            warnings.append(
                "Dedicated Skills section not detected."
            )

        word_count = len(text.split())

        if word_count < 200:
            score -= 8
            warnings.append(
                "Resume appears too short."
            )

        if word_count > 1200:
            score -= 5
            warnings.append(
                "Resume may be overly long."
            )

        return max(score, 0), errors, warnings

    def analyze(self, pdf_path):

        text = self.extract_text(pdf_path)

        contact = self.find_contact_info(text)

        sections = self.detect_sections(text)

        skills = self.extract_skills(text)

        bullets = self.extract_bullets(text)

        impact_score = self.score_impact(bullets)

        action_score = self.score_action_verbs(bullets)

        ats_score, critical_errors, warnings = (
            self.score_ats(
                contact,
                sections,
                text
            )
        )

        feedback = []

        if impact_score < 50:
            feedback.append(
                "Add more measurable achievements using percentages, revenue figures, user growth, cost savings, or productivity metrics."
            )

        if action_score < 50:
            feedback.append(
                "Begin experience bullet points with strong action verbs."
            )

        if len(skills) < 5:
            feedback.append(
                "Add more role-relevant hard skills and technologies."
            )

        overall_score = round(
            (
                ats_score +
                impact_score +
                action_score
            ) / 3
        )

        return {
            "overall_score": overall_score,
            "ats_compatibility_score": ats_score,
            "impact_score": impact_score,
            "action_verbs_score": action_score,
            "field_of_expertise": self.infer_field(text),
            "top_skills": skills[:10] if skills else ["N/A"],
            "missing_critical_keywords": [],
            "critical_errors": critical_errors,
            "formatting_warnings": warnings,
            "actionable_feedback": (
                feedback
                if feedback
                else [
                    "Strong ATS structure with measurable achievements."
                ]
            ),
            "contact_info": contact
        }


def analyze_resume(pdf_path):
    analyzer = ResumeAnalyzer()
    return analyzer.analyze(pdf_path)


if __name__ == "__main__":
    import sys
    import json
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No PDF path provided"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    try:
        result = analyze_resume(pdf_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "overall_score": 0,
            "ats_compatibility_score": 0,
            "impact_score": 0,
            "action_verbs_score": 0,
            "field_of_expertise": "General Professional",
            "top_skills": ["N/A"],
            "missing_critical_keywords": [],
            "critical_errors": [{"issue": "Parser execution error", "fix": str(e)}],
            "formatting_warnings": ["Script crashed during analysis"],
            "actionable_feedback": ["An unexpected error occurred in the Python parser script."]
        }))
