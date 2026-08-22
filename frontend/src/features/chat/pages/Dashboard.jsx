import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hook/useAuth";
import CodeBlock from "../components/CodeBlock";
import ThemeToggle from "../../../app/ThemeToggle";
import ChatNovaLogo from "../../../components/ChatNovaLogo";
import "../style/chat.scss";

const Dashboard = () => {
  const chat = useChat();
  const auth = useAuth();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesContainerRef = useRef(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const currentChat = chats?.[currentChatId];
  const currentChatTitle = currentChat?.title ?? "New Conversation";
  const isStreaming = useSelector((state) => state.chat.isStreaming);
  const hasReceivedFirstChunk = useSelector((state) => state.chat.hasReceivedFirstChunk);
  const isEmptyChat = !currentChatId || !currentChat?.messages || currentChat.messages.length === 0;

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
    return () => chat.cancelActiveStream();
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [currentChatId, currentChat?.messages, isStreaming]);

  const handleSubmitMessage = (event) => {
    if (event) event.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) {
      return;
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId });
    setChatInput("");
  };

  const handleSuggestionClick = (promptText) => {
    setChatInput(promptText);
  };

  const handleCopyMessage = (msgId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleFeedback = (msgId, type) => {
    setFeedbackState((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type,
    }));
  };

  const openChat = (chatId) => {
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

  // Filter chats based on user search query
  const filteredChats = Object.values(chats || {}).filter((c) => {
    if (!searchQuery.trim()) return true;
    return c.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const promptSuggestions = [
    { title: "Explain Cloud Architecture", desc: "Load balancers, microservices & failover strategies" },
    { title: "REST API in Express", desc: "Clean architecture pattern with JWT auth" },
    { title: "Optimize SQL Database Query", desc: "Indexing strategies for low latency queries" },
    { title: "System Design Essentials", desc: "Scalability, caching, and database sharding" },
  ];

  return (
    <main className="dashboard-ui h-screen w-screen max-w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#020617] dark:text-slate-100 p-0 md:p-3">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close chat menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-xs md:hidden"
        />
      )}

      <section className="mx-auto flex h-full w-full gap-3 overflow-hidden md:h-[calc(100vh-1.5rem)] md:gap-4">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-[80] flex w-[min(20rem,calc(100vw-2.5rem))] flex-col border-r border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-transform duration-300 ease-out dark:border-slate-800/80 dark:bg-[#090d16] dark:shadow-slate-950/40 md:relative md:z-auto md:h-full md:w-72 md:shrink-0 md:translate-x-0 md:rounded-2xl md:border ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand Header with Official ChatNova Logo */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ChatNovaLogo className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                ChatNova
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              chat.handleOpenNewChat();
              setSidebarOpen(false);
            }}
            className="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>New Chat</span>
          </button>

          {/* Search History Filter Input - High Contrast in Dark Mode */}
          <div className="relative mb-3">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            />
          </div>

          {/* Chat History List - Hidden Scrollbar */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recent Conversations
            </p>
            {filteredChats.length === 0 ? (
              <p className="px-2 py-4 text-xs text-slate-400 dark:text-slate-500 italic text-center">
                No conversations found
              </p>
            ) : (
              filteredChats.map((chatItem) => {
                const isActive = chatItem.id === currentChatId;
                const cleanTitle = chatItem.title
                  ? chatItem.title.replace(/[\*_"]/g, "").trim()
                  : "New Conversation";

                return (
                  <div
                    key={chatItem.id}
                    className={`group flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                    }`}
                    onClick={() => openChat(chatItem.id)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <i
                        className={`fa-regular fa-message text-xs ${
                          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                        }`}
                      ></i>
                      <span className="truncate">{cleanTitle}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChatId(chatItem.id);
                        setDeleteModalOpen(true);
                        setSidebarOpen(false);
                      }}
                      className="ml-1 text-slate-400 transition hover:text-rose-500 md:opacity-0 md:group-hover:opacity-100"
                      title="Delete conversation"
                    >
                      <i className="fa-regular fa-trash-can text-xs"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* User Profile & Theme Switcher Footer */}
          <div className="mt-3 border-t border-slate-200/80 pt-3 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs dark:bg-indigo-900/60 dark:text-indigo-200">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate dark:text-white">
                    {user?.username || "User"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate dark:text-slate-500">
                    {user?.email || "Free Tier"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettingsModalOpen(true)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                title="Settings"
              >
                <i className="fa-solid fa-gear text-xs"></i>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <ThemeToggle inline={true} />

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
                title="Logout"
              >
                <i className="fa-solid fa-right-from-bracket text-[11px]"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CHAT CANVAS */}
        <section className="relative mx-auto flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs dark:bg-[#0b0f19] dark:border-slate-800/80">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open conversation menu"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:hidden"
              >
                <i className="fa-solid fa-bars text-xs" />
              </button>

              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {currentChatTitle.replace(/[\*_"]/g, "").trim()}
                </h2>
              </div>
            </div>

            {/* Model Badge Display & Header Settings */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Gemini 3.1 Pro</span>
              </span>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(true)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                title="Chat Settings"
              >
                <i className="fa-solid fa-gear text-xs"></i>
              </button>
            </div>
          </div>

          {/* Messages Stream Container - Hidden Scrollbar with Smooth Scroll */}
          <div
            ref={messagesContainerRef}
            className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-28 md:pb-32 no-scrollbar max-w-3xl mx-auto w-full"
          >
            {/* EMPTY STATE */}
            {isEmptyChat && (
              <div className="flex h-full flex-col items-center justify-center text-center animate-fadeIn py-12">
                <div className="mb-4 flex items-center justify-center">
                  <ChatNovaLogo className="h-14 w-14 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  How can I help you today?
                </h3>
                <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Select a prompt below or type your query to start a new intelligent conversation.
                </p>

                {/* Prompt Suggestion Cards */}
                <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
                  {promptSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(item.title)}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-left transition hover:border-indigo-400 hover:bg-white hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-indigo-700 dark:hover:bg-slate-900"
                    >
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
                        {item.title}
                      </span>
                      <span className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {chats[currentChatId]?.messages?.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 max-w-full overflow-hidden animate-fadeIn ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    message.role === "user"
                      ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                      : "bg-indigo-600 text-white p-1"
                  }`}
                >
                  {message.role === "user" ? (
                    user?.username?.charAt(0).toUpperCase() || "U"
                  ) : (
                    <ChatNovaLogo className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Content Container */}
                <div
                  className={`group relative max-w-[85%] md:max-w-[82%] overflow-hidden flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {message.role === "user" ? (
                    /* User Message: Indigo Bubble */
                    <div className="rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-4 py-3 text-xs md:text-sm leading-relaxed max-w-full overflow-hidden break-words shadow-xs">
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  ) : (
                    /* AI Response: Lumina Minimalist Canvas */
                    <div className="w-full text-xs md:text-sm leading-relaxed text-slate-800 dark:text-slate-200 break-words max-w-full overflow-hidden border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2.5 last:mb-0 leading-relaxed break-words">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-2.5 list-disc pl-5 space-y-1 break-words">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-2.5 list-decimal pl-5 space-y-1 break-words">{children}</ol>
                          ),
                          code: ({ inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline ? (
                              <CodeBlock language={match ? match[1] : ""}>
                                {String(children).replace(/\n$/, "")}
                              </CodeBlock>
                            ) : (
                              <code
                                className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[12px] text-slate-800 dark:bg-slate-800 dark:text-slate-200 break-words"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                        }}
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>

                      {/* AI Response Action Toolbar (Copy & Feedback) */}
                      <div className="mt-2 flex items-center gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition"
                          title="Copy message text"
                        >
                          {copiedMessageId === message.id ? (
                            <>
                              <i className="fa-solid fa-check text-emerald-500"></i>
                              <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <i className="fa-regular fa-copy"></i>
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleFeedback(message.id, "up")}
                            className={`rounded-md p-1 text-[11px] transition hover:text-slate-700 dark:hover:text-slate-200 ${
                              feedbackState[message.id] === "up" ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""
                            }`}
                            title="Good response"
                          >
                            <i className="fa-regular fa-thumbs-up"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(message.id, "down")}
                            className={`rounded-md p-1 text-[11px] transition hover:text-slate-700 dark:hover:text-slate-200 ${
                              feedbackState[message.id] === "down" ? "text-rose-500 font-bold" : ""
                            }`}
                            title="Bad response"
                          >
                            <i className="fa-regular fa-thumbs-down"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Streaming Dots Indicator */}
            {isStreaming && !hasReceivedFirstChunk && (
              <div className="flex gap-3 animate-fadeIn">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs p-1">
                  <ChatNovaLogo className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-slate-200/60 bg-slate-100/80 px-4 py-3 text-xs text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-400">
                  <span className="font-medium mr-1">Thinking</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dot-pulse-1"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dot-pulse-2"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dot-pulse-3"></span>
                </div>
              </div>
            )}
          </div>

          {/* FLOATING MESSAGE INPUT DOCK */}
          <footer className="absolute bottom-3 left-0 right-0 px-3 md:px-6">
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0f172a]/95 dark:shadow-slate-950/50">
              <form onSubmit={handleSubmitMessage} className="flex items-center gap-2">
                {/* Main Text Input */}
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask ChatNova anything..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs md:text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                />

                {/* Send / Stop Action Button */}
                <button
                  type="submit"
                  onClick={isStreaming ? chat.cancelActiveStream : undefined}
                  disabled={isStreaming ? false : !chatInput.trim()}
                  className={`flex h-9 min-w-[2.5rem] px-4 shrink-0 items-center justify-center gap-1.5 rounded-xl font-medium text-xs transition ${
                    isStreaming
                      ? "bg-rose-500 text-white hover:bg-rose-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  }`}
                >
                  {isStreaming ? (
                    <>
                      <i className="fa-solid fa-square text-[10px]"></i>
                      <span className="hidden sm:inline">Stop</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <i className="fa-solid fa-arrow-up text-[10px]"></i>
                    </>
                  )}
                </button>
              </form>

              {/* Disclaimer Subtext */}
              <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-500">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </footer>
        </section>
      </section>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Delete Conversation
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this chat history? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Account & Preferences
              </h2>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Active User
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="font-medium text-slate-900 dark:text-white">{user?.username}</p>
                  <p className="text-slate-400">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Default AI Model
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50 flex justify-between items-center">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Gemini 3.1 Pro</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-semibold dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
