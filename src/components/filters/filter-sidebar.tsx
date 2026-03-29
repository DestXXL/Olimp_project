'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tag } from '@prisma/client';
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_FORMAT_LABELS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from '@/lib/constants';

interface FilterSidebarProps {
  tags: Tag[];
}

export function FilterSidebar({ tags }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createFilterHandler = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);
    
    if (currentValues.includes(value)) {
      params.delete(key);
      currentValues.filter(v => v !== value).forEach(v => params.append(key, v));
    } else {
      params.append(key, value);
    }
    
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/');
  };

  const isChecked = (key: string, value: string) => {
    return searchParams.getAll(key).includes(value);
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Фильтры</CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Сбросить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type Filter */}
        <div>
          <h4 className="font-medium mb-3">Тип</h4>
          <div className="space-y-2">
            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${value}`}
                  checked={isChecked('type', value)}
                  onCheckedChange={() => createFilterHandler('type', value)}
                />
                <Label htmlFor={`type-${value}`} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Format Filter */}
        <div>
          <h4 className="font-medium mb-3">Формат</h4>
          <div className="space-y-2">
            {Object.entries(OPPORTUNITY_FORMAT_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`format-${value}`}
                  checked={isChecked('format', value)}
                  onCheckedChange={() => createFilterHandler('format', value)}
                />
                <Label htmlFor={`format-${value}`} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <h4 className="font-medium mb-3">Уровень</h4>
          <div className="space-y-2">
            {Object.entries(LEVEL_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${value}`}
                  checked={isChecked('level', value)}
                  onCheckedChange={() => createFilterHandler('level', value)}
                />
                <Label htmlFor={`level-${value}`} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <h4 className="font-medium mb-3">Навыки</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {tags.slice(0, 20).map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={isChecked('tags', tag.name)}
                  onCheckedChange={() => createFilterHandler('tags', tag.name)}
                />
                <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer">
                  {tag.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
