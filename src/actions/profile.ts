'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { PrivacyLevel } from '@prisma/client';
import { logAudit } from './audit';

interface UpdateApplicantProfileData {
  fullName?: string;
  university?: string;
  faculty?: string;
  course?: string;
  graduationYear?: number;
  city?: string;
  about?: string;
  githubUrl?: string;
  gitlabUrl?: string;
  portfolioUrl?: string;
  privacyLevel?: PrivacyLevel;
}

interface UpdateCompanyData {
  name?: string;
  description?: string;
  industry?: string;
  website?: string;
  city?: string;
  address?: string;
  socialLinks?: Record<string, string>;
}

export async function getApplicantProfile(userId: string) {
  return prisma.applicantProfile.findUnique({
    where: { userId },
    include: {
      skills: { include: { tag: true } },
      projects: true,
      experiences: true,
    },
  });
}

export async function updateApplicantProfile(
  userId: string,
  data: UpdateApplicantProfileData
) {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  const updated = await prisma.applicantProfile.update({
    where: { userId },
    data,
  });

  await logAudit(userId, 'update', 'applicantProfile', profile.id, null, data);
  revalidatePath('/applicant/profile');
  return updated;
}

export async function updateApplicantSkills(userId: string, tagIds: string[]) {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Remove existing skills
  await prisma.applicantSkillTag.deleteMany({
    where: { profileId: profile.id },
  });

  // Add new skills
  if (tagIds.length > 0) {
    await prisma.applicantSkillTag.createMany({
      data: tagIds.map((tagId) => ({
        profileId: profile.id,
        tagId,
      })),
    });
  }

  revalidatePath('/applicant/profile');
  return { success: true };
}

export async function addProject(
  userId: string,
  data: {
    title: string;
    description?: string;
    url?: string;
    technologies: string[];
  }
) {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  const project = await prisma.project.create({
    data: {
      profileId: profile.id,
      ...data,
    },
  });

  revalidatePath('/applicant/profile');
  return project;
}

export async function removeProject(userId: string, projectId: string) {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  await prisma.project.deleteMany({
    where: { id: projectId, profileId: profile.id },
  });

  revalidatePath('/applicant/profile');
  return { success: true };
}

export async function addExperience(
  userId: string,
  data: {
    company: string;
    position: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
  }
) {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  const experience = await prisma.experience.create({
    data: {
      profileId: profile.id,
      ...data,
    },
  });

  revalidatePath('/applicant/profile');
  return experience;
}

export async function removeExperience(userId: string, experienceId: string) {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  await prisma.experience.deleteMany({
    where: { id: experienceId, profileId: profile.id },
  });

  revalidatePath('/applicant/profile');
  return { success: true };
}

export async function getCompanyProfile(userId: string) {
  return prisma.company.findUnique({
    where: { userId },
  });
}

export async function updateCompanyProfile(
  userId: string,
  data: UpdateCompanyData
) {
  const company = await prisma.company.findUnique({
    where: { userId },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  const updated = await prisma.company.update({
    where: { userId },
    data,
  });

  await logAudit(userId, 'update', 'company', company.id, null, data);
  revalidatePath('/employer/profile');
  return updated;
}

export async function uploadResume(userId: string, fileUrl: string) {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  await prisma.applicantProfile.update({
    where: { userId },
    data: { resumeUrl: fileUrl },
  });

  revalidatePath('/applicant/profile');
  return { success: true };
}
