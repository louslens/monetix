import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Offset (ms) between the server clock and this device's clock. */
export function useServerOffset() {
  const q = useQuery({
    queryKey: ["server-offset"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const t0 = Date.now();
      const { data, error } = await supabase.rpc("server_now");
      const t1 = Date.now();
      if (error || !data) return 0;
      return new Date(data as string).getTime() - (t0 + t1) / 2;
    },
  });
  return { offset: q.data ?? 0, ready: q.isSuccess };
}

/** Current server time, ticking every second. Null until hydrated. */
export function useServerNow(intervalMs = 1000) {
  const { offset } = useServerOffset();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [offset, intervalMs]);
  return now;
}
