import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Briefcase, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Найдите свою возможность в IT
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Трамплин — карьерная платформа для студентов, выпускников и работодателей. 
            Стажировки, вакансии, менторство и карьерные события в одном месте.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/catalog">
              <Button size="lg" variant="secondary" className="gap-2">
                <Search className="h-4 w-4" />
                Найти возможность
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Присоединиться
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-white/10 p-4">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Стажировки и вакансии</h3>
            <p className="mt-2 text-blue-100">Найдите работу мечты в ведущих IT-компаниях</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-white/10 p-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Менторство</h3>
            <p className="mt-2 text-blue-100">Получите поддержку от опытных профессионалов</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-white/10 p-4">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Карьерные события</h3>
            <p className="mt-2 text-blue-100">Участвуйте в митапах, хакатонах и ярмарках</p>
          </div>
        </div>
      </div>
    </div>
  );
}
