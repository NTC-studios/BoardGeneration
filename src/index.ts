import Board from "./Board.js";
import { tileSettings } from "./tileSettings.js";
import { Config } from "./types.js";

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const config: Config = {
    TILE_SIZE: 100,
    SPACING: 25,
    TEXT_SIZE: 25,
    ctx: ctx
}

const rates: { [key: string]: number } = {
    empty: 20,
    gold: 10,
    shop: 8,
    lucky: 9,
    unlucky: 9,
    versus: 5,
    teleport: 3,
    notile: 35,
}

const board = new Board(
    config,
    [6, 9], // Height, Width
    tileSettings,
    rates
)

document.addEventListener("keypress", event => {
    if (event.code === 'Space') {
        board.clear();
        board.populate();
    }
})


// // Step 3, draw all the connections
// for (let i = 0; i < boardSize[0]; i++) {
//     for (let j = 0; j < boardSize[1]; j++) {
//         const self = board[i][j];
//         if (self?.text === "notile") continue;


//         [-1, 0, 1].forEach(deltaY => {
//             [-1, 0, 1].forEach(deltaX => {
//                 const tile = board?.[i + deltaY]?.[j + deltaX]
//                 const random = randomInt(0, 100);

//                 if (tile && tile.text !== "notile" && random > 70) {
//                     const isOneWay = randomInt(0, 100) > 60;
//                     drawConnection(config, [i, j], [i + deltaY, j + deltaX], isOneWay);
//                 }
//             })
//         })

//     }
// }