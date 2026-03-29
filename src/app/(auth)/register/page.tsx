'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { registerApplicant, registerEmployer } from '@/actions/auth';
import { CITIES, UNIVERSITIES } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('applicant');

  // Applicant form
  const [applicantData, setApplicantData] = useState({
    email: '',
    password: '',
    displayName: '',
    fullName: '',
    university: '',
    faculty: '',
    course: '',
    graduationYear: '',
    city: '',
  });

  // Employer form
  const [employerData, setEmployerData] = useState({
    email: '',
    password: '',
    displayName: '',
    companyName: '',
    inn: '',
    website: '',
    description: '',
    city: '',
    address: '',
  });

  const handleApplicantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerApplicant({
        ...applicantData,
        graduationYear: applicantData.graduationYear
          ? parseInt(applicantData.graduationYear)
          : undefined,
      });
      toast.success('Регистрация успешна! Теперь вы можете войти.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerEmployer(employerData);
      toast.success('Регистрация успешна! Теперь вы можете войти.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт для доступа к платформе
          </CardDescription>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applicant">Соискатель</TabsTrigger>
            <TabsTrigger value="employer">Работодатель</TabsTrigger>
          </TabsList>

          <TabsContent value="applicant">
            <form onSubmit={handleApplicantSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-email">Email</Label>
                    <Input
                      id="app-email"
                      type="email"
                      value={applicantData.email}
                      onChange={(e) =>
                        setApplicantData({ ...applicantData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-password">Пароль</Label>
                    <Input
                      id="app-password"
                      type="password"
                      value={applicantData.password}
                      onChange={(e) =>
                        setApplicantData({ ...applicantData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-displayName">Имя пользователя</Label>
                  <Input
                    id="app-displayName"
                    value={applicantData.displayName}
                    onChange={(e) =>
                      setApplicantData({ ...applicantData, displayName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-fullName">ФИО</Label>
                  <Input
                    id="app-fullName"
                    value={applicantData.fullName}
                    onChange={(e) =>
                      setApplicantData({ ...applicantData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-university">ВУЗ</Label>
                    <select
                      id="app-university"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={applicantData.university}
                      onChange={(e) =>
                        setApplicantData({ ...applicantData, university: e.target.value })
                      }
                      required
                    >
                      <option value="">Выберите ВУЗ</option>
                      {UNIVERSITIES.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-city">Город</Label>
                    <select
                      id="app-city"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={applicantData.city}
                      onChange={(e) =>
                        setApplicantData({ ...applicantData, city: e.target.value })
                      }
                      required
                    >
                      <option value="">Выберите город</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Уже есть аккаунт?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Войти
                  </Link>
                </p>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="employer">
            <form onSubmit={handleEmployerSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emp-email">Email</Label>
                    <Input
                      id="emp-email"
                      type="email"
                      value={employerData.email}
                      onChange={(e) =>
                        setEmployerData({ ...employerData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-password">Пароль</Label>
                    <Input
                      id="emp-password"
                      type="password"
                      value={employerData.password}
                      onChange={(e) =>
                        setEmployerData({ ...employerData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-displayName">Имя пользователя</Label>
                  <Input
                    id="emp-displayName"
                    value={employerData.displayName}
                    onChange={(e) =>
                      setEmployerData({ ...employerData, displayName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-companyName">Название компании</Label>
                  <Input
                    id="emp-companyName"
                    value={employerData.companyName}
                    onChange={(e) =>
                      setEmployerData({ ...employerData, companyName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emp-inn">ИНН</Label>
                    <Input
                      id="emp-inn"
                      value={employerData.inn}
                      onChange={(e) =>
                        setEmployerData({ ...employerData, inn: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-city">Город</Label>
                    <select
                      id="emp-city"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={employerData.city}
                      onChange={(e) =>
                        setEmployerData({ ...employerData, city: e.target.value })
                      }
                      required
                    >
                      <option value="">Выберите город</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Уже есть аккаунт?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Войти
                  </Link>
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
