
import React from 'react';

const Step: React.FC<{ number: number; text: string; }> = ({ number, text }) => (
    <div className="p-2 border border-black rounded-md text-sm font-medium w-full max-w-md text-left dark:border-gray-400">
        Step #{number}: {text}
    </div>
);

interface PostLoginOnboardingProps {
    step: number;
}

const PostLoginOnboarding: React.FC<PostLoginOnboardingProps> = ({ step }) => {
    const step4Text = "Begin writing. The word counter will track your progress. When you reach 24 words, press '1' or '2' to add a suggestion to your story. Rinse, Repeat.";

    // For step 3, we only show the instruction, without the placeholder text
    // as the real WritingArea will be visible.
    if (step === 3) {
        return (
            <div className="flex flex-col items-center justify-start py-4 space-y-2">
                <Step number={4} text={step4Text} />
            </div>
        );
    }

    // For steps 1 and 2, we show the fake placeholder and instructions.
    return (
        <div className="flex-grow flex flex-col items-center justify-start pt-4 space-y-2">
            <p className="text-gray-400 dark:text-gray-500 mb-4">Start writing your story here...</p>
            {step === 1 && (
                <>
                    <Step number={2} text="Fill out Milestones form in Navbar" />
                    <Step number={3} text="Fill out the Name of at least 1 Chapter in Navbar" />
                    <Step number={4} text={step4Text} />
                </>
            )}
            {step === 2 && (
                <>
                    <Step number={3} text="Fill out the Name of at least 1 Chapter in Navbar" />
                    <Step number={4} text={step4Text} />
                </>
            )}
        </div>
    );
};

export default PostLoginOnboarding;