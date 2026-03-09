import React, { useEffect, useState, useRef } from "react";
import { MatrixEvent, RoomEvent } from "matrix-js-sdk";
import { QRCodeSVG } from "qrcode.react";
import { useMatrix } from "../../context/MatrixContext";

interface ChatWindowProps {
  roomId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId }) => {
  const { client } = useMatrix();
  const [messages, setMessages] = useState<MatrixEvent[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [membership, setMembership] = useState<string | undefined>(
    client?.getRoom(roomId)?.getMyMembership(),
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client) return;

    // Function to sync membership and messages
    const updateRoomData = () => {
      const currentRoom = client.getRoom(roomId);
      if (currentRoom) {
        setMessages([...currentRoom.getLiveTimeline().getEvents()]);
      }
    };

    updateRoomData();

    const handleTimelineEvent = (event: MatrixEvent) => {
      if (event.getRoomId() !== roomId) return;

      // If we see a membership event for ourselves, update the state
      if (
        event.getType() === "m.room.member" &&
        event.getStateKey() === client.getUserId()
      ) {
        updateRoomData();
      }

      if (event.getType() === "m.room.message") {
        setMessages((prev) => [...prev, event]);
      }
    };

    client.on(RoomEvent.Timeline, handleTimelineEvent);
    return () => {
      client.removeListener(RoomEvent.Timeline, handleTimelineEvent);
    };
  }, [client, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !client) return;

    await client.sendTextMessage(roomId, newMessage);
    setNewMessage("");
  };

  const handleJoin = async () => {
    try {
      if (!client) return;
      await client.joinRoom(roomId);
      setMembership("join");
    } catch (err) {
      console.error("Failed to join room:", err);
    }
  };

  const isMatrixQR = (content: string) => {
    // Check if it starts with the Matrix QR version '2@'
    // OR if it's a comma-separated string starting with '2'
    const isV2Format = content.startsWith("2@") && content.includes(",");
    const isLegacyFormat =
      content.split(",")[0] === "2" && content.split(",").length === 4;

    return isV2Format || isLegacyFormat;
  };

  if (client && membership === "invite") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white/30 backdrop-blur-md p-10">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Room Invitation</h2>
        <p className="text-slate-500 text-center max-w-sm mt-2 mb-6">
          You have been invited to join{" "}
          <strong>{client.getRoom(roomId)?.name}</strong>. Accept to start
          chatting.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleJoin}
            className="cursor-pointer px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
          >
            Accept Invitation
          </button>
          <button
            onClick={() => client.leave(roomId)}
            className="cursor-pointer px-8 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Decline
          </button>
        </div>
      </div>
    );
  }

  console.log("Messages for room", roomId, messages);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages
          .filter((event) => event.getType() === "m.room.message")
          .map((event) => {
            const isMe = event.getSender() === client?.getUserId();
            const content = event.getContent().body;

            if (!content) return null;

            const isQRCode = isMatrixQR(content);

            return (
              <div
                key={event.getId()}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  }`}
                >
                  {isQRCode ? (
                    <QRCodeSVG
                      value={content}
                      size={200}
                      level="M" // Medium error correction is usually best for screens
                    />
                  ) : (
                    <p
                      className={`text-sm ${isMe ? "text-white" : "text-slate-800"}`}
                    >
                      {content}
                    </p>
                  )}
                  <p className={`text-[10px] mt-2 opacity-60 text-right`}>
                    {new Date(event.getTs()).toLocaleString([], {
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-white/50 border-t border-white/50 backdrop-blur-md"
      >
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 outline-none text-slate-700 placeholder-slate-400"
          />
          <button className="cursor-pointer p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
