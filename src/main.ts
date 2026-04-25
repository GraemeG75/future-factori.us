import { Game } from './game/Game';
import './styles/main.less';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas not found');

const game = new Game(canvas);
game.init().then(() => {
  console.log('Future Factorius started!');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).game = game;
}).catch((err: unknown) => {
  console.error('Failed to start game:', err);
});
