/**
 * John Conway's Game of Life
 *
 * SPACE
 *    pause / unpause
 * LEFT/RIGHT
 *    next step, if paused
 * MOUSE CLICK or MOUSE DRAG
 *    activate cell
 *
 * -----------
 *
 *  For a space that is 'populated':
 *     Each cell with one or no neighbors dies, as if by loneliness.
 *     Each cell with two or three neighbors survives.
 *     Each cell with four or more neighbors dies, as if by overpopulation.
 *
 *  For a space that is 'empty' or 'unpopulated'
 *     Each cell with three neighbors becomes populated.
 */

var gamejs = require('gamejs');
gamejs.ready(main);

function Map(width, height) {
   var W = width;
   var H = height;
   var CELL_SIZE = 4; // pixel size of cell

   var DIRS = [
      [1,0],
      [0,1],
      [1,1],
      [-1,0],
      [0, -1],
      [-1,-1],
      [-1,1],
      [1,-1]
   ];
   var DIRS_LENGTH = DIRS.length;

   /**
    * @returns number of neighbours that are alive
    */
   function countNeighbors(x, y) {
      var count = 0;
      for (var i=0; i < DIRS_LENGTH; i++) {
         var dir = DIRS[i];
         var nx = x + dir[0];
         var ny = y + dir[1];
         if (nx < 0 || ny < 0) continue;
         if (nx >= W || ny >= H) continue;
         if (!map[nx][ny]) continue;

         count++;
      }
      return count;
   };

   /**
    * Set cell at mousePos to alive. Transforms passed mouse position
    * to map position.
    */
   this.setAt = function(mousePos) {
      var x = parseInt(mousePos[1] / CELL_SIZE, 10);
      var y = parseInt(mousePos[0] / CELL_SIZE, 10);
      map[x][y] = true;
   }

   /**
    * Draw game of life map to screen.
    */
   this.draw = function(display) {
      // optimization: create rect once and modify its position for current cell
      var pos = new gamejs.Rect([0,0], [CELL_SIZE, CELL_SIZE]);
      for (var i=0; i<H; i++) {
         for (var j=0; j<W; j++) {
            if (map[i][j] === true) {
               pos.top = i * CELL_SIZE;
               pos.left = j * CELL_SIZE;
               gamejs.draw.rect(display, '#666666', pos, 0);
            }
         }
      }
   };

   /**
    * Update map according to game of life rules
    */
   this.update = function() {
      var newMap = [];
      for (var i=0; i<H; i++) {
         newMap[i] = [];
         for (var j=0; j<W; j++) {
            var c = countNeighbors(i, j);
            if (map[i][j] === true) {
               if (c <= 1) {
                  //newMap[i][j] = false;
               } else if (c <= 3) {
                  newMap[i][j] = true;
               } else if (c >= 4) {
                  //newMap[i][j] = false;
               }
            } else {
               if (c === 3) {
                  newMap[i][j] = true;
               } else {
                  // newMap[i][j] = false;
               }
            }
         }
      }
      map = newMap;
      return this;
   };

   /**
    * Constructor randomly sets some cells alive.
    */
   var map = [];
   for (var i=0; i<H; i++) {
      map[i] = [];
      for (var j=0; j<W; j++) {
         map[i][j] = Math.random() < 0.1 ? true : false;
      }
   }
   return this;
}

function main() {
   var display = gamejs.display.setMode([900, 900])
   gamejs.time.fpsCallback(tick, this, 10);

   var map = new Map(200, 200);

   /**
    * Keyboard handling
    */
   var isMouseDown = false;
   var isPaused = false;
   function eventHandler(event) {
      if (event.type === gamejs.event.MOUSE_DOWN) {
         isMouseDown = true;
         map.setAt(event.pos);
      } else if (event.type === gamejs.event.MOUSE_UP) {
         isMouseDown = false;
      } else if (event.type === gamejs.event.MOUSE_MOTION) {
         if (isMouseDown) {
            map.setAt(event.pos);
         }
      } else if (event.type === gamejs.event.KEY_UP) {
         if (event.key === gamejs.event.K_SPACE) {
            isPaused = !isPaused;
         } else if ([gamejs.event.K_RIGHT, gamejs.event.K_LEFT].
            indexOf(event.key) > -1) {
            if (isPaused) {
               map.update();
            }
         }
      }
   }

   /**
    * Every game tick...
    */
   function tick() {
      gamejs.event.get().forEach(eventHandler);
      if (!isPaused) {
         map.update();
      }
      display.clear();
      map.draw(display);
      return;
   };

};
