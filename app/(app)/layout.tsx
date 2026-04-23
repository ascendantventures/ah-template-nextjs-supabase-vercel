import { LiveTicker } from '@/components/ticker/LiveTicker';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      {/* Ticker at very top */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <LiveTicker />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* TopBar */}
      <TopBar />

      {/* Main content */}
      <main
        style={{
          marginLeft: 220,
          paddingTop: 92, /* ticker 36 + topbar 56 */
          minHeight: '100vh',
          background: '#020617',
        }}
      >
        <div style={{ padding: '24px' }}>{children}</div>
      </main>
    </div>
  );
}
