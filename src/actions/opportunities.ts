'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { OpportunityStatus, OpportunityType, OpportunityFormat, Level, EmploymentType } from '@prisma/client';
import { OpportunityFormData, OpportunityFilters } from '@/types';
import { logAudit } from './audit';

const ITEMS_PER_PAGE = 12;

export async function getOpportunities(
  filters: OpportunityFilters = {},
  page = 1,
  sortBy: 'date' | 'relevance' | 'salary' | 'popular' = 'date'
) {
  const where: any = {
    status: filters.status || OpportunityStatus.active,
    deletedAt: null,
  };

  if (filters.type) where.type = filters.type;
  if (filters.format) where.format = filters.format;
  if (filters.level) where.level = filters.level;
  if (filters.employmentType) where.employmentType = filters.employmentType;
  if (filters.city) where.city = filters.city;
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      some: {
        tag: {
          name: { in: filters.tags },
        },
      },
    };
  }
  if (filters.salaryFrom) where.salaryTo = { gte: filters.salaryFrom };
  if (filters.salaryTo) where.salaryFrom = { lte: filters.salaryTo };
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { shortDescription: { contains: filters.search, mode: 'insensitive' } },
      { company: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const orderBy: any = {};
  switch (sortBy) {
    case 'date':
      orderBy.publishedAt = 'desc';
      break;
    case 'salary':
      orderBy.salaryFrom = 'desc';
      break;
    case 'popular':
      orderBy.views = 'desc';
      break;
    default:
      orderBy.publishedAt = 'desc';
  }

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      include: {
        company: true,
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, applications: true } },
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.opportunity.count({ where }),
  ]);

  return {
    data: opportunities,
    total,
    page,
    pageSize: ITEMS_PER_PAGE,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  };
}

export async function getOpportunityById(id: string, userId?: string) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      company: true,
      tags: { include: { tag: true } },
      mediaFiles: true,
      _count: { select: { favorites: true, applications: true } },
    },
  });

  if (!opportunity) return null;

  // Increment views
  await prisma.opportunity.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  // Check if favorited by user
  let isFavorited = false;
  let hasApplied = false;
  if (userId) {
    const [favorite, application] = await Promise.all([
      prisma.favorite.findFirst({
        where: { userId, opportunityId: id },
      }),
      prisma.application.findFirst({
        where: { userId, opportunityId: id },
      }),
    ]);
    isFavorited = !!favorite;
    hasApplied = !!application;
  }

  return { ...opportunity, isFavorited, hasApplied };
}

export async function createOpportunity(data: OpportunityFormData, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!user?.company) {
    throw new Error('Company not found');
  }

  if (user.company.verificationStatus !== 'verified') {
    throw new Error('Company must be verified to publish opportunities');
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      companyId: user.company.id,
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      type: data.type,
      format: data.format,
      level: data.level,
      employmentType: data.employmentType,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      salaryFrom: data.salaryFrom,
      salaryTo: data.salaryTo,
      startDate: data.startDate,
      endDate: data.endDate,
      deadline: data.deadline,
      status: OpportunityStatus.pending_moderation,
      contacts: data.contacts,
    },
  });

  // Add tags
  if (data.tags.length > 0) {
    const tags = await prisma.tag.findMany({
      where: { name: { in: data.tags } },
    });
    await prisma.opportunityTag.createMany({
      data: tags.map((tag) => ({
        opportunityId: opportunity.id,
        tagId: tag.id,
      })),
    });
  }

  await logAudit(userId, 'create', 'opportunity', opportunity.id, null, opportunity);
  revalidatePath('/catalog');
  return opportunity;
}

export async function updateOpportunity(
  id: string,
  data: Partial<OpportunityFormData>,
  userId: string
) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!opportunity) {
    throw new Error('Opportunity not found');
  }

  if (opportunity.company.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const oldData = { ...opportunity };

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      type: data.type,
      format: data.format,
      level: data.level,
      employmentType: data.employmentType,
      city: data.city,
      address: data.address,
      salaryFrom: data.salaryFrom,
      salaryTo: data.salaryTo,
      deadline: data.deadline,
      contacts: data.contacts,
    },
  });

  // Update tags
  if (data.tags) {
    await prisma.opportunityTag.deleteMany({
      where: { opportunityId: id },
    });
    const tags = await prisma.tag.findMany({
      where: { name: { in: data.tags } },
    });
    await prisma.opportunityTag.createMany({
      data: tags.map((tag) => ({
        opportunityId: id,
        tagId: tag.id,
      })),
    });
  }

  await logAudit(userId, 'update', 'opportunity', id, oldData, updated);
  revalidatePath(`/opportunity/${id}`);
  revalidatePath('/catalog');
  return updated;
}

export async function changeOpportunityStatus(
  id: string,
  status: OpportunityStatus,
  userId: string
) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!opportunity) {
    throw new Error('Opportunity not found');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Only company owner, curator, or admin can change status
  const canModify =
    opportunity.company.userId === userId ||
    user?.role === 'curator' ||
    user?.role === 'admin';

  if (!canModify) {
    throw new Error('Unauthorized');
  }

  const oldData = { status: opportunity.status };
  const updated = await prisma.opportunity.update({
    where: { id },
    data: { status },
  });

  await logAudit(userId, 'status_change', 'opportunity', id, oldData, { status });
  revalidatePath(`/opportunity/${id}`);
  return updated;
}

export async function getEmployerOpportunities(userId: string, status?: OpportunityStatus) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!user?.company) {
    throw new Error('Company not found');
  }

  return prisma.opportunity.findMany({
    where: {
      companyId: user.company.id,
      ...(status && { status }),
      deletedAt: null,
    },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { applications: true, favorites: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOpportunitiesForMap(filters: OpportunityFilters = {}) {
  const where: any = {
    status: OpportunityStatus.active,
    deletedAt: null,
  };

  if (filters.type) where.type = filters.type;
  if (filters.format) where.format = filters.format;
  if (filters.level) where.level = filters.level;

  const opportunities = await prisma.opportunity.findMany({
    where,
    select: {
      id: true,
      title: true,
      type: true,
      format: true,
      latitude: true,
      longitude: true,
      city: true,
      salaryFrom: true,
      salaryTo: true,
      deadline: true,
      company: {
        select: {
          name: true,
          city: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return opportunities.map((opp) => ({
    ...opp,
    lat: opp.latitude || getCityCoordinates(opp.city || opp.company.city).lat,
    lng: opp.longitude || getCityCoordinates(opp.city || opp.company.city).lng,
  }));
}

function getCityCoordinates(city: string): { lat: number; lng: number } {
  const cities: Record<string, { lat: number; lng: number }> = {
    'Москва': { lat: 55.7558, lng: 37.6173 },
    'Санкт-Петербург': { lat: 59.9311, lng: 30.3609 },
    'Новосибирск': { lat: 55.0084, lng: 82.9357 },
    'Екатеринбург': { lat: 56.8389, lng: 60.6057 },
    'Казань': { lat: 55.8304, lng: 49.0661 },
  };
  return cities[city] || { lat: 55.7558, lng: 37.6173 };
}
