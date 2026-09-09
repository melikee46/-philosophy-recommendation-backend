import { QuizRepository } from '../repositories/quizRepository';
import { RecommendationService } from './recommendationService';
import { DifficultyLevel } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { SubmitQuizInput } from '../schemas/quizSchemas';

export interface PhilosophyScoreDetail {
  philosophyId: string;
  name: string;
  slug: string;
  era: string;
  description: string;
  coreTenets: string[];
  score: number;
  percentage: number;
}

export class QuizService {
  constructor(
    private quizRepository: QuizRepository = new QuizRepository(),
    private recommendationService: RecommendationService = new RecommendationService()
  ) {}

  async getQuestions() {
    return this.quizRepository.getActiveQuestions();
  }

  async calculateQuizResults(input: SubmitQuizInput) {
    const optionIds = input.answers.map((a) => a.selectedOptionId);
    const optionsWithScores = await this.quizRepository.getOptionsWithScores(optionIds);

    if (optionsWithScores.length === 0) {
      throw ApiError.badRequest('Seçilen yanıtlar bulunamadı veya geçersiz');
    }

    // Map to aggregate scores per philosophy
    const scoreMap = new Map<
      string,
      {
        philosophy: {
          id: string;
          name: string;
          slug: string;
          era: string;
          description: string;
          coreTenets: string[];
        };
        score: number;
      }
    >();

    let cumulativeTotalScore = 0;

    for (const option of optionsWithScores) {
      for (const scoreRecord of option.scores) {
        const p = scoreRecord.philosophy;
        cumulativeTotalScore += scoreRecord.weight;

        const existing = scoreMap.get(p.id);
        if (existing) {
          existing.score += scoreRecord.weight;
        } else {
          scoreMap.set(p.id, {
            philosophy: {
              id: p.id,
              name: p.name,
              slug: p.slug,
              era: p.era,
              description: p.description,
              coreTenets: p.coreTenets,
            },
            score: scoreRecord.weight,
          });
        }
      }
    }

    if (scoreMap.size === 0) {
      throw ApiError.badRequest('Seçilen seçenekler için herhangi bir felsefi ağırlık hesaplanamadı');
    }

    // Convert map to sorted array
    const breakdown: PhilosophyScoreDetail[] = Array.from(scoreMap.values())
      .map((item) => ({
        philosophyId: item.philosophy.id,
        name: item.philosophy.name,
        slug: item.philosophy.slug,
        era: item.philosophy.era,
        description: item.philosophy.description,
        coreTenets: item.philosophy.coreTenets,
        score: item.score,
        percentage:
          cumulativeTotalScore > 0 ? Math.round((item.score / cumulativeTotalScore) * 100) : 0,
      }))
      .sort((a, b) => b.score - a.score);

    const primaryMatch = breakdown[0];
    const secondaryMatch = breakdown.length > 1 ? breakdown[1] : null;

    // Fetch dynamic starter pack for primary philosophy at beginner level
    const starterPack = await this.recommendationService.getDynamicPack(
      primaryMatch.slug,
      DifficultyLevel.BEGINNER
    );

    return {
      resultSummary: {
        dominantPhilosophy: primaryMatch.name,
        affinityRate: `${primaryMatch.percentage}%`,
        description: primaryMatch.description,
      },
      primaryMatch,
      secondaryMatch,
      fullScoreBreakdown: breakdown,
      recommendedStarterPack: starterPack,
    };
  }
}
