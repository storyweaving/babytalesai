import React, { forwardRef, useState, useEffect, useLayoutEffect } from 'react';

interface WritingAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  onSelectionChange: (range: Range) => void;
  isLocked: boolean;
  highlightInfo?: { highlightText: string; textBefore: string } | null;
  onHighlightComplete: () => void;
}

const ImageToolbar: React.FC<{ top: number; left: number; onRotate: () => void; onDelete: () => void; }> = ({ top, left, onRotate, onDelete }) => (
    <div
        className="absolute z-10 flex space-x-1 bg-gray-900/80 backdrop-blur-sm text-white p-1 rounded-md shadow-lg"
        style={{ top: `${top - 32}px`, left: `${left}px` }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()}
    >
        <button
            onClick={onRotate}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Rotate Image"
            aria-label="Rotate Image"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0113.59-6.32l2.41 2.41M20 15a9 9 0 01-13.59 6.32l-2.41-2.41" />
            </svg>
        </button>
        <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-red-400 hover:text-red-300"
            title="Delete Image"
            aria-label="Delete Image"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    </div>
);


const WritingArea = forwardRef<HTMLDivElement, WritingAreaProps>(({ content, onContentChange, onSelectionChange, isLocked, highlightInfo, onHighlightComplete }, ref) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ element: HTMLElement; top: number; left: number } | null>(null);
  const editorRef = ref as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    if (highlightInfo && onHighlightComplete) {
      const { highlightText } = highlightInfo;

      const CHAR_ANIMATION_DURATION = 400; // ms, from CSS (0.4s)
      const STAGGER_DELAY = 20; // ms, from inline style
      const HOLD_DURATION = 1000; // ms, to hold the final state after the wave completes
      const waveCompletionTime = ((highlightText.length - 1) * STAGGER_DELAY) + CHAR_ANIMATION_DURATION;
      const totalTimeout = waveCompletionTime + HOLD_DURATION;

      const startAnimationTimer = setTimeout(() => setIsAnimating(true), 10);
      const completionTimer = setTimeout(() => onHighlightComplete(), totalTimeout);

      return () => {
        clearTimeout(startAnimationTimer);
        clearTimeout(completionTimer);
        setIsAnimating(false);
      };
    }
  }, [highlightInfo, onHighlightComplete]);
  
  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (editor && content !== editor.innerHTML) {
      editor.innerHTML = content;
    }
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setSelectedImage(null); // Hide toolbar on input
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
  };
  
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0).cloneRange();
        const editor = editorRef.current;
        if (editor && editor.contains(range.commonAncestorContainer)) {
            onSelectionChange(range);
        }
    }
  };
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const imageContainer = target.closest('.story-image-container');
    const editor = editorRef.current;

    if (imageContainer instanceof HTMLElement && editor) {
        e.preventDefault();
        const rect = imageContainer.getBoundingClientRect();
        const editorRect = editor.getBoundingClientRect();
        
        setSelectedImage({
            element: imageContainer,
            top: rect.top - editorRect.top + editor.scrollTop,
            left: rect.left - editorRect.left + editor.scrollLeft,
        });
    } else if (!target.closest('[class*="bg-gray-900"]')) { // Don't hide if clicking toolbar
        setSelectedImage(null);
    }
  };
  
  const handleRotate = () => {
    if (!selectedImage || !editorRef.current) return;
    const img = selectedImage.element.querySelector('img');
    if (!img) return;
    
    const currentTransform = img.style.transform;
    let currentRotation = 0;
    if (currentTransform && currentTransform.includes('rotate')) {
        const match = currentTransform.match(/rotate\((\d+)deg\)/);
        if (match && match[1]) {
            currentRotation = parseInt(match[1], 10);
        }
    }
    const newRotation = (currentRotation + 90) % 360;
    img.style.transform = `rotate(${newRotation}deg)`;
    onContentChange(editorRef.current.innerHTML);
  };

  const handleDelete = () => {
      if (!selectedImage || !editorRef.current) return;
      selectedImage.element.remove();
      onContentChange(editorRef.current.innerHTML);
      setSelectedImage(null);
  };

  const renderHighlightedContent = () => {
    if (!highlightInfo) return null;

    const { highlightText, textBefore } = highlightInfo;

    return (
      <div 
        className="absolute inset-0 w-full h-full px-4 pt-4 pb-16 text-lg leading-relaxed bg-transparent border-none focus:ring-0 focus:outline-none dark:text-gray-200 text-gray-800 whitespace-pre-wrap"
        aria-hidden="true"
      >
        <span dangerouslySetInnerHTML={{ __html: textBefore }} />
        {textBefore ? ' ' : ''}
        <span className="relative inline-block">
          {highlightText.split('').map((char, index) => (
            <span
              key={index}
              className={`highlight-char ${isAnimating ? 'active' : ''}`}
              style={{ transitionDelay: `${index * 20}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </div>
    );
  };
  
  const highlightedContent = renderHighlightedContent();

  return (
    <div className="relative flex-grow w-full">
      {highlightedContent}
      {selectedImage && (
          <ImageToolbar
              top={selectedImage.top}
              left={selectedImage.left}
              onRotate={handleRotate}
              onDelete={handleDelete}
          />
      )}
      <div
        ref={ref}
        onInput={handleInput}
        onClick={handleClick}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={saveSelection}
        contentEditable={!(isLocked || !!highlightInfo)}
        suppressContentEditableWarning={true}
        data-placeholder="Start writing your story here..."
        className={`editor-area w-full px-4 pt-4 pb-16 text-lg leading-relaxed bg-transparent border-none rounded-md focus:ring-0 focus:outline-none transition-colors duration-200 whitespace-pre-wrap ${
            isLocked ? 'text-gray-400 dark:text-gray-300' : 'text-gray-800 dark:text-gray-200'
          } ${highlightInfo ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
});

export default WritingArea;
