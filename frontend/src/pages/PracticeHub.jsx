import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, BookMarked, Mic2, ArrowRight, ChevronRight,
    RotateCcw, Sparkles, Trophy, Target,
    Mic, MicOff, Loader2, Volume2, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import STARBuilder from '../components/training/STARBuilder';
import ElevatorPitchTrainer from '../components/training/ElevatorPitchTrainer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const recordDrillCompletion = async (skillTag, domainName) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        await fetch(`${API_URL}/training/drills/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                skill_tag: skillTag,
                domain: domainName || 'General'
            })
        });
    } catch (err) {
        console.error('Failed to record drill completion:', err);
    }
};

// ── DOMAIN KNOWLEDGE Q&A ────────────────────────────────────────────────────
const DOMAIN_QUESTIONS = {
    'Computer Science': [
        { q: 'Explain the difference between a stack and a queue.', a: 'A stack is LIFO (Last In, First Out) — like a plate stack. A queue is FIFO (First In, First Out) — like a line. Stacks are used in function call management and undo systems. Queues are used in task scheduling and BFS algorithms.', tip: 'Always give a real-world analogy + use case.' },
        { q: 'What is the time complexity of binary search and why?', a: 'O(log n) — each comparison halves the search space. For n=1,000,000 elements, you need at most ~20 comparisons.', tip: 'Show your working — "each step eliminates half". Don\'t just say the answer.' },
        { q: 'What is the difference between SQL and NoSQL databases?', a: 'SQL: relational, fixed schema, ACID transactions (PostgreSQL, MySQL). NoSQL: flexible schema, scales horizontally (MongoDB, Redis). Use SQL for structured transactional data; NoSQL for large-scale flexible data.', tip: 'Name specific databases. Show you know when to use each.' },
        { q: 'What is REST and what makes an API RESTful?', a: 'REST is an architectural style using HTTP methods (GET, POST, PUT, DELETE), stateless communication, resource-based URLs, and standard responses (JSON). Key principles: stateless, client-server, cacheable, uniform interface.', tip: 'Contrast with GraphQL or SOAP to show depth.' },
        { q: 'Explain the four pillars of Object-Oriented Programming.', a: 'Encapsulation — hide internal state. Inheritance — reuse parent behavior. Polymorphism — same interface, different implementations. Abstraction — hide complexity, expose only what\'s needed.', tip: 'Give a concrete example for each pillar.' },
    ],
    'Business': [
        { q: 'Walk me through how you would analyze a declining revenue trend.', a: 'Segment the decline by product, region, customer type. Check external factors (market, competition), then internal (pricing, sales team, product). Use data to isolate root cause before recommending.', tip: 'Use MECE thinking: Mutually Exclusive, Collectively Exhaustive.' },
        { q: 'What is a SWOT analysis and when would you use one?', a: 'SWOT = Strengths, Weaknesses, Opportunities, Threats. Used for strategic planning — before launching a product, entering a new market, or making major decisions. Internal factors (S,W) + External (O,T).', tip: 'Always pair SWOT with action — what do you DO with the findings?' },
        { q: 'How would you prioritize multiple projects with limited resources?', a: 'Use an impact vs. effort matrix — high impact, low effort first. Also consider strategic alignment, ROI, deadlines, and dependencies. Present trade-offs to stakeholders clearly.', tip: 'Show stakeholder management — business needs people who communicate trade-offs, not just decide alone.' },
        { q: 'What is the difference between revenue, profit, and cash flow?', a: 'Revenue: total earned before deductions. Profit: revenue minus expenses. Cash flow: actual cash moving in and out. A profitable company can still go bankrupt with poor cash flow.', tip: 'The cash flow point is often underappreciated — shows real financial literacy.' },
        { q: 'How do you handle disagreeing with a manager\'s decision?', a: 'Share concern once, clearly and respectfully with evidence. Focus on business outcome not personal disagreement. If they proceed, commit fully. Learn from the result afterward.', tip: 'Shows professional maturity — neither a yes-man nor a rebel.' },
    ],
    'Marketing': [
        { q: 'What is the difference between brand awareness and lead generation campaigns?', a: 'Brand awareness builds recognition (top of funnel) — metrics: reach, impressions, recall. Lead gen converts intent (bottom of funnel) — metrics: conversion rate, CPL, qualified leads. Both work in full-funnel strategy.', tip: 'Show you understand the full funnel, not just one stage.' },
        { q: 'How would you measure the success of a social media campaign?', a: 'Depends on goal. Awareness: reach, impressions. Engagement: CTR, shares, saves. Conversion: link clicks, conversions. Define KPIs before launch and benchmark against previous campaigns.', tip: 'Always tie metrics to GOALS. "1M impressions" means nothing without context.' },
        { q: 'What is SEO and what are the most important ranking factors?', a: 'SEO improves organic visibility. Key factors: content quality + relevance, backlinks from authoritative sites, technical health (speed, mobile-friendliness, Core Web Vitals), user experience signals (bounce rate, dwell time).', tip: 'Mention E-E-A-T (Experience, Expertise, Authority, Trust) — shows you follow current Google guidelines.' },
        { q: 'Run a product launch campaign with a limited budget — what is your approach?', a: 'Focus on owned + earned media first: SEO content around the problem, email list, micro-influencers (high engagement, low cost). Run small paid campaign on highest-intent platform. Measure and double down on what converts.', tip: 'Show prioritization and ROI thinking. Acknowledge the constraint and work within it.' },
        { q: 'What is A/B testing and how do you decide what to test?', a: 'A/B testing shows version A to one group and B to another. Decide what to test based on: where is the biggest drop-off in funnel? Test one variable at a time to isolate the cause. Need statistical significance.', tip: 'Mention statistical significance — many marketers skip this, shows rigor.' },
    ],
    'Finance': [
        { q: 'Walk me through a DCF analysis.', a: 'Project free cash flows 5-10 years. Calculate terminal value. Discount both to present value using WACC. Sum = Enterprise Value. Subtract net debt for equity value.', tip: 'Show you know WACC components (cost of equity via CAPM, cost of debt). The depth matters.' },
        { q: 'What happens to the three financial statements when depreciation increases by $10?', a: 'Income Statement: EBIT down $10, taxes down $3 (30%), net income down $7. Cash Flow: net income -$7, add back depreciation +$10, operating CF up $3. Balance Sheet: assets -$10, retained earnings -$7, L+E balances.', tip: 'Classic IB interview question. Practice until it\'s instant.' },
        { q: 'What is the difference between enterprise value and equity value?', a: 'Equity Value = market cap (shareholders\' share). Enterprise Value = market cap + Debt - Cash (total business value regardless of capital structure). EV used for EV/EBITDA; equity for P/E ratios.', tip: 'Always explain WHY each is used in different contexts.' },
        { q: 'How do you value a company with negative earnings?', a: 'Use revenue multiples (EV/Revenue), EV/EBITDA if positive, DCF with path to profitability, or comparable transactions. For startups: user growth, LTV/CAC, total addressable market.', tip: 'Shows adaptability — not every company can be valued with P/E.' },
        { q: 'What is working capital and why does it matter?', a: 'Working capital = Current Assets - Current Liabilities. Measures short-term liquidity. Increases use cash. This is why profitable companies can still go bankrupt with poor working capital management.', tip: 'Connect to cash flow and operations — shows real-world understanding beyond the formula.' },
    ],
    'Healthcare': [
        { q: 'Explain the difference between sensitivity and specificity in medical testing.', a: 'Sensitivity = true positive rate (catches people WITH disease). High sensitivity = few false negatives. Specificity = true negative rate (excludes people WITHOUT disease). High specificity = few false positives.', tip: 'Mnemonic: SnNout (high Sensitivity rules out), SpPin (high Specificity rules in).' },
        { q: 'What is evidence-based medicine (EBM)?', a: 'EBM integrates best research evidence + clinical expertise + patient values. Hierarchy: systematic reviews/meta-analyses, then RCTs, cohort studies, case reports. Prevents over-reliance on tradition or anecdote.', tip: 'Mention that EBM doesn\'t eliminate clinical judgment — it informs it.' },
        { q: 'How do you handle a patient who refuses necessary treatment?', a: 'Respect patient autonomy if they have capacity and are fully informed. Ensure they understand risks, address fears/misconceptions, involve family if appropriate, document conversation, continue offering care within their preferences.', tip: 'Balance autonomy with beneficence — never override informed refusal.' },
        { q: 'What is the difference between primary, secondary, and tertiary prevention?', a: 'Primary: prevent disease before it occurs (vaccines). Secondary: early detection to halt progression (mammograms). Tertiary: manage existing disease to prevent complications (cardiac rehab, diabetes management).', tip: 'Give examples for each — abstract definitions alone are forgettable.' },
        { q: 'How do you explain a complex diagnosis to a patient with limited health literacy?', a: 'Use plain language, relatable analogies, teach-back method (ask them to repeat back), visual aids, invite questions. Check understanding at each step, not just at the end.', tip: 'Mention teach-back by name — it\'s the gold standard for health literacy.' },
    ],
    'Engineering': [
        { q: 'Walk me through your approach to designing a new engineering system.', a: 'Requirements → conceptual design (multiple options) → feasibility analysis (technical, economic, safety) → detailed design → prototyping/simulation → testing → iteration. Use design standards and codes throughout.', tip: 'Show you know the full design lifecycle, not just the computation part.' },
        { q: 'What is a safety factor and how do you determine an appropriate value?', a: 'Safety factor = ultimate capacity / design load. Accounts for uncertainty in materials, manufacturing variations, unexpected loads, and failure consequences. Higher consequence = higher SF. Bridges use 2-5; medical devices use higher.', tip: '"What SF?" answer is always "it depends" — then explain what it depends on.' },
        { q: 'How do you ensure quality in engineering deliverables?', a: 'Design reviews at key milestones, peer checking of all calculations, design verification against requirements, testing against real-world conditions, post-implementation monitoring. Document assumptions, methods, and decisions.', tip: 'Mention peer review specifically — engineering is never a solo activity.' },
        { q: 'What is the difference between accuracy and precision in measurements?', a: 'Accuracy = closeness to the true value. Precision = repeatability/consistency. A scale consistently reading 95g for a 100g weight is precise but inaccurate. Both matter for different types of errors.', tip: 'Classic target analogy: accuracy = hitting bullseye; precision = grouping shots tightly.' },
        { q: 'How do you handle scope creep in engineering projects?', a: 'Prevent it with a clear scope document and change control process. Assess impact of any changes on timeline, budget, and technical requirements before agreeing. Communicate trade-offs to stakeholders. Document all approvals.', tip: 'Show project management competency alongside technical expertise.' },
    ],
};

// ── SPEAKING PROMPTS ────────────────────────────────────────────────────────
const SPEAKING_PROMPTS = {
    'General': [
        'Tell me about yourself and why you\'re a strong candidate for this role.',
        'Describe your greatest professional achievement and how you accomplished it.',
        'Where do you see yourself in 5 years and how does this position fit?',
    ],
    'Computer Science': [
        'Explain what you built in your most impressive technical project.',
        'Walk me through how you would debug a production outage affecting thousands of users.',
        'Describe your approach when you have to learn a completely new technology quickly.',
    ],
    'Business': [
        'Tell me about a time you turned data into a business decision.',
        'Describe a process you improved and the business impact it had.',
        'Walk me through how you build relationships with cross-functional stakeholders.',
    ],
    'Marketing': [
        'Describe a campaign you ran and how you measured its success.',
        'Walk me through how you identify your target audience for a new product.',
        'Tell me about a creative idea you had that drove real results.',
    ],
    'Finance': [
        'Walk me through your investment thesis for a company you\'ve researched.',
        'Tell me about a time you identified a risk others missed.',
        'Describe how you present financial analysis to non-financial stakeholders.',
    ],
    'Healthcare': [
        'Describe a time you had to make a quick decision under pressure in a clinical setting.',
        'Walk me through how you communicate a difficult diagnosis to a patient.',
        'Tell me about a time you collaborated with a multidisciplinary team.',
    ],
    'Engineering': [
        'Describe the most complex technical problem you\'ve solved.',
        'Walk me through how you handle a design conflict between safety and cost.',
        'Tell me about a time a project went off-track and how you recovered it.',
    ],
};

// ── FLIP CARD CHALLENGE BANKS ───────────────────────────────────────────────
const CHALLENGE_BANKS = {
    'Computer Science': [
        {
            type: 'code', language: 'Python', title: 'List Sum — Off-by-One',
            front: 'def calculate_total(numbers):\n    total = 0\n    for i in range(1, len(numbers)):  # Bug\n        total += numbers[i]\n    return total\n\nprint(calculate_total([10, 20, 30, 40]))\n# Expected: 100  |  Actual: 90',
            question: 'Find the bug — the function skips an element.',
            back: '🐛 Bug: range(1, ...) skips index 0 — the first element (10) is never added.\n\n✅ Fix:\nfor i in range(len(numbers)):  # Start at 0\n    total += numbers[i]',
            funFact: '💡 Off-by-one errors are among the most common bugs. Dijkstra dedicated an entire paper to correct loop boundary thinking.',
        },
        {
            type: 'code', language: 'Python', title: 'Palindrome — Case Bug',
            front: 'def is_palindrome(word):\n    return word == word[::-1]\n\nprint(is_palindrome("Racecar"))\n# Expected: True  |  Actual: False',
            question: 'Returns False for "Racecar". Find and fix the bug.',
            back: '🐛 Bug: "Racecar" ≠ "racecaR" — case-sensitive comparison.\n\n✅ Fix:\ndef is_palindrome(word):\n    word = word.lower()\n    return word == word[::-1]',
            funFact: '💡 The longest common English palindrome word is "redivider". "racecar", "level", and "deified" are others.',
        },
        {
            type: 'code', language: 'JavaScript', title: 'Counter — ReferenceError',
            front: 'function makeCounter() {\n    let count = 0;\n    return {\n        increment: () => count++,\n        getCount: () => Count  // Bug\n    };\n}\nconst c = makeCounter();\nc.increment(); c.increment();\nconsole.log(c.getCount());\n// Throws: ReferenceError',
            question: 'Why does getCount() throw a ReferenceError?',
            back: '🐛 Bug: `Count` (capital C) is not defined. JavaScript is case-sensitive.\n\n✅ Fix:\ngetCount: () => count  // lowercase',
            funFact: '💡 JavaScript has 7 error types: SyntaxError, ReferenceError, TypeError, RangeError, URIError, EvalError, and Error.',
        },
        {
            type: 'code', language: 'Python', title: 'Infinite Recursion',
            front: 'def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n)  # Bug\n\nprint(factorial(5))\n# Expected: 120  |  Causes: RecursionError',
            question: 'This function never terminates. What is wrong?',
            back: '🐛 Bug: factorial(n) calls itself with the same n — never reaches 0.\n\n✅ Fix:\nreturn n * factorial(n - 1)  # Decrement!',
            funFact: '💡 Python\'s default recursion limit is 1000 calls. Deep recursion is usually a sign to use an iterative loop instead.',
        },
        {
            type: 'code', language: 'JavaScript', title: 'Filter — Logic Reversed',
            front: 'function getEvens(numbers) {\n    return numbers.filter(n => n % 2);\n}\nconsole.log(getEvens([1,2,3,4,5,6]));\n// Expected: [2,4,6]  |  Actual: [1,3,5]',
            question: 'Returns odd numbers instead of even ones. Why?',
            back: '🐛 Bug: `n % 2` is truthy (1) for odd numbers, not even.\n\n✅ Fix:\nreturn numbers.filter(n => n % 2 === 0);',
            funFact: '💡 .filter() was added in ES5 (2009). Before that, you wrote for-loops manually for every filtering operation.',
        },
    ],
    'Business': [
        {
            type: 'fact', emoji: '📊', title: 'TRUE OR FALSE?',
            front: '"A company with $10M revenue and $8M costs is always profitable."',
            back: '❌ FALSE\n\nProfit depends on WHICH costs you measure. Cash flow can be negative even when accounting shows profit due to accruals, depreciation timing, and deferred payments.',
            funFact: '💡 WeWork reported $1.8B revenue in 2019 but $3.5B net losses. Massive revenue ≠ profitability.'
        },
        {
            type: 'fact', emoji: '🚀', title: 'TRUE OR FALSE?',
            front: '"More product features always leads to better sales and happier customers."',
            back: '❌ FALSE\n\nFeature bloat creates complexity and decision fatigue. Apple\'s iPod succeeded by REMOVING features. The Paradox of Choice: more options often reduces satisfaction.',
            funFact: '💡 A Jam Study showed stores with 6 varieties sold 10x more than stores with 24 — less choice drives more decisions.'
        },
        {
            type: 'fact', emoji: '💰', title: 'MYTH OR FACT?',
            front: '"Price increases always reduce demand for a product."',
            back: '❌ MYTH\n\nVeblen Goods (luxury items) often see INCREASED demand when price rises. Higher price signals exclusivity and quality. Rolls-Royce, luxury handbags, and fine dining operate this way.',
            funFact: '💡 Thorstein Veblen coined "conspicuous consumption" in 1899 — describing purchases made specifically to signal wealth.'
        },
        {
            type: 'fact', emoji: '🏢', title: 'DID YOU KNOW?',
            front: '"Amazon was unprofitable for 20+ years yet investors kept funding it. Why?"',
            back: '✅ Jeff Bezos deliberately reinvested ALL profits into growth. He called it a "feature, not a bug" — prioritizing market share and infrastructure over short-term profit.\n\nThis works when your TAM (total addressable market) is enormous.',
            funFact: '💡 Amazon AWS generates the majority of Amazon\'s operating profit — separate from the e-commerce business entirely.'
        },
        {
            type: 'fact', emoji: '📉', title: 'TRUE OR FALSE?',
            front: '"Acquiring new customers is more important than retaining existing ones for long-term growth."',
            back: '❌ FALSE\n\nAcquiring a new customer costs 5-25x more than retaining one. A 5% increase in retention increases profits 25-95% (Bain & Company). Loyal customers also refer others.',
            funFact: '💡 Customer Lifetime Value (CLV) exists to quantify why retention is more valuable than acquisition in most business models.'
        },
    ],
    'Marketing': [
        {
            type: 'fact', emoji: '📣', title: 'TRUE OR FALSE?',
            front: '"Email marketing has a lower ROI than social media advertising."',
            back: '❌ FALSE\n\nEmail generates $42 for every $1 spent (4,200% ROI) — highest of any marketing channel. Social media ads typically return $2-$5 per $1 spent.',
            funFact: '💡 The first marketing email was sent in 1978 by Gary Thuerk to 400 ARPANET users. It generated $13M in sales — and was also history\'s first spam.'
        },
        {
            type: 'fact', emoji: '🔍', title: 'MYTH OR FACT?',
            front: '"Posting at 10am on Tuesdays is the universal best time for social media engagement."',
            back: '❌ MYTH\n\nThe "best time" depends entirely on YOUR specific audience\'s behavior. Use your own analytics to find when YOUR followers are most active — no universal answer exists.',
            funFact: '💡 Instagram changed from chronological to engagement-based algorithm in 2016, making content quality far more important than posting time.'
        },
        {
            type: 'fact', emoji: '🍔', title: 'DID YOU KNOW?',
            front: '"Which spends more on marketing per year: McDonald\'s or Harvard + Yale + Princeton combined?"',
            back: '✅ McDonald\'s ($800M+/year) spends more than Harvard, Yale, and Princeton\'s entire annual budgets combined (~$600M).\n\nThis shows the power of consistent brand investment over decades.',
            funFact: '💡 McDonald\'s Golden Arches are reportedly more recognized globally than the Christian cross — testament to omnipresent, consistent branding.'
        },
        {
            type: 'fact', emoji: '🎯', title: 'TRUE OR FALSE?',
            front: '"97% of first-time website visitors don\'t convert (buy or sign up) on their first visit."',
            back: '✅ TRUE\n\nMost decisions require 7+ touchpoints before conversion. This is why retargeting ads, email drip campaigns, and content marketing exist — to capture people across multiple visits.',
            funFact: '💡 "The Rule of 7" says a prospect needs to see your message 7 times before acting. This concept originated in 1930s Hollywood film marketing.'
        },
        {
            type: 'fact', emoji: '🎨', title: 'MYTH OR FACT?',
            front: '"Color alone can increase brand recognition by up to 80%."',
            back: '✅ FACT\n\nUniversity of Loyola research shows color increases brand recognition up to 80%. This is why brands obsessively protect color trademarks (Tiffany Blue, UPS Brown, Coca-Cola Red).',
            funFact: '💡 Owens Corning was the first to trademark a color — their pink fiberglass insulation (Pantone 474) has been legally protected since 1985.'
        },
    ],
    'Finance': [
        {
            type: 'fact', emoji: '📈', title: 'TRUE OR FALSE?',
            front: '"A higher stock price means the company is more valuable."',
            back: '❌ FALSE\n\nPrice alone means nothing without shares outstanding. Market Cap = Price × Shares. Apple at $185/share × 15B shares = $2.8T. A $3,000 stock could be worth far less.',
            funFact: '💡 Berkshire Hathaway Class A shares trade at ~$700,000 per share — Buffett never split them to deter short-term traders.'
        },
        {
            type: 'fact', emoji: '🏦', title: 'MYTH OR FACT?',
            front: '"Paying off all your debt immediately is always the best financial decision."',
            back: '❌ MYTH\n\nIf debt costs 3% (e.g., mortgage) but investments return 10% historically, carrying the cheap debt and investing the difference generates more wealth over time. This is called arbitrage.',
            funFact: '💡 This arbitrage between borrowing cost and investment return is a core concept in corporate capital structure optimization.'
        },
        {
            type: 'fact', emoji: '👴', title: 'DID YOU KNOW?',
            front: '"Warren Buffett is worth $130B+. What percentage did he earn AFTER turning 50?"',
            back: '✅ ~99% of Buffett\'s wealth was earned after age 50 — and 97% after age 65.\n\nHis secret: compound interest + time. He started investing at age 11 and never stopped.',
            funFact: '💡 If Buffett started at 30 and retired at 60, his net worth would be ~$11.9M instead of $130B. Time in market > timing the market.'
        },
        {
            type: 'fact', emoji: '📉', title: 'TRUE OR FALSE?',
            front: '"Diversification eliminates all investment risk."',
            back: '❌ FALSE\n\nDiversification eliminates UNSYSTEMATIC risk (individual company risk) but NOT systematic risk (market-wide). In the 2008 crash, diversified portfolios still lost 30-50%.',
            funFact: '💡 Harry Markowitz won the 1990 Nobel in Economics for Modern Portfolio Theory — mathematically proving diversification maximizes return for a given risk level.'
        },
        {
            type: 'fact', emoji: '⚠️', title: 'TRUE OR FALSE?',
            front: '"A profitable company cannot go bankrupt."',
            back: '❌ FALSE\n\nA company can be profitable on paper but run out of CASH. Toys R Us had profitable years before bankruptcy. Cash flow — not accounting profit — determines solvency.',
            funFact: '💡 Accounting uses accrual: revenue is recorded when earned, not when cash arrives. A company owed $10M with $0 in the bank cannot pay its suppliers — despite being "profitable".'
        },
    ],
    'Healthcare': [
        {
            type: 'fact', emoji: '🧠', title: 'MYTH OR FACT?',
            front: '"Humans only use 10% of their brains."',
            back: '❌ MYTH\n\nBrain imaging (fMRI) shows activity in virtually ALL brain regions — just not simultaneously. Over a day, essentially 100% of the brain is used. This myth originated from misquoted 19th century neuroscience.',
            funFact: '💡 The brain consumes ~20% of the body\'s total energy despite being only 2% of body weight — roughly 400 calories per day just to think.'
        },
        {
            type: 'fact', emoji: '💊', title: 'TRUE OR FALSE?',
            front: '"Antibiotics can cure the flu and common cold."',
            back: '❌ FALSE\n\nAntibiotics ONLY work on bacteria. Flu and cold are caused by VIRUSES. Using antibiotics against viruses has zero therapeutic effect — and contributes to dangerous antibiotic resistance.',
            funFact: '💡 Antibiotic resistance is projected to kill 10 million people/year by 2050 — more than cancer — one of the most serious global health threats.'
        },
        {
            type: 'fact', emoji: '🥕', title: 'MYTH OR FACT?',
            front: '"Eating carrots improves your eyesight beyond normal."',
            back: '❌ MYTH\n\nVitamin A (in carrots) prevents night blindness from DEFICIENCY. If your levels are normal, more carrots don\'t help your vision at all.\n\nThis myth was WWII British propaganda to hide radar technology.',
            funFact: '💡 Britain spread the "carrots help pilots see in the dark" story to fool Germany into thinking exceptional vision — not radar — was why their pilots performed better at night.'
        },
        {
            type: 'fact', emoji: '🦠', title: 'TRUE OR FALSE?',
            front: '"Your gut contains more neurons than your spinal cord (the \'second brain\')."',
            back: '✅ TRUE\n\nThe enteric nervous system has 100-500 million neurons — more than the spinal cord. It can operate independently of the brain and produces 95% of the body\'s serotonin.',
            funFact: '💡 Gut bacteria can influence mood, anxiety, and decision-making via the vagus nerve — why scientists study the microbiome for mental health treatments.'
        },
        {
            type: 'fact', emoji: '❤️', title: 'TRUE OR FALSE?',
            front: '"Mental health disorders only affect a small percentage of the population."',
            back: '❌ FALSE\n\n1 in 4 people worldwide will experience a mental health condition in their lifetime. Depression is the leading cause of disability globally — one of the most common health conditions.',
            funFact: '💡 Despite prevalence, only 1 in 3 people with a mental health disorder receive treatment — primarily due to stigma, lack of access, and misdiagnosis.'
        },
    ],
    'Engineering': [
        {
            type: 'fact', emoji: '⚙️', title: 'MYTH OR FACT?',
            front: '"Good engineers always choose the highest-performing technical solution."',
            back: '❌ MYTH\n\nEngineers optimize across constraints: cost, safety, schedule, and maintainability. The "good enough" solution that meets all requirements, fits the budget, and is maintainable is often the RIGHT choice.',
            funFact: '💡 The "worse is better" philosophy argues simple, slightly flawed systems dominate complex perfect ones — because adoption, reliability, and maintainability matter more than theoretical purity.'
        },
        {
            type: 'fact', emoji: '🗼', title: 'DID YOU KNOW?',
            front: '"The Eiffel Tower changes height depending on the temperature. By how much?"',
            back: '✅ Up to 15cm (6 inches) in summer due to thermal expansion of iron.\n\nAt 300m tall, a 40°C temperature swing causes 12-18cm of expansion — a significant engineering consideration.',
            funFact: '💡 All long bridges, railways, and pipelines use expansion joints — deliberate gaps that allow structures to expand and contract without buckling.'
        },
        {
            type: 'fact', emoji: '🐛', title: 'TRUE OR FALSE?',
            front: '"The term \'computer bug\' originated from an actual physical bug found in a computer."',
            back: '✅ TRUE\n\nIn 1947, engineers at Harvard found a moth trapped in a relay of the Mark II. Grace Hopper\'s team taped it into the logbook: "First actual case of bug being found."',
            funFact: '💡 Grace Hopper also invented the first compiler and popularized the idea that programming could use English-like commands — fundamentally changing how computers are programmed.'
        },
        {
            type: 'fact', emoji: '🔄', title: 'TRUE OR FALSE?',
            front: '"Redundancy in safety-critical engineering systems is wasteful and unnecessary cost."',
            back: '❌ FALSE\n\nRedundancy is ESSENTIAL. Aircraft have triple/quadruple-redundant flight controls. Spacecraft use redundant radiation-hardened computers. Cost of redundancy << cost of failure.',
            funFact: '💡 The Boeing 777 has three independent hydraulic systems, each capable of flying the plane solo. Probability of all three failing simultaneously: less than 1 in a billion flight hours.'
        },
        {
            type: 'fact', emoji: '⚡', title: 'MYTH OR FACT?',
            front: '"Optimize code performance as early as possible during development."',
            back: '❌ MYTH\n\n"Premature optimization is the root of all evil" — Donald Knuth.\n\nWrite correct, maintainable code first. Then PROFILE to find real bottlenecks. Only 3-4% of code typically causes 97% of performance issues.',
            funFact: '💡 Donald Knuth\'s The Art of Computer Programming is the most comprehensive algorithms work ever written. Bill Gates said: "If you think you\'re a good programmer... read Knuth\'s Art."'
        },
    ],
};

// ── BRAIN TEASERS ────────────────────────────────────────────────────────────
const TEASERS = [
    { title: 'The Water Jug Problem', question: 'You have a 3L and a 5L jug. No markings. Measure exactly 4 liters using only these two jugs.', hint: '1. Fill 5L\n2. Pour into 3L until full → 5L has 2L\n3. Empty 3L\n4. Pour 2L from 5L into 3L\n5. Fill 5L again\n6. Pour from 5L into 3L until full (needs 1L) → 5L has exactly 4L ✅', tip: 'Tests systematic thinking. Show your steps — interviewers want your process, not just the answer.' },
    { title: 'The Metric Drop', question: 'Your app\'s daily active users dropped 25% overnight. Walk through exactly how you would diagnose the root cause.', hint: '1. Is it a tracking/data issue?\n2. Did a deployment happen?\n3. Segment: which platform? Region? User type?\n4. Check error rates and response times\n5. Check external factors (competitor, news, outage)\n6. Look at funnel: where do users drop off?', tip: 'Never guess first. Eliminate data errors, then isolate variables systematically.' },
    { title: 'Piano Tuners', question: 'Estimate how many piano tuners work in a city of 1 million people. Show your reasoning.', hint: '• 1M people → ~400K households\n• ~5% own pianos → 20,000 pianos\n• Tuned once/year → 20,000 jobs/year\n• Tuner does ~4/day × 250 days = 1,000/year\n• 20,000 ÷ 1,000 ≈ 20 tuners', tip: 'State assumptions clearly. Round confidently. The interviewer wants structured estimation, not precision.' },
    { title: 'A/B Test Conflict', question: 'Version B has 5% higher click rate but 3% lower purchase completion. Which version do you ship?', hint: 'Ship A or investigate. Higher clicks + lower purchases = B attracts unqualified clicks.\nCalculate: click rate × completion rate for both.\nRevenue per visitor = clicks × conversions × AOV.\nThat\'s your real metric.', tip: 'Always ask: what metric matters for the business goal? Never optimize for vanity metrics.' },
    { title: 'The Guard Riddle', question: 'Two guards, two doors. One always tells truth, one always lies. One door leads to freedom, one to danger. You can ask ONE guard ONE question. What do you ask?', hint: 'Ask either guard: "If I asked the OTHER guard which door leads to freedom, what would they say?" Then take the OPPOSITE door.\n\nWhy: Truth-teller reports liar\'s lie. Liar lies about truth-teller\'s truth. Both give the wrong answer — so flip it.', tip: 'If you know this puzzle, say so and explain the logic. Honesty + clear communication is what\'s really being tested.' },
];

// ── FLIP CARD COMPONENT ──────────────────────────────────────────────────────
const COLOR_MAP = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', accent: 'text-emerald-400', dot: 'bg-emerald-500', btn: 'bg-emerald-600' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'text-blue-400', dot: 'bg-blue-500', btn: 'bg-blue-600' },
    brand: { bg: 'bg-brand/10', border: 'border-brand/20', accent: 'text-brand', dot: 'bg-brand', btn: 'bg-brand' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', accent: 'text-purple-400', dot: 'bg-purple-500', btn: 'bg-purple-600' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', accent: 'text-rose-400', dot: 'bg-rose-500', btn: 'bg-rose-600' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', accent: 'text-orange-400', dot: 'bg-orange-500', btn: 'bg-orange-600' },
};

function FlipCard({ item, flipped, onFlip, colorKey }) {
    const c = COLOR_MAP[colorKey] || COLOR_MAP.emerald;
    const isCode = item.type === 'code';
    return (
        <AnimatePresence mode="wait">
            {!flipped ? (
                <motion.div key="front" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.3 }}
                    onClick={onFlip}
                    className={`cursor-pointer rounded-3xl border ${c.bg} ${c.border} p-7 min-h-[230px] flex flex-col justify-between group hover:opacity-90 transition-opacity`}>
                    <div className="flex items-start justify-between">
                        {!isCode
                            ? <p className={`text-[10px] font-black uppercase tracking-widest ${c.accent}`}>{item.emoji} {item.title}</p>
                            : <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${c.bg} ${c.accent} ${c.border}`}>{item.language}</span>
                                <span className={`text-xs font-black italic uppercase ${c.accent}`}>{item.title}</span>
                            </div>
                        }
                        <span className="text-xl opacity-30 group-hover:opacity-60 transition-opacity">🔄</span>
                    </div>

                    {isCode ? (
                        <div className="rounded-xl overflow-hidden border border-emerald-500/20 mt-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900">
                                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                                <span className="text-[9px] text-content-muted font-mono ml-1">{item.language?.toLowerCase()}</span>
                            </div>
                            <div className="p-4 bg-gray-950 overflow-x-auto">
                                <pre className="text-xs text-emerald-300 font-mono leading-relaxed whitespace-pre">{item.front}</pre>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xl font-black text-content-base italic leading-snug mt-4">"{item.front}"</p>
                    )}

                    <p className={`text-[10px] font-black uppercase tracking-widest ${c.accent} mt-5`}>
                        👆 {isCode ? item.question : 'Tap card to flip & reveal answer'}
                    </p>
                </motion.div>
            ) : (
                <motion.div key="back" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.3 }}
                    onClick={onFlip}
                    className="cursor-pointer rounded-3xl border border-stroke bg-surface-card p-7 min-h-[230px] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-content-muted">✅ Answer Revealed</p>
                        <span className="text-xl opacity-30">🔄</span>
                    </div>
                    {isCode ? (
                        <div className="rounded-xl overflow-hidden border border-emerald-500/20">
                            <div className="px-3 py-1.5 bg-emerald-900/40 border-b border-emerald-500/20">
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Explanation + Fix</span>
                            </div>
                            <div className="p-4 bg-gray-950 overflow-x-auto">
                                <pre className="text-xs text-emerald-300 font-mono leading-relaxed whitespace-pre">{item.back}</pre>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-5 rounded-2xl ${c.bg} border ${c.border}`}>
                            <p className="text-sm text-content-base leading-relaxed whitespace-pre-wrap">{item.back}</p>
                        </div>
                    )}
                    <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                        <p className="text-xs text-yellow-300 leading-relaxed">{item.funFact}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── DEBUG CHALLENGE (all domains, flip cards) ────────────────────────────────
const DOMAIN_COLORS = { 'Computer Science': 'emerald', 'Business': 'blue', 'Marketing': 'brand', 'Finance': 'purple', 'Healthcare': 'rose', 'Engineering': 'orange' };
const DOMAIN_EMOJIS = { 'Computer Science': '💻', 'Business': '📊', 'Marketing': '📣', 'Finance': '💰', 'Healthcare': '🏥', 'Engineering': '⚙️' };

function CodeDebugDrill({ onExit }) {
    const [domain, setDomain] = useState(null);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [finished, setFinished] = useState(false);

    const bank = domain ? CHALLENGE_BANKS[domain] : [];
    const item = bank[index];
    const colorKey = DOMAIN_COLORS[domain] || 'emerald';
    const c = COLOR_MAP[colorKey] || COLOR_MAP.emerald;

    const handleNext = () => {
        if (index + 1 >= bank.length) {
            setFinished(true);
            recordDrillCompletion('structure', domain);
        }
        else { setIndex(i => i + 1); setFlipped(false); }
    };

    if (!domain) {
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-1">Step 1</p>
                    <h3 className="text-2xl font-black text-content-base italic uppercase">Choose Your Domain</h3>
                    <p className="text-content-muted text-sm mt-1">CS gets code debug flip cards. All other domains get myth-busting fun-fact challenges.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.keys(CHALLENGE_BANKS).map((d, i) => {
                        const ck = DOMAIN_COLORS[d];
                        const hoverMap = { emerald: 'hover:border-emerald-500/40 hover:bg-emerald-500/5', blue: 'hover:border-blue-500/40 hover:bg-blue-500/5', brand: 'hover:border-brand/40 hover:bg-brand/5', purple: 'hover:border-purple-500/40 hover:bg-purple-500/5', rose: 'hover:border-rose-500/40 hover:bg-rose-500/5', orange: 'hover:border-orange-500/40 hover:bg-orange-500/5' };
                        const textMap = { emerald: 'group-hover:text-emerald-400', blue: 'group-hover:text-blue-400', brand: 'group-hover:text-brand', purple: 'group-hover:text-purple-400', rose: 'group-hover:text-rose-400', orange: 'group-hover:text-orange-400' };
                        return (
                            <motion.button key={d} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                onClick={() => setDomain(d)}
                                className={`p-5 rounded-2xl border border-stroke bg-surface-hover text-left transition-all group ${hoverMap[ck] || ''}`}>
                                <div className="text-3xl mb-2">{DOMAIN_EMOJIS[d]}</div>
                                <p className={`text-xs font-black uppercase tracking-widest text-content-base transition-colors ${textMap[ck] || ''}`}>{d}</p>
                                <p className="text-[10px] text-content-muted mt-1">{d === 'Computer Science' ? '🐛 Code Debugging' : '💡 Fun Fact Flip Cards'}</p>
                            </motion.button>
                        );
                    })}
                </div>
                <button onClick={onExit} className="text-[10px] font-black uppercase tracking-widest text-content-muted hover:text-content-base transition-colors">← Back to Drills</button>
            </div>
        );
    }

    if (finished) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="py-16 flex flex-col items-center gap-6 text-center">
                <div className="text-6xl">🏆</div>
                <div>
                    <h3 className="text-3xl font-black text-content-base italic uppercase">{domain} Complete!</h3>
                    <p className="text-content-muted text-sm mt-2">You flipped all {bank.length} cards.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { setDomain(null); setIndex(0); setFlipped(false); setFinished(false); }}
                        className="px-6 py-3 rounded-xl border border-stroke text-content-muted text-xs font-black uppercase tracking-widest hover:bg-surface-hover transition-all flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5" /> Try Another Domain
                    </button>
                    <button onClick={onExit} className={`px-6 py-3 rounded-xl ${c.btn} text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all`}>← Back</button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex gap-1.5">{bank.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= index ? c.dot : 'bg-surface-hover'}`} />)}</div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-content-muted uppercase tracking-widest">{index + 1} / {bank.length}</span>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full bg-surface-hover uppercase tracking-widest ${flipped ? 'text-emerald-400' : c.accent}`}>
                        {flipped ? '✅ Revealed' : '👆 Tap to flip'}
                    </span>
                </div>
            </div>

            <FlipCard item={item} flipped={flipped} onFlip={() => setFlipped(f => !f)} colorKey={colorKey} />

            <div className="flex gap-3 pt-1">
                <button onClick={() => { setDomain(null); setIndex(0); setFlipped(false); }}
                    className="px-5 py-3 rounded-xl border border-stroke text-content-muted text-xs font-black uppercase tracking-widest hover:bg-surface-hover transition-all">← Domains</button>
                <button onClick={handleNext}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${flipped ? `${c.btn} text-white hover:opacity-90` : 'bg-surface-hover border border-stroke text-content-muted'}`}>
                    {index + 1 < bank.length ? <><ChevronRight className="w-4 h-4" /> Next Card</> : <><Trophy className="w-4 h-4" /> Finish</>}
                </button>
            </div>
        </div>
    );
}

// ── DOMAIN KNOWLEDGE QUIZ ────────────────────────────────────────────────────
function DomainQuiz({ onExit }) {
    const [domain, setDomain] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [finished, setFinished] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');

    const questions = domain ? DOMAIN_QUESTIONS[domain] : [];
    const current = questions[questionIndex];

    const handleNext = () => {
        if (questionIndex + 1 >= questions.length) {
            setFinished(true);
            recordDrillCompletion('domain_knowledge', domain);
        }
        else { setQuestionIndex(i => i + 1); setRevealed(false); setUserAnswer(''); }
    };

    if (!domain) {
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-1">Step 1</p>
                    <h3 className="text-2xl font-black text-content-base italic uppercase">Choose Your Field</h3>
                    <p className="text-content-muted text-sm mt-1">Get 5 expert-level interview Q&As for your specific domain.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.keys(DOMAIN_QUESTIONS).map((d, i) => {
                        const ck = DOMAIN_COLORS[d];
                        const hoverMap = { emerald: 'hover:border-emerald-500/40 hover:bg-emerald-500/5', blue: 'hover:border-blue-500/40 hover:bg-blue-500/5', brand: 'hover:border-brand/40 hover:bg-brand/5', purple: 'hover:border-purple-500/40 hover:bg-purple-500/5', rose: 'hover:border-rose-500/40 hover:bg-rose-500/5', orange: 'hover:border-orange-500/40 hover:bg-orange-500/5' };
                        const textMap = { emerald: 'group-hover:text-emerald-400', blue: 'group-hover:text-blue-400', brand: 'group-hover:text-brand', purple: 'group-hover:text-purple-400', rose: 'group-hover:text-rose-400', orange: 'group-hover:text-orange-400' };
                        return (
                            <motion.button key={d} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                onClick={() => setDomain(d)}
                                className={`p-5 rounded-2xl border border-stroke bg-surface-hover text-left transition-all group ${hoverMap[ck] || ''}`}>
                                <div className="text-3xl mb-2">{DOMAIN_EMOJIS[d]}</div>
                                <p className={`text-xs font-black uppercase tracking-widest text-content-base transition-colors ${textMap[ck] || ''}`}>{d}</p>
                                <p className="text-[10px] text-content-muted mt-1">{DOMAIN_QUESTIONS[d].length} questions</p>
                            </motion.button>
                        );
                    })}
                </div>
                <button onClick={onExit} className="text-[10px] font-black uppercase tracking-widest text-content-muted hover:text-content-base transition-colors">← Back to Drills</button>
            </div>
        );
    }

    if (finished) {
        const ck = DOMAIN_COLORS[domain] || 'brand';
        const c = COLOR_MAP[ck] || COLOR_MAP.brand;
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="py-16 flex flex-col items-center gap-6 text-center">
                <div className="text-6xl">🏆</div>
                <div>
                    <h3 className="text-3xl font-black text-content-base italic uppercase">{domain} Complete!</h3>
                    <p className="text-content-muted text-sm mt-2">You finished all {questions.length} domain questions.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { setDomain(null); setQuestionIndex(0); setFinished(false); setRevealed(false); setUserAnswer(''); }}
                        className="px-6 py-3 rounded-xl border border-stroke text-content-muted text-xs font-black uppercase tracking-widest hover:bg-surface-hover transition-all flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5" /> Try Another Domain
                    </button>
                    <button onClick={onExit} className={`px-6 py-3 rounded-xl ${c.btn} text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2`}>← Back to Drills</button>
                </div>
            </motion.div>
        );
    }

    const ck = DOMAIN_COLORS[domain] || 'brand';
    const c = COLOR_MAP[ck] || COLOR_MAP.brand;

    return (
        <AnimatePresence mode="wait">
            <motion.div key={questionIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">{questions.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= questionIndex ? c.dot : 'bg-surface-hover'}`} />)}</div>
                    <span className="text-xs font-black text-content-muted uppercase tracking-widest">{questionIndex + 1} / {questions.length}</span>
                </div>
                <div className={`p-6 rounded-2xl ${c.bg} border ${c.border}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${c.accent} mb-2`}>🌐 {domain} — Interview Question</p>
                    <h3 className="text-lg font-black text-content-base italic leading-snug">"{current.q}"</h3>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted">✏️ Your Answer</label>
                    <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
                        placeholder="Write your answer here before revealing the model answer..."
                        rows={4}
                        className={`w-full rounded-xl bg-surface-hover border border-stroke text-sm text-content-base p-4 resize-none focus:outline-none focus:border-${ck}-500/50 placeholder:text-content-muted/40 transition-colors`} />
                </div>
                {!revealed ? (
                    <button onClick={() => setRevealed(true)}
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${userAnswer.trim() ? `${c.btn} text-white hover:opacity-90 shadow-lg` : `border ${c.border} ${c.accent} hover:opacity-80`}`}>
                        💡 {userAnswer.trim() ? 'Compare With Model Answer' : 'Show Strong Answer'}
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {userAnswer.trim() && (
                            <div className="p-4 rounded-xl bg-surface-card border border-stroke">
                                <p className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2">📝 Your Answer</p>
                                <p className="text-sm text-content-base italic leading-relaxed">{userAnswer}</p>
                            </div>
                        )}
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">✅ Strong Answer</p>
                            <p className="text-sm text-content-base leading-relaxed">{current.a}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                            <p className="text-sm text-yellow-300 leading-relaxed">{current.tip}</p>
                        </div>
                    </motion.div>
                )}
                <div className="flex gap-3 pt-2">
                    <button onClick={() => { setDomain(null); setQuestionIndex(0); setRevealed(false); setUserAnswer(''); }}
                        className="px-5 py-3 rounded-xl border border-stroke text-content-muted text-xs font-black uppercase tracking-widest hover:bg-surface-hover transition-all">← Domains</button>
                    <button onClick={handleNext}
                        className={`flex-1 py-3 rounded-xl ${c.btn} text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2`}>
                        {questionIndex + 1 < questions.length ? <><ChevronRight className="w-4 h-4" /> Next</> : <><Trophy className="w-4 h-4" /> Finish</>}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ── BRAIN TEASERS ────────────────────────────────────────────────────────────
function BrainTeasers({ onExit }) {
    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [finished, setFinished] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const item = TEASERS[index];

    const handleNext = () => {
        if (index + 1 >= TEASERS.length) {
            setFinished(true);
            recordDrillCompletion('reasoning', 'General');
        }
        else { setIndex(i => i + 1); setRevealed(false); setUserAnswer(''); }
    };

    if (finished) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center gap-6 text-center">
                <div className="text-6xl">🏆</div>
                <h3 className="text-3xl font-black text-content-base italic uppercase">Mind Sharpened!</h3>
                <div className="flex gap-3">
                    <button onClick={() => { setIndex(0); setRevealed(false); setFinished(false); setUserAnswer(''); }}
                        className="px-6 py-3 rounded-xl border border-stroke text-content-muted text-xs font-black uppercase tracking-widest hover:bg-surface-hover transition-all flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Restart</button>
                    <button onClick={onExit} className="px-6 py-3 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">← Back</button>
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">{TEASERS.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= index ? 'bg-purple-500' : 'bg-surface-hover'}`} />)}</div>
                    <span className="text-xs font-black text-content-muted uppercase tracking-widest">{index + 1} / {TEASERS.length}</span>
                </div>
                <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">🧩 {item.title}</p>
                    <p className="text-base text-content-base leading-relaxed">{item.question}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted">✏️ Your Answer / Reasoning</label>
                    <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
                        placeholder="Type your reasoning here before revealing the answer..."
                        rows={4}
                        className="w-full rounded-xl bg-surface-hover border border-stroke text-sm text-content-base p-4 resize-none focus:outline-none focus:border-purple-500/50 placeholder:text-content-muted/40 transition-colors" />
                </div>
                {!revealed ? (
                    <button onClick={() => setRevealed(true)}
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${userAnswer.trim() ? 'bg-purple-600 text-white hover:opacity-90 shadow-lg' : 'border border-purple-500/30 text-purple-400 hover:bg-purple-500/10'}`}>
                        💡 {userAnswer.trim() ? 'Check My Answer' : 'Reveal Answer'}
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {userAnswer.trim() && (
                            <div className="p-4 rounded-xl bg-surface-card border border-stroke">
                                <p className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2">📝 Your Answer</p>
                                <p className="text-sm text-content-base italic leading-relaxed">{userAnswer}</p>
                            </div>
                        )}
                        <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Solution</p>
                            <p className="text-sm text-content-base leading-relaxed whitespace-pre-wrap">{item.hint}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                            <p className="text-sm text-yellow-300">{item.tip}</p>
                        </div>
                    </motion.div>
                )}
                <div className="flex gap-3 pt-2">
                    <button onClick={onExit} className="px-5 py-3 rounded-xl border border-stroke text-content-muted text-xs font-black uppercase tracking-widest hover:bg-surface-hover transition-all">← Exit</button>
                    <button onClick={handleNext} className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
                        {index + 1 < TEASERS.length ? <><ChevronRight className="w-4 h-4" /> Next</> : <><Trophy className="w-4 h-4" /> Finish</>}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ── LIVE SPEAKING LAB ────────────────────────────────────────────────────────
function LiveSpeakingLab({ onExit }) {
    const [domain, setDomain] = useState('General');
    const [promptIndex, setPromptIndex] = useState(0);
    const [stage, setStage] = useState('ready');
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [seconds, setSeconds] = useState(0);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const domains = Object.keys(SPEAKING_PROMPTS);
    const prompts = SPEAKING_PROMPTS[domain] || SPEAKING_PROMPTS['General'];
    const currentPrompt = prompts[promptIndex % prompts.length];

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            chunksRef.current = [];
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.start(500);
            setStage('recording');
            setSeconds(0);
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        } catch {
            setError('Microphone access denied. Please allow microphone in your browser settings.');
        }
    };

    const stopAndEvaluate = async () => {
        clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
        setStage('transcribing');
        setError(null);
        await new Promise(r => setTimeout(r, 600));
        try {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            const token = await getToken();
            const transcribeRes = await fetch(`${API_URL}/training/transcribe`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
            });
            if (!transcribeRes.ok) throw new Error('Transcription failed');
            const { transcript: text } = await transcribeRes.json();
            setTranscript(text);
            const feedbackRes = await fetch(`${API_URL}/training/speaking-feedback`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: text, prompt: currentPrompt, domain }),
            });
            if (!feedbackRes.ok) throw new Error('Feedback failed');
            const { feedback: fb } = await feedbackRes.json();
            setFeedback(fb);
            setStage('feedback');
            recordDrillCompletion('communication', domain);
        } catch (err) {
            setError(err.message || 'Something went wrong. Try again.');
            setStage('ready');
        }
    };

    const reset = () => { setStage('ready'); setTranscript(''); setFeedback(null); setError(null); setSeconds(0); };
    const nextPrompt = () => { setPromptIndex(i => i + 1); reset(); };

    const ScoreBar = ({ label, value }) => (
        <div className="space-y-1">
            <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-content-muted">{label}</span>
                <span className={`text-sm font-black ${value >= 70 ? 'text-emerald-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{value}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
                    className={`h-full rounded-full ${value >= 70 ? 'bg-emerald-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted">Your Domain</label>
                    <select value={domain} onChange={e => { setDomain(e.target.value); reset(); setPromptIndex(0); }} className="w-full input-field text-sm">
                        {domains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted">Question {promptIndex % prompts.length + 1} of {prompts.length}</label>
                    <button onClick={nextPrompt} className="w-full input-field text-left text-sm text-content-muted hover:text-content-base transition-colors flex items-center justify-between">
                        <span>Next Prompt</span><ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                </div>
            </div>
            <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3">🎤 Speak Your Answer To This Question</p>
                <h3 className="text-xl font-black text-content-base italic leading-snug">"{currentPrompt}"</h3>
            </div>
            {stage === 'ready' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-surface-hover border border-stroke">
                        <p className="text-xs text-content-muted">📋 <strong>Instructions:</strong> Click Start, speak your answer for 30–90 seconds, then click Stop. AI transcribes your speech and gives instant coaching feedback.</p>
                    </div>
                    {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-sm text-red-400">{error}</p></div>}
                    <button onClick={startRecording} className="w-full py-5 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg">
                        <Mic className="w-5 h-5" /> Start Speaking
                    </button>
                </div>
            )}
            {stage === 'recording' && (
                <div className="space-y-4">
                    <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                        className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
                            <span className="text-red-400 font-black uppercase tracking-widest text-sm">Recording</span>
                        </div>
                        <div className="text-4xl font-black text-content-base tabular-nums">
                            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
                        </div>
                        <p className="text-xs text-content-muted">Speak clearly. Aim for 30–90 seconds.</p>
                    </motion.div>
                    <button onClick={stopAndEvaluate} className="w-full py-5 rounded-2xl bg-surface-card border border-red-500/30 text-red-400 font-black uppercase tracking-widest text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-3">
                        <MicOff className="w-5 h-5" /> Stop & Get AI Feedback
                    </button>
                </div>
            )}
            {stage === 'transcribing' && (
                <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-brand animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-content-muted">Transcribing & Analyzing with AI...</p>
                </div>
            )}
            {stage === 'feedback' && feedback && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="card-bento p-6 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-content-muted flex items-center gap-2"><Target className="w-3.5 h-3.5 text-brand" /> Performance Scores</h4>
                        <ScoreBar label="Clarity" value={feedback.clarity_score} />
                        <ScoreBar label="Confidence" value={feedback.confidence_score} />
                        <ScoreBar label="Structure" value={feedback.structure_score} />
                        {feedback.filler_count > 0 && (
                            <div className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                                <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Filler Words Detected</span>
                                <span className="text-sm font-black text-yellow-400">{feedback.filler_count}x</span>
                            </div>
                        )}
                    </div>
                    <div className="card-bento p-5 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-content-muted">📝 What You Said</p>
                        <p className="text-sm text-content-base leading-relaxed italic">"{transcript}"</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-brand/5 border border-brand/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">🤖 AI Coach Feedback</p>
                        <p className="text-sm text-content-base leading-relaxed">{feedback.overall_feedback}</p>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-content-muted">💡 Improvement Tips</p>
                        {(feedback.suggestions || []).map((s, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-surface-hover rounded-xl border border-stroke">
                                <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-[10px] font-black shrink-0">{i + 1}</div>
                                <p className="text-sm text-content-base">{s}</p>
                            </div>
                        ))}
                    </div>
                    {feedback.improved_version && (
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2"><Volume2 className="w-3 h-3" /> Model Answer</p>
                            <p className="text-sm text-content-base leading-relaxed italic">"{feedback.improved_version}"</p>
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button onClick={reset} className="flex-1 py-3 rounded-xl border border-stroke text-content-muted text-xs font-black uppercase tracking-widest hover:bg-surface-hover transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-3.5 h-3.5" /> Try Again
                        </button>
                        <button onClick={nextPrompt} className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5" /> Next Question
                        </button>
                    </div>
                </motion.div>
            )}
            <button onClick={onExit} className="text-[10px] font-black uppercase tracking-widest text-content-muted hover:text-content-base transition-colors flex items-center gap-1">← Back to Drills</button>
        </div>
    );
}

// ── CATEGORY PICKER ──────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'speaking', label: 'Live Speaking Lab', emoji: '🎤', desc: 'Speak into mic → AI transcript & coaching', bgClass: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20', accentClass: 'text-blue-400', sub: 'AI Feedback' },
    { id: 'code_debug', label: 'Knowledge Flip', emoji: '🃏', desc: 'Flip cards: code bugs for CS, myth-busters for all other domains', bgClass: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20', accentClass: 'text-emerald-400', sub: '6 Domains' },
    { id: 'domain', label: 'Domain Knowledge', emoji: '🌐', desc: 'Expert Q&As: CS, Business, Finance, Healthcare & more', bgClass: 'bg-brand/10 border-brand/30 hover:bg-brand/20', accentClass: 'text-brand', sub: '6 Domains' },
    { id: 'reasoning', label: 'Brain Teasers', emoji: '🧩', desc: 'Logic puzzles, estimation, and case study challenges', bgClass: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20', accentClass: 'text-purple-400', sub: '5 Puzzles' },
];

function AIdrills() {
    const [activeCategory, setActiveCategory] = useState(null);
    const cat = CATEGORIES.find(c => c.id === activeCategory);
    return (
        <div className="space-y-6">
            {activeCategory && (
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat?.emoji}</span>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-content-muted">Active Drill</p>
                        <h3 className={`text-lg font-black italic uppercase ${cat?.accentClass}`}>{cat?.label}</h3>
                    </div>
                </div>
            )}
            {!activeCategory ? (
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand flex items-center gap-2 mb-1"><Sparkles className="w-3 h-3" /> Choose Your Drill</p>
                        <h3 className="text-2xl font-black text-content-base italic uppercase">Pick a category to start</h3>
                        <p className="text-content-muted text-sm mt-1">All drills work instantly, no loading required.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {CATEGORIES.map((cat, i) => (
                            <motion.button key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`group relative p-8 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${cat.bgClass}`}>
                                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className={`w-5 h-5 ${cat.accentClass}`} />
                                </div>
                                <div className="text-5xl mb-4">{cat.emoji}</div>
                                <h4 className={`text-lg font-black uppercase italic tracking-tight mb-1 ${cat.accentClass}`}>{cat.label}</h4>
                                <p className="text-xs text-content-muted leading-relaxed mb-3">{cat.desc}</p>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${cat.bgClass}`}>
                                    <Target className="w-3 h-3" /> {cat.sub}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : activeCategory === 'speaking' ? (
                <LiveSpeakingLab onExit={() => setActiveCategory(null)} />
            ) : activeCategory === 'code_debug' ? (
                <CodeDebugDrill onExit={() => setActiveCategory(null)} />
            ) : activeCategory === 'domain' ? (
                <DomainQuiz onExit={() => setActiveCategory(null)} />
            ) : (
                <BrainTeasers onExit={() => setActiveCategory(null)} />
            )}
        </div>
    );
}

// ── MAIN PRACTICE HUB ────────────────────────────────────────────────────────
const HUB_TABS = [
    { id: 'drills', label: 'AI Drills', icon: Zap },
    { id: 'star', label: 'STAR Builder', icon: BookMarked },
    { id: 'pitch', label: 'Elevator Pitch', icon: Mic2 },
];

const PracticeHub = () => {
    const [activeTab, setActiveTab] = useState('drills');
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <header className="space-y-2">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-brand font-black uppercase tracking-[0.3em] text-[10px]">
                    <Zap className="w-3 h-3 fill-current" /> Neural Training Core
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-content-base italic uppercase tracking-tight">
                    AI Personalized <span className="text-brand">Practice Hub</span>
                </motion.h2>
                <p className="text-content-muted max-w-2xl font-medium text-sm">
                    Four drill types, six domains, live speaking & sharpen every interview skill.
                </p>
            </header>
            <div className="flex gap-2 p-1 bg-surface-hover rounded-2xl border border-stroke w-fit">
                {HUB_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-brand text-white shadow-md shadow-brand-glow' : 'text-content-muted hover:text-content-base hover:bg-surface-card'}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:block">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'drills' && <AIdrills />}
                    {activeTab === 'star' && <STARBuilder />}
                    {activeTab === 'pitch' && <ElevatorPitchTrainer />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default PracticeHub;
