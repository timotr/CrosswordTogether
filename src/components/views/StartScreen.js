import Button from "../Button";
import {AppContext} from "../../App";
import React, {useContext} from "react";
import {Column, FlexContainer} from "../Layouts";
import useLocalStorage from "react-use-localstorage/dist/index";

export default function StartScreen(props) {
    const {setView, setCrosswordName} = useContext(AppContext);
    const [crosswordsStr, ] = useLocalStorage('crosswords', '{}');
    let crosswords = JSON.parse(crosswordsStr);

    return <FlexContainer>
        <Column className="flex-rows">
            <h1>Crossword Together</h1>
            <Button onClick={() => setView("CreateGame")}>Start a new game</Button>
            <Button onClick={() => setView("JoinGame")}>Join a game</Button>
            <Button onClick={() => setView("CreateCrossword")}>Create a new crossword</Button>
            <Button onClick={() => setView("SelectCrosswordEdit")}>Import/edit an existing crossword</Button>
        </Column>
        {/*<Column className="flex-rows">
            <h1>Continue playing</h1>
            {Object.keys(crosswords).map(name =>
                <Button key={name} onClick={() => {
                    setCrosswordName(name);
                    setView("CreateGame");
                }}>
                    {name}
                </Button>
            )}
        </Column>*/}
    </FlexContainer>
}
