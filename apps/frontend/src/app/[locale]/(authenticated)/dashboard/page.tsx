import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            {t('welcome')}
          </h2>

          <div className="space-y-4">
            {/* Placeholder for future dashboard content */}
            <div className="mt-8">
              <p className="text-gray-600">
                Dashboard content will appear here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
