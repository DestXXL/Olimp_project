'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';
import { logAudit } from './audit';

export async function getUserContacts(userId: string) {
  const sent = await prisma.professionalContact.findMany({
    where: { senderId: userId, status: ContactStatus.accepted },
    include: {
      receiver: {
        include: {
          applicantProfile: true,
          company: true,
        },
      },
    },
  });

  const received = await prisma.professionalContact.findMany({
    where: { receiverId: userId, status: ContactStatus.accepted },
    include: {
      sender: {
        include: {
          applicantProfile: true,
          company: true,
        },
      },
    },
  });

  return [...sent, ...received];
}

export async function getPendingContactRequests(userId: string) {
  const sent = await prisma.professionalContact.findMany({
    where: { senderId: userId, status: ContactStatus.pending },
    include: {
      receiver: {
        include: {
          applicantProfile: true,
          company: true,
        },
      },
    },
  });

  const received = await prisma.professionalContact.findMany({
    where: { receiverId: userId, status: ContactStatus.pending },
    include: {
      sender: {
        include: {
          applicantProfile: true,
          company: true,
        },
      },
    },
  });

  return { sent, received };
}

export async function sendContactRequest(
  senderId: string,
  receiverId: string,
  message?: string
) {
  if (senderId === receiverId) {
    throw new Error('Нельзя отправить запрос самому себе');
  }

  const existing = await prisma.professionalContact.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    throw new Error('Запрос уже существует');
  }

  const contact = await prisma.professionalContact.create({
    data: {
      senderId,
      receiverId,
      message,
      status: ContactStatus.pending,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'contact_request',
      title: 'Новый запрос в контакты',
      message: 'Пользователь хочет добавить вас в профессиональные контакты',
    },
  });

  await logAudit(senderId, 'create', 'professionalContact', contact.id, null, contact);
  revalidatePath('/applicant/contacts');
  return contact;
}

export async function respondToContactRequest(
  contactId: string,
  userId: string,
  accept: boolean
) {
  const contact = await prisma.professionalContact.findUnique({
    where: { id: contactId },
  });

  if (!contact || contact.receiverId !== userId) {
    throw new Error('Unauthorized');
  }

  const status = accept ? ContactStatus.accepted : ContactStatus.rejected;

  const updated = await prisma.professionalContact.update({
    where: { id: contactId },
    data: { status },
  });

  // Create notification for sender
  await prisma.notification.create({
    data: {
      userId: contact.senderId,
      type: accept ? 'contact_accepted' : 'system',
      title: accept ? 'Запрос принят' : 'Запрос отклонен',
      message: accept
        ? 'Пользователь принял ваш запрос в контакты'
        : 'Пользователь отклонил ваш запрос в контакты',
    },
  });

  await logAudit(userId, 'update', 'professionalContact', contactId, null, { status });
  revalidatePath('/applicant/contacts');
  return updated;
}

export async function recommendContact(
  contactId: string,
  recommenderId: string,
  opportunityId: string,
  message?: string
) {
  const contact = await prisma.professionalContact.findUnique({
    where: { id: contactId },
  });

  if (!contact) {
    throw new Error('Contact not found');
  }

  // Check if recommender is part of the contact
  if (contact.senderId !== recommenderId && contact.receiverId !== recommenderId) {
    throw new Error('Unauthorized');
  }

  // Get the other person in the contact
  const recommendedId =
    contact.senderId === recommenderId ? contact.receiverId : contact.senderId;

  const recommendation = await prisma.contactRecommendation.create({
    data: {
      contactId,
      recommenderId,
      opportunityId,
      message,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: recommendedId,
      type: 'recommendation',
      title: 'Вас рекомендовали на возможность',
      message: 'Ваш контакт рекомендовал вас на интересную возможность',
      data: { opportunityId, recommenderId },
    },
  });

  await logAudit(recommenderId, 'create', 'contactRecommendation', recommendation.id, null, recommendation);
  return recommendation;
}

export async function removeContact(userId: string, contactId: string) {
  const contact = await prisma.professionalContact.findUnique({
    where: { id: contactId },
  });

  if (!contact || (contact.senderId !== userId && contact.receiverId !== userId)) {
    throw new Error('Unauthorized');
  }

  await prisma.professionalContact.delete({
    where: { id: contactId },
  });

  revalidatePath('/applicant/contacts');
  return { success: true };
}
