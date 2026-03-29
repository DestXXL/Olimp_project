import Link from 'next/link';
import { OpportunityWithDetails } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatSalary, formatDate, truncateText } from '@/lib/utils';
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_FORMAT_LABELS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from '@/lib/constants';
import { MapPin, Calendar, DollarSign, Building2, Heart, Eye } from 'lucide-react';

interface OpportunityListProps {
  opportunities: OpportunityWithDetails[];
  totalPages: number;
  currentPage: number;
}

export function OpportunityList({
  opportunities,
  totalPages,
  currentPage,
}: OpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-4">
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Возможностей не найдено</h3>
        <p className="mt-2 text-sm text-gray-500">
          Попробуйте изменить параметры поиска или фильтры
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/?page=${page}`}
              className={`rounded-md px-3 py-1 text-sm ${
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: OpportunityWithDetails }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
              </Badge>
              <Badge variant="outline">
                {OPPORTUNITY_FORMAT_LABELS[opportunity.format]}
              </Badge>
              <Badge variant="outline">{LEVEL_LABELS[opportunity.level]}</Badge>
            </div>
            <h3 className="mt-2 text-lg font-semibold">
              <Link href={`/opportunity/${opportunity.id}`} className="hover:text-primary">
                {opportunity.title}
              </Link>
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Building2 className="h-4 w-4" />
              <span>{opportunity.company.name}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-gray-600">
          {truncateText(opportunity.shortDescription, 150)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {opportunity.tags.slice(0, 5).map(({ tag }) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {opportunity.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {opportunity.city}
            </span>
          )}
          {(opportunity.salaryFrom || opportunity.salaryTo) && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatSalary(opportunity.salaryFrom, opportunity.salaryTo, opportunity.salaryCurrency)}
            </span>
          )}
          {opportunity.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              до {formatDate(opportunity.deadline)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {opportunity.views}
          </span>
          <Link href={`/opportunity/${opportunity.id}`}>
            <Button size="sm">Подробнее</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
