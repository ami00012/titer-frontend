import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">{user.name || user.email}</div>
                <div className="text-sm text-secondary-foreground">{user.email}</div>
              </div>
              <div className="flex items-center gap-3">
                {user.suspended && <Badge variant="destructive">Suspended</Badge>}
                <UserActions userId={user.id} suspended={user.suspended} role={user.role} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
