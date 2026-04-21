import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from '@/lib/convex';
import '@/index.css'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { BudgetsPage } from '@/pages/BudgetsPage'
import { InsightsPage } from '@/pages/InsightsPage'
import { AiChatPage } from '@/pages/AiChatPage'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/transactions", element: <TransactionsPage /> },
      { path: "/budgets", element: <BudgetsPage /> },
      { path: "/insights", element: <InsightsPage /> },
      { path: "/ai-chat", element: <AiChatPage /> },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ConvexAuthProvider client={convex}>
          <RouterProvider router={router} />
        </ConvexAuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)