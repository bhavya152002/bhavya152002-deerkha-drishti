import StreamGrid from '@/components/StreamGrid';
import AlertsPanel from '@/components/AlertsPanel';

export default function Home() {
  return (
    <main className="flex h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <StreamGrid />
      </div>

      {/* Sidebar - Alerts */}
      <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col z-20 shadow-2xl h-full">
        <AlertsPanel />
      </div>
    </main>
  );
}
