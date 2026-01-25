/**
 * Admin Layout
 *
 * Protected admin area layout with sidebar navigation and header
 * Verifies authentication and redirects to login if not authenticated
 */

import { redirect } from 'next/navigation';
import { verifySessionFromCookies } from '@/lib/auth/session';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify authentication
  const user = await verifySessionFromCookies();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-carbon">
      {/* Sidebar - Desktop and Mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header userName={user.name} userEmail={user.email} />

        {/* Page Content */}
        <main className="px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
