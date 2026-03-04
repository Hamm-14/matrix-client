import { UserHeaderInfo } from "./UserInfo";

interface AuthenticatedLayoutProps {
  logout: () => void;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  logout,
}) => {
  return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-700">
      {/* Sidebar will go here */}
      <aside className="w-80 bg-white/40 backdrop-blur-md border-r border-white/50 shadow-sm">
        {/* <RoomList /> */}
        <div className="p-4 font-semibold border-b border-white/20 tracking-wide text-slate-800">
          Messages
        </div>
      </aside>

      {/* Chat Area will go here */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white/20 backdrop-blur-sm border-b border-white/30 flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-600 tracking-wide">
              Matrix Dashboard
            </span>
            <span className="px-2 py-0.5 rounded text-[12px] bg-green-500/10 text-green-600 border border-green-500/20 font-bold uppercase">
              Live
            </span>
          </div>

          <div className="flex items-center gap-6">
            <UserHeaderInfo />

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

        <div className="flex-1 flex items-center justify-center text-slate-400">
          <p>Welcome! Your matrix client is ready.</p>
        </div>
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
