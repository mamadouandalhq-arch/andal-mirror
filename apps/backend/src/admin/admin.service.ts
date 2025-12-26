import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetReceiptsQueryDto, ReviewReceiptDto } from './dto';
import { ReceiptStatus, FeedbackStatus } from '@prisma/client';
import { mapFeedbackAnswers } from './mappers';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeedbackById(feedbackId: string, language: string) {
    const feedbackResult = await this.prisma.feedbackResult.findUnique({
      where: {
        id: feedbackId,
      },
      include: this.getFeedbackWithAnswersInclude(language),
    });

    if (!feedbackResult) {
      throw new NotFoundException('Feedback not found');
    }

    return {
      id: feedbackResult.id,
      status: feedbackResult.status,
      pointsValue: feedbackResult.pointsValue,
      createdAt: feedbackResult.createdAt,
      completedAt: feedbackResult.completedAt,
      answers: mapFeedbackAnswers(feedbackResult.answers),
    };
  }

  async reviewReceipt(dto: ReviewReceiptDto) {
    return await this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id: dto.receiptId },
        select: {
          id: true,
          status: true,
          userId: true,
          feedbackResult: {
            select: { pointsValue: true },
          },
        },
      });

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      if (!receipt.userId) {
        throw new NotFoundException('User not found');
      }

      const wasPending = receipt.status === ReceiptStatus.pending;
      const willBeApproved = dto.status === ReceiptStatus.approved;

      if (!wasPending) {
        throw new BadRequestException('Receipt was already handled');
      }

      const updatedReceipt = await tx.receipt.update({
        where: { id: receipt.id },
        data: {
          status: dto.status,
          comment: willBeApproved ? undefined : dto.comment,
        },
      });

      if (wasPending && willBeApproved) {
        await tx.user.update({
          where: { id: receipt.userId },
          data: {
            pointsBalance: {
              increment: receipt.feedbackResult?.pointsValue ?? 0,
            },
          },
        });
      }

      return updatedReceipt;
    });
  }

  async getReceipts(query: GetReceiptsQueryDto) {
    return await this.prisma.receipt.findMany({
      where: {
        feedbackResult: {
          status: query.feedbackStatus,
        },
        status: query.status,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        feedbackResult: {
          select: {
            id: true,
            status: true,
            pointsValue: true,
            completedAt: true,
          },
        },
      },
    });
  }

  async getReceipt(receiptId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id: receiptId,
      },
      include: {
        feedbackResult: {
          select: {
            id: true,
            status: true,
            totalQuestions: true,
            answeredQuestions: true,
            pointsValue: true,
            completedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with id '${receiptId}' not found`);
    }

    return receipt;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        role: 'user',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        pointsBalance: true,
        createdAt: true,
        _count: {
          select: {
            receipts: true,
            redemptions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const usersWithRisk = await Promise.all(
      users.map(async (user) => {
        const riskAssessment = await this.calculateUserRisk(user.id);
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          pointsBalance: user.pointsBalance,
          createdAt: user.createdAt,
          receiptsCount: user._count.receipts,
          redemptionsCount: user._count.redemptions,
          riskLevel: riskAssessment.level,
          riskAssessment: {
            averagePercentage: riskAssessment.averagePercentage,
            completedSurveys: riskAssessment.completedSurveys,
          },
        };
      }),
    );

    return usersWithRisk;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        street: true,
        building: true,
        apartment: true,
        avatarUrl: true,
        pointsBalance: true,
        createdAt: true,
        receipts: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            receiptUrl: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        redemptions: {
          select: {
            id: true,
            status: true,
            pointsAmount: true,
            dollarAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const riskAssessment = await this.calculateUserRisk(userId);

    return {
      ...user,
      riskAssessment,
    };
  }

  async calculateUserRisk(userId: string): Promise<{
    level: 'high' | 'medium' | 'low';
    averagePercentage: number;
    totalScore: number;
    maxPossibleScore: number;
    completedSurveys: number;
  }> {
    // Get all completed FeedbackResult for the user
    const completedFeedbackResults = await this.prisma.feedbackResult.findMany({
      where: {
        userId,
        status: FeedbackStatus.completed,
      },
      include: {
        survey: {
          include: {
            surveyQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (completedFeedbackResults.length === 0) {
      // No completed surveys - return medium risk as default
      return {
        level: 'medium',
        averagePercentage: 0,
        totalScore: 0,
        maxPossibleScore: 0,
        completedSurveys: 0,
      };
    }

    const sortedSurveys = completedFeedbackResults.sort((a, b) => {
      const dateA = a.completedAt?.getTime() ?? a.createdAt.getTime();
      const dateB = b.completedAt?.getTime() ?? b.createdAt.getTime();
      return dateB - dateA;
    });

    const DECAY_FACTOR = 0.85;
    const surveyData: Array<{
      percentage: number;
      weight: number;
      userScore: number;
      maxScore: number;
    }> = [];

    let totalScore = 0;
    let maxPossibleScore = 0;

    for (let i = 0; i < sortedSurveys.length; i++) {
      const feedbackResult = sortedSurveys[i];
      const survey = feedbackResult.survey;
      const surveyQuestions = survey.surveyQuestions;

      // Calculate maximum possible score for this survey
      let surveyMaxScore = 0;
      for (const surveyQuestion of surveyQuestions) {
        const question = surveyQuestion.question;
        if (question.options.length > 0) {
          const maxOptionScore = Math.max(
            ...question.options.map((opt) => opt.score),
          );
          surveyMaxScore += maxOptionScore;
        }
      }

      // Calculate actual user score for this survey
      let userScore = 0;
      for (const answer of feedbackResult.answers) {
        const question = answer.question;
        for (const answerKey of answer.answerKeys) {
          const option = question.options.find((opt) => opt.key === answerKey);
          if (option) {
            userScore += option.score;
          }
        }
      }

      totalScore += userScore;
      maxPossibleScore += surveyMaxScore;

      if (surveyMaxScore > 0) {
        const percentage = (userScore / surveyMaxScore) * 100;
        const weight = Math.pow(DECAY_FACTOR, i);
        surveyData.push({
          percentage,
          weight,
          userScore,
          maxScore: surveyMaxScore,
        });
      }
    }

    const totalWeight = surveyData.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = surveyData.reduce(
      (sum, item) => sum + item.percentage * item.weight,
      0,
    );
    let averagePercentage = totalWeight > 0 ? weightedSum / totalWeight : 0;

    const recentSurveysCount = Math.min(3, sortedSurveys.length);
    const recentSurveys = sortedSurveys.slice(0, recentSurveysCount);
    const recentPercentages: number[] = [];

    for (const feedbackResult of recentSurveys) {
      const survey = feedbackResult.survey;
      const surveyQuestions = survey.surveyQuestions;

      let surveyMaxScore = 0;
      for (const surveyQuestion of surveyQuestions) {
        const question = surveyQuestion.question;
        if (question.options.length > 0) {
          const maxOptionScore = Math.max(
            ...question.options.map((opt) => opt.score),
          );
          surveyMaxScore += maxOptionScore;
        }
      }

      let userScore = 0;
      for (const answer of feedbackResult.answers) {
        const question = answer.question;
        for (const answerKey of answer.answerKeys) {
          const option = question.options.find((opt) => opt.key === answerKey);
          if (option) {
            userScore += option.score;
          }
        }
      }

      if (surveyMaxScore > 0) {
        const percentage = (userScore / surveyMaxScore) * 100;
        recentPercentages.push(percentage);
      }
    }

    const recentAverage =
      recentPercentages.length > 0
        ? recentPercentages.reduce((sum, p) => sum + p, 0) /
          recentPercentages.length
        : 0;

    if (recentAverage < 50 && averagePercentage >= 50) {
      averagePercentage = Math.min(averagePercentage, recentAverage + 10);
    }

    let hasDecliningTrend = false;
    if (sortedSurveys.length >= 6) {
      const previousSurveysCount = Math.min(3, sortedSurveys.length - 3);
      const previousSurveys = sortedSurveys.slice(
        recentSurveysCount,
        recentSurveysCount + previousSurveysCount,
      );
      const previousPercentages: number[] = [];

      for (const feedbackResult of previousSurveys) {
        const survey = feedbackResult.survey;
        const surveyQuestions = survey.surveyQuestions;

        let surveyMaxScore = 0;
        for (const surveyQuestion of surveyQuestions) {
          const question = surveyQuestion.question;
          if (question.options.length > 0) {
            const maxOptionScore = Math.max(
              ...question.options.map((opt) => opt.score),
            );
            surveyMaxScore += maxOptionScore;
          }
        }

        let userScore = 0;
        for (const answer of feedbackResult.answers) {
          const question = answer.question;
          for (const answerKey of answer.answerKeys) {
            const option = question.options.find(
              (opt) => opt.key === answerKey,
            );
            if (option) {
              userScore += option.score;
            }
          }
        }

        if (surveyMaxScore > 0) {
          const percentage = (userScore / surveyMaxScore) * 100;
          previousPercentages.push(percentage);
        }
      }

      const previousAverage =
        previousPercentages.length > 0
          ? previousPercentages.reduce((sum, p) => sum + p, 0) /
            previousPercentages.length
          : 0;

      const trendDifference = previousAverage - recentAverage;
      if (trendDifference >= 15 && recentAverage < 70) {
        hasDecliningTrend = true;
      }
    }

    let level: 'high' | 'medium' | 'low';
    if (averagePercentage < 50) {
      level = 'high';
    } else if (averagePercentage < 70) {
      level = 'medium';
    } else {
      level = 'low';
    }

    if (hasDecliningTrend) {
      if (level === 'low') {
        level = 'medium';
      } else if (level === 'medium') {
        level = 'high';
      }
    }

    return {
      level,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      totalScore,
      maxPossibleScore,
      completedSurveys: completedFeedbackResults.length,
    };
  }

  async getUserSurveyResults(userId: string): Promise<
    Array<{
      date: string;
      percentage: number;
      completedAt: string | null;
      answeredQuestions: number;
      totalQuestions: number;
    }>
  > {
    const MAX_SURVEYS = 30;

    const completedFeedbackResults = await this.prisma.feedbackResult.findMany({
      where: {
        userId,
        status: FeedbackStatus.completed,
      },
      include: {
        survey: {
          include: {
            surveyQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: MAX_SURVEYS,
    });

    const sortedResults = completedFeedbackResults.reverse();

    const results = sortedResults.map((feedbackResult) => {
      const survey = feedbackResult.survey;
      const surveyQuestions = survey.surveyQuestions;

      let surveyMaxScore = 0;
      for (const surveyQuestion of surveyQuestions) {
        const question = surveyQuestion.question;
        if (question.options.length > 0) {
          const maxOptionScore = Math.max(
            ...question.options.map((opt) => opt.score),
          );
          surveyMaxScore += maxOptionScore;
        }
      }

      let userScore = 0;
      for (const answer of feedbackResult.answers) {
        const question = answer.question;
        for (const answerKey of answer.answerKeys) {
          const option = question.options.find((opt) => opt.key === answerKey);
          if (option) {
            userScore += option.score;
          }
        }
      }

      const percentage =
        surveyMaxScore > 0 ? (userScore / surveyMaxScore) * 100 : 0;
      const date =
        feedbackResult.completedAt?.toISOString() ??
        feedbackResult.createdAt.toISOString();

      return {
        date,
        percentage: Math.round(percentage * 100) / 100,
        completedAt: feedbackResult.completedAt?.toISOString() ?? null,
        answeredQuestions: feedbackResult.answeredQuestions,
        totalQuestions: feedbackResult.totalQuestions,
      };
    });

    return results;
  }

  private getFeedbackWithAnswersInclude(language: string) {
    return {
      answers: {
        include: {
          question: {
            include: {
              translations: {
                where: { language: language },
                take: 1,
              },
              options: {
                include: {
                  translations: {
                    where: { language: language },
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}
