/**
 * Gamification System for CET-4 Vocabulary Learning
 * Evidence-based mechanics based on learning science research
 */

import { createSPAClient } from "@/lib/supabase/client";
import { UserGamification } from "@/store/vocabularyStore";

// XP Rewards
export const XP_REWARDS = {
  CORRECT_ANSWER: 10,
  FAST_ANSWER_BONUS: 5, // < 3 seconds
  WRONG_ANSWER: 2, // Even trying gives some XP
  COMPLETE_SESSION: 50,
  DAILY_STREAK_BONUS: 20,
  PERFECT_SCORE_BONUS: 50,
  LEVEL_UP: 200,
  ACHIEVEMENT: (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return 1000;
      case "epic":
        return 500;
      case "rare":
        return 200;
      default:
        return 100;
    }
  },
};

// Max level to prevent infinite loop
export const MAX_LEVEL = 100;
// Level XP requirements - 500 XP per level as per requirements
export const LEVEL_XP_REQUIREMENTS = (level: number): number => {
  return 500 * level;
};

// Gamification Service
export class GamificationService {
  private supabase;

  constructor() {
    this.supabase = createSPAClient();
  }

  /**
   * Initialize gamification state for a new user
   */
  async initializeUser(userId: string) {
    const { data: existing } = await (this.supabase as any)
      .from("user_gamification")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existing) return existing as UserGamification;

    const { data, error } = await (this.supabase as any)
      .from("user_gamification")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as UserGamification;
  }

  /**
   * Record a correct answer and update XP
   */
  async recordCorrectAnswer(userId: string, responseTime?: number, isPerfectScore?: boolean) {
    let xpEarned = XP_REWARDS.CORRECT_ANSWER;
    const bonuses: string[] = [];

    // Fast answer bonus (< 3 seconds)
    if (responseTime && responseTime < 3000) {
      xpEarned += XP_REWARDS.FAST_ANSWER_BONUS;
      bonuses.push('fast_answer');
    }

    // Update user gamification
    const { data: userGamification, error: userError } = await (this.supabase as any)
      .from("user_gamification")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (userError || !userGamification) {
      await this.initializeUser(userId);
      return { xpEarned, newLevel: 1, bonuses };
    }

    let newXP = (userGamification as UserGamification).xp || 0 + xpEarned;
    let newLevel = (userGamification as UserGamification).level || 1;
    let leveledUp = false;

    // Check for level up
    while (newLevel < MAX_LEVEL && newXP >= LEVEL_XP_REQUIREMENTS(newLevel + 1)) {
      newLevel++;
      newXP += XP_REWARDS.LEVEL_UP;
      leveledUp = true;
    }

    // Update daily session
    const today = new Date().toISOString().split("T")[0];
    const { data: dailySession } = await (this.supabase as any)
      .from("daily_learning_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("session_date", today)
      .single();

    let dailyStreakBonusApplied = false;
    if (dailySession) {
      // Check if this is the first correct answer today for streak bonus
      if ((dailySession as any).correct_answers === 0) {
        newXP += XP_REWARDS.DAILY_STREAK_BONUS;
        xpEarned += XP_REWARDS.DAILY_STREAK_BONUS;
        bonuses.push('daily_streak');
        dailyStreakBonusApplied = true;
      }

      await (this.supabase as any)
        .from("daily_learning_sessions")
        .update({
          correct_answers: (dailySession as any).correct_answers + 1,
          total_questions: (dailySession as any).total_questions + 1,
          xp_earned: (dailySession as any).xp_earned + xpEarned,
        })
        .eq("id", (dailySession as any).id);
    } else {
      // First answer today - include daily streak bonus
      newXP += XP_REWARDS.DAILY_STREAK_BONUS;
      xpEarned += XP_REWARDS.DAILY_STREAK_BONUS;
      bonuses.push('daily_streak');
      dailyStreakBonusApplied = true;

      await (this.supabase as any).from("daily_learning_sessions").insert({
        user_id: userId,
        session_date: today,
        correct_answers: 1,
        total_questions: 1,
        xp_earned: xpEarned,
      });
    }

    // Perfect score bonus
    if (isPerfectScore) {
      newXP += XP_REWARDS.PERFECT_SCORE_BONUS;
      xpEarned += XP_REWARDS.PERFECT_SCORE_BONUS;
      bonuses.push('perfect_score');
    }

    // Update streak
    const streakResult = await this.updateStreak(userId, userGamification as UserGamification);

    // Update user gamification
    const { data: updatedUser } = await (this.supabase as any)
      .from("user_gamification")
      .update({
        xp: newXP,
        level: newLevel,
        total_correct_answers: ((userGamification as UserGamification).total_correct_answers || 0) + 1,
        total_questions_answered: ((userGamification as UserGamification).total_questions_answered || 0) + 1,
        current_streak: streakResult.currentStreak,
        longest_streak: streakResult.longestStreak,
        last_streak_date: streakResult.lastStreakDate,
      })
      .eq("user_id", userId)
      .select()
      .single();

    // Check for achievements
    const newAchievements = await this.checkAchievements(userId, updatedUser as UserGamification);

    return {
      xpEarned,
      newXP,
      newLevel,
      leveledUp,
      streak: streakResult.currentStreak,
      newAchievements,
      bonuses,
    };
  }

  /**
   * Update daily streak
   */
  private async updateStreak(userId: string, currentState: UserGamification) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let currentStreak = currentState.current_streak || 0;
    let longestStreak = currentState.longest_streak || 0;
    let lastStreakDate = currentState.last_streak_date;

    if (lastStreakDate === today) {
      // Already logged today
      return { currentStreak, longestStreak, lastStreakDate };
    }

    if (lastStreakDate === yesterday || !lastStreakDate) {
      // Streak continues or starts
      currentStreak++;
    } else {
      // Streak broken
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    lastStreakDate = today;

    return { currentStreak, longestStreak, lastStreakDate };
  }

  /**
   * Check and unlock achievements
   */
  private async checkAchievements(userId: string, userState: UserGamification) {
    const newAchievements: any[] = [];

    // Get all achievements
    const { data: allAchievements } = await (this.supabase as any)
      .from("achievements")
      .select("*")
      .eq("is_active", true);

    if (!allAchievements) return newAchievements;

    // Get user's existing achievements
    const { data: userAchievements } = await (this.supabase as any)
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    const unlockedIds = new Set((userAchievements as any[])?.map((a: any) => a.achievement_id) || []);

    // Check each achievement
    for (const achievement of allAchievements as any[]) {
      if (unlockedIds.has(achievement.id)) continue;

      let isUnlocked = false;

      switch (achievement.type) {
        case "streak":
          isUnlocked = (userState.current_streak || 0) >= achievement.threshold;
          break;
        case "words_learned":
          isUnlocked = (userState.total_words_learned || 0) >= achievement.threshold;
          break;
        case "mastery":
          // Calculate accuracy
          const accuracy =
            (userState.total_questions_answered || 0) > 0
              ? ((userState.total_correct_answers || 0) / (userState.total_questions_answered || 0)) * 100
              : 0;
          isUnlocked = accuracy >= achievement.threshold;
          break;
        case "consistency":
          isUnlocked = (userState.total_questions_answered || 0) >= achievement.threshold;
          break;
      }

      if (isUnlocked) {
        // Unlock achievement
        const { data: unlocked } = await (this.supabase as any)
          .from("user_achievements")
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          })
          .select()
          .single();

        // Add XP reward
        if (achievement.xp_reward > 0) {
          await (this.supabase as any)
            .from("user_gamification")
            .update({ xp: (userState.xp || 0) + achievement.xp_reward })
            .eq("user_id", userId);
        }

        newAchievements.push({ ...achievement, unlockedAt: (unlocked as any)?.unlocked_at });
      }
    }

    return newAchievements;
  }

  /**
   * Get user's gamification state
   */
  async getUserGamification(userId: string) {
    const { data, error } = await (this.supabase as any)
      .from("user_gamification")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return this.initializeUser(userId);
    }

    return data as UserGamification;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string) {
    const { data } = await (this.supabase as any)
      .from("user_achievements")
      .select(`
        *,
        achievements (*)
      `)
      .eq("user_id", userId);

    return data || [];
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements() {
    const { data } = await (this.supabase as any)
      .from("achievements")
      .select("*")
      .eq("is_active", true)
      .order("rarity");

    return data || [];
  }

  /**
   * Record session completion for perfect score bonus
   */
  async recordSessionCompletion(userId: string, totalQuestions: number, correctCount: number) {
    const isPerfectScore = totalQuestions > 0 && totalQuestions === correctCount;
    
    if (isPerfectScore) {
      const { data: userGamification } = await (this.supabase as any)
        .from("user_gamification")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userGamification) {
        await (this.supabase as any)
          .from("user_gamification")
          .update({ xp: ((userGamification as UserGamification).xp || 0) + XP_REWARDS.PERFECT_SCORE_BONUS })
          .eq("user_id", userId);
      }
    }

    return { isPerfectScore, xpBonus: isPerfectScore ? XP_REWARDS.PERFECT_SCORE_BONUS : 0 };
  }

  /**
   * Get progress to next level
   */
  getLevelProgress(currentXP: number, currentLevel: number) {
    const currentLevelXP = LEVEL_XP_REQUIREMENTS(currentLevel);
    const nextLevelXP = LEVEL_XP_REQUIREMENTS(currentLevel + 1);
    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  }
}

// Export singleton
export const gamificationService = new GamificationService();
