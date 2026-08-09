"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setOrderStatus } from "@/lib/admin-shop-actions";

export function OrderActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = (status: "FULFILLED" | "CANCELLED") =>
    start(async () => {
      await setOrderStatus(id, status);
      router.refresh();
    });
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="primary" onClick={() => act("FULFILLED")} disabled={pending}>Mark fulfilled</Button>
      <Button size="sm" variant="outline" onClick={() => act("CANCELLED")} disabled={pending}>Cancel</Button>
    </div>
  );
}
