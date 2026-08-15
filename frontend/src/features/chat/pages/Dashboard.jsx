import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hook/useAuth";
import "../style/chat.scss";

const Dashboard = () => {
  const chat = useChat();
  const auth = useAuth();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [chatInput, setChatInput] = useState("");
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const currentChat = chats?.[currentChatId];
  const currentChatTitle = currentChat?.title ?? "New Chat";
  const messagesContainerRef = useRef(null);
  const isStreaming = useSelector((state) => state.chat.isStreaming);
  const hasReceivedFirstChunk = useSelector((state) => state.chat.hasReceivedFirstChunk);
  const isEmptyChat = !currentChatId;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
    return () => chat.cancelActiveStream();
  }, []);

  // Runs after every message and streamed chunk render so the newest response
  // stays visible as it is generated.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [currentChatId, currentChat?.messages]);

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
    setSidebarOpen(false);
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

const handleLogout = async () => {
  const loggedOut = await auth.handleLogout();

  if (loggedOut) {
    navigate("/login", { replace: true });
  }
};
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-stone-100 via-neutral-50 to-zinc-100 p-0 text-zinc-950 dark:bg-[#07090f] dark:bg-none dark:text-white md:p-5">
      {sidebarOpen && <button type="button" aria-label="Close chat menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-[70] bg-zinc-950/45 backdrop-blur-sm md:hidden" />}
      <section className="mx-auto flex h-screen w-full gap-4 p-2 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1">
        <aside className={`fixed inset-y-0 left-0 z-[80] flex w-[min(20rem,calc(100vw-3rem))] flex-col border-r border-stone-200/80 bg-gradient-to-br from-[#faf9f6] via-stone-50 to-zinc-100 p-4 shadow-2xl shadow-zinc-950/20 transition-transform duration-300 ease-out dark:border-white/10 dark:bg-[#080b12] dark:bg-none dark:shadow-black/50 md:relative md:z-auto md:h-full md:w-72 md:shrink-0 md:translate-x-0 md:rounded-3xl md:border md:shadow-xl md:shadow-stone-300/40 dark:md:shadow-black/20 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* HEADER (fixed top) */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">ChatNova</h1>
            <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white md:hidden"><i className="fa-solid fa-xmark text-lg" /></button>
          </div>

          {/* NEW CHAT (fixed under header) */}
          <button
            type="button"
            onClick={() => {
              chat.handleOpenNewChat();
              setSidebarOpen(false);
            }}
            className="w-full mb-3 cursor-pointer rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-left text-base font-medium text-zinc-700 transition hover:border-cyan-500 hover:text-zinc-950 dark:border-white/60 dark:text-white/90 dark:hover:border-white dark:hover:text-white"
          >
            <i className="fa-solid fa-plus mr-2"></i>New Chat
          </button>

          {/* CHAT LIST (SCROLLABLE AREA) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {Object.values(chats)?.map((chatItem) => (
              <div
                key={chatItem.id}
                className="group flex items-center justify-between w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-zinc-700 hover:border-cyan-500 hover:text-zinc-950 dark:border-white/60 dark:text-white/90 dark:hover:border-white dark:hover:text-white"
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
    setSidebarOpen(false);
  }}
                  className="ml-2 cursor-pointer text-red-400 transition hover:text-red-300 md:opacity-0 md:group-hover:opacity-100"
                  title="Delete chat"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ))}
          </div>

          {/* PROFILE (fixed bottom) */}
          <div className="mt-3 border-t border-zinc-200 pt-4 dark:border-white/10">
            <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cyan-100 text-cyan-900 flex items-center justify-center font-semibold dark:bg-white/20 dark:text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-950 truncate dark:text-white">
                {user?.username}
              </p>
              <p className="text-xs text-zinc-500 truncate dark:text-white/50">{user?.email}</p>
            </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
            >
              <i className="fa-solid fa-right-from-bracket mr-2"></i>Logout
            </button>
          </div>
        </aside>

        <section className="relative mx-auto flex h-full min-w-0 flex-1 flex-col gap-3 md:gap-4">
          <div className="flex items-center gap-3 border-b border-zinc-200 pb-3 dark:border-white/10">
            <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open chat history" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/15 dark:bg-white/5 dark:text-white md:hidden"><i className="fa-solid fa-bars" /></button>
            <h2 className="min-w-0 truncate text-xl font-semibold md:text-2xl">
              {currentChatTitle
                .replace(/\*/g, "")
                .replace(/"/g, "")
                .replace(/_/g, "")}
            </h2>
          </div>

          <div ref={messagesContainerRef} className="messages flex-1 space-y-3 overflow-y-auto pr-1 pb-44 md:pb-36">
            {/* EMPTY STATE */}
            {isEmptyChat && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                  <h3 className="text-xl md:text-2xl font-semibold text-zinc-600 dark:text-white/70">
                    Start a new conversation
                  </h3>
                  <p className="text-zinc-400 mt-2 text-sm md:text-base dark:text-white/40">
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
                    ? "ml-auto rounded-br-none bg-cyan-500 text-white shadow-lg shadow-cyan-200/60 dark:bg-white/12 dark:text-white dark:shadow-none"
                    : "mr-auto text-zinc-800 dark:text-white/90"
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
                        <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-white/10">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="mb-2 overflow-x-auto rounded-xl bg-zinc-200 p-3 dark:bg-black/30">
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
            {isStreaming && !hasReceivedFirstChunk && (
              <div className="mr-auto w-fit rounded-2xl px-4 py-3 text-sm text-zinc-500 dark:text-white/60">
                Thinking…
              </div>
            )}
          </div>

          <footer className="rounded-3xl w-full absolute bottom-2 border border-stone-200/80 bg-gradient-to-r from-[#faf9f6] via-stone-50 to-zinc-100 p-4 shadow-xl shadow-stone-300/40 dark:border-white/60 dark:bg-[#080b12] dark:bg-none dark:shadow-black/30 md:p-5">
            <form
              onSubmit={handleSubmitMessage}
              className="flex flex-col gap-3 md:flex-row"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Type your message..."
                className="w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-lg text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-cyan-500 dark:border-white/50 dark:text-white dark:placeholder:text-white/45 dark:focus:border-white/90"
              />
              <button
                type="submit"
                onClick={isStreaming ? chat.cancelActiveStream : undefined}
                disabled={isStreaming ? false : !chatInput.trim()}
                className="rounded-2xl border border-zinc-300 px-6 py-3 text-lg font-semibold text-zinc-800 transition hover:border-cyan-500 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/60 dark:text-white dark:hover:bg-white/10"
              >
                {isStreaming ? "Stop" : "Send"}
              </button>
            </form>
          </footer>
        </section>
      </section>
      {deleteModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm dark:bg-black/60">
    
    <div className="w-[90%] max-w-md rounded-2xl border border-stone-200/80 bg-gradient-to-br from-[#faf9f6] via-stone-50 to-zinc-100 p-6 shadow-xl dark:border-white/10 dark:bg-[#0b0f17] dark:bg-none">

      <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
        Delete Chat
      </h2>

      <p className="mt-3 text-zinc-600 dark:text-white/70">
        Are you sure you want to delete this chat? This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">

        {/* CANCEL */}
        <button
          onClick={handleCancelDelete}
          className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
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
