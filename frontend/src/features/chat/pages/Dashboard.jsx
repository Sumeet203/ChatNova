import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import "../style/chat.scss";

const Dashboard = () => {
  const chat = useChat();
  const user = useSelector((state) => state.auth.user);
  const [chatInput, setChatInput] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const currentChat = chats?.[currentChatId];
  const currentChatTitle = currentChat?.title ?? "New Chat";
  const isEmptyChat = !currentChatId;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []);

  const handleSubmitMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) {
      return;
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId });
    setChatInput("");
  };
  const openChat = (chatId) => {
    console.log("Opening chat with id : ", chatId);
    chat.handleOpenChat(chatId, chats);
  };
  const handleCancelDelete = () => {
  setDeleteModalOpen(false);
  setSelectedChatId(null);
};

const handleConfirmDelete = async () => {
  if (!selectedChatId) return;

  await chat.handleDeleteChat(selectedChatId);

  setDeleteModalOpen(false);
  setSelectedChatId(null);
  chat.handleGetChats();
};
  return (
    <main className="min-h-screen w-full bg-[#07090f] p-3 text-white md:p-5">
      <section className="mx-auto flex h-[calc(100vh-1.5rem)] w-full gap-4 rounded-3xl border   p-1 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1 border-none">
        <aside className="hidden h-full w-72 shrink-0 rounded-3xl bg-[#080b12] p-4 md:flex flex-col">
          {/* HEADER (fixed top) */}
          <h1 className="mb-4 text-3xl font-semibold tracking-tight">
            Perplexity
          </h1>

          {/* NEW CHAT (fixed under header) */}
          <button
            type="button"
            onClick={() => chat.handleOpenNewChat()}
            className="w-full mb-3 cursor-pointer rounded-xl border border-white/60 bg-transparent px-3 py-2 text-left text-base font-medium text-white/90 transition hover:border-white hover:text-white"
          >
            <i className="fa-solid fa-plus mr-2"></i>New Chat
          </button>

          {/* CHAT LIST (SCROLLABLE AREA) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {Object.values(chats)?.map((chatItem) => (
              <div
                key={chatItem.id}
                className="group flex items-center justify-between w-full rounded-xl border border-white/60 bg-transparent px-3 py-2 text-white/90 hover:border-white"
              >
                {/* OPEN CHAT */}
                <button
                  onClick={() => openChat(chatItem.id)}
                  className="flex-1 text-left text-base font-medium cursor-pointer"
                >
                  {chatItem.title
                    .replace(/\*/g, "")
                    .replace(/"/g, "")
                    .replace(/_/g, "")}
                </button>

                {/* DELETE BUTTON */}
                <button
                   onClick={(e) => {
    e.stopPropagation();
    setSelectedChatId(chatItem.id);
    setDeleteModalOpen(true);
  }}
                  className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-300 ml-2 cursor-pointer"
                  title="Delete chat"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ))}
          </div>

          {/* PROFILE (fixed bottom) */}
          <div className="mt-3 border-t border-white/10 pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
        </aside>

        <section className="relative max-w-3/5 mx-auto flex h-full min-w-0 flex-1 flex-col gap-4">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-2xl font-semibold">
              {currentChatTitle
                .replace(/\*/g, "")
                .replace(/"/g, "")
                .replace(/_/g, "")}
            </h2>
          </div>

          <div className="messages flex-1 space-y-3 overflow-y-auto pr-1 pb-30">
            {/* EMPTY STATE */}
            {isEmptyChat && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                  <h3 className="text-xl md:text-2xl font-semibold text-white/70">
                    Start a new conversation
                  </h3>
                  <p className="text-white/40 mt-2 text-sm md:text-base">
                    Type a message below to begin
                  </p>
                </div>
              </div>
            )}

            {chats[currentChatId]?.messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm md:text-base ${
                  message.role === "user"
                    ? "ml-auto rounded-br-none bg-white/12 text-white"
                    : "mr-auto text-white/90"
                }`}
              >
                {message.role === "user" ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-5">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-5">{children}</ol>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-white/10 px-1 py-0.5">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="mb-2 overflow-x-auto rounded-xl bg-black/30 p-3">
                          {children}
                        </pre>
                      ),
                    }}
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            ))}
          </div>

          <footer className="rounded-3xl w-full absolute bottom-2 border border-white/60 bg-[#080b12] p-4 md:p-5">
            <form
              onSubmit={handleSubmitMessage}
              className="flex flex-col gap-3 md:flex-row"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Type your message..."
                className="w-full rounded-2xl border border-white/50 bg-transparent px-4 py-3 text-lg text-white outline-none transition placeholder:text-white/45 focus:border-white/90"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="rounded-2xl border border-white/60 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </footer>
        </section>
      </section>
      {deleteModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    
    <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-[#0b0f17] p-6 shadow-xl">

      <h2 className="text-xl font-semibold text-white">
        Delete Chat
      </h2>

      <p className="mt-3 text-white/70">
        Are you sure you want to delete this chat? This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">

        {/* CANCEL */}
        <button
          onClick={handleCancelDelete}
          className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition"
        >
          Cancel
        </button>

        {/* CONFIRM DELETE */}
        <button
          onClick={handleConfirmDelete}
          className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition"
        >
          Delete
        </button>

      </div>

    </div>
  </div>
)}
    </main>
    
  );
};

export default Dashboard;
