import { Suspense } from 'react';
import { getOpportunities, getOpportunitiesForMap } from '@/actions/opportunities';
import { getAllTags } from '@/actions/tags';
import { HeroSection } from '@/components/hero-section';
import { OpportunityList } from '@/components/opportunity/opportunity-list';
import { MapView } from '@/components/map/map-view';
import { FilterSidebar } from '@/components/filters/filter-sidebar';
import { SearchBar } from '@/components/search-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  const format = typeof searchParams.format === 'string' ? searchParams.format : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

  const [opportunitiesData, mapOpportunities, tags] = await Promise.all([
    getOpportunities({
      search,
      type: type as any,
      format: format as any,
      city,
    }, page),
    getOpportunitiesForMap({
      type: type as any,
      format: format as any,
    }),
    getAllTags(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SearchBar initialSearch={search} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters */}
          <div className="hidden lg:block">
            <FilterSidebar tags={tags} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="list" className="w-full">
              <div className="mb-4 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="list">Список</TabsTrigger>
                  <TabsTrigger value="map">Карта</TabsTrigger>
                </TabsList>
                <span className="text-sm text-gray-500">
                  Найдено: {opportunitiesData.total}
                </span>
              </div>

              <TabsContent value="list">
                <Suspense fallback={<div>Загрузка...</div>}>
                  <OpportunityList 
                    opportunities={opportunitiesData.data} 
                    totalPages={opportunitiesData.totalPages}
                    currentPage={page}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="map" className="h-[600px]">
                <MapView opportunities={mapOpportunities} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
