import type { Metadata } from 'next';
import AnalyticsDashboard from './AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics | Easy Corten Admin',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
