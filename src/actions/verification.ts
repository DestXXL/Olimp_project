'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';
import { logAudit } from './audit';

interface SubmitVerificationData {
  inn: string;
  corporateEmail: string;
  website?: string;
  socialLinks?: Record<string, string>;
  documents?: string[];
}

export async function submitVerification(
  userId: string,
  data: SubmitVerificationData
) {
  const company = await prisma.company.findUnique({
    where: { userId },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  // Check if verification already exists
  const existing = await prisma.employerVerification.findUnique({
    where: { companyId: company.id },
  });

  if (existing && existing.status === VerificationStatus.pending) {
    throw new Error('Verification already pending');
  }

  if (existing) {
    // Update existing verification
    await prisma.employerVerification.update({
      where: { companyId: company.id },
      data: {
        ...data,
        status: VerificationStatus.pending,
        reviewedBy: null,
        reviewedAt: null,
        curatorNotes: null,
      },
    });
  } else {
    // Create new verification
    await prisma.employerVerification.create({
      data: {
        companyId: company.id,
        ...data,
        status: VerificationStatus.pending,
      },
    });
  }

  // Update company status
  await prisma.company.update({
    where: { id: company.id },
    data: { verificationStatus: VerificationStatus.pending },
  });

  await logAudit(userId, 'create', 'employerVerification', company.id, null, data);
  revalidatePath('/employer/verification');
  return { success: true };
}

export async function getVerificationStatus(userId: string) {
  const company = await prisma.company.findUnique({
    where: { userId },
    include: {
      verification: true,
    },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  return company.verification;
}
