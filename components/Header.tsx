
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                Projection Mapping Academy AI Designer
            </h1>
            <p className="mt-3 text-lg md:text-xl text-secondary-foreground/80 max-w-2xl mx-auto">
                Create stunning holiday displays for your home.
            </p>
        </header>
    );
};