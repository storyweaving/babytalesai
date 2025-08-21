
import React from 'react';

interface WordCounterProps {
  currentCount: number;
  triggerCount: number;
  isTriggered: boolean;
  showText?: boolean;
}

const WordCounter: React.FC<WordCounterProps> = ({ currentCount, triggerCount, isTriggered, showText = true }) => {
  const progress = Math.min((currentCount / triggerCount) * 100, 100);

  const getProgressColor = () => {
    if (isTriggered || currentCount >= triggerCount) {
      return 'bg-red-500';
    }
    if (currentCount >= triggerCount - 2) { // Words 22 and 23
      return 'bg-yellow-400';
    }
    return 'bg-green-500'; // Words 0-21
  };

  const colorClass = getProgressColor();

  return (
    <div className={showText ? "space-y-2" : ""}>
      {showText && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Word Count: <span className="font-bold text-green-800 dark:text-green-300">{currentCount}</span> / {triggerCount}
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-800 rounded-full">
              saved
            </span>
          </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-[8px]">
        <div
          className={`h-[8px] rounded-full transition-all duration-300 ease-out ${colorClass}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default WordCounter;
