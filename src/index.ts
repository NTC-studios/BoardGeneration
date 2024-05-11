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