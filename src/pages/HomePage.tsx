import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "../components/SignInForm";

export function HomePage() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Redirect authenticated users to AI chat
  useEffect(() => {
    if (loggedInUser) {
      navigate("/ai-chat", { replace: true });
    }
  }, [loggedInUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight">
            AI Chat <span className="text-gradient">Application</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Start chatting with AI. Sign in to begin your conversation.
          </p>
        </div>

        <Authenticated>
          <Button
            size="lg"
            onClick={() => navigate("/ai-chat")}
            className="px-8 py-6 text-lg font-semibold"
          >
            Go to AI Chat
          </Button>
        </Authenticated>

        <Unauthenticated>
          <div className="space-y-4">
            <SignInForm />
          </div>
        </Unauthenticated>
      </div>
    </div>
  );
}
