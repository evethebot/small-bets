import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, CreditCard, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  const stats = [
    { title: "Total Revenue", value: "$0", change: "+0%", icon: CreditCard },
    { title: "Active Users", value: "0", change: "+0%", icon: Users },
    { title: "Page Views", value: "0", change: "+0%", icon: BarChart3 },
    { title: "Conversion Rate", value: "0%", change: "+0%", icon: Activity },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content area */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              No activity yet. Start building!
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              Add your product-specific actions here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
