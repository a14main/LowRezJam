import Phaser from "phaser";
import SceneKeys from "../keys/SceneKeys";
import AssetKeys from "../keys/AssetKeys";

import Perlin from 'phaser3-rex-plugins/plugins/perlin.js';
import { AI, DefaultAI } from "../ai/AI";

export const WIDTH = 64;
export const HEIGHT = 48;

const MAX_ENTITIES = 128;

const NUM_TRIBES = 4;

const TICK = 300;

export enum Terrain {
    Ground = 0,
    Wall = 1,
    Water = -1
}

export interface Entity {
    id: number,
    color: number,
    clock: number,
    ai: AI,
    stats: Stats,
}

interface Stats {
    hunger: number,
}

export interface MapTile {
    x: number,
    y: number,
    terrain: Terrain,
    food: number,
    entities: Entity[],
}

export default class Gameplay extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Gameplay);
    }

    private map!: MapTile[];
    private nextMap!: MapTile[];

    private graphics!: Phaser.GameObjects.Graphics;

    private infoText!: Phaser.GameObjects.BitmapText;

    create() {

        // create graphics
        this.graphics = this.add.graphics();



        // create map
        const mapSeed = Phaser.Math.Between(0, Phaser.Math.MAX_SAFE_INTEGER);
        const foodSeed = Phaser.Math.Between(0, Phaser.Math.MAX_SAFE_INTEGER);
        this.map = Array(WIDTH * HEIGHT);
        this.nextMap = Array(WIDTH * HEIGHT);


        const mapNoise = new Perlin(mapSeed);
        const foodNoise = new Perlin(foodSeed);

        for (let i = 0; i < this.map.length; i++) {
            const x = i % WIDTH;
            const y = Math.floor(i / WIDTH);

            const mapNoiseValue = mapNoise.simplex2(x / 4, y / 4);
            const foodNoiseValue = foodNoise.simplex2(x, y);

            this.nextMap[i] = {
                x: x,
                y: y,
                terrain: Math.round(mapNoiseValue * 0.8),
                food: Math.max(0, Math.floor(foodNoiseValue * 10)),
                entities: []
            }
        }


        // spawn entities




        let spawned = 0;

        while (spawned < MAX_ENTITIES) {
            const x = Phaser.Math.Between(0, WIDTH - 1);
            const y = Phaser.Math.Between(0, HEIGHT - 1);

            if (this.nextMap[y * WIDTH + x].terrain === Terrain.Ground) {
                const ent: Entity = {
                    id: spawned,
                    color: Phaser.Math.Between(0x000000, 0xffffff),
                    clock: Phaser.Math.Between(0, TICK),
                    ai: DefaultAI,
                    stats: {
                        hunger: 0
                    }
                }

                this.nextMap[y * WIDTH + x].entities.push(ent);
                spawned++;
            }
        }




        // start systems

        // add input listeners

        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;
            const x = Math.floor(worldX);
            const y = Math.floor(worldY);
            this.showInfo(y * WIDTH + x);
        });

        // add UI

        this.infoText = this.add.bitmapText(
            0,
            64,
            AssetKeys.Font,
            "012345678901234567890",
            10,
            Phaser.GameObjects.BitmapText.ALIGN_LEFT
        ).setOrigin(0, 1);
    }

    update(_time: number, deltaTime: number) {

        this.graphics.clear();

        this.map = [...this.nextMap];
        this.nextMap = this.nextMap.map((tile) => {
            return { x: tile.x, y: tile.y, terrain: tile.terrain, food: tile.food, entities: [] }
        });

        for (let i = 0; i < this.map.length; i++) {
            this.drawMapTile(i, deltaTime);
        }
    }

    private drawMapTile(i: number, deltaTime: number) {
        const mapTile = this.map[i];
        const { terrain, food, entities } = mapTile;

        const mapX = i % WIDTH;
        const mapY = Math.floor(i / WIDTH);

        this.graphics.fillStyle(terrain === Terrain.Ground ? 0xc6d696 : terrain === Terrain.Wall ? 0xA0A080 : 0x4080A0);
        this.graphics.fillPoint(mapX, mapY);


        if (terrain === Terrain.Ground && food > 0) {
            this.graphics.fillStyle(0x008000, food / 10);
            this.graphics.fillPoint(mapX, mapY);
        }


        for (let entity of entities) {

            let ex = i % WIDTH;
            let ey = Math.floor(i / WIDTH);

            this.graphics.fillStyle(entity.color);
            this.graphics.fillPoint(ex, ey);


            entity.clock += deltaTime;
            if (entity.clock > TICK) {
                entity.clock -= TICK;

                entity.stats.hunger += 1;

                const resolver = entity.ai.process(entity, this.map, ex, ey);
                entity.ai = resolver.newState;
                ex = resolver.newX;
                ey = resolver.newY;
                if (
                    this.map[resolver.newX].entities.length === 0
                    && this.nextMap[resolver.newY].entities.length === 0
                ) {
                    
                }
            }

            this.nextMap[ey * WIDTH + ex].entities.push(entity);
            this.nextMap[i].food = this.map[i].food;
        }
    }

    private showInfo(mapIndex: number) {
        if (mapIndex > this.map.length) {
            this.infoText.setText("");
            return;
        }
        const ent = this.map[mapIndex].entities;
        if (!ent) {
            return;
        }
        const entities = this.map.reduce((sum, value) => { return sum + (value.entities.length)}, 0);
        const text = this.map[mapIndex].food + ":" + this.map[mapIndex].terrain + ":" + ent[0]?.stats.hunger + ":" + ent[0]?.ai.name;

        this.infoText.setText(text);
    }

}

