import Button from "../Button";
import styled from 'styled-components'
import React, {useState, useEffect, useContext} from "react";
import {AppContext} from "../../App";
import useLocalStorage from 'react-use-localstorage';

export default function CreateCrossword(props) {
    const {setView, crosswordName} = useContext(AppContext);
    const [crosswordsStr, setCrosswords] = useLocalStorage('crosswords', '{}');
    const crosswords = JSON.parse(crosswordsStr);
    let crossword = crosswords[crosswordName];

    const [gridPosition, setGridPosition] = useState(crossword?.gridPosition || [0,0]);
    const [gridSize, setGridSize] = useState(crossword?.gridSize || [10,10]);
    const [gridSchema, setGridSchema] = useState(crossword?.gridSchema || []);
    const [gridData, setGridData] = useState(crossword?.gridData || []);
    const [cellSize, setCellSize] = useState(crossword?.cellSize || [20,20]);
    const [image, setImage] = useState(crossword?.image || "");
    const [name, setName] = useState(crossword?.name || "");
    const [zoomLevel, setZoomLevel] = useState(1);

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

        let json = JSON.parse(crosswordsStr);
        //TODO confirm existing overwrite
        json[name] = {
            gridPosition, gridSize, gridSchema, gridData, cellSize, image, name, isSave: false
        };
        setCrosswords(JSON.stringify(json))
        setView("StartScreen");
    };

    const handleArrowKeys = e => {
        if (e.ctrlKey || e.metaKey || e.altKey) {
            switch (e.keyCode) {
                case 38: setZoomLevel(prev => prev*0.75); break; // up
                case 40: setZoomLevel(prev => prev*1.5); break; // down
            }
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleArrowKeys);
        return () => {
            window.removeEventListener("keydown", handleArrowKeys);
        }
    }, []);

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
        <GridContainer style={{backgroundImage: `url('${image}')`}} zoomLevel={zoomLevel}>
            <Grid
                gridSize={gridSize}
                cellSize={cellSize}
                gridPosition={gridPosition}
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
    //justify-content: center;
    align-items: start;
`;
const Toolbar = styled.div`
    flex: 1;
    position: sticky;
    top: 0;
`;

const GridContainer = styled.div`
    flex: 6;
    background-repeat: no-repeat;
    background-attachment: local;
    transform-origin: 0 0;
    transform: scale(${props => props.zoomLevel});
`;


const Grid = styled.div`
    display: grid;
    grid-template-rows: repeat(${props => props.gridSize[1]}, ${props => props.cellSize[1]}px);
    grid-template-columns: repeat(${props => props.gridSize[0]}, ${props => props.cellSize[0]}px);
    margin-top: ${props => props.gridPosition[1]}px;
    margin-left: ${props => props.gridPosition[0]}px;
`;

const Cell = styled.div`
    border: 1px solid #000;
`;
