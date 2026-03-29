'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createApplication } from '@/actions/applications';
import { Loader2, CheckCircle, XCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApplyButtonProps {
  opportunityId: string;
  userId: string;
  hasApplied: boolean;
  opportunityTitle: string;
}

export function ApplyButton({ opportunityId, userId, hasApplied: initialHasApplied, opportunityTitle }: ApplyButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(initialHasApplied);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleApply = async () => {
    setIsLoading(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      await createApplication(opportunityId, userId, {});
      setHasApplied(true);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка');
      setShowError(true);
      
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasApplied) {
    return (
      <Button className="w-full" disabled variant="secondary">
        <CheckCircle className="mr-2 h-4 w-4" />
        Вы уже откликнулись
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <Button 
        className="w-full relative overflow-hidden" 
        onClick={handleApply}
        disabled={isLoading}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </motion.span>
          ) : (
            <motion.span
              key="apply"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center"
            >
              <Send className="mr-2 h-4 w-4" />
              Откликнуться
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
              </motion.div>
              <div className="flex-1">
                <h4 className="font-medium text-green-900">Отклик отправлен!</h4>
                <p className="text-sm text-green-700 mt-1">
                  Вы успешно откликнулись на «{opportunityTitle}». Работодатель получил вашу заявку.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Отклик добавлен в ваш личный кабинет
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                <XCircle className="h-5 w-5 text-red-600" />
              </motion.div>
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Ошибка</h4>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
