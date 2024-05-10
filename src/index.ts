import { tiles } from "./tiles.js";
import { Config, Coordinates, Tile } from "./types.js";
import { drawConnection, drawTile, findTile, getSurroundingTiles, makeBoard, randomInt } from "./utils.js";

// DEBUG HELP

// const rates = {
//     empty: 20,
//     gold: 10,
//     shop: 8,
//     lucky: 9,
//     unlucky: 9,
//     versus: 5,
//     teleport: 3,
//     notile: 35,
// }

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

for (const [key, value] of Object.entries(rates)) {
    const index = tiles.findIndex(tile => tile.text === key);
    tiles[index].rate = value;
}

// END



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
// Width - Height
const boardSize = [9, 6];
if (boardSize[0] * boardSize[1] > 256) throw new Error("Board too big");

const board: (Tile | null)[][] = makeBoard(boardSize[1], boardSize[0]);

// Step 1, tiles with min. spawn
const haveMinSpawn = tiles.filter(tile => tile.minSpawn);
if (haveMinSpawn.length > boardSize[0] * boardSize[1]) throw new Error("Board too small");
for (const tile of haveMinSpawn) {
    // Coord first indexes what row, then what column
    let coords = [randomInt(0, boardSize[0] - 1), randomInt(0, boardSize[1] - 1)] as Coordinates;
    while (board[coords[0]][coords[1]]) coords = [randomInt(0, boardSize[0] - 1), randomInt(0, boardSize[1] - 1)] as Coordinates;

    drawTile(config, coords, tile);
    board[coords[0]][coords[1]] = structuredClone(tile);
    if (tile.maxSpawn) tile.maxSpawn -= 1;

    // Should spawn till maxSpawn is reached tbh
}

// Step 2, filter the tiles and get constants
let tilesToSpawn = tiles.filter(tile => tile.rate > 0 && tile.maxSpawn !== 0);

for (let i = 0; i < boardSize[0]; i++) {
    for (let j = 0; j < boardSize[1]; j++) {
        if (board[i][j]) continue;

        let sessionTiles = structuredClone(tilesToSpawn);

        getSurroundingTiles(board, [i, j])
            .filter(v => v[1] > 0)
            .forEach(tileType => {
                const t = sessionTiles.find(tile => tile.text === tileType[0]);
                if (t && t.text !== "empty") {
                    const divisor = Math.max(-0.5 * tileType[1] + 2.5, 0)
                    t.rate = Math.floor(t.rate / divisor);
                };
            });

        let totalRate = sessionTiles.reduce((a, b) => a + b.rate, 0);
        let tileIndexer: number[] = sessionTiles.map(v => v.rate).map((sum => value => sum += value)(0));

        // Change rates based on tiles around
        const tileToSpawn = randomInt(1, totalRate);
        const indexer = tileIndexer.findIndex(v => tileToSpawn <= v);
        if (indexer === -1) console.log(tileToSpawn)
        const tile = sessionTiles[indexer];

        drawTile(config, [i, j], tile);
        board[i][j] = structuredClone(tile);
        if (tile.maxSpawn) {
            tile.maxSpawn -= 1;
            if (tile.maxSpawn !== 0) continue;
            tilesToSpawn = tilesToSpawn.filter(tile => tile.maxSpawn !== 0);
        }
    }
}

// Step 3, draw all the connections
for (let i = 0; i < boardSize[0]; i++) {
    for (let j = 0; j < boardSize[1]; j++) {
        const self = board[i][j];
        if (self?.text === "notile") continue;


        [-1, 0, 1].forEach(deltaY => {
            [-1, 0, 1].forEach(deltaX => {
                const tile = board?.[i + deltaY]?.[j + deltaX]
                const random = randomInt(0, 100);

                if (tile && tile.text !== "notile" && random > 70) {
                    const isOneWay = randomInt(0, 100) > 60;
                    drawConnection(config, [i, j], [i + deltaY, j + deltaX], isOneWay);
                }
            })
        })

    }
}

// Get flamingo distance and validate flamingo position
const flamingo_tile = findTile(board, "flamingo");
const start_tile = findTile(board, "start");