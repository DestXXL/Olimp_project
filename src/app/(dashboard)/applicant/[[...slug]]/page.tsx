import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { getUserApplications } from '@/actions/applications';
import { getUserFavorites } from '@/actions/favorites';
import { getUserContacts, getPendingContactRequests } from '@/actions/contacts';
import { formatDate } from '@/lib/utils';
import { APPLICATION_STATUS_LABELS } from '@/lib/constants';
import { Briefcase, Heart, Users, Settings, FileText } from 'lucide-react';

export default async function ApplicantDashboard({
  params,
}: {
  params: { slug?: string[] };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'applicant') {
    redirect('/login');
  }

  const userId = session.user.id;
  const page = params.slug?.[0] || 'overview';

  // Fetch data based on page
  const [profile, applications, favorites, contacts, pendingRequests] = await Promise.all([
    prisma.applicantProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { tag: true } },
        projects: true,
        experiences: true,
      },
    }),
    getUserApplications(userId),
    getUserFavorites(userId),
    getUserContacts(userId),
    getPendingContactRequests(userId),
  ]);

  if (!profile) {
    return <div>Профиль не найден</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <p className="text-gray-600">Добро пожаловать, {profile.fullName}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-2">
          <Link href="/applicant">
            <Button variant={page === 'overview' ? 'default' : 'ghost'} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Обзор
            </Button>
          </Link>
          <Link href="/applicant/profile">
            <Button variant={page === 'profile' ? 'default' : 'ghost'} className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Профиль
            </Button>
          </Link>
          <Link href="/applicant/applications">
            <Button variant={page === 'applications' ? 'default' : 'ghost'} className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Отклики ({applications.length})
            </Button>
          </Link>
          <Link href="/applicant/favorites">
            <Button variant={page === 'favorites' ? 'default' : 'ghost'} className="w-full justify-start">
              <Heart className="mr-2 h-4 w-4" />
              Избранное ({favorites.length})
            </Button>
          </Link>
          <Link href="/applicant/contacts">
            <Button variant={page === 'contacts' ? 'default' : 'ghost'} className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Контакты ({contacts.length})
            </Button>
          </Link>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {page === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Отклики</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{applications.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">В избранном</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{favorites.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Контакты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contacts.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>Последние отклики</CardTitle>
                </CardHeader>
                <CardContent>
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between border-b py-3 last:border-0">
                      <div>
                        <p className="font-medium">{app.opportunity.title}</p>
                        <p className="text-sm text-gray-500">{app.opportunity.company.name}</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </span>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <p className="text-gray-500">У вас пока нет откликов</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {page === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Профиль</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">ФИО</h4>
                  <p className="text-gray-600">{profile.fullName}</p>
                </div>
                <div>
                  <h4 className="font-medium">Университет</h4>
                  <p className="text-gray-600">{profile.university}</p>
                </div>
                <div>
                  <h4 className="font-medium">Факультет</h4>
                  <p className="text-gray-600">{profile.faculty || 'Не указан'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Курс / Год выпуска</h4>
                  <p className="text-gray-600">
                    {profile.course ? `${profile.course} курс` : ''}
                    {profile.graduationYear ? ` / ${profile.graduationYear}` : ''}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Город</h4>
                  <p className="text-gray-600">{profile.city}</p>
                </div>
                <div>
                  <h4 className="font-medium">Навыки</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.skills.map(({ tag }) => (
                      <span key={tag.id} className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {page === 'applications' && (
            <Card>
              <CardHeader>
                <CardTitle>Мои отклики</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.map((app) => (
                  <div key={app.id} className="border-b py-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{app.opportunity.title}</h4>
                        <p className="text-sm text-gray-500">{app.opportunity.company.name}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          Отклик отправлен: {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </span>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p className="text-gray-500">У вас пока нет откликов</p>
                )}
              </CardContent>
            </Card>
          )}

          {page === 'favorites' && (
            <Card>
              <CardHeader>
                <CardTitle>Избранное</CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.map(({ opportunity }) => (
                  <div key={opportunity.id} className="border-b py-4 last:border-0">
                    <Link href={`/opportunity/${opportunity.id}`}>
                      <h4 className="font-medium hover:text-primary">{opportunity.title}</h4>
                    </Link>
                    <p className="text-sm text-gray-500">{opportunity.company.name}</p>
                  </div>
                ))}
                {favorites.length === 0 && (
                  <p className="text-gray-500">У вас пока нет избранных возможностей</p>
                )}
              </CardContent>
            </Card>
          )}

          {page === 'contacts' && (
            <Card>
              <CardHeader>
                <CardTitle>Профессиональные контакты</CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="mb-4 font-medium">Мои контакты ({contacts.length})</h4>
                {contacts.map((contact) => {
                  const otherPerson = contact.senderId === userId ? contact.receiver : contact.sender;
                  return (
                    <div key={contact.id} className="flex items-center gap-3 border-b py-3 last:border-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {otherPerson.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{otherPerson.displayName}</p>
                        <p className="text-sm text-gray-500">{otherPerson.email}</p>
                      </div>
                    </div>
                  );
                })}
                {contacts.length === 0 && (
                  <p className="text-gray-500">У вас пока нет контактов</p>
                )}

                {pendingRequests.received.length > 0 && (
                  <>
                    <h4 className="mb-4 mt-6 font-medium">Входящие запросы</h4>
                    {pendingRequests.received.map((request) => (
                      <div key={request.id} className="flex items-center justify-between border-b py-3">
                        <div>
                          <p className="font-medium">{request.sender.displayName}</p>
                          <p className="text-sm text-gray-500">{request.message}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Принять</Button>
                          <Button size="sm" variant="ghost">Отклонить</Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
