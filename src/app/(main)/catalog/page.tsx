import { Suspense } from 'react';
import { getOpportunities } from '@/actions/opportunities';
import { getAllTags } from '@/actions/tags';
import { OpportunityList } from '@/components/opportunity/opportunity-list';
import { FilterSidebar } from '@/components/filters/filter-sidebar';
import { SearchBar } from '@/components/search-bar';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  const format = typeof searchParams.format === 'string' ? searchParams.format : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

  const [opportunitiesData, tags] = await Promise.all([
    getOpportunities({
      search,
      type: type as any,
      format: format as any,
      city,
    }, page),
    getAllTags(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Каталог возможностей</h1>
          <p className="mt-2 text-gray-600">
            Найдите стажировку, вакансию или менторскую программу
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SearchBar initialSearch={search} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="hidden lg:block">
            <FilterSidebar tags={tags} />
          </div>

          <div className="lg:col-span-3">
            <Suspense fallback={<div>Загрузка...</div>}>
              <OpportunityList
                opportunities={opportunitiesData.data}
                totalPages={opportunitiesData.totalPages}
                currentPage={page}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
