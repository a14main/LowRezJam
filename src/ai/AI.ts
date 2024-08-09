import { Entity, HEIGHT, MapTile, Terrain, WIDTH } from "../scenes/Gameplay";

export interface AI {
    name: string,
    process: (entity: Entity, map: MapTile[], x: number, y: number) => AIResolver
}

export const DefaultAI: AI = {
    name: "default",
    process: DEFAULT_AI
}
const HungryAI: AI = {
    name: "hungry",
    process(entity, map, x, y): AIResolver {
        let newX = x;
        let newY = y;
        if (map[y * WIDTH + x].food >= 1) {
            map[y * WIDTH + x].food -= 1;
            entity.stats.hunger -= 10;
        } else {
            const possibleMoves = getPossibleMoves(map, x, y);
            possibleMoves.sort((a, b) => b.tile.food - a.tile.food);
            let move = possibleMoves[0];
            if (move.tile.food < 1) {
                move = Phaser.Math.RND.pick(possibleMoves);
            }
            newX = move.tile.x;
            newY = move.tile.y;
        }

        let newState = HungryAI;
        if (entity.stats.hunger < 20) {
            newState = DefaultAI;
        }

        return {
            newX: newX,
            newY: newY,
            newState: newState
        }
    }
}

export interface Action {

}

export interface AIResolver {
    newX: number,
    newY: number,
    newState: AI,
    action?: Action
}

interface MoveChoice {
    tile: MapTile,
    cost: number
}

function DEFAULT_AI(entity: Entity, map: MapTile[], x: number, y: number): AIResolver {
    
    const possibleMoves = getPossibleMoves(map, x, y);
    
    const move = Phaser.Math.RND.pick(possibleMoves);
    const newX = move.tile.x;
    const newY = move.tile.y;

    let newState = DefaultAI;
    if (entity.stats.hunger > 20) {
        newState = HungryAI;
    }
    

    return {
        newX: newX,
        newY: newY,
        newState: newState
    };

}

function getPossibleMoves(map: MapTile[], x: number, y: number): MoveChoice[] {
    const possibleMoves: MoveChoice[] = [];
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const targetX = x + dx;
            const targetY = y + dy;
            const tile = map[targetY * WIDTH + targetX];
            if (targetX < 0 || targetX >= WIDTH || targetY < 0 || targetY >= HEIGHT) {
                continue;
            }
            if (tile && tile.terrain === Terrain.Ground) {
                possibleMoves.push({tile: tile, cost: 1});
            }
        }
    }
    return possibleMoves;
}