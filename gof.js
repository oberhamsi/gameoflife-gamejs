try {
   var gamejs = require('gamejs');
} catch (e) {
   // lets hope we are on serverside
}

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

/*
 *
 *  For a space that is 'populated':
 *     Each cell with one or no neighbors dies, as if by loneliness.
 *     Each cell with two or three neighbors survives.
 *     Each cell with four or more neighbors dies, as if by overpopulation.
 *
 *  For a space that is 'empty' or 'unpopulated'
 *     Each cell with three neighbors becomes populated.
 */

exports.Map = function (dims) {
   var W = parseInt(dims[0] / CELL_SIZE, 10);
   var H = parseInt(dims[1] / CELL_SIZE, 10);

   var paused = true;

   this.togglePaused = function() {
      paused = !paused;
   };

   this.forceUpdate = function() {
      // FIXME force on update() but then we'd have update(ms, force)
      paused = false;
      this.update();
      paused = true;
      return;
   };

   /**
    * Set cell at mousePos to alive. Transforms passed mouse position
    * to map position.
    */
   this.setAt = function(mousePos) {
      var x = parseInt(mousePos[1] / CELL_SIZE, 10);
      var y = parseInt(mousePos[0] / CELL_SIZE, 10);
      if (x<0 || y<0) return;
      if (y>=W || x>=H) return;
      set(map, x, y, true);
      return;
   }

   /**
    * Draw game of life map to screen.
    */
   this.draw = function(display) {
      // optimization: create rect once and modify its position for current cell
      var pos = new gamejs.Rect([0,0], [CELL_SIZE, CELL_SIZE]);
      for (var i=0; i<H; i++) {
         for (var j=0; j<W; j++) {
            if (map[i][j].alive === true) {
               pos.top = i * CELL_SIZE;
               pos.left = j * CELL_SIZE;
               gamejs.draw.rect(display, '#ff4444', pos, 0);
            }
         }
      }
   };

   /**
    * set position to alive and update the neighbors
    * caches.
    */
   function set(cMap, x, y, alive) {
      if (cMap[x][y].alive === alive) {
         return;
      }

      cMap[x][y].alive = alive;
      for (var i=0; i < DIRS_LENGTH; i++) {
         var dir = DIRS[i];
         var nx = x + dir[0];
         var ny = y + dir[1];
         if (nx < 0 || ny < 0) continue;
         if (nx >= H || ny >= W) continue;

         if (alive) {
            cMap[nx][ny].neighbors += 1;
         } else if (cMap[nx][ny].neighbors > 0) {
            cMap[nx][ny].neighbors -= 1;
         }
      }
      return;
   }

   /**
    * Update map according to game of life rules
    */
   this.update = function() {
      if (paused === true) return;

      // copy
      var newMap = getMapClone();
      for (var i=0; i<H; i++) {
         for (var j=0; j<W; j++) {
            var neighbors = map[i][j].neighbors;
            var alive = map[i][j].alive;
            if (alive === true) {
               if (neighbors != 2 && neighbors != 3) {
                  set(newMap, i, j, false);
               }
            } else if (neighbors === 3) {
               set(newMap, i, j, true);
            }
         }
      }
      map = newMap;
      return;
   };

   this.clear = function() {
      initMap();
   };

   function initMap() {
      map = [];
      for (var i=0; i<H; i++) {
         map[i] = [];
         for (var j=0; j<W; j++) {
            map[i][j] = {
               alive: false,
               neighbors: 0
            };
         }
      }
      return;
   };

   function getMapClone() {
      return map.map(function(r) {
         return r.map(function(i) {
            return {
               alive: i.alive,
               neighbors: i.neighbors
            };
         });
      });
   }

   this.random = function() {
      var c= ((W * H) / 5);
      for (var i=0;i<c;i++) {
         var x = parseInt(Math.random() * H, 10);
         var y = parseInt(Math.random() * W, 10);
         set(map, x, y, true);
      }

   };

   /**
    * Constructor randomly sets some cells alive.
    */
   var map = [];
   initMap();
   this.random();
   return this;
};
