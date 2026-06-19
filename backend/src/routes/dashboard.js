import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

import { requireAuth } from '../middleware/auth.js';

router.get('/stats', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch total resumes
        const { count: resumeCount, error: resumeError } = await supabase
            .from('resumes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // 2. Fetch interviews stats
        const { data: interviews, error: interviewError } = await supabase
            .from('interviews')
            .select('id, evaluation, created_at, status')
            .eq('user_id', userId);

        if (resumeError && resumeError.code !== 'PGRST205') {
            console.error(resumeError);
        }
        if (interviewError && interviewError.code !== 'PGRST205') {
            console.error(interviewError);
        }

        const completedInterviews = (interviews || []).filter(i => i.status === 'completed');

        // 3. Fetch all resumes for ATS trend
        const { data: resumes, error: resumesDataError } = await supabase
            .from('resumes')
            .select('parsed_text, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        // Calculate average ATS score
        let totalAtsScore = 0;
        const safeResumes = resumes || [];
        safeResumes.forEach(r => {
            try {
                if (r.parsed_text && r.parsed_text.startsWith('{')) {
                    const parsed = JSON.parse(r.parsed_text);
                    r.analysis = parsed.analysis || {};
                }
            } catch (e) {
                r.analysis = {};
            }
            totalAtsScore += r.analysis?.overall_score || 0;
        });
        const avgAtsScore = safeResumes.length > 0 ? Math.round(totalAtsScore / safeResumes.length) : 0;

        // Prepare ATS Trend Data (last 4 uploads or weekly)
        const atsTrend = safeResumes.slice(-4).map((r, i) => ({
            name: `Upload ${i + 1}`,
            score: r.analysis?.overall_score || 0
        }));

        // Prepare Interview Scores (from latest interview)
        let interviewScores = [
            { name: 'Soft Skills', score: 0 },
            { name: 'Technical', score: 0 },
            { name: 'System Design', score: 0 },
            { name: 'Behavioral', score: 0 },
        ];

        if (completedInterviews.length > 0) {
            const latest = completedInterviews[completedInterviews.length - 1].evaluation;
            interviewScores = [
                { name: 'Communication', score: latest.communicationScore || 0 },
                { name: 'Relevance', score: latest.contentRelevanceScore || 0 },
                { name: 'Overall', score: latest.overallScore || 0 },
                { name: 'Technical', score: Math.round((latest.communicationScore + latest.contentRelevanceScore) / 2) }
            ];
        }

        // 4. Fetch practice sessions stats
        const { data: practiceSessions, error: practiceError } = await supabase
            .from('practice_sessions')
            .select('status')
            .eq('user_id', userId);

        if (practiceError && practiceError.code !== 'PGRST205') {
            console.error(practiceError);
        }

        const safePractice = practiceSessions || [];
        const completedPractice = safePractice.filter(p => p.status === 'completed').length;
        const totalPractice = safePractice.length;
        const trainingProgress = totalPractice > 0 ? Math.round((completedPractice / totalPractice) * 100) : 0;

        // Calculate Weekly Growth Metrics
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const calculateGrowth = (current_total, recently_added) => {
            const previous_total = current_total - recently_added;
            if (previous_total === 0) return recently_added > 0 ? 100 : 0;
            return Math.round((recently_added / previous_total) * 100);
        };

        const resumesLastWeek = safeResumes.filter(r => new Date(r.created_at) >= oneWeekAgo).length;
        const resumeGrowth = safeResumes.length === 0 ? 0 : calculateGrowth(safeResumes.length, resumesLastWeek);

        const interviewsLastWeek = completedInterviews.filter(i => new Date(i.created_at) >= oneWeekAgo).length;
        const interviewGrowth = completedInterviews.length === 0 ? 0 : calculateGrowth(completedInterviews.length, interviewsLastWeek);

        let atsGrowth = 0;
        if (safeResumes.length > 0) {
            const olderResumes = safeResumes.filter(r => new Date(r.created_at) < oneWeekAgo);
            if (olderResumes.length > 0) {
                const oldTotalScore = olderResumes.reduce((acc, r) => acc + (r.analysis?.overall_score || 0), 0);
                const oldAvg = oldTotalScore / olderResumes.length;
                atsGrowth = Math.round(((avgAtsScore - oldAvg) / (oldAvg || 1)) * 100);
            } else {
                atsGrowth = 100;
            }
        }

        const trainingGrowth = trainingProgress > 0 ? Math.round(trainingProgress / 2) : 0; // estimate

        const lastInterview = completedInterviews.length > 0
            ? completedInterviews.reduce((latest, current) => {
                return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
            })
            : null;

        res.json({
            totalResumes: resumeCount || 0,
            totalInterviews: completedInterviews.length,
            avgAtsScore: `${avgAtsScore}/100`,
            practiceTime: `${completedInterviews.length * 20 + completedPractice * 10}m`, // 20m per interview, 10m per practice
            trainingProgress: `${trainingProgress}%`,
            lastInterviewDate: lastInterview ? lastInterview.created_at : null,
            lastInterviewId: lastInterview ? lastInterview.id : null,
            growth: {
                resumes: resumesLastWeek,
                interviews: interviewsLastWeek,
                atsScore: atsGrowth,
                trainingProgress: trainingGrowth
            },
            atsTrend: atsTrend.length > 0 ? atsTrend : [
                { name: 'Week 1', score: 0 },
                { name: 'Week 2', score: 0 },
                { name: 'Week 3', score: 0 },
                { name: 'Week 4', score: 0 }
            ],
            interviewScores,
            totalPractice,
            completedPractice
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
