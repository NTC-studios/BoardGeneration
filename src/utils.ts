import { Config, Coordinates, Tile } from "./types";

export const randomInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1) + a);

export function makeBoard(width: number, height: number) {
    let arr: null[][] = [];
    for (let i = 0; i < height; i++) {
        arr[i] = [];
        for (let j = 0; j < width; j++) arr[i][j] = null;
    }

    return arr;
}

export function drawTile(config: Config, coordinates: Coordinates, tile: Tile) {
    const { TILE_SIZE, SPACING, ctx, TEXT_SIZE } = config;

    const [x, y] = coordinates;
    const rectX = x * (TILE_SIZE + SPACING);
    const rectY = y * (TILE_SIZE + SPACING);

    // Draw square
    ctx.fillStyle = tile.fillColour;
    ctx.fillRect(rectX, rectY, TILE_SIZE, TILE_SIZE);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = tile.textColour ?? "#FFFFFF";
    ctx.font = `${TEXT_SIZE}px Arial`;
    ctx.fillText(tile.text, rectX + (TILE_SIZE / 2), rectY + (TILE_SIZE / 2))
}

export function drawConnection(config: Config, tile1: Coordinates, tile2: Coordinates) {

}

function drawArrow(config: Config, from: Coordinates, to: Coordinates) {
    const { ctx } = config;
    const headLen = 10;
    const dx = from[0] - to[0];
    const dy = from[1] - to[1];
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.lineTo(to[0] - headLen * Math.cos(angle - Math.PI / 6), to[1] - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to[0], to[1]);
    ctx.lineTo(to[0] - headLen * Math.cos(angle + Math.PI / 6), to[1] - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}