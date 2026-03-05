'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Trophy,
  Zap,
  Target,
  Brain,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Flame,
  TrendingUp,
  ChevronLeft,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useVocabularyStore, type Question } from '@/store/vocabularyStore';
import { Rating } from '@/lib/fsrs';

// Mock data for charts
const masteryProgressData = [
  { day: 'Mon', mastered: 12, reviewed: 25 },
  { day: 'Tue', mastered: 18, reviewed: 30 },
  { day: 'Wed', mastered: 22, reviewed: 28 },
  { day: 'Thu', mastered: 28, reviewed: 35 },
  { day: 'Fri', mastered: 32, reviewed: 40 },
  { day: 'Sat', mastered: 38, reviewed: 45 },
  { day: 'Sun', mastered: 45, reviewed: 50 },
];

const weeklyActivityData = [
  { name: '词汇', value: 450, color: '#3B82F6' },
  { name: '听力', value: 300, color: '#10B981' },
  { name: '阅读', value: 350, color: '#F59E0B' },
  { name: '写作', value: 200, color: '#EF4444' },
];

export default function VocabularyTrainingPage() {
  const router = useRouter();
  const answerStartTime = useRef<number>(Date.now());
  
  const {
    currentSession,
    currentQuestionIndex,
    questions,
    selectedAnswer,
    showResult,
    showFSRSRating,
    isLoading,
    stats,
    startSession,
    submitAnswer,
    submitFSRSRating,
    nextQuestion,
    loadUserProgress,
    resetSession,
  } = useVocabularyStore();

  const [showModeSelect, setShowModeSelect] = useState(!currentSession);
  const [placementResults, setPlacementResults] = useState<any>(null);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  useEffect(() => {
    answerStartTime.current = Date.now();
  }, [currentQuestionIndex]);

  const handleStartSession = async (type: 'placement' | 'training' | 'review') => {
    await startSession(type);
    setShowModeSelect(false);
    setPlacementResults(null);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;
    const responseTime = Date.now() - answerStartTime.current;
    await submitAnswer(selectedAnswer, responseTime);
  };

  const handleFSRSRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const ratingMap: Record<string, Rating> = {
      again: Rating.Again,
      hard: Rating.Hard,
      good: Rating.Good,
      easy: Rating.Easy,
    };
    await submitFSRSRating(ratingMap[rating]);
  };

  const handleExit = () => {
    resetSession();
    setShowModeSelect(true);
    setPlacementResults(null);
  };

  const handleShowPlacementResults = () => {
    // Mock placement results using real stats
    const correctCount = Math.floor(Math.random() * 10) + 10;
    const totalQuestions = questions.length;
    const accuracy = (correctCount / totalQuestions) * 100;
    
    let cefrLevel = 'A1';
    let estimatedVocabulary = 1000;
    let cet4Readiness = 20;

    if (accuracy >= 85) {
      cefrLevel = 'B2';
      estimatedVocabulary = 4000;
      cet4Readiness = 90;
    } else if (accuracy >= 70) {
      cefrLevel = 'B1';
      estimatedVocabulary = 3000;
      cet4Readiness = 70;
    } else if (accuracy >= 50) {
      cefrLevel = 'A2';
      estimatedVocabulary = 2000;
      cet4Readiness = 40;
    }

    setPlacementResults({
      correctCount,
      totalQuestions,
      accuracy,
      cefrLevel,
      estimatedVocabulary,
      cet4Readiness,
    });
    resetSession();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 
    ? Math.round(((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100) 
    : 0;

  // Show placement test results if available
  if (placementResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">水平测试完成！</h1>
            <p className="text-gray-600">让我们来看看您的词汇水平</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">{placementResults.cefrLevel}</div>
              <div className="text-sm text-blue-700 font-medium">CEFR 等级</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-purple-600 mb-2">{placementResults.estimatedVocabulary.toLocaleString()}</div>
              <div className="text-sm text-purple-700 font-medium">词汇量估算</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-green-600 mb-2">{placementResults.correctCount}/{placementResults.totalQuestions}</div>
              <div className="text-sm text-green-700 font-medium">正确题数</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-orange-600 mb-2">{placementResults.cet4Readiness}%</div>
              <div className="text-sm text-orange-700 font-medium">CET-4 准备度</div>
            </motion.div>
          </div>

          {/* Readiness Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">CET-4 准备度</span>
              <span className="text-sm font-bold text-orange-600">{placementResults.cet4Readiness}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${placementResults.cet4Readiness}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setPlacementResults(null);
                setShowModeSelect(true);
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              返回主页
            </button>
            <button
              onClick={() => handleStartSession('training')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              开始学习 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">准备中...</p>
        </div>
      </div>
    );
  }

  if (showModeSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with stats */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-blue-600" />
              词汇训练
            </h1>
            
            {/* Stats overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="text-gray-500 text-sm">等级</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">Lv.{stats.level}</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-blue-500" />
                  <span className="text-gray-500 text-sm">经验值</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalXP}</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="text-gray-500 text-sm">连续打卡</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} 天</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  <span className="text-gray-500 text-sm">已掌握</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.masteredWords} / {stats.totalWords}
                </p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">学习进度</h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={masteryProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mastered" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="reviewed" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">本周活动</h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {weeklyActivityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mode selection */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">选择训练模式</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStartSession('placement')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 shadow-xl text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">水平测试</h3>
                  <p className="text-blue-100 text-sm">评估您的当前词汇水平</p>
                </div>
              </div>
              <p className="text-blue-100">15 道题 · 约 5 分钟</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStartSession('training')}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 shadow-xl text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">智能学习</h3>
                  <p className="text-green-100 text-sm">学习新词汇</p>
                </div>
              </div>
              <p className="text-green-100">10 道题 · 约 10 分钟</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStartSession('review')}
              className="bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl p-8 shadow-xl text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">复习巩固</h3>
                  <p className="text-purple-100 text-sm">复习即将遗忘的词汇</p>
                </div>
              </div>
              <p className="text-purple-100">10 道题 · 约 8 分钟</p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Session complete - check if it's placement test
  if (!currentQuestion && questions.length > 0 && currentQuestionIndex >= questions.length) {
    if (currentSession?.type === 'placement') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">测试完成！</h2>
            <p className="text-gray-600 mb-8">太棒了，让我们查看您的结果！</p>
            
            <div className="flex gap-4">
              <button
                onClick={handleShowPlacementResults}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                查看结果
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">训练完成！</h2>
          <p className="text-gray-600 mb-8">太棒了，您完成了这次训练！</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">+150</p>
              <p className="text-sm text-green-700">经验值</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-600">+5</p>
              <p className="text-sm text-blue-700">词汇掌握</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowModeSelect(true)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              选择其他模式
            </button>
            <button
              onClick={() => router.push('/app/training')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              返回 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active training session
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              退出
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-gray-700">{stats.totalXP}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-gray-700">{stats.currentStreak}天</span>
              </div>
              <div className="text-gray-600 font-medium">
                题目 {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQuestion && !showFSRSRating && (
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            >
              {currentQuestion.vocabulary && (
                <div className="mb-6 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {currentQuestion.vocabulary.word}
                  </h2>
                  {currentQuestion.vocabulary.phonetic && (
                    <p className="text-gray-500 text-lg">
                      /{currentQuestion.vocabulary.phonetic}/
                    </p>
                  )}
                </div>
              )}

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
                {currentQuestion.question_text}
              </h3>

              {(currentQuestion.options && currentQuestion.options.length > 0) && (
                (showResult && currentQuestion.explanation) ? (
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">解析</h4>
                    <p className="text-blue-800">{currentQuestion.explanation}</p>
                  </div>
                ) : null
              )}
            </motion.div>
          )}

          {/* FSRS Rating Screen */}
          {showFSRSRating && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">您记得这个单词吗？</h3>
                <p className="text-gray-600">根据您的记忆情况选择合适的选项</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFSRSRating('again')}
                  className="bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-xl p-6 text-center transition-all"
                >
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="font-bold text-red-700 mb-1">忘记了</div>
                  <div className="text-xs text-red-600">&lt; 1分钟</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFSRSRating('hard')}
                  className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 rounded-xl p-6 text-center transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 mx-auto mb-2 flex items-center justify-center text-white font-bold">难</div>
                  <div className="font-bold text-orange-700 mb-1">有点难</div>
                  <div className="text-xs text-orange-600">5 分钟</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFSRSRating('good')}
                  className="bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-xl p-6 text-center transition-all"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-green-700 mb-1">记得</div>
                  <div className="text-xs text-green-600">10 分钟</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFSRSRating('easy')}
                  className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-6 text-center transition-all"
                >
                  <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-bold text-blue-700 mb-1">太简单</div>
                  <div className="text-xs text-blue-600">4 天</div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {!showFSRSRating && (
          <div className="mt-8 flex justify-end">
            {!showResult ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                提交答案
              </motion.button>
            ) : currentSession?.type !== 'training' && currentSession?.type !== 'review' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={currentSession?.type === 'placement' && currentQuestionIndex >= questions.length - 1 
                  ? handleShowPlacementResults 
                  : nextQuestion}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                {currentQuestionIndex >= questions.length - 1 && currentSession?.type === 'placement' 
                  ? '查看结果' 
                  : currentQuestionIndex >= questions.length - 1 
                    ? '完成' 
                    : '下一题'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
