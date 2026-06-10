import Navbar from "@/components/site/Navbar/Navbar";
import AnalyticsTracker from "@/components/site/AnalyticsTracker/AnalyticsTracker";
import SmoothScroll from "@/components/ui/SmoothScroll/SmoothScroll";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SmoothScroll>
      <Navbar />
      <AnalyticsTracker />
      {children}
    </SmoothScroll>
  );
}
