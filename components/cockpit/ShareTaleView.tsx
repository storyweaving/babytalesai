import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastType } from '../../types';
import { generateShortTale, TaleType } from '../../services/geminiService';

const taleOptions = [
    { id: 'teaser', title: 'Teaser Tale (approx. 25-50 words)', description: 'A tiny, exciting glimpse to get them hooked! Perfect for a quick text message.' },
    { id: 'mini', title: 'Mini Tale (approx. 100-150 words)', description: 'A snapshot of the story, introducing the main characters and the beginning of their adventure.' },
    { id: 'summary', title: 'Summary Tale (approx. 250-300 words)', description: 'The core adventure from start to finish, hitting all the key moments and highlights.' },
    { id: 'full', title: 'The Full Tale', description: 'The complete, original story in all its glory.' }
];

const ShareTaleView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { chapters, milestones } = state;

    const [selectedTaleType, setSelectedTaleType] = useState<TaleType>('teaser');
    const [generatedTale, setGeneratedTale] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleBack = () => {
        if (isGenerating) return;
        if (generatedTale) {
            setGeneratedTale(null);
        } else {
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'menu' });
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedTale(null);
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Generating your tale...', type: ToastType.Info }});
        try {
            const tale = await generateShortTale(chapters, milestones, selectedTaleType);
            setGeneratedTale(tale);
        } catch (error: any) {
            dispatch({ type: 'ADD_TOAST', payload: { message: error.message, type: ToastType.Error } });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleShare = (method: 'email' | 'text') => {
        if (!generatedTale) return;
        const body = encodeURIComponent(generatedTale);
        
        let url = '';
        if (method === 'email') {
            const subject = encodeURIComponent("A story from BabyTalesAI for you!");
            // Use Gmail compose URL for better reliability on web
            url = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
        } else { // 'text'
            // sms: protocol has limited support on desktop but is standard for mobile
            url = `sms:?&body=${body}`; 
        }
        
        window.open(url, '_blank');
    };


    const renderSelectionView = () => (
        <>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose a format to share with family & friends:</p>
                {taleOptions.map(option => (
                    <div
                        key={option.id}
                        onClick={() => setSelectedTaleType(option.id as TaleType)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedTaleType === option.id ? 'bg-green-50 border-green-500 dark:bg-green-900/40 dark:border-green-500' : 'bg-gray-50 border-transparent hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
                    >
                        <div className="flex items-start">
                             <div className="flex items-center h-5">
                                <input
                                    id={option.id}
                                    name="tale-type"
                                    type="radio"
                                    checked={selectedTaleType === option.id}
                                    onChange={() => setSelectedTaleType(option.id as TaleType)}
                                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={option.id} className="font-bold text-gray-800 dark:text-gray-200">{option.title}</label>
                                <p className="text-gray-500 dark:text-gray-400">{option.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex-shrink-0">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {isGenerating ? 'Generating...' : 'Generate Tale'}
                </button>
            </div>
        </>
    );
    
    const renderResultView = () => (
        <>
            <div className="flex-grow flex flex-col min-h-0">
                <textarea
                    readOnly
                    value={generatedTale || ''}
                    className="w-full flex-grow bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                    aria-label="Generated Tale"
                />
            </div>
            <div className="mt-4 flex-shrink-0 grid grid-cols-2 gap-4">
                 <button
                    onClick={() => handleShare('email')}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                </button>
                <button
                    onClick={() => handleShare('text')}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    Text
                </button>
            </div>
        </>
    );

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex items-center mb-6 flex-shrink-0">
                <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 dark:hover:text-white mr-4 p-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Short Tale</h2>
            </div>
            
            {generatedTale ? renderResultView() : renderSelectionView()}
        </div>
    );
};

export default ShareTaleView;
