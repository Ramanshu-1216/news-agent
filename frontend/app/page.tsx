import { SessionGuard } from "@/components/layout/session-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function Home() {
  return (
    <SessionGuard>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </SessionGuard>
  );
}
