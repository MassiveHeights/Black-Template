import { Black, CanvasDriver, StageScaleMode } from 'black';
import Game from './game';

// Game will be our starting class and rendering will be done on Canvas
const black = new Black('container', Game, CanvasDriver);

// For performance purposes fixed-time-step is disabled by default
black.enableFixedTimeStep = true;

// Pause simulation when container loses focus
black.pauseOnBlur = true;

// Pause simulation when page is getting hidden
black.pauseOnHide = true;

// Wroom, wroom!
black.start();

// Set default stage size
black.stage.setSize(900, 500);

// Makes stage always centered
black.stage.scaleMode = StageScaleMode.LETTERBOX;