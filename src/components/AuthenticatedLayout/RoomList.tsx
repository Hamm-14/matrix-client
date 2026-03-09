import { useCallback, useEffect, useState } from "react";
import { ClientEvent, Room, RoomEvent } from "matrix-js-sdk";
import { useMatrix } from "../../context/MatrixContext";

const RoomList = ({
  onSelectRoom,
}: {
  onSelectRoom: (roomId: string | null) => void;
}) => {
  const { client } = useMatrix();
  const [rooms, setRooms] = useState<Room[]>([]);

  const handleRoomUpdates = useCallback(() => {
    if (client) {
      const allRooms = client.getRooms();

      const sorted = allRooms.sort((a, b) => {
        const timeA = a.getLastActiveTimestamp();
        const timeB = b.getLastActiveTimestamp();

        const timestampA = timeA && timeA > 0 ? timeA : 0;
        const timestampB = timeB && timeB > 0 ? timeB : 0;

        return timestampB - timestampA;
      });

      setRooms([...sorted]);
    }
  }, [client]);

  useEffect(() => {
    if (!client) return;

    handleRoomUpdates(); // initial room load

    client.on(ClientEvent.Room, handleRoomUpdates);
    client.on(RoomEvent.Timeline, handleRoomUpdates);
    client.on(RoomEvent.MyMembership, handleRoomUpdates);

    return () => {
      client.removeListener(ClientEvent.Room, handleRoomUpdates);
      client.removeListener(RoomEvent.Timeline, handleRoomUpdates);
      client.removeListener(RoomEvent.MyMembership, handleRoomUpdates);
    };
  }, [client]);

  // Helper to identify bridge type
  const getBridgeType = (room: Room) => {
    const name = room.name.toLowerCase();
    if (
      name.includes("whatsapp") ||
      room.getJoinedMembers().some((m) => m.userId.includes("whatsapp"))
    )
      return "WA";
    if (name.includes("postmoogle")) return "EMAIL";
    return "DM";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-700 tracking-wide">
            Messages
          </h2>
          <span className="bg-indigo-100 text-indigo-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {rooms.length}
          </span>
        </div>

        {/* Plus button to add a new conversation*/}
        <button
          onClick={() => onSelectRoom(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer group"
          title="New Conversation"
        >
          <svg
            className="w-5 h-5 transform group-active:scale-90 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-1 px-3">
        {rooms.map((room) => {
          const type = getBridgeType(room);
          const lastEvent = room.getLiveTimeline().getEvents().slice(-1)[0];
          const lastMsg = lastEvent?.getContent()?.body || "No message yet";
          const membership = room.getMyMembership();

          if (client && membership === "invite") {
            return (
              <div
                key={room.roomId}
                onClick={() => onSelectRoom(room.roomId)}
                className="cursor-pointer p-3 mb-2 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-pulse"
              >
                <p className="text-xs font-bold text-indigo-700 mb-2">
                  New Invitation!
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 truncate w-32">
                    {room.name}
                  </span>
                  {/* <div className="flex gap-2">
                    <button
                      onClick={() => client.joinRoom(room.roomId)}
                      className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"
                      title="Accept"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => client.leave(room.roomId)}
                      className="p-1.5 bg-white text-rose-500 border border-rose-100 rounded-md hover:bg-rose-50"
                      title="Decline"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div> */}
                </div>
              </div>
            );
          }

          return (
            <button
              key={room.roomId}
              onClick={() => onSelectRoom(room.roomId)}
              className="cursor-pointer w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-all group border border-transparent hover:border-white/50 hover:shadow-sm"
            >
              {/* Bridge Icon Avatar */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0 
                ${type === "WA" ? "bg-emerald-500" : type === "EMAIL" ? "bg-amber-500" : "bg-indigo-500"}`}
              >
                {type === "WA" ? "W" : type === "EMAIL" ? "@" : "M"}
              </div>

              {/* Room Details */}
              <div className="flex flex-col items-start overflow-hidden w-[calc(100%-48px)]">
                <div className="flex justify-between w-full">
                  <span className="text-sm font-bold text-slate-700 truncate w-32 text-left">
                    {room.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(room.getLastActiveTimestamp()).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        weekday: "short",
                        hour12: true,
                      },
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate w-full text-left font-medium">
                  {lastMsg}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoomList;
