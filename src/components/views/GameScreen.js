import Button from "../Button";
import styled from 'styled-components'
import React, {useState, useEffect, useContext, useMemo, useRef} from "react";
import {AppContext} from "../../App";
import useLocalStorage from 'react-use-localstorage';
import {Column} from "../Layouts";
import {toast} from "react-toastify";

export default function GameScreen(props) {
    const masterServer = localStorage.getItem('masterServer') ?? "ws://troosa.ddns.net:3008";
    const {setView, ws, setWs, crosswordName, player, setPlayer, room, setRoom} = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [zoomLevel, setZoomLevel] = useState(1);

    const [crosswordsStr, setCrosswords] = useLocalStorage('crosswords', '{}');
    const [crossword, setCrossword] = useState({
        gridSize: [0,0], cellSize: [0,0], gridSchema: [], gridPosition: [0,0], image: "", gridData: [], loading: true
    });

    const {gridSize, cellSize, gridSchema, gridPosition, image} = crossword;
    const [gridData, setGridData] = useState(crossword.gridData || []);

    // Override local player instance in network players map
    const players = useMemo(() => {
        if (room?.players)
            return [player, ...Object.values(room.players).filter(p => p.id !== player.id)];
        return [player];
    }, [room.players, player]);

    const cellRefs = useRef([]);
    //const [moveDir, setMoveDir] = useState(true); // true = right, false = down

    const getI = (x,y) => y*gridSize[0]+x;
    const getX = (i) => Math.round((i/gridSize[0] % 1) * gridSize[0]);
    const getY = (i) => Math.floor(i/gridSize[0]);

    const updateCell = (x,y,value) => {
        console.log("updateCell", value);
        let pos = getI(x,y);
        if (ws) {
            ws.send(JSON.stringify({type: "updateCell", roomId: room.code, player, pos, value}));
        }
        let data = [...gridData];
        data[pos] = value;
        //selectCell(player.x+(moveDir ? 1 : 0), player.y+(moveDir ? 0 : 1));
        setGridData(data);
    };

    const selectCell = (x,y) => {
        console.log("selectCell", x,y)
        // TODO check if outside bounds
        setPlayer((prev) => ({...prev, x, y}));
        //let data = [...gridData];
        //let pos = getI(x,y);
        //data[pos] = ;
        //setGridData(data);
    };

    const getCellPlayerColors = (x,y) => {
        return players
            .filter(p => p.x === x && p.y === y)
            .map(p => p.color);
    };

    const handleArrowKeys = e => {
        if (e.ctrlKey || e.metaKey || e.altKey) {
            switch (e.keyCode) {
                case 38: setZoomLevel(prev => prev*0.75); break; // up
                case 40: setZoomLevel(prev => prev*1.5); break; // down
            }
        }
        switch (e.keyCode) {
            case 37: selectCell(player.x-1,player.y); break; // left
            case 38: selectCell(player.x,player.y-1); break; // up
            case 39: selectCell(player.x+1,player.y); break; // right
            case 40: selectCell(player.x,player.y+1); break; // down
        }
    };

    const handleIncomingMessage = ({data}) => {
        let packet = JSON.parse(data);
        console.log("[ws]", packet);

        if (typeof packet.success !== "undefined" && !packet.success) {
            if (packet.type === "joinRoom") {
                setView("JoinGame");
                toast('🦄'+packet.error);
            }
        } else {
            if (packet.type === "createRoom") {
                setRoom((prev) => ({...prev, code: packet.room.code}));
                //setLoading(false);
            }
            else if (packet.type === "joinRoom") {
                const {
                    gridSize, cellSize, gridSchema, gridPosition, image,
                    gridData,
                    name, players
                } = packet.room;
                setCrossword({gridSize, cellSize, gridSchema, gridPosition, image});
                setGridData(gridData);
                setRoom((prev) => ({...prev, name, players}));
                setLoading(false);
            }
            else if (packet.type === "updatePlayer") {
                setRoom(prev => ({...prev, players: packet.players}));
            }
            else if (packet.type === "updateCell") {
                setRoom(prev => ({...prev, players: packet.players}));
                setGridData(packet.gridData);
            }
        }
    };

    // Create new room
    useEffect(() => {
        const ws = new WebSocket(masterServer);
        ws.addEventListener("open", () => {
            console.log("We are connected");
            ws.addEventListener("message", handleIncomingMessage);
            setWs(ws);

            console.log(room.code, !room.code, "createRoom")
            if (!room.code) {
                let crosswords = JSON.parse(localStorage.getItem("crosswords") || '{}');
                let crossword = crosswords[crosswordName];
                let {gridSize, cellSize, gridSchema, gridPosition, image, gridData} = crossword;
                ws.send(JSON.stringify({
                    type: "createRoom",
                    player,
                    name: room.name,
                    cellSize: cellSize,
                    gridPosition: gridPosition,
                    gridSize: gridSize,
                    gridSchema: gridSchema,
                    gridData: gridData,
                    image: image,
                }));
            }
        });
        ws.addEventListener('error', event => {
            console.log('WebSocket error: ', event);
            setError("Cannot connect to the server");
            setLoading(false);
        });

        return () => {
            console.log("unmount");
            ws.removeEventListener("message", handleIncomingMessage);
        }
    }, []);

    // Join and leave when room code changes
    useEffect(() => {
        if (ws && room.code) {
            console.log("join", room.code.toUpperCase());
            ws.send(JSON.stringify({type: "joinRoom", roomId: room.code.toUpperCase(), player}));
            return () => {
                console.log("leaveRoom", room.code);
                ws.send(JSON.stringify({type: "leaveRoom", roomId: room.code.toUpperCase(), player}));
            }
        }
    }, [ws, room.code]);

    useEffect(() => {
        if (!ws) return;
        ws.send(JSON.stringify({type: "updatePlayer", roomId: room.code, player}));
    }, [player]);

    useEffect(() => {
        window.addEventListener("keydown", handleArrowKeys);
        return () => {
            window.removeEventListener("keydown", handleArrowKeys);
        }
    }, [player.x, player.y]);

    useEffect(() => {
        //cellRefs.current = cellRefs.current.slice(0, gridData.length);
    }, [gridData]);

    // Focus cell
    useEffect(() => {
        if (Number.isInteger(player.x) && Number.isInteger(player.y)) {
            let pos = getI(player.x,player.y);
            if (pos >= 0 && pos < gridSize[0]*gridSize[1]) {
                cellRefs.current[pos].focus();
            }
        }
    }, [player.x, player.y]);

    const saveGame = () => {
        let date = new Date().toUTCString();
        let name = room.name.split("(")[0] + `(${date})`;

        let json = JSON.parse(crosswordsStr);
        json[name] = {
            gridPosition, gridSize, gridSchema, gridData, cellSize, image, name, isSave: true
        };
        setCrosswords(JSON.stringify(json));
        setView("StartScreen");
    };
    const exitGame = () => {
        setView("StartScreen");
    };

    if (error) {
        return <FlexContainer style={{alignItems: "center", height: "100vh"}}>
            <Column>
                <div>{error}</div>
                <Button onClick={() => {setView("StartScreen")}}>Back</Button>
            </Column>
        </FlexContainer>
    }

    if (loading) {
        return <FlexContainer style={{alignItems: "center", height: "100vh"}}>
            <Column>
                Loading game...
            </Column>
        </FlexContainer>
    }

    return <FlexContainer>
        <Header>
            <span>Room name: {room.name}</span>
            <span>Room code: {room.code}</span>
            <Button onClick={saveGame}>Save and exit</Button>
            <Button onClick={exitGame}>Exit without saving</Button>
        </Header>
        <GridContainer style={{backgroundImage: `url('${image}')`}} zoomLevel={zoomLevel}>
            <Grid
                gridSize={gridSize}
                cellSize={cellSize}
                gridPosition={gridPosition}
            >{gridSchema.map((cellType, i) => {
                let colors = getCellPlayerColors(getX(i), getY(i));
                if (cellType === 1 && colors.length === 0) {
                    colors = ['transparent'];
                }
                return (
                    <Cell
                        key={i}
                        ref={el => cellRefs.current[i] = el}
                        colors={colors}
                        contentEditable
                        suppressContentEditableWarning
                        onClick={() => selectCell(getX(i), getY(i))}
                        onInput={e => {
                            e.target.textContent = e.target.textContent.slice(0,1);
                            updateCell(getX(i), getY(i), e.target.textContent)
                        }}
                    >
                    {gridData[i]}
                </Cell>
            )})}
            </Grid>
    </GridContainer>
    </FlexContainer>
}

const FlexContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
`;
const Header = styled.div`
    flex: 1;
    display: flex;
    width: 100vw;
    justify-content: space-between;
    align-items: center;
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
    font-size: ${props => Math.round(props.cellSize[1]*0.7)}px;
    margin-top: ${props => props.gridPosition[1]}px;
    margin-left: ${props => props.gridPosition[0]}px;
`;

const Cell = styled.div`
    border: ${props => props.colors.length > 0 ? "14" : "1"}px solid ${props => props.colors[0] || "rgba(0,0,0,0.0)"};
    border-image: conic-gradient(${props => props.colors.join(", ")});
    border-image-slice: 1;
    text-transform: uppercase;
    font-family: 'Handlee', sans-serif;;
    box-sizing: border-box;
    caret-color: transparent;
`;
