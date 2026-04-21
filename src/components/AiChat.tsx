import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send, Settings, Trash2, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface AiChatProps {
  threadId?: Id<"chatThreads">;
}

export function AiChat({ threadId: initialThreadId }: AiChatProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<
    Id<"chatThreads"> | null
  >(initialThreadId || null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant."
  );
  const [threadTitle, setThreadTitle] = useState("New Chat");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated
  const { isAuthenticated } = useConvexAuth();

  // Only query threads if authenticated
  const threads = useQuery(
    api.aiChat.listThreads,
    isAuthenticated ? {} : "skip"
  );
  const threadData = useQuery(
    api.aiChat.getThread,
    isAuthenticated && selectedThreadId ? { threadId: selectedThreadId } : "skip"
  );

  const createThread = useMutation(api.aiChat.createThread);
  const updateThread = useMutation(api.aiChat.updateThread);
  const deleteThread = useMutation(api.aiChat.deleteThread);
  const sendMessage = useAction(api.aiChat.sendMessage);
  
  // Default model for OpenRouter (format: google/gemini-...)
  const defaultModel = "google/gemini-2.5-flash-lite";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [threadData?.messages]);

  // Load thread settings when thread is selected
  useEffect(() => {
    if (threadData?.thread) {
      setSystemPrompt(threadData.thread.systemPrompt);
      setThreadTitle(threadData.thread.title);
    }
  }, [threadData?.thread]);

  const handleCreateThread = async () => {
    try {
      const newThreadId = await createThread({
        title: threadTitle || "New Chat",
        systemPrompt: systemPrompt || "You are a helpful AI assistant.",
        model: defaultModel,
      });
      setSelectedThreadId(newThreadId);
      setIsSettingsOpen(false);
      // Reset form for next creation
      setThreadTitle("New Chat");
      setSystemPrompt("You are a helpful AI assistant.");
      toast.success("Chat thread created");
    } catch (error) {
      toast.error("Failed to create thread");
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedThreadId || isSending) return;

    const messageContent = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await sendMessage({
        threadId: selectedThreadId,
        content: messageContent,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
      setMessage(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!selectedThreadId) return;

    try {
      await updateThread({
        threadId: selectedThreadId,
        title: threadTitle,
        systemPrompt: systemPrompt,
      });
      setIsSettingsOpen(false);
      toast.success("Settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    }
  };

  const handleDeleteThread = async (threadId: Id<"chatThreads">) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      await deleteThread({ threadId });
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
      }
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
      console.error(error);
    }
  };

  const handleSelectThread = (threadId: Id<"chatThreads">) => {
    setSelectedThreadId(threadId);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/50 flex flex-col">
        <div className="p-4 border-b">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Reset to create new chat mode
                  setSelectedThreadId(null);
                  setThreadTitle("New Chat");
                  setSystemPrompt("You are a helpful AI assistant.");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedThreadId ? "Edit Chat Settings" : "Create New Chat"}
                </DialogTitle>
                <DialogDescription>
                  Configure your AI chat thread with a custom system prompt.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Chat Title</Label>
                  <Input
                    id="title"
                    value={threadTitle}
                    onChange={(e) => setThreadTitle(e.target.value)}
                    placeholder="My AI Chat"
                  />
                </div>
                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful AI assistant."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This prompt defines the AI's behavior and personality.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    selectedThreadId ? handleUpdateSettings : handleCreateThread
                  }
                >
                  {selectedThreadId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {threads?.map((thread) => (
              <div
                key={thread._id}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-accent ${
                  selectedThreadId === thread._id ? "bg-accent" : ""
                }`}
                onClick={() => handleSelectThread(thread._id)}
              >
                <span className="text-sm truncate flex-1">
                  {thread.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteThread(thread._id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThreadId && threadData ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {threadData.thread.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {threadData.messages.length} messages
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  // Keep selected thread when editing
                  setIsSettingsOpen(true);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {threadData.messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <Card className="bg-muted max-w-[80%]">
                      <CardContent className="p-3">
                        <p className="text-sm text-muted-foreground">
                          Thinking...
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  rows={2}
                  disabled={isSending}
                  className="resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  size="icon"
                  className="h-auto"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>No Chat Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create a new chat to start conversing with AI.
                </p>
                <Button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

