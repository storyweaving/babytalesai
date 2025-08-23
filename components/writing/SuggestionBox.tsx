import React from 'react';

interface SuggestionBoxProps {
  suggestions: string[];
  isLoading: boolean;
  isSuggesting: boolean;
  onSelect: (suggestion: string) => void;
  isMobileKeyboardActive?: boolean;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ suggestions, isLoading, isSuggesting, onSelect, isMobileKeyboardActive }) => {
  const renderBoxContent = (index: number) => {
    if (isLoading) {
      return (
        <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-600 rounded-md"></div>
      );
    }
    if (isSuggesting && suggestions[index]) {
      return (
        <button onClick={() => onSelect(suggestions[index])} className="text-left w-full h-full text-gray-700 hover:text-green-700 dark:text-gray-300 dark:hover:text-green-300">
          {suggestions[index]}
        </button>
      );
    }
    return <span className="text-gray-400 dark:text-gray-500">Waiting for suggestions...</span>;
  };

  return (
    <div
      className={!isMobileKeyboardActive ? "mt-2" : undefined}
      style={isMobileKeyboardActive ? { marginTop: '3px' } : undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map(index => (
          <div
            key={index}
            className={`flex items-center p-2 rounded-lg border h-12 transition-all duration-300 ${
              isSuggesting ? 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700 shadow-lg' : 'bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
            }`}
          >
            <span className={`text-lg font-bold mr-3 ${isSuggesting ? 'text-green-600 dark:text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>#{index + 1}</span>
            <div className="flex-grow text-sm">{renderBoxContent(index)}</div>
          </div>
        ))}
      </div>

      {isSuggesting && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 h-6 flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 dark:border-green-400"></div>
                <span className="font-semibold text-green-700 dark:text-green-300">Generating suggestions...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <span className="hidden md:block">Press <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">1</kbd> or <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">2</kbd> to select, or <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">ESC</kbd> to skip.</span>
            ) : null}
        </div>
      )}
    </div>
  );
};

export default SuggestionBox;
