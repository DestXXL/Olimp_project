import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getPendingVerifications } from '@/actions/moderation';
import { getModerationQueue, getReports } from '@/actions/moderation';
import { formatDate } from '@/lib/utils';
import {
  VERIFICATION_STATUS_LABELS,
  MODERATION_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  STATUS_COLORS,
} from '@/lib/constants';
import { CheckCircle, AlertCircle, FileText, Users, Shield, Flag } from 'lucide-react';

export default async function CuratorDashboard({
  params,
}: {
  params: { slug?: string[] };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'curator') {
    redirect('/login');
  }

  const page = params.slug?.[0] || 'overview';

  const [verifications, moderationQueue, reports] = await Promise.all([
    getPendingVerifications(),
    getModerationQueue('pending'),
    getReports('pending'),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Кабинет куратора</h1>
        <p className="text-gray-600">Модерация и управление платформой</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-2">
          <Link href="/curator">
            <Button variant={page === 'overview' ? 'default' : 'ghost'} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Обзор
            </Button>
          </Link>
          <Link href="/curator/verifications">
            <Button variant={page === 'verifications' ? 'default' : 'ghost'} className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Верификации ({verifications.length})
            </Button>
          </Link>
          <Link href="/curator/moderation">
            <Button variant={page === 'moderation' ? 'default' : 'ghost'} className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Модерация ({moderationQueue.length})
            </Button>
          </Link>
          <Link href="/curator/reports">
            <Button variant={page === 'reports' ? 'default' : 'ghost'} className="w-full justify-start">
              <Flag className="mr-2 h-4 w-4" />
              Жалобы ({reports.length})
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
                    <CardTitle className="text-sm font-medium text-gray-500">На верификации</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{verifications.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">На модерации</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{moderationQueue.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Жалобы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reports.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Верификации компаний</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {verifications.slice(0, 3).map((v) => (
                      <div key={v.id} className="border-b py-2 last:border-0">
                        <p className="font-medium">{v.company.name}</p>
                        <p className="text-sm text-gray-500">ИНН: {v.inn}</p>
                      </div>
                    ))}
                    {verifications.length === 0 && (
                      <p className="text-gray-500">Нет заявок на верификацию</p>
                    )}
                    <Link href="/curator/verifications">
                      <Button variant="link" className="mt-2 p-0">Все заявки</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Жалобы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reports.slice(0, 3).map((r) => (
                      <div key={r.id} className="border-b py-2 last:border-0">
                        <p className="font-medium">{r.target.displayName}</p>
                        <p className="text-sm text-gray-500">Причина: {r.reason}</p>
                      </div>
                    ))}
                    {reports.length === 0 && (
                      <p className="text-gray-500">Нет жалоб</p>
                    )}
                    <Link href="/curator/reports">
                      <Button variant="link" className="mt-2 p-0">Все жалобы</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {page === 'verifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Заявки на верификацию</CardTitle>
              </CardHeader>
              <CardContent>
                {verifications.map((v) => (
                  <div key={v.id} className="border-b py-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{v.company.name}</h4>
                        <p className="text-sm text-gray-500">ИНН: {v.inn}</p>
                        <p className="text-sm text-gray-500">Email: {v.corporateEmail}</p>
                        {v.website && (
                          <p className="text-sm text-gray-500">Сайт: {v.website}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Подано: {formatDate(v.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Одобрить</Button>
                        <Button size="sm" variant="ghost">Отклонить</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {verifications.length === 0 && (
                  <p className="text-gray-500">Нет заявок на верификацию</p>
                )}
              </CardContent>
            </Card>
          )}

          {page === 'moderation' && (
            <Card>
              <CardHeader>
                <CardTitle>Очередь модерации</CardTitle>
              </CardHeader>
              <CardContent>
                {moderationQueue.map((item) => (
                  <div key={item.id} className="border-b py-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.targetType}</h4>
                        <p className="text-sm text-gray-500">Тип: {item.type}</p>
                        {item.reason && (
                          <p className="text-sm text-gray-500">Причина: {item.reason}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Создано: {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Одобрить</Button>
                        <Button size="sm" variant="ghost">Отклонить</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {moderationQueue.length === 0 && (
                  <p className="text-gray-500">Очередь модерации пуста</p>
                )}
              </CardContent>
            </Card>
          )}

          {page === 'reports' && (
            <Card>
              <CardHeader>
                <CardTitle>Жалобы</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.map((report) => (
                  <div key={report.id} className="border-b py-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Жалоба на: {report.target.displayName}</h4>
                        <p className="text-sm text-gray-500">Причина: {report.reason}</p>
                        {report.description && (
                          <p className="text-sm text-gray-500">Описание: {report.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Подана: {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Решить</Button>
                        <Button size="sm" variant="ghost">Отклонить</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-gray-500">Нет жалоб</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
