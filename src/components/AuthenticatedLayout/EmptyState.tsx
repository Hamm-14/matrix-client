import { EventType } from "matrix-js-sdk";
import { useMatrix } from "../../context/MatrixContext";

interface EmptyStateProps {
  onSelectRoom: (roomId: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSelectRoom }) => {
  const { client } = useMatrix();

  const startInstantDM = async () => {
    const targetUserId = prompt(
      "Enter the Matrix ID (e.g., @user:server.com):",
    );
    if (!targetUserId || !client) return;

    try {
      // Create the room with the 'is_direct' flag
      const response = await client.createRoom({
        name: `Chat with ${targetUserId.split(":")[0]}`,
        invite: [targetUserId], // Invite the user immediately
        is_direct: true, // Marks this as a DM in Matrix metadata
        preset: "trusted_private_chat" as any, // Optimized for DMs
      });

      const newRoomId = response.room_id;

      // Update the 'm.direct' account data
      // This tells all Matrix clients that this specific room is a DM with this user
      const dmMap = client.getAccountData(EventType.Direct)?.getContent() || {};
      dmMap[targetUserId] = [...(dmMap[targetUserId] || []), newRoomId];

      await client.setAccountData(EventType.Direct, dmMap);

      alert(
        "DM Created! If the other user is a Bridge/Bot, they will join automatically.",
      );

      // Auto-select the room in your UI
      onSelectRoom(newRoomId);
    } catch (err: any) {
      console.error("DM Start failed:", err);
      alert("Could not start DM: " + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-500">
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.274 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        No Conversation Selected
      </h2>
      <p className="text-slate-500 max-w-sm mb-8">
        Select a bridged WhatsApp or Email chat from the sidebar, or start a
        fresh Matrix room.
      </p>
      <button
        onClick={startInstantDM}
        className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Start a Direct Message
      </button>
    </div>
  );
};

export default EmptyState;
