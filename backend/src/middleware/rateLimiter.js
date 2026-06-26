import rateLimit from 'express-rate-limit';

// Standard rate limiter for general routes 
export const standardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Strict rate limiter for expensive AI & LLM processing routes
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, //15 requests per window for AI tools
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Expensive AI processing rate limit exceeded. Please wait 15 minutes before submitting again.' }
});
