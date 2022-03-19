import './App.css';
import React, {useState} from "react";
import StartScreen from "./components/views/StartScreen";
import CreateCrossword from "./components/views/CreateCrossword";
import SelectCrossword from "./components/views/SelectCrossword";
import CreateGame from "./components/views/CreateGame";
import GameScreen from "./components/views/GameScreen";
import JoinGame from "./components/views/JoinGame";
import colors from "./data/colors.json"
import adjectives from "./data/adjectives.json"
import animals from "./data/animals.json"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getRandomName = () => {
    let adj = adjectives[Math.floor(Math.random()*adjectives.length)];
    let animal = animals[Math.floor(Math.random()*animals.length)];
    return ucfirst(adj) + " " + ucfirst(animal);
};

const getRandomColor = () => {
    return colors[Math.floor(Math.random()*colors.length)];
};

export const AppContext = React.createContext();

function App() {
  const [view, setView] = useState("StartScreen");
  const [crosswordName, setCrosswordName] = useState(null);
  const [ws, setWs] = useState(null);
  const [room, setRoom] = useState({code: "", name: "", players: []});
  const [player, setPlayer] = useState({id: Math.random(), name: getRandomName(), color: getRandomColor()});
  return (
    <div className="App">
      <AppContext.Provider value={{view, setView, crosswordName, setCrosswordName, ws, setWs, room, setRoom, player, setPlayer}}>
        {view === "StartScreen" && <StartScreen />}
        {view === "CreateCrossword" && <CreateCrossword />}
        {view === "CreateGame" && <CreateGame />}
        {view === "SelectCrosswordEdit" && <SelectCrossword />}
        {view === "JoinGame" && <JoinGame />}
        {view === "GameScreen" && <GameScreen />}
          <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
          />
      </AppContext.Provider>
    </div>
  );
}

export default App;
