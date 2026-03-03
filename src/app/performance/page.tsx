import AuthGuard from "@/components/AuthGuard";
import PerformanceClient from "./PerformanceClient";

export default function PerformancePage() {
  return (
    <AuthGuard>
      <PerformanceClient />
    </AuthGuard>
  );
}