import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getEmployerOpportunities } from '@/actions/opportunities';
import { getVerificationStatus } from '@/actions/verification';
import { formatDate } from '@/lib/utils';
import {
  OPPORTUNITY_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  STATUS_COLORS,
} from '@/lib/constants';
import { Briefcase, Building2, FileText, Settings, AlertCircle, CheckCircle } from 'lucide-react';

export default async function EmployerDashboard({
  params,
}: {
  params: { slug?: string[] };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'employer') {
    redirect('/login');
  }

  const userId = session.user.id;
  const page = params.slug?.[0] || 'overview';

  const [company, opportunities, verification] = await Promise.all([
    prisma.company.findUnique({
      where: { userId },
    }),
    getEmployerOpportunities(userId),
    getVerificationStatus(userId),
  ]);

  if (!company) {
    return <div>Компания не найдена</div>;
  }

  const isVerified = company.verificationStatus === 'verified';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Кабинет работодателя</h1>
        <p className="text-gray-600">{company.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-2">
          <Link href="/employer">
            <Button variant={page === 'overview' ? 'default' : 'ghost'} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Обзор
            </Button>
          </Link>
          <Link href="/employer/company">
            <Button variant={page === 'company' ? 'default' : 'ghost'} className="w-full justify-start">
              <Building2 className="mr-2 h-4 w-4" />
              Профиль компании
            </Button>
          </Link>
          <Link href="/employer/opportunities">
            <Button variant={page === 'opportunities' ? 'default' : 'ghost'} className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Возможности ({opportunities.length})
            </Button>
          </Link>
          <Link href="/employer/verification">
            <Button variant={page === 'verification' ? 'default' : 'ghost'} className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Верификация
            </Button>
          </Link>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {!isVerified && page !== 'verification' && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  Ваша компания не верифицирована. 
                  <Link href="/employer/verification" className="ml-1 underline">
                    Пройдите верификацию
                  </Link>
                  , чтобы публиковать возможности.
                </span>
              </div>
            </div>
          )}

          {page === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Всего возможностей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{opportunities.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Активных</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {opportunities.filter(o => o.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Всего откликов</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {opportunities.reduce((sum, o) => sum + (o._count?.applications || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Opportunities */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Последние возможности</CardTitle>
                  {isVerified && (
                    <Link href="/employer/opportunities/new">
                      <Button size="sm">Создать</Button>
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  {opportunities.slice(0, 5).map((opp) => (
                    <div key={opp.id} className="flex items-center justify-between border-b py-3 last:border-0">
                      <div>
                        <p className="font-medium">{opp.title}</p>
                        <p className="text-sm text-gray-500">
                          {opp._count?.applications || 0} откликов
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[opp.status] || 'bg-gray-100'}`}>
                        {OPPORTUNITY_STATUS_LABELS[opp.status]}
                      </span>
                    </div>
                  ))}
                  {opportunities.length === 0 && (
                    <p className="text-gray-500">У вас пока нет возможностей</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {page === 'company' && (
            <Card>
              <CardHeader>
                <CardTitle>Профиль компании</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Название</h4>
                  <p className="text-gray-600">{company.name}</p>
                </div>
                <div>
                  <h4 className="font-medium">ИНН</h4>
                  <p className="text-gray-600">{company.inn || 'Не указан'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Сайт</h4>
                  <p className="text-gray-600">{company.website || 'Не указан'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Город</h4>
                  <p className="text-gray-600">{company.city}</p>
                </div>
                <div>
                  <h4 className="font-medium">Адрес</h4>
                  <p className="text-gray-600">{company.address || 'Не указан'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Описание</h4>
                  <p className="text-gray-600">{company.description || 'Не указано'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Статус верификации</h4>
                  <Badge className={STATUS_COLORS[company.verificationStatus] || ''}>
                    {VERIFICATION_STATUS_LABELS[company.verificationStatus]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {page === 'opportunities' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Мои возможности</CardTitle>
                {isVerified && (
                  <Link href="/employer/opportunities/new">
                    <Button>Создать возможность</Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {opportunities.map((opp) => (
                  <div key={opp.id} className="border-b py-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{opp.title}</h4>
                        <p className="text-sm text-gray-500">
                          Создано: {formatDate(opp.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Откликов: {opp._count?.applications || 0}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[opp.status] || 'bg-gray-100'}`}>
                        {OPPORTUNITY_STATUS_LABELS[opp.status]}
                      </span>
                    </div>
                  </div>
                ))}
                {opportunities.length === 0 && (
                  <p className="text-gray-500">У вас пока нет возможностей</p>
                )}
              </CardContent>
            </Card>
          )}

          {page === 'verification' && (
            <Card>
              <CardHeader>
                <CardTitle>Верификация компании</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium">Текущий статус</h4>
                  <Badge className={`mt-2 ${STATUS_COLORS[company.verificationStatus] || ''}`}>
                    {VERIFICATION_STATUS_LABELS[company.verificationStatus]}
                  </Badge>
                </div>

                {verification?.curatorNotes && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="font-medium">Комментарий куратора</h4>
                    <p className="mt-1 text-gray-600">{verification.curatorNotes}</p>
                  </div>
                )}

                {company.verificationStatus === 'draft' && (
                  <div>
                    <p className="mb-4 text-gray-600">
                      Для публикации возможностей необходимо пройти верификацию компании. 
                      Заполните форму ниже:
                    </p>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium">ИНН</label>
                        <input type="text" className="mt-1 block w-full rounded-md border px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Корпоративный email</label>
                        <input type="email" className="mt-1 block w-full rounded-md border px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Сайт компании</label>
                        <input type="url" className="mt-1 block w-full rounded-md border px-3 py-2" />
                      </div>
                      <Button type="submit">Подать заявку на верификацию</Button>
                    </form>
                  </div>
                )}

                {company.verificationStatus === 'pending' && (
                  <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                    <p>Ваша заявка на верификацию находится на рассмотрении.</p>
                  </div>
                )}

                {company.verificationStatus === 'verified' && (
                  <div className="rounded-lg bg-green-50 p-4 text-green-800">
                    <p>Ваша компания успешно верифицирована! Теперь вы можете публиковать возможности.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
