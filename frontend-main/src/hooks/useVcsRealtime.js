import { useEffect } from "react";
import { getSocket } from "../realtime/socket";

export default function useVcsRealtime(onUpdate) {
  useEffect(() => {
    const socket = getSocket();
    const handleUpdate = () => onUpdate();

    socket.on("vcs:commit-created", handleUpdate);
    socket.on("vcs:branch-updated", handleUpdate);

    return () => {
      socket.off("vcs:commit-created", handleUpdate);
      socket.off("vcs:branch-updated", handleUpdate);
    };
  }, [onUpdate]);
}
