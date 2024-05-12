import Board from "./Board.js";
import { tileSettings } from "./tileSettings.js";
import { Config } from "./types.js";

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let BOARD_SIZE = [6, 9] as [number, number]; // Height, Width
const newSize = prompt("Board size? (H W):", "6 9")?.split(" ").map(Number);
if (newSize?.length === 2) {
    BOARD_SIZE[0] = newSize[0];
    BOARD_SIZE[1] = newSize[1]
}

const tileWidth = Math.floor(canvas.width / (BOARD_SIZE[1] + BOARD_SIZE[1] * 0.25));
const tileHeight = Math.floor(canvas.height / (BOARD_SIZE[0] + BOARD_SIZE[0] * 0.25));
const tileSize = Math.min(tileWidth, tileHeight);
const fontSize = Math.round(tileSize * 0.25);

const config: Config = {
    TILE_SIZE: tileSize,
    SPACING: fontSize,
    TEXT_SIZE: fontSize,
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
    BOARD_SIZE,
    tileSettings,
    rates
)

board.export();

document.addEventListener("keypress", event => {
    if (event.code === 'Space') {
        board.clear();
        board.populate();
    }
})