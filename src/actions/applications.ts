'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import { logAudit } from './audit';

export async function createApplication(
  opportunityId: string,
  userId: string,
  data: { coverLetter?: string; resumeUrl?: string }
) {
  // Check if already applied
  const existing = await prisma.application.findFirst({
    where: { userId, opportunityId },
  });

  if (existing) {
    throw new Error('You have already applied for this opportunity');
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity || opportunity.status !== 'active') {
    throw new Error('Opportunity not available');
  }

  const application = await prisma.application.create({
    data: {
      userId,
      opportunityId,
      coverLetter: data.coverLetter,
      resumeUrl: data.resumeUrl,
      status: ApplicationStatus.new,
    },
  });

  // Create status history
  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: application.id,
      status: ApplicationStatus.new,
      notes: 'Заявка создана',
    },
  });

  // Update applications count
  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { applicationsCount: { increment: 1 } },
  });

  await logAudit(userId, 'create', 'application', application.id, null, application);
  revalidatePath(`/opportunity/${opportunityId}`);
  return application;
}

export async function getUserApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      opportunity: {
        include: {
          company: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOpportunityApplications(opportunityId: string, employerUserId: string) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: { company: true },
  });

  if (!opportunity || opportunity.company.userId !== employerUserId) {
    throw new Error('Unauthorized');
  }

  return prisma.application.findMany({
    where: { opportunityId },
    include: {
      user: {
        include: {
          applicantProfile: {
            include: {
              skills: { include: { tag: true } },
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  employerUserId: string,
  notes?: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: { include: { company: true } },
    },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  if (application.opportunity.company.userId !== employerUserId) {
    throw new Error('Unauthorized');
  }

  const oldStatus = application.status;

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status, employerNotes: notes },
  });

  // Create status history
  await prisma.applicationStatusHistory.create({
    data: {
      applicationId,
      status,
      notes: notes || `Статус изменен на: ${status}`,
      changedBy: employerUserId,
    },
  });

  await logAudit(
    employerUserId,
    'status_change',
    'application',
    applicationId,
    { status: oldStatus },
    { status }
  );

  revalidatePath(`/employer/applications`);
  return updated;
}

export async function withdrawApplication(applicationId: string, userId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application || application.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (application.status === ApplicationStatus.accepted) {
    throw new Error('Cannot withdraw accepted application');
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: ApplicationStatus.withdrawn },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId,
      status: ApplicationStatus.withdrawn,
      notes: 'Заявка отозвана кандидатом',
    },
  });

  // Decrement applications count
  await prisma.opportunity.update({
    where: { id: application.opportunityId },
    data: { applicationsCount: { decrement: 1 } },
  });

  await logAudit(userId, 'status_change', 'application', applicationId, null, { status: 'withdrawn' });
  revalidatePath('/applicant/applications');
  return updated;
}

export async function addApplicationNote(
  applicationId: string,
  employerUserId: string,
  notes: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { opportunity: { include: { company: true } } },
  });

  if (!application || application.opportunity.company.userId !== employerUserId) {
    throw new Error('Unauthorized');
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: { employerNotes: notes },
  });
}
