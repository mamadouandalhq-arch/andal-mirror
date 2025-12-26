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

    const surveyPercentages: number[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const feedbackResult of completedFeedbackResults) {
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

      // Calculate percentage from maximum for this survey
      if (surveyMaxScore > 0) {
        const percentage = (userScore / surveyMaxScore) * 100;
        surveyPercentages.push(percentage);
      }
    }

    // Calculate average percentage across all surveys
    const averagePercentage =
      surveyPercentages.length > 0
        ? surveyPercentages.reduce((sum, p) => sum + p, 0) /
          surveyPercentages.length
        : 0;

    // Determine risk category
    let level: 'high' | 'medium' | 'low';
    if (averagePercentage < 50) {
      level = 'high';
    } else if (averagePercentage < 70) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return {
      level,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      totalScore,
      maxPossibleScore,
      completedSurveys: completedFeedbackResults.length,
    };
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
