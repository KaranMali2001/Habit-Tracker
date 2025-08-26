import ErrorPage from "@/components/errorPage";
import Dashboard from "../dashboard";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const today = new Date(
    new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
  );
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  try {
    let [tasks, notes] = await Promise.all([
      prisma.dailyTask.findMany({
        where: {
          userId: user.id,
          date: today,
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      }),
      prisma.dailyNote.findFirst({
        where: {
          userId: user.id,
          date: today,
        },
        include: {
          tasks: true,
        },
      }),
    ]);
    if (!notes) {
      notes = await prisma.dailyNote.create({
        data: {
          userId: user.id,
          date: today,
        },
        include: {
          tasks: true,
        },
      });
    }

    return <Dashboard task={tasks} note={notes} />;
  } catch (error) {
    console.error("Failed to fetch day data:", error);
    return (
      <div>
        <ErrorPage />
      </div>
    );
  }
}
