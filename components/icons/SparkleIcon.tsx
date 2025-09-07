import React from 'react';

export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"></path>
        <path d="M5 5L2 2"></path>
        <path d="M19 5l3-3"></path>
        <path d="M5 19l-3 3"></path>
        <path d="M19 19l3 3"></path>
    </svg>
);