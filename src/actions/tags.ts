'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ModerationStatus } from '@prisma/client';
import { logAudit } from './audit';

export async function getTags(category?: string, status?: ModerationStatus) {
  const where: any = {};
  if (category) where.category = category;
  if (status) where.status = status;

  return prisma.tag.findMany({
    where,
    orderBy: { name: 'asc' },
  });
}

export async function getAllTags() {
  return prisma.tag.findMany({
    where: { status: ModerationStatus.approved },
    orderBy: { name: 'asc' },
  });
}

export async function suggestTag(
  name: string,
  category: string,
  suggestedBy: string
) {
  // Check if tag already exists
  const existing = await prisma.tag.findUnique({
    where: { name: name.toLowerCase() },
  });

  if (existing) {
    throw new Error('Tag already exists');
  }

  const tag = await prisma.tag.create({
    data: {
      name: name.toLowerCase(),
      category,
      isSystem: false,
      status: ModerationStatus.pending,
      suggestedBy,
    },
  });

  await logAudit(suggestedBy, 'create', 'tag', tag.id, null, tag);
  revalidatePath('/curator/tags');
  return tag;
}

export async function approveTag(tagId: string, curatorId: string) {
  const tag = await prisma.tag.update({
    where: { id: tagId },
    data: { status: ModerationStatus.approved },
  });

  await logAudit(curatorId, 'moderation', 'tag', tagId, null, { status: 'approved' });
  revalidatePath('/curator/tags');
  return tag;
}

export async function rejectTag(tagId: string, curatorId: string) {
  const tag = await prisma.tag.update({
    where: { id: tagId },
    data: { status: ModerationStatus.rejected },
  });

  await logAudit(curatorId, 'moderation', 'tag', tagId, null, { status: 'rejected' });
  revalidatePath('/curator/tags');
  return tag;
}

export async function mergeTags(
  sourceTagId: string,
  targetTagId: string,
  curatorId: string
) {
  // Move all relations from source to target
  await prisma.opportunityTag.updateMany({
    where: { tagId: sourceTagId },
    data: { tagId: targetTagId },
  });

  await prisma.applicantSkillTag.updateMany({
    where: { tagId: sourceTagId },
    data: { tagId: targetTagId },
  });

  // Delete source tag
  await prisma.tag.delete({
    where: { id: sourceTagId },
  });

  await logAudit(curatorId, 'delete', 'tag', sourceTagId, null, { mergedInto: targetTagId });
  revalidatePath('/curator/tags');
  return { success: true };
}

export async function deleteTag(tagId: string, curatorId: string) {
  // Remove all relations first
  await prisma.opportunityTag.deleteMany({
    where: { tagId },
  });

  await prisma.applicantSkillTag.deleteMany({
    where: { tagId },
  });

  await prisma.tag.delete({
    where: { id: tagId },
  });

  await logAudit(curatorId, 'delete', 'tag', tagId, null, null);
  revalidatePath('/curator/tags');
  return { success: true };
}
