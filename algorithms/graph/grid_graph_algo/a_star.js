const Heap = require('../../utils/heap');

/**
 * A* Algorithm
 * The function runs A* Algorithm to get the shortest path from start to end.
 * gScore {Map} stores the actual cost of the path (Here for grid weight is assumed to be 1 for all edges)
 * Manhattan Distance has been taken for calculating heuristic cost
 * fScore {Map} stores the combination of the gScore and heuristic cost
 * 
 * Reference : https://en.wikipedia.org/wiki/A*_search_algorithm
 * 
 * NOTE: This Algorithm performs very well if nice heuristic function is present and always explores lesser number of nodes as compared to Dijkstra.
 *       Further Custom Min-Heap has been used which allowed log n removal and addition of nodes and O(1) retrieval of Minimum Distance Node. 
 * 
 * @param {Board} board Board Object on which A* has to be done 
 */
function aStar(board){
    let {nodes, start, end} = board;
    let gScore = new Map();
    let fscore = new Map();
    gScore[2] =3;
    Object.keys(nodes).forEach((nodeId)=> (gScore[nodeId] = Infinity, fscore[nodeId]= Infinity));

    gScore[start.id] = 0;
    fscore[start.id] = manahattanDistance(start.id, end.id);
    function comperator(node1, node2){
        return fscore[node1.id] > fscore[node2.id];
    }
    let openSet = new Heap([], comperator);
    openSet.push(start);
    let current;
    let marked = new Map();
    while(!openSet.empty()){
        current = openSet.top();
        if(current === end){
            board.algorithmDone = true;
            break;
        }
        board.nodesToAnimate.push(current);
        if(current.type !== 'start'){
            current.type = 'visited';
        }
        openSet.pop();
        let neighbours = getNeighbours(current, nodes);
        neighbours = neighbours.filter((node)=>!marked[node.id] && (node.type !== 'wall'));
        neighbours.forEach((node)=>{
            let tentativeScore = gScore[current.id] + 1;
            if(tentativeScore < gScore[node.id]){
                node.previousNode = current;
                gScore[node.id] = tentativeScore;
                fscore[node.id] = gScore[node.id] + manahattanDistance(node.id, end.id);
                openSet.push(node);
                marked[node.id] = true;
            }
        });
    }
    board.algorithmDone = true;
}

/**
 * Return Manhattan Distnace
 * @param {Node} node1 
 * @param {Node} node2 
 * @returns {number}
 */
function manahattanDistance(node1, node2){
    let [r1, c1] = node1.split('-').map((x)=>parseInt(x));
    let [r2, c2] = node2.split('-').map((x)=>parseInt(x));
    return Math.abs(r1-r2)+ Math.abs(c1-c2);
}

/**
 * Return the neighbours in the grid
 * @param {Node} node Node Element whose neighbours are required
 * @param {Array of Node} nodes Array of nodes
 * @returns {Array} neighbours
 */
function getNeighbours(node ,nodes){
    let neighbours = [];
    let [row,col] = node.id.split('-').map(x => parseInt(x));
    for(let i=0;i<2;i++){
        for(let j=0;j<2;j++){
            let nrow = row +(i-j);
            let ncol = col + (j+i-1);
            let neighbour = nodes[`${nrow}-${ncol}`];
            if(neighbour && neighbour.type !== 'wall'){
                neighbours.push(neighbour);
            }
        }
    }
    return neighbours;
}

module.exports = aStar;