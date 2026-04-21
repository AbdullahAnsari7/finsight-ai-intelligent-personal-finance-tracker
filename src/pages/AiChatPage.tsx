import { Authenticated, Unauthenticated } from "convex/react";
import { AiChat } from "@/components/AiChat";
import { SignInForm } from "@/components/SignInForm";

export function AiChatPage() {
  // Authentication required - users must sign in to use AI chat
  return (
    <>
      <Authenticated>
        <AiChat />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Sign in to use AI Chat
            </h1>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
