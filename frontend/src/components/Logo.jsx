import React from 'react';

export default function Logo({ className }) {
    return (
        <img
            src="/logo.svg"
            alt="CareerCraft Logo"
            className={className}
            style={{ objectFit: 'cover', display: 'block' }}
        />
    );
}
