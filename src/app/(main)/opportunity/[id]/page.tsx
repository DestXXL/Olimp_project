import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getOpportunityById } from '@/actions/opportunities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatSalary } from '@/lib/utils';
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_FORMAT_LABELS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from '@/lib/constants';
import { MapPin, Calendar, DollarSign, Building2, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ApplyButton } from '@/components/opportunity/ApplyButton';

interface OpportunityPageProps {
  params: { id: string };
}

export default async function OpportunityPage({ params }: OpportunityPageProps) {
  const session = await getServerSession(authOptions);
  const opportunity = await getOpportunityById(params.id, session?.user?.id);

  if (!opportunity) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">
            {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
          </Badge>
          <Badge variant="outline">
            {OPPORTUNITY_FORMAT_LABELS[opportunity.format]}
          </Badge>
          <Badge variant="outline">{LEVEL_LABELS[opportunity.level]}</Badge>
          <Badge variant="outline">
            {EMPLOYMENT_TYPE_LABELS[opportunity.employmentType]}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold">{opportunity.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-gray-600">
          <Link href={`/company/${opportunity.company.id}`} className="flex items-center gap-2 hover:text-primary">
            <Building2 className="h-5 w-5" />
            {opportunity.company.name}
          </Link>
          {opportunity.city && (
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {opportunity.city}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{opportunity.fullDescription}</p>
            </CardContent>
          </Card>

          {opportunity.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Требования</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{opportunity.requirements}</p>
              </CardContent>
            </Card>
          )}

          {opportunity.responsibilities && (
            <Card>
              <CardHeader>
                <CardTitle>Обязанности</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{opportunity.responsibilities}</p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <div>
            <h3 className="mb-3 font-medium">Теги</h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {(opportunity.salaryFrom || opportunity.salaryTo) && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Зарплата</p>
                      <p className="font-medium">
                        {formatSalary(opportunity.salaryFrom, opportunity.salaryTo, opportunity.salaryCurrency)}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Дедлайн</p>
                      <p className="font-medium">{formatDate(opportunity.deadline)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Опубликовано</p>
                    <p className="font-medium">
                      {opportunity.publishedAt ? formatDate(opportunity.publishedAt) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {session?.user?.role === 'applicant' && session?.user?.id && (
                  <ApplyButton
                    opportunityId={opportunity.id}
                    userId={session.user.id}
                    hasApplied={opportunity.hasApplied}
                    opportunityTitle={opportunity.title}
                  />
                )}
                {(!session || session?.user?.role !== 'applicant') && (
                  <Link href="/login">
                    <Button className="w-full">Войдите, чтобы откликнуться</Button>
                  </Link>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="mr-2 h-4 w-4" />
                    В избранное
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company info */}
          <Card>
            <CardHeader>
              <CardTitle>О компании</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{opportunity.company.description}</p>
              <Link href={`/company/${opportunity.company.id}`}>
                <Button variant="link" className="mt-4 p-0">
                  Подробнее о компании
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
