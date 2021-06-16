/**
 * Dijkstra Algorithm
 * This function runs Dijkstra on a grid to give shortest path from start to end.
 * In this greedy approach element with the least cost is picked for exploring the next node.
 * 
 * Reference : https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
 * 
 * NOTE: As the grid is very small I have not written the most optimized form of it. (Time : O(n^2))
 * 
 * @param {Board} board 
 */
const dijkstra = (board)=>{
    let {start, end, nodes} = board;
    if(!start || !end || start ===end){
        return false;
    }
    nodes[start.id].distance = 0;
    let unvisitedNodes = Object.keys(nodes);
    while(unvisitedNodes.length){
        let closestNode = minDistanceNodes(nodes,unvisitedNodes);
        while(closestNode.type=='wall' && unvisitedNodes.length){
            closestNode = minDistanceNodes(nodes, unvisitedNodes);
        }
        if(closestNode.distance === Infinity){
            board.algorithmDone = true;
            return;
        }
        board.nodesToAnimate.push(closestNode);
        if(closestNode.type==='end'){
            board.algorithmDone = true;
            break;
        }
        if(closestNode.type !== 'start')
            closestNode.type = 'visited';
        update(nodes,closestNode);
    }
}
function minDistanceNodes(nodes, unvisitedNodes){
    let currentClosest,index;
    for(let i=0;i<unvisitedNodes.length ;i++){
        if(!currentClosest || currentClosest.distance > nodes[unvisitedNodes[i]].distance){
            currentClosest = nodes[unvisitedNodes[i]];
            index =i;
        }
    }
    unvisitedNodes.splice(index,1);
    return currentClosest;
}

function update(nodes, node){
    let neighbours = getNeighbours(node,nodes);
    for(let i in neighbours){
        let neighbour = neighbours[i];
        let distance = calcDistance(node,neighbour);
        if(neighbour.distance > distance + node.distance){
            neighbour.distance = distance + node.distance;
            neighbour.previousNode = node;
        }
    }
}

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

function calcDistance(node1, node2){
    let [x1,y1] = node1.id.split('-').map((x)=> parseInt(x));
    let [x2,y2] = node2.id.split('-').map((x)=> parseInt(x));
    return (Math.abs(x2-x1)+Math.abs(y2-y1));
}

module.exports = dijkstra;