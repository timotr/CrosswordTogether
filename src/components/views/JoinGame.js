import Button from "../Button";
import styled from 'styled-components'
import {AppContext} from "../../App";
import React, {useState, useContext} from "react";
import useLocalStorage from "react-use-localstorage/dist/index";
import {Column, FlexContainer, Input, Label} from "../Layouts";

export default function JoinGame(props) {
    const {room, setRoom, setView, setWs} = useContext(AppContext);

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
            <Button onClick={startGame} disabled={room.code.length !== 5}>Join game</Button>
            <Button onClick={() => setView("StartScreen")}>Back</Button>
        </Column>
    </FlexContainer>
}