import Button from "../Button";
import styled from 'styled-components'
import {AppContext} from "../../App";
import React, {useState, useContext} from "react";
import useLocalStorage from "react-use-localstorage/dist/index";
import {Column, FlexContainer} from "../Layouts";

export default function SelectCrossword(props) {
    const {setView, setCrosswordName} = useContext(AppContext);
    const [selected, setSelected] = useState(null);
    const [crosswordsStr, ] = useLocalStorage('crosswords', '{}');
    let crosswords = JSON.parse(crosswordsStr);
    const isSelected = selected!==null;

    const deleteSelected = () => {

    };

    return <FlexContainer>
        <Column className="flex-rows">
            <h1>Select a crossword</h1>
            <span>Selected: {!isSelected ? <i>none</i> : <b>{selected}</b>}</span>
            <Button onClick={() => setView("CreateCrossword")} disabled={!isSelected}>Edit selected</Button>
            <Button disabled>Import</Button>
            <Button disabled>Export</Button>
            <Button onClick={deleteSelected} disabled={!isSelected}>Delete</Button>
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