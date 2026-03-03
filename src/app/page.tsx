import AuthGuard from "@/components/AuthGuard";
import OrganizationClient from "@/app/organization/OrganizationClient";

export default function Home() {
  return (
    <AuthGuard>
      <OrganizationClient />
    </AuthGuard>
  );
}