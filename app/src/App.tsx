import { useEffect } from 'react';
import { EditModeProvider } from '@/hooks/useEditMode';
import { EditEntry } from '@/components/custom/EditEntry';
import { PasswordModal } from '@/components/custom/PasswordModal';
import { Hero } from '@/sections/Hero';
import { Timeline } from '@/sections/Timeline';
import { ValueCircles } from '@/sections/ValueCircles';
import { PhilosophySpace } from '@/sections/PhilosophySpace';
import { Footer } from '@/sections/Footer';

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <EditModeProvider>
      <div className="relative min-h-screen text-white overflow-x-hidden">
        {/* Main Content */}
        <main>
          <Hero />
          <Timeline />
          <ValueCircles />
          <PhilosophySpace />
        </main>

        {/* Footer */}
        <Footer />

        {/* Hidden Edit Entry */}
        <EditEntry />

        {/* Password Modal */}
        <PasswordModal />
      </div>
    </EditModeProvider>
  );
}

export default App;
