/**
 * Determine contact info, sections, and score deterministically
 * like a standard Applicant Tracking System.
 */

const ACTION_VERBS = [
    'achieved', 'improved', 'trained', 'mentored', 'managed', 'created',
    'resolved', 'volunteered', 'influenced', 'increased', 'decreased',
    'negotiated', 'launched', 'optimized', 'developed', 'led', 'designed',
    'spearheaded', 'orchestrated', 'built', 'transformed', 'delivered',
    'generated', 'maximized', 'minimized', 'streamlined'
];

export function parseResume(text) {
    if (!text || typeof text !== 'string') return null;

    const lowerText = text.toLowerCase();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // 1. Extract Contact Info
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
    const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/i;
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
    const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/i;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    const linkedinMatch = text.match(linkedinRegex);
    const githubMatch = text.match(githubRegex);

    // 2. Identify Sections (basic heuristic)
    const hasEducation = /education|academic/i.test(lowerText);
    const hasExperience = /experience|employment|work history/i.test(lowerText);
    const hasSkills = /skills|technologies|core competencies/i.test(lowerText);
    const hasSummary = /summary|profile|objective/i.test(lowerText);

    // 3. Impact Scoring (Metrics)
    // Looking for $, %, or distinct numbers over 10 indicating scale
    const metricRegex = /(\$|\b\d{2,}\b|%)/g;
    const bulletMatch = text.match(/^[•\-\*]\s+(.*)$/gm) || [];
    let metricBulletsCount = 0;
    
    // 4. Action Verbs
    let actionVerbBulletsCount = 0;

    const actionableFeedback = [];
    const missingCriticalKeywords = [];
    const criticalErrors = [];
    const formattingWarnings = [];

    bulletMatch.forEach(bullet => {
        if (metricRegex.test(bullet)) {
            metricBulletsCount++;
        }
        // Action verbs check (first word of bullet)
        const firstWordMatch = bullet.match(/^[•\-\*]\s+([a-zA-Z]+)/);
        if (firstWordMatch) {
            const firstWord = firstWordMatch[1].toLowerCase();
            if (ACTION_VERBS.includes(firstWord)) {
                actionVerbBulletsCount++;
            }
        }
    });

    let impactScore = bulletMatch.length > 0 ? Math.round((metricBulletsCount / bulletMatch.length) * 100) : 0;
    // Cap impact score but expect at least 30% of bullets to have metrics
    impactScore = Math.min(100, Math.round(impactScore * 3.33));

    let actionVerbsScore = bulletMatch.length > 0 ? Math.round((actionVerbBulletsCount / bulletMatch.length) * 100) : 0;
    // Expect at least 50% action verbs
    actionVerbsScore = Math.min(100, Math.round(actionVerbsScore * 2));

    let atsCompatibilityScore = 100;
    
    if (!emailMatch) {
        atsCompatibilityScore -= 15;
        criticalErrors.push({ issue: "Missing Email", fix: "Add a professional email address at the top." });
    }
    if (!phoneMatch) {
        atsCompatibilityScore -= 10;
        criticalErrors.push({ issue: "Missing Phone Number", fix: "Add a contact phone number." });
    }
    if (!hasEducation) {
        atsCompatibilityScore -= 10;
        criticalErrors.push({ issue: "Missing Education Section", fix: "Add an identifiable 'Education' header." });
    }
    if (!hasExperience) {
        atsCompatibilityScore -= 20;
        criticalErrors.push({ issue: "Missing Experience Section", fix: "Add an identifiable 'Experience' or 'Work History' header." });
    }
    if (!hasSkills) {
        atsCompatibilityScore -= 10;
        formattingWarnings.push("Missing a dedicated 'Skills' section. This helps ATS pick up keywords.");
    }
    
    if (impactScore < 50) {
        actionableFeedback.push("Your experience bullet points lack quantifiable metrics. Add numbers, percentages, or dollar amounts to show impact.");
    }
    if (actionVerbsScore < 50) {
        actionableFeedback.push("Use strong action verbs (e.g., 'Spearheaded', 'Optimized') to start your bullet points instead of passive phrasing.");
    }

    if (!linkedinMatch) {
        formattingWarnings.push("Consider adding a LinkedIn profile URL.");
    }

    // Rough determination of field based on keywords
    let field_of_expertise = "General Professional";
    if (/javascript|react|node|software|developer|engineer|api|database|sql|python|java/i.test(lowerText)) {
        field_of_expertise = "Software Engineering / Tech";
    } else if (/marketing|sales|seo|campaign|revenue|b2b/i.test(lowerText)) {
        field_of_expertise = "Marketing / Sales";
    } else if (/finance|accounting|audit|tax|hedge|portfolio/i.test(lowerText)) {
        field_of_expertise = "Finance";
    }

    // Very basic extraction of some skills based on common word list
    const COMMON_SKILLS = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker', 'project management', 'agile', 'scrum', 'data analysis', 'excel', 'seo', 'marketing'];
    const top_skills = COMMON_SKILLS.filter(skill => lowerText.includes(skill.toLowerCase())).slice(0, 5);

    if (top_skills.length === 0) {
        missingCriticalKeywords.push("Ensure you list concrete hard skills relevant to your industry.");
    }

    const overall_score = Math.round((atsCompatibilityScore + impactScore + actionVerbsScore) / 3);

    return {
        overall_score,
        ats_compatibility_score: Math.max(0, atsCompatibilityScore),
        impact_score: Math.max(0, impactScore),
        action_verbs_score: Math.max(0, actionVerbsScore),
        field_of_expertise,
        top_skills: top_skills.length > 0 ? top_skills : ["N/A"],
        missing_critical_keywords: missingCriticalKeywords,
        critical_errors: criticalErrors,
        formatting_warnings: formattingWarnings,
        actionable_feedback: actionableFeedback.length > 0 ? actionableFeedback : ["Great job quantifying results and using strong action verbs!"]
    };
}
