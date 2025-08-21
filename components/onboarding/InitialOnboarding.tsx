
import React from 'react';

const Step: React.FC<{ number: number; text: string; }> = ({ number, text }) => (
    <div className="p-2 border border-black rounded-md text-sm font-medium w-full max-w-md text-left dark:border-gray-400">
        Step #{number}: {text}
    </div>
);

const InitialOnboarding: React.FC = () => {
    return (
        <div className="flex-grow flex flex-col items-center justify-start pt-4 space-y-2">
            <Step number={1} text="Sign Up or Login" />
            <Step number={2} text="Fill out Milestones form in Navbar" />
            <Step number={3} text="Fill out the Name of at least 1 Chapter in Navbar" />
            <Step number={4} text="Begin writing. The word counter will track your progress. When you reach 24 words, press '1' or '2' to add a suggestion to your story. Rinse, Repeat." />
        </div>
    );
};

export default InitialOnboarding;
