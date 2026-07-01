import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AthleteDashboardPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "athlete") redirect("/coach/dashboard");

  return (
    <main className="flex-1 p-8">
      <h1 className="text-xl font-semibold">Dashboard athlète</h1>
      <p className="mt-2 text-sm text-gray-600">
        Bienvenue {session.user.name}. La connexion Strava et l&apos;objectif arriveront en Phase 1.
      </p>
    </main>
  );
}
