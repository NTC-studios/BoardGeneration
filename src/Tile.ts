import { Config } from "./types";

export default class Tile {
    readonly ID: string;

    constructor(
        public text: string,
        public fillColour: string,
        public textColour = "#FFFFFF",
        public coordinates: [number, number],
        public connections: Tile[] = [],
        public maxConnections: number | null,
        public minConnections = 1,
    ) {
        this.ID = crypto.randomUUID();
    }

    draw(config: Config) {
        const { TILE_SIZE, SPACING, ctx, TEXT_SIZE } = config;

        const rectY = this.coordinates[0] * (TILE_SIZE + SPACING);
        const rectX = this.coordinates[1] * (TILE_SIZE + SPACING);

        // Draw square
        ctx.fillStyle = this.fillColour;
        ctx.fillRect(rectX, rectY, TILE_SIZE, TILE_SIZE);

        // Draw text
        if (this.text === "notile") return;
        const text_to_draw = this.text.toUpperCase();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.textColour;

        let textSizeDynamic = TEXT_SIZE;
        ctx.font = `500 ${textSizeDynamic}px Oswald`;
        while (ctx.measureText(text_to_draw).width > 0.8 * TILE_SIZE) {
            textSizeDynamic -= 1;
            ctx.font = `500 ${textSizeDynamic}px Oswald`;
        }

        ctx.fillText(text_to_draw, rectX + (TILE_SIZE / 2), rectY + (TILE_SIZE / 2));

        // # Connections
        const HALF_TILE = config.TILE_SIZE / 2;
        const SIZE_SPACING = TILE_SIZE + SPACING;
        for (const tile of this.connections) {
            const dY = tile.coordinates[0] - this.coordinates[0];
            const dX = tile.coordinates[1] - this.coordinates[1];

            const tile_1_point = [
                this.coordinates[0] * SIZE_SPACING + HALF_TILE,
                this.coordinates[1] * SIZE_SPACING + HALF_TILE
            ] as [number, number]

            if (dY < 0) tile_1_point[0] -= HALF_TILE;
            if (dY > 0) tile_1_point[0] += HALF_TILE;
            if (dX < 0) tile_1_point[1] -= HALF_TILE;
            if (dX > 0) tile_1_point[1] += HALF_TILE;

            const tile_2_point = [
                tile.coordinates[0] * SIZE_SPACING + HALF_TILE,
                tile.coordinates[1] * SIZE_SPACING + HALF_TILE
            ] as [number, number]

            if (dY < 0) tile_2_point[0] += HALF_TILE;
            if (dY > 0) tile_2_point[0] -= HALF_TILE;
            if (dX < 0) tile_2_point[1] += HALF_TILE;
            if (dX > 0) tile_2_point[1] -= HALF_TILE;

            drawArrow(config, tile_1_point, tile_2_point);
        }
    }
}

function drawArrow(config: Config, from: [number, number], to: [number, number], oneWay = false) {
    const { ctx } = config;
    const headLen = 10;
    const dx = from[1] - to[1];
    const dy = from[0] - to[0];
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF"
    ctx.moveTo(from[1], from[0]);
    ctx.lineTo(to[1], to[0]);
    if (oneWay) ctx.lineTo(to[0] - headLen * Math.cos(angle - Math.PI / 6), to[1] - headLen * Math.sin(angle - Math.PI / 6));
    if (oneWay) ctx.lineTo(to[0], to[1]);
    if (oneWay) ctx.lineTo(to[0] - headLen * Math.cos(angle + Math.PI / 6), to[1] - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}