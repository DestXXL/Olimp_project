'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      opportunity: {
        include: {
          company: true,
          tags: { include: { tag: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addToFavorites(userId: string, opportunityId: string) {
  const existing = await prisma.favorite.findFirst({
    where: { userId, opportunityId },
  });

  if (existing) {
    return existing;
  }

  const favorite = await prisma.favorite.create({
    data: { userId, opportunityId },
  });

  revalidatePath('/favorites');
  revalidatePath(`/opportunity/${opportunityId}`);
  return favorite;
}

export async function removeFromFavorites(userId: string, opportunityId: string) {
  await prisma.favorite.deleteMany({
    where: { userId, opportunityId },
  });

  revalidatePath('/favorites');
  revalidatePath(`/opportunity/${opportunityId}`);
  return { success: true };
}

export async function checkIsFavorite(userId: string, opportunityId: string) {
  const favorite = await prisma.favorite.findFirst({
    where: { userId, opportunityId },
  });
  return !!favorite;
}
