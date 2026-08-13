import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PublicRoute from "./components/layout/PublicRoute";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import { Auth } from "./pages/Auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/themes/dark.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route element={<PublicRoute />}>
              <Route path="/auth" element={<Auth />} />
            </Route>
          </Route>
        </Routes>
      </ThemeProvider>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
