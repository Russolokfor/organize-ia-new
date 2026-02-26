import AuthGuard from "@/components/AuthGuard";
import TodayClient from "./TodayClient";

export default function Home() {
  return (
    <AuthGuard>
      <TodayClient />
    </AuthGuard>
  );
}
