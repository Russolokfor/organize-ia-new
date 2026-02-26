import AuthGuard from "@/components/AuthGuard";
import RoutineClient from "./RoutineClient";

export default function Routine() {
  return (
    <AuthGuard>
      <RoutineClient />
    </AuthGuard>
  );
}