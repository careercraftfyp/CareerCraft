import { useEffect } from 'react';

export default function SEO({ title, description, keywords, ogImage, ogUrl }) {
    useEffect(() => {
        // Set document title
        document.title = title 
            ? `${title} | CareerCraft - AI Career Agent` 
            : 'CareerCraft | AI Career Agent - Optimize ATS Resumes & Practice Mock Interviews';

        // Helper to update or create meta tags
        const updateMetaTag = (attributeName, attributeValue, content) => {
            if (!content) return;
            let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attributeName, attributeValue);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update description
        updateMetaTag('name', 'description', description || 'Optimize your resume for ATS systems, practice interactive speaking drills, build elevator pitches, and prepare for mock video interviews with CareerCraft AI.');

        // Update keywords
        updateMetaTag('name', 'keywords', keywords || 'AI mock interview, ATS resume checker, resume optimization, elevator pitch builder, speak coaching, CareerCraft AI');

        // Update Open Graph tags
        updateMetaTag('property', 'og:title', title || 'CareerCraft | AI Career Agent');
        updateMetaTag('property', 'og:description', description || 'Optimize your resume for ATS, practice speaking drills, and prepare for interviews.');
        updateMetaTag('property', 'og:image', ogImage || 'https://careercraft.cloud/logo.png');
        updateMetaTag('property', 'og:url', ogUrl || window.location.href);
        updateMetaTag('property', 'og:type', 'website');

        // Update Twitter card tags
        updateMetaTag('name', 'twitter:card', 'summary_large_image');
        updateMetaTag('name', 'twitter:title', title || 'CareerCraft | AI Career Agent');
        updateMetaTag('name', 'twitter:description', description || 'Optimize your resume for ATS, practice speaking drills, and prepare for interviews.');
        updateMetaTag('name', 'twitter:image', ogImage || 'https://careercraft.cloud/logo.png');

    }, [title, description, keywords, ogImage, ogUrl]);

    return null;
}
