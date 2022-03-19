import Button from "../Button";
import styled from 'styled-components'
import React, {useState, useEffect, useContext} from "react";
import {AppContext} from "../../App";
import useLocalStorage from 'react-use-localstorage';

export default function CreateCrossword(props) {
    const {setView} = useContext(AppContext);
    const [gridPosition, setGridPosition] = useState([0,0]);
    const [gridSize, setGridSize] = useState([10,10]);
    const [gridSchema, setGridSchema] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [cellSize, setCellSize] = useState([20,20]);
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [crosswords, setCrosswords] = useLocalStorage('crosswords', '{}');

    const getI = (x,y) => y*gridSize[0]+x;
    const getX = (i) => Math.round((i/gridSize[0] % 1) * gridSize[0]);
    const getY = (i) => Math.floor(i/gridSize[0]);

    useEffect(() => {
        let totalSize = gridSize[0] * gridSize[1];
        setGridSchema(Array.from({length: totalSize}, (v, i) => 0));
        setGridData(Array.from({length: totalSize}, (v, i) => ''));
    }, [gridSize]);

    const toggleSchema = (x,y) => {
        let data = [...gridSchema];
        let pos = getI(x,y);
        //console.log("toggle",x,y,data[pos])
        if (data[pos] === 0)
            data[pos] = 1;
        else
            data[pos] = 0;
        setGridSchema(data);
    };

    const saveCrossword = () => {
        if (name === "") {
            alert("Name is empty")
            return;
        }

        let json = JSON.parse(crosswords);
        //TODO confirm existing overwrite
        json[name] = {
            gridPosition, gridSize, gridSchema, gridData, cellSize, image, name, isSave: false
        };
        setCrosswords(JSON.stringify(json))
        setView("StartScreen");
    };

    return <FlexContainer>
        <Toolbar>
            <h1>Create a new crossword</h1>
            Position:
            <input type="number" value={gridPosition[0]} onChange={e => setGridPosition([parseInt(e.target.value), gridPosition[1]])} />
            <input type="number" value={gridPosition[1]} onChange={e => setGridPosition([gridPosition[0], parseInt(e.target.value)])} />
            Cell size:
            <input type="number" value={cellSize[0]} onChange={e => setCellSize([parseInt(e.target.value), cellSize[1]])} />
            <input type="number" value={cellSize[1]} onChange={e => setCellSize([cellSize[0], parseInt(e.target.value)])} />
            Grid size:
            <input type="number" value={gridSize[0]} onChange={e => setGridSize([parseInt(e.target.value), gridSize[1]])} />
            <input type="number" value={gridSize[1]} onChange={e => setGridSize([gridSize[0], parseInt(e.target.value)])} />
            Image url:
            <input value={image} onChange={e => setImage(e.target.value)} />
            Name:
            <input value={name} onChange={e => setName(e.target.value)} />
            <Button onClick={saveCrossword}>Save crossword</Button>
            <Button onClick={() => setView("StartScreen")}>Back</Button>
        </Toolbar>
        <GridContainer style={{backgroundImage: `url('${image}')`}}>
            <Grid
                gridSize={gridSize}
                cellSize={cellSize}
            >{gridData.map((letter, i) => (
                <Cell
                    key={i}
                    style={{backgroundColor: gridSchema[i] === 0 ? `rgba(0,255,0,0.5)` : `rgba(255,0,0,0.5)`}}
                    onClick={() => toggleSchema(getX(i), getY(i))}
                >
                    {letter}
                </Cell>
            ))}
            </Grid>
        </GridContainer>
    </FlexContainer>
}

const FlexContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: start;
`;
const Toolbar = styled.div`
    flex: 1;
`;

const GridContainer = styled.div`
    flex: 6;
    overflow: auto;
    background-repeat: no-repeat;
`;


const Grid = styled.div`
    display: grid;
    grid-template-rows: repeat(${props => props.gridSize[1]}, ${props => props.cellSize[1]}px);
    grid-template-columns: repeat(${props => props.gridSize[0]}, ${props => props.cellSize[0]}px);
`;

const Cell = styled.div`
    border: 1px solid #000;
`;
