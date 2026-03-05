import React, { useEffect, useState } from "react";
import { useMatrix } from "../../context/MatrixContext";

const UserInfo: React.FC = () => {
  const { client } = useMatrix();
  const [displayName, setDisplayName] = useState<string>("");
  const userId = client?.getUserId() || "";

  useEffect(() => {
    if (!client) return;

    // Fetch the display name from the server
    client.getProfileInfo(userId).then((info) => {
      if (info.displayname) setDisplayName(info.displayname);
    });
  }, [client, userId]);

  return (
    <div className="flex items-center gap-3 bg-white/30 px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
      {/* Avatar Circle */}
      <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
        {displayName
          ? displayName.charAt(0).toUpperCase()
          : userId.charAt(1).toUpperCase()}
      </div>

      <div className="flex flex-col leading-tight -mt-0.5">
        <span className="text-sm font-bold text-slate-800">
          {displayName || "Loading..."}
        </span>
        <span className="text-[12px] text-slate-500 font-semibold tracking-tight">
          {userId}
        </span>
      </div>
    </div>
  );
};

export default UserInfo;
