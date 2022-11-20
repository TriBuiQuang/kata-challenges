/**
 * Finding exit coordinates
 *
 * The function returns an array of all possible outputs from the matrix
 * @param maze
 * @returns {[]}
 */
function getExitCoordinates(maze = []) {
   const height = maze.length,
      width = maze[0].length,
      exitPositions = [],
      isExit = (symbol) => {
         return symbol !== "#";
      },
      /**
       * Is it a dead end?
       * The function checks the existence of neighboring cells in the matrix, and checks whether all neighboring cells contain a wall
       * @param maze
       * @param coordinates
       * @returns {boolean}
       */
      isDeadEnd = (maze, coordinates) => {
         const neighbors = [
            makeCoordinates(coordinates.x + 1, coordinates.y),
            makeCoordinates(coordinates.x - 1, coordinates.y),
            makeCoordinates(coordinates.x, coordinates.y + 1),
            makeCoordinates(coordinates.x, coordinates.y - 1),
         ];

         let response = true;

         neighbors.forEach((neighborCoordinates) => {
            if (maze[neighborCoordinates.x] === undefined) {
               return;
            }

            if (maze[neighborCoordinates.x][neighborCoordinates.y] === undefined) {
               return;
            }

            if (maze[neighborCoordinates.x][neighborCoordinates.y] === "#") {
               return;
            }

            response = false;
         });

         return response;
      };

   // Bypassing the upper and lower boundaries of the matrix
   [0, height - 1].forEach((x) => {
      maze[x].forEach((symbol, y) => {
         let coordinatesObject = makeCoordinates(x, y);

         if (!isExit(symbol)) {
            return;
         }

         if (isDeadEnd(maze, coordinatesObject)) {
            return;
         }

         exitPositions.push(coordinatesObject);
      });
   });

   // Bypassing the left and right borders of a matrix
   for (let x = 0; x <= height - 1; x++) {
      let columns = [0, width - 1];

      columns.forEach((y) => {
         let symbol = maze[x][y];

         // Code duplication
         let coordinatesObject = makeCoordinates(x, y);

         if (!isExit(symbol)) {
            return;
         }

         if (isDeadEnd(maze, coordinatesObject)) {
            return;
         }

         exitPositions.push(coordinatesObject);
      });
   }

   return exitPositions;
}

/**
 * The function iterates through the matrix and looks for the player's designation symbols
 * @param matrix
 * @returns {{x: *, y: *}}
 */
function getPlayerStartCoordinates(matrix) {
   const isPlayer = (symbol) => {
      const playerSymbols = ["^", "<", "v", ">"];

      return playerSymbols.includes(symbol);
   };

   for (let x = 0; x <= matrix.length - 1; x++) {
      for (let y = 0; y <= matrix[x].length - 1; y++) {
         if (isPlayer(matrix[x][y])) {
            return makeCoordinates(x, y);
         }
      }
   }
}

function getCoordinatesHash(coordinates) {
   return coordinates.x + ":" + coordinates.y;
}

function makeCoordinates(x, y) {
   return {
      x: x,
      y: y,
   };
}

function parseCoordinates(point) {
   point = point.split(":");
   return {
      x: parseInt(point[0]),
      y: parseInt(point[1]),
   };
}

function paintStepsWithoutTimeout(matrix, path) {
   path.forEach((point, index) => {
      let coordinates = parseCoordinates(point);
      matrix[coordinates.x][coordinates.y] = index;
   });

   console.table(matrix);
}

/**
 * Implementation of modified Depth-first search
 * The modification is to sort the priority when choosing the next vertex
 * Sorting is to find the lowest cost between two vertices (current and exit)
 *
 * @param graph
 * @param startCoordinates
 * @param exitCoordinates
 * @returns {*[]}
 */
function dfsPriority(graph, startCoordinates, exitCoordinates) {
   const exitCoordinatesHash = getCoordinatesHash(exitCoordinates),
      startCoordinatesHash = getCoordinatesHash(startCoordinates);

   // The path traveled and a label indicating whether the search is completed or not. The label is a crutch. it was not possible to implement the exit from search iterations in another way.
   let visited = [],
      finished = false;

   /**
    * Deleting dead-end branches of the found path to the goal
    *
    * The principle of operation is to enumerate the path and cut off the sequence of coordinates, which are very different when sequentially reading the path.
    * Works only if you start the search from the end, so the array is reversed in the output and in the output
    *
    * @param path
    * @returns {[]}
    */
   const cutUselessBranches = (path) => {
      // Copying an array to avoid changes by reference
      path = [...path].reverse();

      // If currentMark is not null, then there was a big difference between the vertex coordinates, i.e. branches are cut off from the main path.
      let currentMark = null,
         // This is a new array that only has a direct path to the target, with no deviations along the way.
         optimizeVisited = [];

      // Function - check if two coordinates are neighbors
      const twoCoordinatesIsNeighbors = (coordinatesA, coordinatesB) => {
         // Checking neighbors on the x-axis
         if (
            coordinatesA.x === coordinatesB.x &&
            (coordinatesA.y + 1 === coordinatesB.y || coordinatesA.y - 1 === coordinatesB.y)
         ) {
            return true;
         }
         // Checking Y-Neighbors
         return (
            (coordinatesA.x + 1 === coordinatesB.x || coordinatesA.x - 1 === coordinatesB.x) &&
            coordinatesA.y === coordinatesB.y
         );
      };

      // Basis - sequential traversal from the end of the non-optimized path from the player to the exit
      path.forEach((hashedCoordinate, index) => {
         // If now is the beginning or end of the path, the coordinates are added immediately to the new path.
         // But we do not skip the check for leaving the path - if this is done, it will be ignored if the exit itself has a fork.
         if (path.length - 1 === index || index === 0) {
            optimizeVisited.push(hashedCoordinate);
         }

         // If the next coordinate does not exist
         if (path[index + 1] === undefined) {
            return;
         }

         let currentCoordinate = parseCoordinates(hashedCoordinate),
            nextCoordinate = parseCoordinates(path[index + 1]);

         // If the skip coordinate mark is not empty, then check = if the current coordinate is within one cell from currentMark
         // If the current coordinate is nearby, clear the label and add the current coordinate to the new path and move on to the next iteration
         if (currentMark !== null) {
            if (twoCoordinatesIsNeighbors(currentCoordinate, currentMark)) {
               optimizeVisited.push(hashedCoordinate);
               currentMark = null;
            }

            return;
         }

         // If two coordinates are not neighbors. This part only fires if currentMark is empty
         if (!twoCoordinatesIsNeighbors(currentCoordinate, nextCoordinate)) {
            currentMark = currentCoordinate;
            optimizeVisited.push(hashedCoordinate);

            return;
         }

         // Just add the current coordinates to the new path if currentMark is empty and no new currentMark has been created
         optimizeVisited.push(hashedCoordinate);
      });

      return optimizeVisited.reverse();
   };

   /**
    * Sort by priority of range of tcoordinates to the target. The lower the cost, the higher the priority
    * @param goalCoordinates
    * @param nodes
    * @returns {this}
    */
   const heuristicPrioritySort = (goalCoordinates, nodes) => {
      // Copying an array otherwise, the change occurs by reference
      nodes = [...nodes];

      // Sorting nested vertices (neighbors). The lower the cost between two vertices, the higher the nested vertex.
      nodes = nodes.sort((a, b) => {
         let aCoordinates = parseCoordinates(a),
            bCoordinates = parseCoordinates(b);

         return (
            goalCoordinates.x -
            aCoordinates.x +
            (goalCoordinates.y - aCoordinates.y) -
            (goalCoordinates.x - bCoordinates.x + (goalCoordinates.y - bCoordinates.y))
         );
      });

      return nodes;
   };

   /**
    * The very implementation of a simple DFS (depth-first search in a graph)
    * Recursion. At the first start, the graph and the position of the player are passed as arguments
    *
    * @param graph
    * @param startNode
    */
   const dfsLoop = (graph, startNode) => {
      if (finished) {
         return;
      }

      visited.push(startNode);

      // Sorting the vertex queue by priority
      let nodeQueue = heuristicPrioritySort(exitCoordinates, graph[startNode]);

      // Traversal of neighbor vertices startNode
      for (let vertex of nodeQueue) {
         // If you have already visited the summit
         if (visited.indexOf(vertex) !== -1) {
            continue;
         }

         // If a way out is found
         if (vertex === exitCoordinatesHash) {
            visited.push(vertex);
            finished = true;
            break;
         }

         dfsLoop(graph, vertex);
      }
   };

   dfsLoop(graph, startCoordinatesHash);

   let completePath = cutUselessBranches(visited);

   return completePath;
}

/**
 * Creating a graph from a matrix
 *
 * @param matrix
 * @param playerCoordinates
 * @param exitCoordinates
 * @returns {{}}
 */
function graphFromMatrix(matrix, playerCoordinates, exitCoordinates) {
   const optimizeVertex = (graph) => {
      let deletedVertex = [];

      const clearGraph = (graph) => {
         let newGraph = {};
         for (let node in graph) {
            if (!graph.hasOwnProperty(node)) {
               continue;
            }

            newGraph[node] = graph[node].filter((value) => {
               return !deletedVertex.includes(value);
            });
         }

         return newGraph;
      };

      return graph;
   };

   let graph = {};

   matrix.forEach((line, x) => {
      line.forEach((symbol, y) => {
         let relations = [];

         if (symbol === "#") {
            return;
         }

         if (x > 0 && matrix[x - 1][y] !== "#") {
            relations.push((x - 1).toString() + ":" + y);
         }

         if (x + 1 <= matrix.length - 1 && matrix[x + 1][y] !== "#") {
            relations.push((x + 1).toString() + ":" + y);
         }

         if (y > 0 && y - 1 <= matrix[x].length - 1 && matrix[x][y - 1] !== "#") {
            relations.push(x + ":" + (y - 1).toString());
         }

         if (y + 1 <= matrix[x].length - 1 && matrix[x][y + 1] !== "#") {
            relations.push(x + ":" + (y + 1).toString());
         }

         graph[x + ":" + y] = relations;
      });
   });

   graph = optimizeVertex(graph);

   return graph;
}

/**
 * Converting a matrix from a loaded drawing array
 * @param maze
 * @returns {[]}
 */
function matrixFromMaze(maze) {
   let response = [];

   maze.forEach((line, index) => {
      response[index] = [];

      Array.from(line).forEach((symbol, symbolIndex) => {
         response[index][symbolIndex] = symbol;
      });
   });

   return response;
}

function rotatePlayerFromTo(from, to) {
   const left = "L",
      right = "R",
      back = "B",
      forward = "F";

   const map = {
      "^": {
         ">": right,
         v: back,
         "<": left,
      },
      ">": {
         v: right,
         "<": back,
         "^": left,
      },
      v: {
         "<": right,
         "^": back,
         ">": left,
      },
      "<": {
         "^": right,
         ">": back,
         v: left,
      },
   };

   if (from === to) {
      return null;
   }

   return map[from][to];
}

/**
 * The function is needed if the player is immediately at the exit point from the start
 * Returns an array with one character character rotated by the player
 *
 * Conditions search for non-existing x y coordinates - they are the exit side
 * @param matrix
 * @param playerPosition
 * @param playerStartSymbol
 * @returns {*}
 */
function playerOnExitByStartRotateAdapter(matrix, playerPosition, playerStartSymbol) {
   let nextRotate;

   if (!matrix[playerPosition.x].includes(playerPosition.y + 1)) {
      nextRotate = rotatePlayerFromTo(playerStartSymbol, ">");
   }

   if (!matrix[playerPosition.x].includes(playerPosition.y - 1)) {
      nextRotate = rotatePlayerFromTo(playerStartSymbol, "<");
   }

   if (!matrix.includes(playerPosition.x + 1)) {
      nextRotate = rotatePlayerFromTo(playerStartSymbol, "v");
   }

   if (!matrix.includes(playerPosition.x - 1)) {
      nextRotate = rotatePlayerFromTo(playerStartSymbol, "^");
   }

   return nextRotate;
}

function graphPathIntoPlayerActionsQueueAdapter(path, playerStartSymbol) {
   const forward = "F";

   let actions = [],
      currentState = playerStartSymbol;

   const rotate = (currentCoordinates, nextCoordinates, currentState) => {
      let nextStateSymbol = null,
         rotateCode = null;

      if (currentCoordinates.x === nextCoordinates.x) {
         nextStateSymbol = currentCoordinates.y > nextCoordinates.y ? "<" : ">";

         rotateCode = rotatePlayerFromTo(currentState, nextStateSymbol);
      }

      if (currentCoordinates.x !== nextCoordinates.x) {
         nextStateSymbol = currentCoordinates.x > nextCoordinates.x ? "^" : "v";

         rotateCode = rotatePlayerFromTo(currentState, nextStateSymbol);
      }

      return {
         rotateCode: rotateCode,
         newState: nextStateSymbol,
      };
   };

   path.forEach((point, index) => {
      if (path.length - 1 === index) {
         return;
      }

      let currentCoordinates = parseCoordinates(point),
         nextCoordinates = parseCoordinates(path[index + 1]);

      let rotateAction = rotate(currentCoordinates, nextCoordinates, currentState);

      if (rotateAction.rotateCode !== null) {
         actions.push(rotateAction.rotateCode);
         currentState = rotateAction.newState;
      }

      actions.push(forward);
   });

   return actions;
}

/**
 * Returns a character from a matrix by coordinates
 *
 * @param matrix
 * @param coordinates
 * @returns {*}
 */
function getPlayerStartSymbol(matrix, coordinates) {
   return matrix[coordinates.x][coordinates.y];
}

function escape(maze, algorithmFunc = dfsPriority) {
   let matrix = matrixFromMaze(maze),
      exitCoordinates = getExitCoordinates(matrix)[0];

   if (exitCoordinates === undefined) {
      return [];
   }

   let playerPosition = getPlayerStartCoordinates(matrix),
      playerSymbol = getPlayerStartSymbol(matrix, playerPosition),
      graph = graphFromMatrix(matrix, playerPosition, exitCoordinates);

   /**
    * If the player is standing at the exit from the start, we return the result of a specially made function
    */
   if (playerPosition.x === exitCoordinates.x && playerPosition.y === exitCoordinates.y) {
      return playerOnExitByStartRotateAdapter(matrix, playerPosition, playerSymbol);
   }

   // Getting an array with hashed coordinates as a sequence
   const path = algorithmFunc(graph, playerPosition, exitCoordinates);

   console.dir(path, { maxArrayLength: null });
   paintStepsWithoutTimeout(matrix, path);

   return graphPathIntoPlayerActionsQueueAdapter(path, playerSymbol);
}

// Test

let maze = [
   "#####################",
   "#<#   #     #       #",
   "# ### # ### # ##### #",
   "# #   #   # #     # #",
   "# # ##### # ##### # #",
   "#     # # #     # # #",
   "##### # # # ### # ###",
   "#   #   # # #   #   #",
   "# # ### # # # ##### #",
   "# #     # # #     # #",
   "# ####### # ####### #",
   "# #       # #       #",
   "# # ##### # # #######",
   "#   #   # #   #     #",
   "##### # # # ### ### #",
   "#   # #   #     # # #",
   "# # # # ####### # # #",
   "# # # # #   #   #   #",
   "# ### ### # # #######",
   "#   #     # #   #   #",
   "### ####### # # ### #",
   "#   #   #   # #     #",
   "# ### # # ### #######",
   "#     # # # # #   # #",
   "# ####### # # # # # #",
   "# #       #   # # # #",
   "# # ### ####### # # #",
   "# # #   #       #   #",
   "# # # ### # #########",
   "#   #     #         #",
   "################### #",
   "#   #     #     #   #",
   "### # ### # ### # ###",
   "#     # #   # # # # #",
   "# ##### ##### # # # #",
   "#     # #       #   #",
   "### ### # ### ### ###",
   "# #   # #   # #   # #",
   "# ### # ### # # ### #",
   "#     #     #       #",
   "################### #",
];

let escapeSteps = escape(maze, dfsPriority);

console.dir(escapeSteps, { maxArrayLength: null });
