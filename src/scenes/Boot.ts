import Phaser from "phaser";
import SceneKeys from "../keys/SceneKeys";

export default class Boot extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Boot);
    }

    create() {
        this.scene.start(SceneKeys.Preload);
    }
}