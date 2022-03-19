import Button from "../Button";
import {AppContext} from "../../App";
import React, {useContext} from "react";
import {Column, FlexContainer, Input, InputGroup, Label} from "../Layouts";
import colors from "../../data/colors.json"
import styled from "styled-components";

export default function JoinGame(props) {
    const {room, setRoom, setView, player, setPlayer} = useContext(AppContext);

    const startGame = () => {
        setView("GameScreen");
    };

    return <FlexContainer>
        <Column className="flex-rows">
            <h1>Start a new game</h1>
            <div>
                <Label>Enter room code</Label>
                <Input value={room.code} onChange={e => setRoom(prev => ({...prev, code: e.target.value.toUpperCase()}))}/>
            </div>
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
            <Button onClick={startGame} disabled={room.code.length !== 5}>Join game</Button>
            <Button onClick={() => setView("StartScreen")}>Back</Button>
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