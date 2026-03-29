'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ModerationStatus, ModerationItemType, OpportunityStatus, VerificationStatus } from '@prisma/client';
import { logAudit } from './audit';

export async function getModerationQueue(
  status?: ModerationStatus,
  type?: ModerationItemType
) {
  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;

  return prisma.moderationQueueItem.findMany({
    where,
    include: {
      reviewer: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function moderateItem(
  itemId: string,
  decision: 'approve' | 'reject',
  curatorId: string,
  notes?: string
) {
  const item = await prisma.moderationQueueItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  const status = decision === 'approve' ? ModerationStatus.approved : ModerationStatus.rejected;

  await prisma.moderationQueueItem.update({
    where: { id: itemId },
    data: {
      status,
      curatorNotes: notes,
      reviewedBy: curatorId,
      reviewedAt: new Date(),
    },
  });

  // Update the target entity based on type
  if (item.type === ModerationItemType.opportunity) {
    await prisma.opportunity.update({
      where: { id: item.targetId },
      data: {
        status: decision === 'approve' ? OpportunityStatus.active : OpportunityStatus.rejected,
      },
    });
  }

  await logAudit(curatorId, 'moderation', item.type, item.targetId, null, { decision, notes });
  revalidatePath('/curator/moderation');
  return { success: true };
}

export async function createModerationItem(
  type: ModerationItemType,
  targetId: string,
  targetType: string,
  reason?: string,
  autoFlags?: any
) {
  return prisma.moderationQueueItem.create({
    data: {
      type,
      targetId,
      targetType,
      reason,
      autoFlags,
      status: ModerationStatus.pending,
    },
  });
}

export async function getReports(status?: string) {
  const where: any = {};
  if (status) where.status = status;

  return prisma.report.findMany({
    where,
    include: {
      reporter: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      target: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function resolveReport(
  reportId: string,
  curatorId: string,
  resolution: string,
  dismiss: boolean = false
) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error('Report not found');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: dismiss ? 'dismissed' : 'resolved',
      resolvedBy: curatorId,
      resolvedAt: new Date(),
      resolution,
    },
  });

  await logAudit(curatorId, 'moderation', 'report', reportId, null, { resolution, dismiss });
  revalidatePath('/curator/reports');
  return { success: true };
}

export async function getPendingVerifications() {
  return prisma.employerVerification.findMany({
    where: { status: VerificationStatus.pending },
    include: {
      company: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function processVerification(
  verificationId: string,
  decision: 'verify' | 'reject',
  curatorId: string,
  notes?: string
) {
  const verification = await prisma.employerVerification.findUnique({
    where: { id: verificationId },
    include: { company: true },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  const status = decision === 'verify' ? VerificationStatus.verified : VerificationStatus.rejected;

  await prisma.employerVerification.update({
    where: { id: verificationId },
    data: {
      status,
      curatorNotes: notes,
      reviewedBy: curatorId,
      reviewedAt: new Date(),
    },
  });

  await prisma.company.update({
    where: { id: verification.companyId },
    data: { verificationStatus: status },
  });

  // Create notification for employer
  await prisma.notification.create({
    data: {
      userId: verification.company.userId,
      type: 'verification_status',
      title: decision === 'verify' ? 'Верификация пройдена' : 'Верификация отклонена',
      message: decision === 'verify'
        ? 'Ваша компания успешно верифицирована. Теперь вы можете публиковать возможности.'
        : `Верификация отклонена. ${notes || ''}`,
    },
  });

  await logAudit(curatorId, 'verification', 'employerVerification', verificationId, null, { decision, notes });
  revalidatePath('/curator/verifications');
  return { success: true };
}
