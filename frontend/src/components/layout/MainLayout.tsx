import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 250, background: '#1a1a2e', color: '#fff', padding: 20 }}>
        <h2>RMS</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/rooms">Rooms</a></li>
            <li><a href="/tenants">Tenants</a></li>
            <li><a href="/contracts">Contracts</a></li>
            <li><a href="/invoices">Invoices</a></li>
            <li><a href="/repairs">Repairs</a></li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
