import Phaser from "phaser";
import Boot from "./scenes/Boot";
import Preload from "./scenes/Preload";
import Gameplay from "./scenes/Gameplay";

new Phaser.Game({
  width: 64,
  height: 64,
  parent: 'game',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  autoRound: true,
  roundPixels: true,
  antialias: false,
  scene: [Boot, Preload, Gameplay]
});