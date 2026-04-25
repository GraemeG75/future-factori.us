import './styles/main.less';
import { Game } from './game/Game';
import { UiController } from './ui/UiController';
import { I18n } from './i18n/index';

const i18n = I18n.getInstance();
i18n.setLocale('en');

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas not found');

const game = new Game(canvas);
await game.init();

const ui = new UiController(game, i18n);
ui.init();

game.setOnStateChange((state) => {
  ui.update(state);
});

// Initial UI render
ui.update(game.getState());

(window as any).game = game;  // eslint-disable-line @typescript-eslint/no-explicit-any
(window as any).ui = ui;      // eslint-disable-line @typescript-eslint/no-explicit-any
