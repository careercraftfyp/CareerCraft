import express from 'express';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase (using service role for backend privileges)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', async (req, res) => {
    const { name, email, protocol, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Save to Supabase Table
        const { error: dbError } = await supabase
            .from('contact_messages')
            .insert([{ name, email, protocol, message }]);

        if (dbError) throw dbError;

        // 2. Send Email Notification via Resend
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'CareerCraft AI <onboarding@resend.dev>',
                    to: process.env.ADMIN_EMAIL || email,
                    subject: `[Inquiry] ${protocol} from ${name}`,
                    html: `
                        <div style="background-color: #0E1D21; padding: 50px 20px; font-family: 'Inter', Arial, sans-serif;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #122E34; border-radius: 24px; overflow: hidden; border: 1px solid rgba(200, 141, 142, 0.2); box-shadow: 0 30px 60px rgba(0,0,0,0.5);">
                                
                                <!-- Top Bar -->
                                <div style="background: linear-gradient(90deg, #C88D8E 0%, #A67273 100%); padding: 14px 30px; text-align: center;">
                                    <span style="color: #FFFFFF; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.25em;">CareerCraft Official Notification</span>
                                </div>

                                <div style="padding: 45px;">
                                    <!-- Header -->
                                    <div style="margin-bottom: 35px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 25px;">
                                        <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.01em;">
                                            New Contact <span style="color: #C88D8E;">Inquiry</span>
                                        </h1>
                                        <p style="color: #677E8A; font-size: 13px; margin-top: 8px; font-weight: 500;">Received from ${name}</p>
                                    </div>

                                    <!-- Information Grid -->
                                    <div style="margin-bottom: 35px;">
                                        <div style="background: rgba(0,0,0,0.15); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.03);">
                                            <table width="100%" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td style="padding-bottom: 20px;">
                                                        <div style="font-size: 10px; font-weight: 800; color: #C88D8E; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px;">Sender Email</div>
                                                        <div style="font-size: 15px; color: #F8FAFC; font-weight: 500;">${email}</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div style="font-size: 10px; font-weight: 800; color: #C88D8E; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px;">Inquiry Subject</div>
                                                        <div style="font-size: 15px; color: #F8FAFC; font-weight: 500;">${protocol}</div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>

                                    <!-- Message: -->
                                    <div style="margin-bottom: 40px;">
                                        <div style="font-size: 10px; font-weight: 800; color: #677E8A; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 15px;">Message Content</div>
                                        <div style="color: #ABAFB5; font-size: 16px; line-height: 1.7; background: rgba(255,255,255,0.02); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                                            ${message.replace(/\n/g, '<br/>')}
                                        </div>
                                    </div>

                                    <!-- Footer Signature -->
                                    <div style="padding-top: 35px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                                        <p style="color: #677E8A; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; margin: 0;">
                                            CareerCraft AI Intelligence Platform // Automated Service
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Email sending failed, but data saved to DB:', emailError);
            }
        }

        res.json({ status: 'ok', message: 'Inquiry successfully processed.' });
    } catch (error) {
        console.error('System error processing contact form:', error);
        res.status(500).json({ error: 'Internal system error during processing' });
    }
});

export default router;
