import React, { useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  showResult: boolean;
  onSelect: (answer: string) => void;
  disabled?: boolean;
}

export default function MultipleChoiceQuestion({
  options,
  selectedAnswer,
  correctAnswer,
  showResult,
  onSelect,
  disabled = false,
}: MultipleChoiceQuestionProps) {
  const isCorrect = useCallback(
    (option: string) => {
      // Extract letter prefix from option (e.g., "A. annual" -> "A")
      const optionLetter = option.charAt(0).toUpperCase();
      const correctLetter = correctAnswer.charAt(0).toUpperCase();
      return optionLetter === correctLetter;
    },
    [correctAnswer]
  );

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        const isOptionCorrect = isCorrect(option);
        const isOptionWrong = showResult && isSelected && !isOptionCorrect;

        let buttonClass =
          'w-full p-4 text-left rounded-lg border-2 transition-all duration-200 flex items-center justify-between';
        
        if (showResult) {
          if (isOptionCorrect) {
            buttonClass += ' border-green-500 bg-green-50';
          } else if (isOptionWrong) {
            buttonClass += ' border-red-500 bg-red-50';
          } else {
            buttonClass += ' border-gray-200 opacity-60';
          }
        } else {
          if (isSelected) {
            buttonClass += ' border-blue-500 bg-blue-50';
          } else {
            buttonClass += ' border-gray-200 hover:border-blue-300 hover:bg-gray-50';
          }
        }

        return (
          <button
            key={index}
            onClick={() => !showResult && !disabled && onSelect(option)}
            disabled={showResult || disabled}
            className={buttonClass}
          >
            <span className="text-gray-800 font-medium">{option}</span>
            {showResult && isOptionCorrect && (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
            {showResult && isOptionWrong && (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
