import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import Layout from "./components/ui/Layout.jsx"
import HomePage from "./pages/HomePage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import TrainingPage from "./pages/TrainingPage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"
import VersionPage from "./pages/VersionPage.jsx"
import ApiDocsPage from "./pages/ApiDocsPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import { SettingsProvider } from "./context/SettingsContext.jsx"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/versions" element={<VersionPage />} />
                <Route path="/api-docs" element={<ApiDocsPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
              <Toaster position="bottom-right" />
            </Layout>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
