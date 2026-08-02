"use client";

import { useQuery } from "@tanstack/react-query";
import { listMyWorkspaces } from "@/lib/api/account";

export function useMyWorkspaces() {
  return useQuery({
    queryKey: ["workspaces", "mine"],
    queryFn: listMyWorkspaces,
    staleTime: 60_000,
  });
}
