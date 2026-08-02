"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api/client";
import { getMembers, inviteMember } from "@/lib/api/workspace";
import { useEntitlements } from "@/hooks/use-entitlements";

const ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;

export default function MembersPage() {
  const { role } = useEntitlements();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace", "members"],
    queryFn: getMembers,
    enabled: isAdmin,
  });

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<(typeof ROLES)[number]>("MEMBER");
  const queryClient = useQueryClient();

  const invite = useMutation({
    mutationFn: () => inviteMember(email, inviteRole),
    onSuccess: () => {
      toast.success(`Invite sent to ${email}.`);
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["workspace", "members"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't send invite.")),
  });

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Only workspace owners and admins can view the member roster.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite someone</CardTitle>
          <CardDescription>They&apos;ll get an email with a link to accept.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              invite.mutate();
            }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as (typeof ROLES)[number])}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={invite.isPending || !email}>
              {invite.isPending ? "Sending…" : "Send invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {error ? <p className="text-sm text-destructive">Couldn&apos;t load members.</p> : null}
          {data?.members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{m.email ?? m.userId}</p>
                <p className="text-xs text-muted-foreground">Joined {new Date(m.joinedAt).toLocaleDateString()}</p>
              </div>
              <Badge variant="secondary">{m.role}</Badge>
            </div>
          ))}
          {data && data.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : null}
        </CardContent>
      </Card>

      {data && data.pendingInvites.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{invite.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
