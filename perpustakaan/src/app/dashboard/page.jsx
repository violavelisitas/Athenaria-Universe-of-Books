import { redirect } from "next/navigation";
import { requireLogin } from "@/lib/auth";

export default async function DashboardRedirect() {
  const user = await requireLogin();
  redirect(`/dashboard/${user.role}`);
}