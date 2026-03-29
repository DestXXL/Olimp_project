import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-700">Страница не найдена</h2>
      <p className="mt-2 text-gray-500">
        Запрашиваемая страница не существует или была удалена.
      </p>
      <Link href="/" className="mt-8">
        <Button>Вернуться на главную</Button>
      </Link>
    </div>
  );
}
