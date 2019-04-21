import { Black, GameObject, CanvasDriver, Input, Engine, StageScaleMode } from "black-engine";
import { Game } from "./game";

// Game will be our starting class and rendering will be done on Canvas
const black = new Engine('container', Game, CanvasDriver, [Input]);

// Pause simulation when container loses focus
black.pauseOnBlur = false;

// Pause simulation when page is getting hidden
black.pauseOnHide = false;

// Wroom, wroom!
black.start();

// // Set default stage size
black.stage.setSize(900, 500);

// // Makes stage always centered
black.stage.scaleMode = StageScaleMode.LETTERBOX;

