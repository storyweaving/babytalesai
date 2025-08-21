
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

const ChapterList: React.FC = () => {
    const { state, dispatch, addChapter, updateChapterName } = useAppContext();
    const { chapters, activeChapterId } = state;
    const [expandedChapter, setExpandedChapter] = useState<string | null>(activeChapterId);
    const debounceTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setExpandedChapter(activeChapterId);
    }, [activeChapterId]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handleNameChange = (id: string, newName: string) => {
        // Update local state immediately for responsiveness.
        dispatch({ type: 'UPDATE_CHAPTER_NAME_SUCCESS', payload: { id, name: newName } });
    
        // Clear previous timeout to avoid multiple saves.
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    
        // Set a new timeout to save to the DB and trigger the onboarding step change.
        debounceTimeoutRef.current = window.setTimeout(() => {
            updateChapterName(id, newName);
        }, 800); // Debounce for 800ms
    };


    const handleSelectChapter = (id: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: id });
    };

    const handleAddChapter = () => {
        addChapter();
    };

    const handleClose = () => {
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
    }

    const toggleExpand = (id: string) => {
        setExpandedChapter(expandedChapter === id ? null : id);
    };
    
    const getPlainText = (html: string) => {
        if (!html) return '';
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chapters</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleAddChapter} className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 p-1">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                        </svg>
                    </button>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6 space-y-3">
                {chapters.map((chapter, index) => {
                    const plainTextPreview = getPlainText(chapter.content);
                    return (
                        <div
                            key={chapter.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${chapter.id === activeChapterId ? 'bg-green-50 border-green-200 dark:bg-green-900/40 dark:border-green-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'}`}
                        >
                            <div className="flex items-center justify-between" onClick={() => handleSelectChapter(chapter.id)}>
                                <div className="flex items-center space-x-3 flex-grow min-w-0">
                                    {chapter.id === activeChapterId && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
                                    <div className="flex items-baseline font-semibold text-gray-800 dark:text-gray-200 min-w-0">
                                        <span className="mr-2 whitespace-nowrap">Chapter {index + 1}</span>
                                        {chapter.id === activeChapterId ? (
                                            <input
                                                type="text"
                                                value={chapter.name}
                                                onChange={(e) => handleNameChange(chapter.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="Add title..."
                                                className="w-full p-1 bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-500 rounded-md text-sm font-normal focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                aria-label="Chapter title"
                                            />
                                        ) : (
                                            <span className="font-normal truncate">{chapter.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{chapter.word_count} words</span>
                                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(chapter.id); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${expandedChapter === chapter.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {expandedChapter === chapter.id && (
                                 <p className="mt-2 pl-5 text-sm text-gray-600 dark:text-gray-400 break-words line-clamp-3">
                                    {plainTextPreview.trim() ? plainTextPreview : <span className="italic">No content yet...</span>}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChapterList;
