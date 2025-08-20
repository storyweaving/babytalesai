import React from 'react';
import { useAppContext } from '../../context/AppContext';

const ChapterTabs: React.FC = () => {
  const { state, dispatch, addChapter } = useAppContext();
  const { chapters, activeChapterId } = state;

  const handleSelectChapter = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: id });
  };

  const handleAddChapter = () => {
    addChapter();
  };

  return (
    <div className="flex-shrink-0 mb-4 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">Chapters:</span>
        <div className="flex items-center space-x-2">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => handleSelectChapter(chapter.id)}
              className={`flex items-center justify-center w-8 h-8 font-medium text-sm rounded-md transition-colors duration-200 ${
                chapter.id === activeChapterId
                  ? 'bg-green-500 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
              aria-current={chapter.id === activeChapterId ? 'page' : undefined}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={handleAddChapter}
            className="flex items-center justify-center w-8 h-8 rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500 dark:border-gray-600 dark:hover:border-green-400 dark:text-gray-500 dark:hover:text-green-400 transition-colors duration-200"
            aria-label="Add new chapter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterTabs;