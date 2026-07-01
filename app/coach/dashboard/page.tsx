import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function CoachDashboardPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "coach") redirect("/athlete/dashboard");

  return (
    <main className="flex-1 p-8">
      <h1 className="text-xl font-semibold">Dashboard coach</h1>
      <p className="mt-2 text-sm text-gray-600">
        Bienvenue {session.user.name}. La liste des athlètes arrivera en Phase 3.
      </p>
    </main>
  );
}
