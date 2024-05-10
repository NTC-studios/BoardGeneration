export type TileSettings = {
    rate: number,
    minSpawn: number | null,
    maxSpawn: number | null,
    minConnections: number | null,
    maxConnections: number | null,
    text: string,
    fillColour: string,
    textColour: string | null,
}

export type Config = {
    TILE_SIZE: number,
    SPACING: number,
    TEXT_SIZE: number,
    ctx: CanvasRenderingContext2D
}