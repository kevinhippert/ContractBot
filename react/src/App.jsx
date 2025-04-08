import "./App.css";
import NavBar from "./components/NavBar";
import { TopicProvider } from "./contexts/TopicContext";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionTimeout from "./components/SessionTimeout";
import MainView from "./pages/mainView/MainView";
import Login from "./pages/login/Login";
import { ThemeProvider } from "@mui/material/styles";
import seiuTheme from "./styles/seiuTheme";

function App() {
  return (
    <>
      <NavBar />
      <TopicProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainView />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
        <SessionTimeout />
      </TopicProvider>
    </>
  );
}

export default App;
