'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserRole, VerificationStatus } from '@prisma/client';
import { logAudit } from './audit';

interface RegisterApplicantData {
  email: string;
  password: string;
  displayName: string;
  fullName: string;
  university: string;
  faculty?: string;
  course?: string;
  graduationYear?: number;
  city: string;
}

interface RegisterEmployerData {
  email: string;
  password: string;
  displayName: string;
  companyName: string;
  inn?: string;
  website?: string;
  description?: string;
  city: string;
  address?: string;
}

export async function registerApplicant(data: RegisterApplicantData) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      displayName: data.displayName,
      role: UserRole.applicant,
      applicantProfile: {
        create: {
          fullName: data.fullName,
          university: data.university,
          faculty: data.faculty,
          course: data.course,
          graduationYear: data.graduationYear,
          city: data.city,
        },
      },
    },
  });

  await logAudit(user.id, 'create', 'user', user.id, null, { role: user.role });

  return { success: true, userId: user.id };
}

export async function registerEmployer(data: RegisterEmployerData) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      displayName: data.displayName,
      role: UserRole.employer,
      company: {
        create: {
          name: data.companyName,
          inn: data.inn,
          website: data.website,
          description: data.description,
          city: data.city,
          address: data.address,
          email: data.email,
          verificationStatus: VerificationStatus.draft,
        },
      },
    },
  });

  await logAudit(user.id, 'create', 'user', user.id, null, { role: user.role });

  return { success: true, userId: user.id };
}

export async function createCurator(data: {
  email: string;
  password: string;
  displayName: string;
}, adminUserId: string) {
  const admin = await prisma.user.findUnique({
    where: { id: adminUserId },
  });

  if (admin?.role !== UserRole.admin) {
    throw new Error('Только администратор может создавать кураторов');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      displayName: data.displayName,
      role: UserRole.curator,
    },
  });

  await logAudit(adminUserId, 'create', 'user', user.id, null, { role: user.role });

  return { success: true, userId: user.id };
}
