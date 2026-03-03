import AuthGuard from "@/components/AuthGuard";
import OrganizationClient from "./OrganizationClient";

export default function OrganizationPage() {
  return (
    <AuthGuard>
      <OrganizationClient />
    </AuthGuard>
  );
}