import { useEffect, useState } from "react";
import { openStatusNow } from "../lib/utils.js";

export function useOpenStatus() {
  const [status, setStatus] = useState(() => openStatusNow());

  useEffect(() => {
    const tick = () => setStatus(openStatusNow());
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return status;
}
