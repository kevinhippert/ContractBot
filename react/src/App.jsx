import "./App.css";
import NavBar from "./components/NavBar";
import { TopicProvider } from "./contexts/TopicContext";
import MainView from "./pages/mainView/MainView";

function App() {
  return (
    <>
      <NavBar />
      <TopicProvider>
        <MainView />
      </TopicProvider>
    </>
  );
}

export default App;
