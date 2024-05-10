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

    if (tile.text === "notile") return;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = tile.textColour ?? "#FFFFFF";
    ctx.font = `${TEXT_SIZE}px Arial`;
    ctx.fillText(tile.text, rectX + (TILE_SIZE / 2), rectY + (TILE_SIZE / 2))
}

export function drawConnection(config: Config, tile1: Coordinates, tile2: Coordinates, isOneWay = false) {
    const { ctx, TILE_SIZE, SPACING } = config;
    const HALF_TILE = config.TILE_SIZE / 2;
    const SIZE_SPACING = TILE_SIZE + SPACING;
    const dX = tile2[0] - tile1[0];
    const dY = tile2[1] - tile1[1];

    const tile_1_point = [tile1[0] * SIZE_SPACING + HALF_TILE, tile1[1] * SIZE_SPACING + HALF_TILE] as Coordinates;
    if (dX < 0) tile_1_point[0] -= HALF_TILE;
    if (dX > 0) tile_1_point[0] += HALF_TILE;
    if (dY < 0) tile_1_point[1] -= HALF_TILE;
    if (dY > 0) tile_1_point[1] += HALF_TILE;

    const tile_2_point = [tile2[0] * SIZE_SPACING + HALF_TILE, tile2[1] * SIZE_SPACING + HALF_TILE] as Coordinates;
    if (dX < 0) tile_2_point[0] += HALF_TILE;
    if (dX > 0) tile_2_point[0] -= HALF_TILE;
    if (dY < 0) tile_2_point[1] += HALF_TILE;
    if (dY > 0) tile_2_point[1] -= HALF_TILE;

    drawArrow(config, tile_1_point, tile_2_point, isOneWay);
}

function drawArrow(config: Config, from: Coordinates, to: Coordinates, oneWay = false) {
    const { ctx } = config;
    const headLen = 10;
    const dx = from[0] - to[0];
    const dy = from[1] - to[1];
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF"
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    if (oneWay) ctx.lineTo(to[0] - headLen * Math.cos(angle - Math.PI / 6), to[1] - headLen * Math.sin(angle - Math.PI / 6));
    if (oneWay) ctx.lineTo(to[0], to[1]);
    if (oneWay) ctx.lineTo(to[0] - headLen * Math.cos(angle + Math.PI / 6), to[1] - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

export function getSurroundingTiles(board: (Tile | null)[][], coordinates: Coordinates) {
    const surroundingTiles: [(string | undefined), number][] = [];

    const RADIUS = 5; // uneven number
    const DISTANCE = (RADIUS - 1) / 2
    let DELTAS = [];
    for (let i = -DISTANCE; i <= DISTANCE; i++) DELTAS.push(i);

    // LTR
    DELTAS.forEach(deltaY => {
        DELTAS.forEach(deltaX => {
            const Y = coordinates[0] + deltaX;
            const X = coordinates[1] + deltaY;
            const tile = board?.[Y]?.[X];
            const distance = Math.max(Math.abs(deltaY), Math.abs(deltaX));
            surroundingTiles.push([tile?.text, distance]);
        })
    })

    return surroundingTiles;
}

export function findTile(board: (Tile | null)[][], type = "flamingo") {
    const tile_x = board.findIndex(row => row.find(v => v?.text === type)) + 1;
    const tile_y = board[tile_x - 1].findIndex(v => v?.text === type) + 1;

    return [tile_x, tile_y];
}