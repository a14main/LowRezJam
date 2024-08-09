import Phaser from "phaser";
import SceneKeys from "../keys/SceneKeys";
import AssetKeys from "../keys/AssetKeys";

export default class Preload extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Preload);
    }

    preload() {
        this.load.bitmapFont(AssetKeys.Font, "./fonts/minogram_6x10.png", "./fonts/minogram_6x10.xml");

        this.textures.addDynamicTexture(AssetKeys.MapTexture, 64, 64);
    }

    create() {
        this.scene.start(SceneKeys.Gameplay);
    }
}