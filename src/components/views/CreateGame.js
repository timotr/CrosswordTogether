import Button from "../Button";
import styled from 'styled-components'
import {AppContext} from "../../App";
import React, {useState, useContext, useMemo} from "react";
import useLocalStorage from "react-use-localstorage/dist/index";
import {Column, FlexContainer, Input, InputGroup, Label} from "../Layouts";
import colors from "../../data/colors.json"

export default function CreateGame(props) {
    const {setView, setCrosswordName, setRoom, player, setPlayer} = useContext(AppContext);
    const [crosswordsStr, ] = useLocalStorage('crosswords', '{}');
    let crosswords = useMemo(() => JSON.parse(crosswordsStr), [crosswordsStr]);
    const [selected, setSelected] = useState(null);
    const [gameName, setGameName] = useState("");
    const isSelected = selected!==null;

    const startGame = () => {
        setRoom({name: gameName});
        setView("GameScreen");
    };

    return <FlexContainer>
        <Column className="flex-rows">
            <h1>Start a new game</h1>
            <InputGroup>
                <Label>Selected:</Label>
                <Label>{!isSelected ? <i>none</i> : <b>{selected}</b>}</Label>
            </InputGroup>
            <InputGroup>
                <Label>Game's name</Label>
                <Input value={gameName} onChange={e => setGameName(e.target.value)}/>
            </InputGroup>
            <InputGroup>
                <Label>Nickname</Label>
                <Input value={player.name} onChange={e => setPlayer((prev)=>({...prev, name: e.target.value}))} />
            </InputGroup>
            <InputGroup>
                <Label>Color</Label>
                <ColorSelector>
                    {colors.map(color => (
                        <Color key={color} color={color} selected={player.color === color} onClick={() => setPlayer((prev)=>({...prev, color}))} />
                    ))}
                </ColorSelector>
            </InputGroup>
            <Button onClick={startGame} disabled={!isSelected || gameName===""}>Start game</Button>
            <Button onClick={() => setView("StartScreen")}>Back</Button>
        </Column>
        <Column className="flex-rows">
            <h1>Select a crossword</h1>
            {Object.keys(crosswords).map(name =>
                <Button key={name} onClick={() => {
                    setSelected(name);
                    setCrosswordName(name);
                }}>
                    {name}
                </Button>
            )}
        </Column>
    </FlexContainer>
}

const ColorSelector = styled.div`
    display: flex;
`;

const Color = styled.div`
    width: 2rem;
    height: 2rem;
    background-color: ${props => props.color};
    
    ${props => props.selected ? "outline: 2px solid black; z-index: 1;" : ""}
    
`;