import Tile from "./Tile.js";
import { Config, TileSettings } from "./types";
import { clamp, randomInt } from "./utils.js";

export default class Board {
    board: (Tile | null)[][] = [];

    constructor(
        private config: Config,
        private boardSize: [number, number],
        private tileSettings: TileSettings[],
        public rates: { [key: string]: number }
    ) {
        if (boardSize[0] * boardSize[1] < 16) throw new Error("Board too small!");

        for (const [key, value] of Object.entries(rates)) {
            const index = this.tileSettings.findIndex(tile => tile.text === key);
            this.tileSettings[index].rate = value;
        }

        this.initialiseBoard(boardSize);
        this.populate();
    }

    private initialiseBoard(boardSize: [number, number]) {
        let arr: null[][] = [];
        for (let i = 0; i < boardSize[0]; i++) {
            arr[i] = [];
            for (let j = 0; j < boardSize[1]; j++) arr[i][j] = null;
        }

        this.board = arr;
    }

    populate() {

        const haveMinSpawn = this.tileSettings.filter(v => v.minSpawn);
        for (const tile of haveMinSpawn) {
            // Coord first indexes what row, then what column
            let coords = [randomInt(0, this.boardSize[0] - 1), randomInt(0, this.boardSize[1] - 1)];
            while (this.board[coords[0]][coords[1]]) coords = [randomInt(0, this.boardSize[0] - 1), randomInt(0, this.boardSize[1] - 1)];

            this.board[coords[0]][coords[1]] = new Tile(
                tile.text,
                tile.fillColour,
                tile.textColour ?? "#FFFFFF",
                coords as [number, number],
                [],
                tile.maxConnections,
                tile.minConnections ?? 1
            );

            if (tile.maxSpawn) tile.maxSpawn -= 1;
        }


        let tilesToSpawn = this.tileSettings.filter(tile => tile.rate > 0 && tile.maxSpawn !== 0);

        for (let i = 0; i < this.boardSize[0]; i++) {
            for (let j = 0; j < this.boardSize[1]; j++) {
                if (this.board[i][j]) continue;

                let sessionTiles = structuredClone(tilesToSpawn);

                this.getAdjacentTiles([i, j])
                    .forEach(tile => {
                        const t = sessionTiles.find(t => t.text === tile.text);
                        if (t && t.text !== "empty") {
                            t.rate = Math.floor(t.rate / 1.5);
                        };
                    });


                let totalRate = sessionTiles.reduce((a, b) => a + b.rate, 0);
                let tileIndexer: number[] = sessionTiles.map(v => v.rate).map((sum => value => sum += value)(0));

                const tileToSpawn = randomInt(1, totalRate);
                const indexer = tileIndexer.findIndex(v => tileToSpawn <= v);
                const tile = sessionTiles[indexer];

                this.board[i][j] = new Tile(
                    tile.text,
                    tile.fillColour,
                    tile?.textColour ?? "#FFFFFF",
                    [i, j] as [number, number],
                    [],
                    tile.maxConnections,
                    tile.minConnections ?? 1
                )

                if (tile.maxSpawn) {
                    tile.maxSpawn -= 1;
                    if (tile.maxSpawn !== 0) continue;
                    tilesToSpawn = tilesToSpawn.filter(tile => tile.maxSpawn !== 0);
                }
            }
        }

        // # Connections
        for (let i = 0; i < this.boardSize[0]; i++) {
            for (let j = 0; j < this.boardSize[1]; j++) {
                const self = this.board[i][j];
                if (!self || self.text === "notile") continue;
                if (self.connections.length === self.maxConnections) continue;

                const availableConnections = this.getAvailableConnections([i, j]);
                const availableDirections = Object.keys(availableConnections).length;
                const selfTile = this.tileSettings.find(v => v.text === self.text)!;

                const STEEPNESS = 7;
                const formula = Math.round(availableDirections * (Math.random() ** STEEPNESS) + 1);
                const realMax = Math.min(self.maxConnections ?? Infinity, availableDirections);
                const amountOfConnections = clamp(formula, selfTile.minConnections ?? 1, realMax);

                for (let i = 0; i < amountOfConnections; i++) {
                    const directions = Object.keys(availableConnections);
                    const randomDirection = directions[randomInt(0, directions.length - 1)];

                    const possibleTiles = availableConnections[randomDirection];
                    const randomTile = possibleTiles[randomInt(0, possibleTiles.length - 1)];

                    delete availableConnections[randomDirection];

                    if (randomTile.maxConnections === randomTile.connections.length) continue;

                    self.connections.push(randomTile);
                    randomTile.connections.push(self);
                }
            }
        }

        // TODO get rid of the islands
        const start = this.findTile("start");
        const flamingo = this.findTile("flamingo");
        const distance = this.distanceBetweenTiles(this.board[start[0]][start[1]]!, this.board[flamingo[0]][flamingo[1]]!);

        if (distance === -1 || distance < 3) {
            this.clear();
            this.populate();
        }

        this.draw();
    }

    private draw() {
        this.board.forEach(row => {
            row.forEach(tile => {
                if (tile) tile.draw(this.config);
            })
        })
    }

    private getAdjacentTiles(coords: [number, number], diagonals = true) {
        const adjacent: Tile[] = [];

        for (let deltaY = -1; deltaY <= 1; deltaY++) {
            for (let deltaX = -1; deltaX <= 1; deltaX++) {
                if (deltaY === 0 && deltaX === 0) continue;
                if (!diagonals && Math.abs(deltaX) + Math.abs(deltaY) === 2) continue;

                const t = this.board?.[coords[0] + deltaY]?.[coords[1] + deltaX];
                if (t) adjacent.push(t);
            }
        }

        return adjacent;
    }

    private getAvailableConnections(coords: [number, number]) {
        const availableConnections: Tile[] = this.getAdjacentTiles(coords);

        availableConnections.forEach(tile => {
            const dX = Math.abs(tile.coordinates[0] - coords[0]);
            const dY = Math.abs(tile.coordinates[1] - coords[1]);
            if (dX + dY !== 2)
                if (tile.text === "notile") availableConnections.push(...this.getAdjacentTiles(tile.coordinates, false));
        })

        const uniqueConnections = [...new Map(availableConnections.map(item => [item.coordinates, item])).values()]
            .filter(tile => tile.text !== "notile")
            .filter(tile => !(tile.coordinates[0] === coords[0] && tile.coordinates[1] === coords[1]));

        let connectionMap: { [key: string]: Tile[] } = {
            N: [],
            NE: [],
            E: [],
            SE: [],
            S: [],
            SW: [],
            W: [],
            NW: []
        }

        for (const tile of uniqueConnections) {
            const dY = tile.coordinates[0] - coords[0];
            const dX = tile.coordinates[1] - coords[1];

            if (dY < 0) {
                if (dX < 0) connectionMap.NW.push(tile)
                if (dX === 0) connectionMap.N.push(tile)
                if (dX > 0) connectionMap.NE.push(tile)
            }
            if (dY === 0) {
                if (dX < 0) connectionMap.W.push(tile)
                if (dX > 0) connectionMap.E.push(tile)
            }
            if (dY > 0) {
                if (dX < 0) connectionMap.SW.push(tile)
                if (dX === 0) connectionMap.S.push(tile)
                if (dX > 0) connectionMap.SE.push(tile)
            }
        }

        connectionMap = Object.fromEntries(Object.entries(connectionMap).filter(v => v[1].length))

        return connectionMap;
    }

    clear() {
        this.config.ctx.clearRect(0, 0, this.config.ctx.canvas.width, this.config.ctx.canvas.height);
        this.initialiseBoard(this.boardSize);
    }

    private findTile(type: string) {
        const Y = this.board.findIndex(v => v.find(v => v?.text === type));
        const X = this.board[Y].findIndex(v => v?.text === type);

        return [Y, X];
    }

    private distanceBetweenTiles(tile1: Tile, tile2: Tile) {
        const CANT_PASS = ["shadow", "teleport"];
        let level = 0;
        const queue: Tile[] = [];
        queue.push(...tile1.connections);
        const visited = new Set();

        while (queue.length) {
            let level_size = queue.length;

            while (level_size) {
                const t = queue.shift()!;
                visited.add(t.coordinates.join("."));

                if (t.coordinates[0] === tile2.coordinates[0] && t.coordinates[1] === tile2.coordinates[1]) {
                    return level;
                }

                for (const con of t.connections) {
                    if (CANT_PASS.includes(con.text)) continue;
                    const coords = con.coordinates.join(".");
                    if (!visited.has(coords)) queue.push(con);
                }

                level_size -= 1;
            }
            level++;
        }

        return -1;
    }
}