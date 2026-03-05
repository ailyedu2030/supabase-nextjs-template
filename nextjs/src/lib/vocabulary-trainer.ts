/**
 * Vocabulary Trainer - Core Learning Flow
 * Combines FSRS, AI questions, and gamification
 */

import { createSPAClient } from "@/lib/supabase/client";
import { fsrs, FSRSCard, Rating, CardState } from "./fsrs";
import { gamificationService } from "./gamification";
import { DatabaseWord, UserGamification, VocabStats } from "@/store/vocabularyStore";

// Trainer state
export interface TrainerState {
  currentWord: DatabaseWord | null;
  currentQuestion: any;
  currentStep: "placement" | "training" | "review";
  placementProgress: number;
  placementResults: any;
  isLoading: boolean;
  streak: number;
  xp: number;
  level: number;
}

// Vocabulary Trainer Service
export class VocabularyTrainer {
  private supabase;

  constructor() {
    this.supabase = createSPAClient();
  }

  /**
   * Initialize trainer for a user
   */
  async initialize(userId: string) {
    // Initialize gamification
    const userGamification = await gamificationService.initializeUser(userId);

    // Check if user has taken placement test
    const { data: placementTests } = await (this.supabase as any)
      .from("placement_test_results")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1);

    const hasTakenPlacement = placementTests && placementTests.length > 0;

    return {
      hasTakenPlacement,
      userGamification,
    };
  }

  /**
   * Start adaptive placement test
   */
  async startPlacementTest(userId: string) {
    // Get 30 random CET-4 words covering different difficulty levels
    const { data: words } = await (this.supabase as any)
      .from("vocabulary_words")
      .select("*")
      .order("frequency", { ascending: true })
      .limit(30);

    if (!words || words.length === 0) {
      throw new Error("No vocabulary words available");
    }

    // Shuffle and select first 20
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const testWords = shuffled.slice(0, 20);

    return {
      testWords,
      currentIndex: 0,
    };
  }

  /**
   * Process placement test answer
   */
  async processPlacementAnswer(
    userId: string,
    answers: { wordId: string; isCorrect: boolean; responseTime: number }[],
    testDurationSeconds: number
  ) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = answers.length;
    const accuracy = (correctCount / totalQuestions) * 100;

    // Estimate CEFR level and vocabulary size
    let cefrLevel = "A1";
    let estimatedVocabulary = 1000;
    let cet4Readiness = 20;

    if (accuracy >= 85) {
      cefrLevel = "B2";
      estimatedVocabulary = 4000;
      cet4Readiness = 90;
    } else if (accuracy >= 70) {
      cefrLevel = "B1";
      estimatedVocabulary = 3000;
      cet4Readiness = 70;
    } else if (accuracy >= 50) {
      cefrLevel = "A2";
      estimatedVocabulary = 2000;
      cet4Readiness = 40;
    }

    // Save placement test results
    const { data: savedResult } = await (this.supabase as any)
      .from("placement_test_results")
      .insert({
        user_id: userId,
        cefr_level: cefrLevel,
        estimated_vocabulary_size: estimatedVocabulary,
        cet4_readiness_score: cet4Readiness,
        questions_answered: totalQuestions,
        correct_answers: correctCount,
        test_duration_seconds: testDurationSeconds,
      })
      .select()
      .single();

    // Initialize user's vocabulary progress based on test
    await this.initializeVocabularyProgress(userId, answers, cefrLevel);

    return {
      cefrLevel,
      estimatedVocabulary,
      cet4Readiness,
      accuracy,
      savedResult,
    };
  }

  /**
   * Initialize user's vocabulary progress based on placement test
   */
  private async initializeVocabularyProgress(
    userId: string,
    answers: { wordId: string; isCorrect: boolean }[],
    cefrLevel: string
  ) {
    // Get all CET-4 words
    const { data: allWords } = await (this.supabase as any)
      .from("vocabulary_words")
      .select("id, difficulty, frequency");

    if (!allWords) return;

    // Create progress entries for words in test
    for (const answer of answers) {
      const word = (allWords as DatabaseWord[]).find((w: DatabaseWord) => w.id === answer.wordId);
      if (!word) continue;

      const initialCard = fsrs.createCard(word.difficulty_level || 5);
      const rating = answer.isCorrect ? Rating.Good : Rating.Again;

      const { card } = fsrs.reviewCard(initialCard, rating);

      await (this.supabase as any).from("user_vocabulary_progress").insert({
        user_id: userId,
        vocabulary_id: answer.wordId,
        state: card.state,
        difficulty: card.difficulty,
        stability: card.stability,
        retrievability: card.retrievability,
        next_due: card.nextReview,
        last_review: card.lastReview,
        review_count: card.reviewCount,
        lapse_count: card.lapseCount,
        correct_count: answer.isCorrect ? 1 : 0,
        wrong_count: answer.isCorrect ? 0 : 1,
      });
    }
  }

  /**
   * Get today's training session
   */
  async getTrainingSession(userId: string, sessionSize: number = 15) {
    // Get due cards for review
    const now = new Date();
    const { data: dueProgress } = await (this.supabase as any)
      .from("user_vocabulary_progress")
      .select(`
        *,
        vocabulary (*)
      `)
      .eq("user_id", userId)
      .lte("next_due", now.toISOString())
      .order("next_due", { ascending: true })
      .limit(sessionSize);

    // Get new words if we don't have enough due cards
    let trainingWords = dueProgress || [];
    if (trainingWords.length < sessionSize) {
      const newWordsNeeded = sessionSize - trainingWords.length;

      // Get words user hasn't started yet
      const { data: existingWordIds } = await (this.supabase as any)
        .from("user_vocabulary_progress")
        .select("vocabulary_id")
        .eq("user_id", userId);

      const existingIds = new Set((existingWordIds as any[])?.map((w: any) => w.vocabulary_id) || []);

      const { data: newWords } = await (this.supabase as any)
        .from("vocabulary_words")
        .select("*")
        .not("id", "in", `(${Array.from(existingIds).join(",")})`)
        .order("frequency", { ascending: true })
        .limit(newWordsNeeded);

      if (newWords) {
        trainingWords = [...trainingWords, ...(newWords as DatabaseWord[]).map((word: DatabaseWord) => ({ vocabulary_words: word }))];
      }
    }

    // Shuffle training words
    trainingWords = [...trainingWords].sort(() => Math.random() - 0.5).slice(0, sessionSize);

    return trainingWords;
  }

  /**
   * Process a single word review
   */
  async processReview(
    userId: string,
    wordId: string,
    rating: Rating,
    responseTime?: number
  ) {
    // Get or create user's progress for this word
    let { data: progress } = await (this.supabase as any)
      .from("user_vocabulary_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("vocabulary_id", wordId)
      .single();

    let card: FSRSCard;
    if (!progress) {
      // New word
      const { data: word } = await (this.supabase as any)
        .from("vocabulary_words")
        .select("difficulty_level")
        .eq("id", wordId)
        .single();

      card = fsrs.createCard((word as any)?.difficulty_level || 5);
    } else {
      // Existing progress
      card = {
        state: (progress as any).state as CardState,
        difficulty: (progress as any).difficulty,
        stability: (progress as any).stability,
        retrievability: (progress as any).retrievability,
        lastReview: (progress as any).last_review ? new Date((progress as any).last_review) : undefined,
        nextReview: (progress as any).next_due ? new Date((progress as any).next_due) : undefined,
        reviewCount: (progress as any).review_count,
        lapseCount: (progress as any).lapse_count,
      };
    }

    // Process review with FSRS
    const now = new Date();
    const { card: updatedCard, reviewLog } = fsrs.reviewCard(card, rating, now);

    // Update or insert progress
    const upsertData = {
      user_id: userId,
      vocabulary_id: wordId,
      state: updatedCard.state,
      difficulty: updatedCard.difficulty,
      stability: updatedCard.stability,
      retrievability: updatedCard.retrievability,
      next_due: updatedCard.nextReview?.toISOString(),
      last_review: updatedCard.lastReview?.toISOString(),
      review_count: updatedCard.reviewCount,
      lapse_count: updatedCard.lapseCount,
      correct_count: rating >= Rating.Good ? ((progress as any)?.correct_count || 0) + 1 : (progress as any)?.correct_count || 0,
      wrong_count: rating < Rating.Good ? ((progress as any)?.wrong_count || 0) + 1 : (progress as any)?.wrong_count || 0,
      avg_response_time: responseTime
        ? (((progress as any)?.avg_response_time || 0) * (updatedCard.reviewCount - 1) + responseTime) / updatedCard.reviewCount
        : (progress as any)?.avg_response_time,
    };

    if (progress) {
      await (this.supabase as any)
        .from("user_vocabulary_progress")
        .update(upsertData)
        .eq("id", (progress as any).id);
    } else {
      await (this.supabase as any).from("user_vocabulary_progress").insert(upsertData);
    }

    // Save review log
    await (this.supabase as any).from("review_logs").insert({
      user_id: userId,
      vocabulary_id: wordId,
      rating: rating,
      response_time: responseTime,
      review_datetime: now.toISOString(),
      scheduled_interval: reviewLog.scheduledInterval,
      actual_interval: reviewLog.actualInterval,
      stability_before: reviewLog.stabilityBefore,
      stability_after: reviewLog.stabilityAfter,
      difficulty_before: reviewLog.difficultyBefore,
      difficulty_after: reviewLog.difficultyAfter,
    });

    // Update gamification if correct
    let gamificationResult = null;
    if (rating >= Rating.Good) {
      gamificationResult = await gamificationService.recordCorrectAnswer(userId, responseTime);
    }

    return {
      updatedCard,
      reviewLog,
      gamificationResult,
    };
  }

  /**
   * Get user's vocabulary mastery statistics
   */
  async getUserVocabularyStats(userId: string): Promise<VocabStats> {
    const { data: progress } = await (this.supabase as any)
      .from("user_vocabulary_progress")
      .select("*")
      .eq("user_id", userId);

    if (!progress) {
      return {
        totalWords: 0,
        learnedWords: 0,
        reviewWords: 0,
        newWords: 0,
        masteryScore: 0,
      };
    }

    const totalWords = (progress as any[]).length;
    const learnedWords = (progress as any[]).filter((p: any) => p.state === "review" && p.stability > 7).length;
    const reviewWords = (progress as any[]).filter((p: any) => p.state === "review" || p.state === "relearning").length;
    const newWords = (progress as any[]).filter((p: any) => p.state === "new").length;

    // Calculate mastery level (0-100)
    const masteryScore =
      totalWords > 0
        ? Math.round(((learnedWords + reviewWords * 0.5) / (totalWords || 1)) * 100)
        : 0;

    return {
      totalWords,
      learnedWords,
      reviewWords,
      newWords,
      masteryScore,
      detailedProgress: progress,
    };
  }
}

// Export singleton
export const vocabularyTrainer = new VocabularyTrainer();
