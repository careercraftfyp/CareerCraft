const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchAdminData(endpoint, token) {
    const res = await fetch(`${API_URL}/admin/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch admin data');
    }
    const json = await res.json();
    return json.data;
}

function parseResumeAnalysis(parsed_text) {
    try {
        if (!parsed_text) return null;
        const parsed = JSON.parse(parsed_text);
        return parsed.analysis || null;
    } catch (e) {
        return null;
    }
}

function parseInterviewEvaluation(evaluation) {
    try {
        if (!evaluation) return {};
        if (typeof evaluation === 'string') return JSON.parse(evaluation);
        return evaluation;
    } catch (e) {
        return {};
    }
}

export async function getDashboardStats(token) {
    const [users, resumes, interviews, atsReports] = await Promise.all([
        fetchAdminData('users', token).catch(() => []),
        fetchAdminData('resumes', token).catch(() => []),
        fetchAdminData('interviews', token).then(data => data.filter(i => i.status === 'completed')).catch(() => []),
        fetchAdminData('ats_reports', token).catch(() => [])
    ]);

    const usersCount = users.length;
    const resumesCount = resumes.length;
    const interviewsCount = interviews.length;

    const allAtsScores = [
        ...atsReports.map(a => a.match_score).filter(s => s != null),
        ...resumes.map(r => parseResumeAnalysis(r.parsed_text)).filter(Boolean).map(a => a.ats_compatibility_score || a.overall_score).filter(s => s != null)
    ];

    const avgAtsScore = allAtsScores.length 
        ? Math.round(allAtsScores.reduce((acc, curr) => acc + curr, 0) / allAtsScores.length) 
        : 0;

    // Last 30 days signups
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime();
    const recentUsers = users.filter(u => new Date(u.created_at).getTime() >= thirtyDaysAgo);
    
    const signupsMap = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        signupsMap[d] = 0;
    }
    recentUsers.forEach(u => {
        const d = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (signupsMap[d] !== undefined) signupsMap[d]++;
    });
    const userSignupsData = Object.keys(signupsMap).map(k => ({ date: k, users: signupsMap[k] }));

    // Last 14 days interviews
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime();
    const recentInterviews = interviews.filter(i => new Date(i.completed_at || i.created_at).getTime() >= fourteenDaysAgo);
    
    const interviewsMap = {};
    for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        interviewsMap[d] = 0;
    }
    recentInterviews.forEach(i => {
        const d = new Date(i.completed_at || i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (interviewsMap[d] !== undefined) interviewsMap[d]++;
    });
    const interviewCompletionsData = Object.keys(interviewsMap).map(k => ({ date: k, completions: interviewsMap[k] }));

    // Recent Activity
    const mergedActivity = [
        ...users.map(u => ({ ...u, type: 'signup', desc: `${u.full_name || 'A user'} signed up`, name: u.full_name })),
        ...resumes.map(r => {
            const u = users.find(x => x.id === r.user_id);
            return { ...r, type: 'resume', desc: `${u?.full_name || 'A user'} uploaded a resume`, name: u?.full_name };
        }),
        ...interviews.map(i => {
            const u = users.find(x => x.id === i.user_id);
            const evalData = parseInterviewEvaluation(i.evaluation);
            const score = i.overall_score || evalData.overallScore || evalData.overall_score || 0;
            return { ...i, type: 'interview', desc: `${u?.full_name || 'A user'} completed a mock interview \u00B7 Score: ${score}`, name: u?.full_name };
        })
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    return {
        stats: { usersCount, resumesCount, interviewsCount, avgAtsScore },
        userSignupsData,
        interviewCompletionsData,
        recentActivity: mergedActivity
    };
}

export async function getUsersList(token) {
    const [users, resumes, atsReports, allInterviews] = await Promise.all([
        fetchAdminData('users', token).catch(() => []),
        fetchAdminData('resumes', token).catch(() => []),
        fetchAdminData('ats_reports', token).catch(() => []),
        fetchAdminData('interviews', token).catch(() => [])
    ]);
    const interviews = allInterviews.filter(i => i.status !== 'in_progress');

    const usersMap = users.map(u => {
        const uResumes = resumes.filter(r => r.user_id === u.id);
        const uInterviews = interviews.filter(i => i.user_id === u.id);
        
        let totalAts = 0;
        let atsCount = 0;
        uResumes.forEach(r => {
            const report = parseResumeAnalysis(r.parsed_text);
            let score = report ? (report.ats_compatibility_score || report.overall_score) : null;
            if (score == null) {
                const legacy = atsReports.find(a => a.resume_id === r.id);
                score = legacy?.match_score;
            }
            if (score != null) {
                totalAts += score;
                atsCount++;
            }
        });

        const completedInterviews = uInterviews.filter(i => i.status === 'completed');
        const avgInterviewScore = completedInterviews.length 
            ? Math.round(completedInterviews.reduce((a, c) => {
                const evalData = parseInterviewEvaluation(c.evaluation);
                return a + (c.overall_score || evalData.overallScore || evalData.overall_score || 0);
            }, 0) / completedInterviews.length) 
            : 0;

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime();
        const lastActive = Math.max(
            new Date(u.created_at || 0).getTime(),
            ...uResumes.map(r => new Date(r.created_at || 0).getTime()),
            ...uInterviews.map(i => new Date(i.created_at || 0).getTime())
        );

        return {
            ...u,
            resumesCount: uResumes.length,
            avgAtsScore: atsCount ? Math.round(totalAts / atsCount) : 0,
            interviewsCount: completedInterviews.length,
            avgInterviewScore,
            status: lastActive > thirtyDaysAgo ? 'Active' : 'Inactive',
            fullResumes: uResumes.map(r => {
                const rep = parseResumeAnalysis(r.parsed_text);
                const leg = atsReports.find(a => a.resume_id === r.id);
                const score = rep ? (rep.ats_compatibility_score || rep.overall_score) : leg?.match_score;
                return { ...r, score: score || 0 };
            }),
            fullInterviews: uInterviews.map(i => {
                const evalData = parseInterviewEvaluation(i.evaluation);
                return { ...i, overall_score: i.overall_score || evalData.overallScore || evalData.overall_score || 0 };
            })
        };
    });

    return usersMap;
}

export async function getResumesList(token) {
    const [resumes, users, atsReports] = await Promise.all([
        fetchAdminData('resumes', token).catch(() => []),
        fetchAdminData('users', token).catch(() => []),
        fetchAdminData('ats_reports', token).catch(() => [])
    ]);

    return resumes.map(r => {
        const u = users.find(x => x.id === r.user_id);
        const legacyReport = atsReports.find(a => a.resume_id === r.id);
        const report = parseResumeAnalysis(r.parsed_text);
        
        let matchScore = report?.ats_compatibility_score || report?.overall_score || legacyReport?.match_score || 0;
        let missingKeywords = report?.missing_critical_keywords || legacyReport?.missing_keywords || [];
        let keywordsMissingCount = Array.isArray(missingKeywords) ? missingKeywords.length : 0;
        
        // Ensure full_report has missing_keywords property for modal
        let fullReport = report || legacyReport || {};
        if (!fullReport.missing_keywords) fullReport.missing_keywords = missingKeywords;

        return {
            ...r,
            user_name: u?.full_name || 'Unknown',
            user_email: u?.email || '',
            ats_score: matchScore,
            keywords_missing_count: keywordsMissingCount,
            full_report: fullReport
        };
    });
}

export async function getInterviewsList(token) {
    const [allInterviews, users] = await Promise.all([
        fetchAdminData('interviews', token).catch(() => []),
        fetchAdminData('users', token).catch(() => [])
    ]);
    const interviews = allInterviews.filter(i => i.status !== 'in_progress');

    return interviews.map(i => {
        const u = users.find(x => x.id === i.user_id);
        const evalData = parseInterviewEvaluation(i.evaluation);
        return {
            ...i,
            user_name: u?.full_name || 'Unknown',
            communication_score: i.communication_score || evalData?.communicationScore || evalData?.communication_score || 0,
            content_score: i.content_score || evalData?.contentRelevanceScore || evalData?.content_relevance_score || evalData?.content_score || 0,
            overall_score: i.overall_score || evalData?.overallScore || evalData?.overall_score || 0,
            evaluation_parsed: evalData
        };
    });
}

export async function getAnalyticsData(token) {
    const [atsReports, allInterviews, practiceSessions, resumes] = await Promise.all([
        fetchAdminData('ats_reports', token).catch(() => []),
        fetchAdminData('interviews', token).catch(() => []),
        fetchAdminData('practice_sessions', token).catch(() => []),
        fetchAdminData('resumes', token).catch(() => [])
    ]);

    const interviews = allInterviews.filter(i => i.status === 'completed');

    const atsData = resumes.map(r => parseResumeAnalysis(r.parsed_text)).filter(Boolean);
    const allAts = [
        ...atsReports.map(a => ({ match_score: a.match_score, missing_keywords: a.missing_keywords })),
        ...atsData.map(a => ({ match_score: a.ats_compatibility_score || a.overall_score, missing_keywords: a.missing_critical_keywords }))
    ];

    const avgAts = allAts.length ? Math.round(allAts.reduce((a, c) => a + (c.match_score || 0), 0) / allAts.length) : 0;
    
    const avgInterview = interviews.length ? Math.round(interviews.reduce((a, c) => {
        const evalData = parseInterviewEvaluation(c.evaluation);
        return a + (c.overall_score || evalData.overallScore || evalData.overall_score || 0);
    }, 0) / interviews.length) : 0;

    // Histogram 0-20, 20-40, etc.
    const hist = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    allAts.forEach(r => {
        const s = r.match_score || 0;
        if (s <= 20) hist['0-20']++;
        else if (s <= 40) hist['21-40']++;
        else if (s <= 60) hist['41-60']++;
        else if (s <= 80) hist['61-80']++;
        else hist['81-100']++;
    });
    const scoreDistribution = Object.keys(hist).map(k => ({ range: k, count: hist[k] }));

    // Top 5 missing keywords
    const keywordCounts = {};
    allAts.forEach(r => {
        if (Array.isArray(r.missing_keywords)) {
            r.missing_keywords.forEach(kw => {
                keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
            });
        }
    });
    const topKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([kw, count]) => ({ keyword: kw, count }));

    // Common job roles
    const roleCounts = {};
    interviews.forEach(i => {
        const r = i.job_role || 'Unknown';
        roleCounts[r] = (roleCounts[r] || 0) + 1;
    });
    const topRoles = Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([role, count]) => ({ role, count }));

    // Difficulty
    const diffCounts = { easy: 0, medium: 0, hard: 0 };
    interviews.forEach(i => {
        const d = (i.difficulty || 'medium').toLowerCase();
        if (diffCounts[d] !== undefined) diffCounts[d]++;
    });
    const difficultyDistribution = Object.keys(diffCounts).map(k => ({ name: k, value: diffCounts[k] }));

    return {
        avgAts,
        avgInterview,
        practiceSessions: practiceSessions.length,
        scoreDistribution,
        topKeywords,
        topRoles,
        difficultyDistribution
    };
}

export async function deletePracticeSessions(token) {
    const res = await fetch(`${API_URL}/admin/practice_sessions`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete practice sessions');
    }
}

export async function pingSupabase(token) {
    try {
        await fetchAdminData('users', token);
        return true;
    } catch {
        return false;
    }
}
