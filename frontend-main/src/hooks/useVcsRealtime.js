import { useEffect } from "react";
import { getSocket } from "../realtime/socket";

export default function useVcsRealtime(onUpdate, { onConnect, onDisconnect } = {}) {
  useEffect(() => {
    const socket = getSocket();
    const handleUpdate = () => onUpdate();
    const handleConnect = () => onConnect?.();
    const handleDisconnect = () => onDisconnect?.();

    socket.on("vcs:commit-created", handleUpdate);
    socket.on("vcs:branch-updated", handleUpdate);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Reflect current connection state immediately
    if (socket.connected) onConnect?.();

    return () => {
      socket.off("vcs:commit-created", handleUpdate);
      socket.off("vcs:branch-updated", handleUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [onUpdate, onConnect, onDisconnect]);
}
