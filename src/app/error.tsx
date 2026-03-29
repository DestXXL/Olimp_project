'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gray-900">Произошла ошибка</h1>
      <p className="mt-4 text-gray-600">
        Что-то пошло не так. Попробуйте обновить страницу.
      </p>
      <Button onClick={reset} className="mt-8">
        Попробовать снова
      </Button>
    </div>
  );
}
