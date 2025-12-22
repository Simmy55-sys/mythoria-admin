import AdminDashboard from "@/components/pages/dashboard";
import { ProtectedRoute } from "@/components/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
