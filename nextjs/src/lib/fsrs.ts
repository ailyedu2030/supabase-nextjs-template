/**
 * FSRS (Free Spaced Repetition Scheduler) - TypeScript Implementation
 * Based on FSRS-6 algorithm from https://github.com/open-spaced-repetition
 */

// FSRS Default Parameters (21 weights)
export const DEFAULT_PARAMS = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194,
  0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629,
  1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
];

// Rating enum (1-4)
export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

// Card state
export enum CardState {
  New = 'new',
  Learning = 'learning',
  Review = 'review',
  Relearning = 'relearning',
}

// FSRS Card interface
export interface FSRSCard {
  state: CardState;
  difficulty: number; // D: 1-10
  stability: number; // S: days
  retrievability?: number; // R: 0-1
  lastReview?: Date;
  nextReview?: Date;
  reviewCount: number;
  lapseCount: number;
}

// Review Log entry
export interface ReviewLog {
  rating: Rating;
  reviewDatetime: Date;
  scheduledInterval?: number;
  actualInterval?: number;
  stabilityBefore: number;
  stabilityAfter: number;
  difficultyBefore: number;
  difficultyAfter: number;
}

// Scheduler result
export interface SchedulerResult {
  card: FSRSCard;
  reviewLog: ReviewLog;
}

export class FSRS {
  private params: number[];
  private requestedRetention: number;
  private maximumInterval: number;

  constructor(
    params: number[] = DEFAULT_PARAMS,
    requestedRetention: number = 0.9,
    maximumInterval: number = 36500
  ) {
    this.params = params;
    this.requestedRetention = requestedRetention;
    this.maximumInterval = maximumInterval;
  }

  /**
   * Create a new FSRS card
   */
  createCard(initialDifficulty: number = 5): FSRSCard {
    return {
      state: CardState.New,
      difficulty: initialDifficulty,
      stability: 0,
      retrievability: 1,
      reviewCount: 0,
      lapseCount: 0,
    };
  }

  /**
   * Calculate retrievability (R) at time t
   */
  private calculateRetrievability(elapsedDays: number, stability: number): number {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20, w21] = this.params;
    const factor = Math.pow(0.9, -1 / w20) - 1;
    return Math.pow(1 + factor * elapsedDays / stability, -w20);
  }

  /**
   * Calculate next interval for desired retention
   */
  private nextInterval(stability: number): number {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20, w21] = this.params;
    const factor = Math.pow(0.9, -1 / w20) - 1;
    const interval = (stability / factor) * (Math.pow(this.requestedRetention, 1 / w20) - 1);
    return Math.min(Math.max(1, Math.round(interval)), this.maximumInterval);
  }

  /**
   * Calculate new stability after successful recall
   */
  private nextStabilityRecall(d: number, s: number, g: number): number {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20, w21] = this.params;
    const hardPenalty = Rating.Hard === g ? w16 : 1;
    const easyBonus = Rating.Easy === g ? w17 : 1;
    return s * (
      1 + Math.exp(w18) * (12 - d) * Math.pow(s, -w19) *
      (Math.exp((1 - g) * w20) - 1) * hardPenalty * easyBonus
    );
  }

  /**
   * Calculate new stability after forgetting
   */
  private nextStabilityForget(d: number, s: number, r: number): number {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20, w21] = this.params;
    return w11 * Math.pow(d, -w12) * (Math.pow(s + 1, w13) - 1) * Math.exp(w14 * (1 - r));
  }

  /**
   * Calculate new difficulty
   */
  private nextDifficulty(d: number, g: number): number {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20, w21] = this.params;
    let nextD = d - w6 * (g - 3);
    nextD = w7 + (d - w7) * Math.exp(-w8 * (g - 3));
    nextD = Math.max(1, Math.min(10, nextD));
    return nextD;
  }

  /**
   * Calculate initial stability for first review
   */
  private initStability(g: number): number {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10] = this.params;
    return Math.max(0.1, w1 + w2 * (g - 1));
  }

  /**
   * Calculate initial difficulty
   */
  private initDifficulty(g: number): number {
    const [w1, w2, w3, w4, w5] = this.params;
    return Math.max(1, Math.min(10, w3 + w4 * (g - 3)));
  }

  /**
   * Main review function - processes a card review
   */
  reviewCard(card: FSRSCard, rating: Rating, now: Date = new Date()): SchedulerResult {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20, w21] = this.params;

    let nextState = card.state;
    let nextDifficulty = card.difficulty;
    let nextStability = card.stability;
    let scheduledInterval = 0;
    let actualInterval = 0;
    const stabilityBefore = card.stability;
    const difficultyBefore = card.difficulty;

    // Calculate actual interval since last review
    if (card.lastReview) {
      actualInterval = Math.max(0, (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Calculate current retrievability
    let retrievability = 1;
    if (card.lastReview && card.stability > 0) {
      retrievability = this.calculateRetrievability(actualInterval, card.stability);
    }

    // Process based on card state and rating
    if (card.state === CardState.New) {
      // First review
      nextDifficulty = this.initDifficulty(rating);
      nextStability = this.initStability(rating);
      nextState = rating >= Rating.Good ? CardState.Review : CardState.Learning;
    } else if (card.state === CardState.Learning || card.state === CardState.Relearning) {
      // Learning/Relearning state
      if (rating >= Rating.Good) {
        nextState = CardState.Review;
        nextDifficulty = this.nextDifficulty(card.difficulty, rating);
        nextStability = this.nextStabilityRecall(card.difficulty, card.stability, rating);
      } else {
        // Stay in learning
        nextDifficulty = this.nextDifficulty(card.difficulty, rating);
        nextStability = this.nextStabilityRecall(card.difficulty, card.stability, rating);
      }
    } else {
      // Review state
      if (rating >= Rating.Good) {
        // Successful recall
        nextDifficulty = this.nextDifficulty(card.difficulty, rating);
        nextStability = this.nextStabilityRecall(card.difficulty, card.stability, rating);
        nextState = CardState.Review;
      } else {
        // Forgetting
        nextState = CardState.Relearning;
        nextDifficulty = this.nextDifficulty(card.difficulty, rating);
        nextStability = this.nextStabilityForget(card.difficulty, card.stability, retrievability);
      }
    }

    // Calculate next review date
    let nextInterval = 0;
    if (nextState === CardState.Review) {
      nextInterval = this.nextInterval(nextStability);
    } else {
      // Learning/Relearning intervals (minutes)
      nextInterval = rating === Rating.Again ? 5 : rating === Rating.Hard ? 10 : rating === Rating.Good ? 60 : 1440;
    }

    const nextReviewDate = new Date(now.getTime() + nextInterval * 60 * 60 * 1000);

    // Create updated card
    const updatedCard: FSRSCard = {
      ...card,
      state: nextState,
      difficulty: nextDifficulty,
      stability: nextStability,
      retrievability: 1, // Reset after review
      lastReview: now,
      nextReview: nextReviewDate,
      reviewCount: card.reviewCount + 1,
      lapseCount: rating === Rating.Again ? card.lapseCount + 1 : card.lapseCount,
    };

    // Create review log
    const reviewLog: ReviewLog = {
      rating,
      reviewDatetime: now,
      scheduledInterval,
      actualInterval,
      stabilityBefore,
      stabilityAfter: nextStability,
      difficultyBefore,
      difficultyAfter: nextDifficulty,
    };

    return { card: updatedCard, reviewLog };
  }

  /**
   * Get cards that are due for review
   */
  getDueCards(cards: FSRSCard[], now: Date = new Date()): FSRSCard[] {
    return cards.filter((card) => {
      if (!card.nextReview) return card.state === CardState.New;
      return card.nextReview <= now;
    });
  }

  /**
   * Get current retrievability of a card
   */
  getCurrentRetrievability(card: FSRSCard, now: Date = new Date()): number {
    if (!card.lastReview || card.stability <= 0) return 1;
    const elapsedDays = Math.max(0, (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24));
    return this.calculateRetrievability(elapsedDays, card.stability);
  }
}

// Export singleton instance
export const fsrs = new FSRS();
