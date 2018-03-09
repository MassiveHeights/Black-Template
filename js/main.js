import { Black, CanvasDriver, StageScaleMode } from 'black';
import Game from './game';

// Game will be our starting class and rendering will be done on Canvas
const black = new Black('container', Game, CanvasDriver);

// For performance purposes fixed-time-step is disabled by default
// Enable it if you doing multiplayer, physics based on time based game
black.enableFixedTimeStep = false;

// Pause simulation when container loses focus
black.pauseOnBlur = false;

// Pause simulation when page is getting hidden
black.pauseOnHide = false;

// Wroom, wroom!
black.start();

// Set default stage size
black.stage.setSize(900, 500);

// Makes stage always centered
black.stage.scaleMode = StageScaleMode.LETTERBOX;