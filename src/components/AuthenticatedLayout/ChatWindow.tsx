import React, { useEffect, useState, useRef } from "react";
import { useMatrix } from "../../context/MatrixContext";
import { MatrixEvent, RoomEvent } from "matrix-js-sdk";

const ChatWindow = ({ roomId }: { roomId: string }) => {
  const { client } = useMatrix();
  const [messages, setMessages] = useState<MatrixEvent[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client) return;

    const room = client.getRoom(roomId);
    if (room) {
      setMessages([...room.getLiveTimeline().getEvents()]);
    }

    const handleTimelineEvent = (event: MatrixEvent) => {
      console.log("Timeline event", event.getType(), event.getContent());
      if (event.getRoomId() !== roomId) return;
      if (event.getType() !== "m.room.message") return;

      setMessages((prev) => [...prev, event]);
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

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((event) => {
          const isMe = event.getSender() === client?.getUserId();
          const content = event.getContent().body;

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
                <p
                  className={`text-sm ${isMe ? "text-white" : "text-slate-800"}`}
                >
                  {content}
                </p>
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
          <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
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
