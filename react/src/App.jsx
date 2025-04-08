import "./App.css";
import NavBar from "./components/NavBar";
import { TopicProvider } from "./contexts/TopicContext";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainView from "./pages/mainView/MainView";
import Login from "./pages/login/Login";

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
      </TopicProvider>
    </>
  );
}

export default App;
