import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { getAuditLogs } from '@/actions/audit';
import { formatDate } from '@/lib/utils';
import { Users, FileText, Shield, Activity } from 'lucide-react';

export default async function AdminDashboard({
  params,
}: {
  params: { slug?: string[] };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const page = params.slug?.[0] || 'overview';

  const [users, curators, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'curator' } }),
    getAuditLogs({}, 1, 10),
  ]);

  const stats = await prisma.$queryRaw`
    SELECT 
      (SELECT COUNT(*) FROM opportunities) as opportunities,
      (SELECT COUNT(*) FROM applications) as applications,
      (SELECT COUNT(*) FROM companies) as companies
  `;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Панель администратора</h1>
        <p className="text-gray-600">Управление системой и пользователями</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-2">
          <Link href="/admin">
            <Button variant={page === 'overview' ? 'default' : 'ghost'} className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Обзор
            </Button>
          </Link>
          <Link href="/admin/curators">
            <Button variant={page === 'curators' ? 'default' : 'ghost'} className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Кураторы
            </Button>
          </Link>
          <Link href="/admin/audit">
            <Button variant={page === 'audit' ? 'default' : 'ghost'} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Журнал действий
            </Button>
          </Link>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {page === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Пользователей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Компаний</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(stats as any)[0]?.companies || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Возможностей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(stats as any)[0]?.opportunities || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Откликов</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(stats as any)[0]?.applications || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Последние действия</CardTitle>
                </CardHeader>
                <CardContent>
                  {auditLogs.data.map((log) => (
                    <div key={log.id} className="border-b py-2 last:border-0">
                      <p className="text-sm">
                        <span className="font-medium">{log.user?.displayName || 'Система'}</span>
                        {' '}{log.action}{' '}
                        <span className="text-gray-500">{log.entityType}</span>
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {page === 'curators' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Создать куратора</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="curator@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Имя</Label>
                      <Input id="displayName" placeholder="Имя куратора" />
                    </div>
                    <Button type="submit">Создать куратора</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Список кураторов</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* List of curators would go here */}
                  <p className="text-gray-500">Кураторы будут отображены здесь</p>
                </CardContent>
              </Card>
            </div>
          )}

          {page === 'audit' && (
            <Card>
              <CardHeader>
                <CardTitle>Журнал действий</CardTitle>
              </CardHeader>
              <CardContent>
                {auditLogs.data.map((log) => (
                  <div key={log.id} className="border-b py-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{log.user?.displayName || 'Система'}</span>
                          {' '}{log.action}{' '}
                          <span className="text-gray-500">{log.entityType}</span>
                        </p>
                        {log.entityId && (
                          <p className="text-xs text-gray-400">ID: {log.entityId}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
