import { useEffect, useState } from "react";
import { useMatrix } from "../../context/MatrixContext";
import UserInfo from "./UserInfo";
import RoomList from "./RoomList";
import EmptyState from "./EmptyState";
import ChatWindow from "./ChatWindow";

interface AuthenticatedLayoutProps {
  logout: () => void;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  logout,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const { client } = useMatrix();

  useEffect(() => {
    if (!client || !selectedRoomId) return;

    const room = client.getRoom(selectedRoomId);
    const roomName = room ? room.name : "Unknown Room";
    setSelectedRoomName(roomName);
  }, [selectedRoomId]);

  return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-700">
      <aside className="w-80 bg-white/40 backdrop-blur-md border-r border-white/50 shadow-sm">
        <RoomList onSelectRoom={(id) => setSelectedRoomId(id)} />
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 shrink-0 bg-white/20 backdrop-blur-sm border-b border-white/30 flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-600 tracking-wide">
              {selectedRoomId ? selectedRoomName : "Matrix Dashboard"}
            </span>
            <span className="px-2 py-0.5 rounded text-[12px] bg-green-500/10 text-green-600 border border-green-500/20 font-bold uppercase">
              Live
            </span>
          </div>

          <div className="flex items-center gap-6">
            <UserInfo />
            <button
              onClick={logout}
              className="cursor-pointer group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              <span>LOGOUT</span>
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 relative flex flex-col overflow-hidden">
          {selectedRoomId ? (
            <ChatWindow roomId={selectedRoomId} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState onSelectRoom={(id) => setSelectedRoomId(id)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
