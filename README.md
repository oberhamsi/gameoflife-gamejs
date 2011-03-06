Game of Life
=============

  * Watch: <http://apps.gamejs.org/gameoflife/2opt/>
  * Code: <https://github.com/oberhamsi/gameoflife-gamejs/>

GameJs implementation of Conway's Game of Life <http://en.wikipedia.org/wiki/Conway's_Game_of_Life>.

The three commits represent the optimization stages this app went through:

### Unoptimized simulation & drawing

<http://apps.gamejs.org/gameolife/0opt>

A two-dimensional array containing booleans holds the cells alive status.
Two nested for loops update the simulation data by creating a new array, checking
each cell's neighbour count every frame. For every cell I draw a `gamejs.draw.rect()`. 

At this point, the simulation part was the bottleneck: 30-40% of the CPU time
was spent in `countAliveNeighbors()`: each cell re-calculates its
neighbours every frame.

### Optimized simulation

<http://apps.gamejs.org/gameolife/1opt>

Usuall, after a short while, the Game of Life simulation consists of mostly
stable cells; i.e. cells that don't change their alive status.

Because so few cells change their status at a particular frame it is
cheaper to update the cached `neighborCount` value of effected cells than to
re-calculate that value every frame.

And indeed, after caching the neighbour count for each cell, the new bottleneck
was the `gamejs.draw.rect` function taking up 25% of our time. This is the last
function we still call for each cell every frame.

### Optimized rendering

<http://apps.gamejs.org/gameolife/2opt>

`gamejs.draw.rect` is too slow to be called so often: it does a
canvas context switch, parameter checking & type conversions. If we could
directly set the couple of pixels this cell represents, instead of going
throw the `rect` layer, we would probably be better off. There are just too
many, mostly small updates to the screen every frame.

`gamejs.surfacearray.SurfaceArray` is for such cases: the surface's individual
pixels are manipulated with `set()` and the SurfaceArray later blit on 
another Surface with a single `gamejs.surfacearray.blitArray` call.

Additionally, I added the dirty flag 'isModified' to each cell. This is
set if a cell's alive status changes - it isModified isn't set I leave the
pixel status to what it is from last frame.
