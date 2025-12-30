import { LandlordsSection } from '@/components/landing/landlords/landlords-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function ForLandlordsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <LandlordsSection />
      </main>
      <Footer />
    </div>
  );
}
