import React from 'react';
import { Vocabulary, Question } from '@/store/vocabularyStore';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';

interface QuestionCardProps {
  question: Question;
  vocabulary?: Vocabulary;
  selectedAnswer: string | null;
  showResult: boolean;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
}

export default function QuestionCard({
  question,
  vocabulary,
  selectedAnswer,
  showResult,
  onSelectAnswer,
  disabled = false,
}: QuestionCardProps) {
  const getOptions = () => {
    // Handle both multiple_choice and cloze types when options exist
    if (question.options && question.options.length > 0) {
      return question.options;
    }
    // Fallback: try parsing correct_answer as JSON for legacy multiple_choice
    if (question.question_type === 'multiple_choice') {
      try {
        return JSON.parse(question.correct_answer);
      } catch {
        return [];
      }
    }
    return [];
  };

  const getCorrectAnswer = () => {
    // Use correct_answer directly if it's a single letter (A, B, C, D)
    if (question.correct_answer && /^[A-D]$/i.test(question.correct_answer)) {
      return question.correct_answer.toUpperCase();
    }
    // Fallback: try to extract from explanation
    if (question.explanation) {
      const match = question.explanation.match(/正确答案是[：:]\s*([A-D])/i);
      if (match?.[1]) return match[1].toUpperCase();
    }
    return question.correct_answer || '';
  };

  const options = getOptions();
  const correctAnswer = getCorrectAnswer();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      {vocabulary && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {vocabulary.word}
          </h2>
          {vocabulary.phonetic && (
            <p className="text-gray-500 text-lg">
              /{vocabulary.phonetic}/
            </p>
          )}
        </div>
      )}

      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
        {question.question_text}
      </h3>

      {(question.options && question.options.length > 0) && (
        <MultipleChoiceQuestion
          options={options}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showResult={showResult}
          onSelect={onSelectAnswer}
          disabled={disabled}
        />
      )}

      {showResult && question.explanation && (
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2">解析</h4>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
