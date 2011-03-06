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
 */

var gamejs = require('gamejs');
var Map = require('./gof').Map;
gamejs.ready(main);

function addClickHandler(elementId, fn) {
   document.getElementById(elementId).addEventListener('click', fn, false);
};
// disable normal browser mouse select
function disableMouseSelect() {
   // no text select on drag
   document.body.style.webkitUserSelect = 'none';
   // non right clickery
   document.body.oncontextmenu = function() { return false; };
}

function main() {

   var screen = [
      Math.max(window.innerWidth - 50, 250),
      Math.max(window.innerHeight - 200, 250)
   ];
   disableMouseSelect();
   var map = new Map(screen);
   var display = gamejs.display.setMode(screen)
   gamejs.time.fpsCallback(tick, this, 8);

   /**
    * Keyboard handling
    */
   var isMouseDown = false;
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
      }
   }

   addClickHandler('gof-playpause', function() {
      map.togglePaused();
   });
   addClickHandler('gof-step', function() {
      map.forceUpdate();
   });
   addClickHandler('gof-random', function() {
      map.random();
   });
   addClickHandler('gof-clear', function() {
      map.clear();
   });
   /**
    * Every game tick...
    */
   function tick() {
      gamejs.event.get().forEach(eventHandler);
      map.update();
      display.clear();
      map.draw(display);
      return;
   };

};
