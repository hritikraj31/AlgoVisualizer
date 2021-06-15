(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const startAnimation = (board)=>{
    let nodes = board.nodesToAnimate;
    function timeout(index){
        setTimeout(()=>{
            if(index===nodes.length){
                board.nodesToAnimate =[];
                if(board.shortestPath)
                    animateShortestPath(board);
                else board.busy = false;
            }else{
                let current =document.getElementById(nodes[index].id);
                if(current.className !== 'start' && current.className !== 'end')
                    current.className = nodes[index].type;
                timeout(index+1);
            }
        },10);
    }
    timeout(0);
}

function animateShortestPath(board){
    let shortestPath = board.shortestPath;
    function timeout(index){
        setTimeout(()=>{
            if(index ===shortestPath.length){
                board.busy = false;
                shortestPath =[];
                board.shortestPath = [];
            }else{
                let current = document.getElementById(shortestPath[index].id);
                if(current.className !== 'start' && current.className !== 'end')
                    current.className = 'path';
                timeout(index+1);
            }
        },10);
    }
    timeout(0);
}

const instantAnimate = (board)=>{
    let nodes = board.nodesToAnimate;
    nodes.forEach((node)=>{
        if(node.type === 'start' || node.type === 'end'){
            document.getElementById(node.id).className = node.type;
        }else{
            document.getElementById(node.id).className = `instant-${node.type}`;
        }
    });
    board.shortestPath.forEach((node) =>{
        if(node.type !== 'start' && node.type !== 'end'){
            document.getElementById(node.id).className = `instant-path`;
        }
    });
    board.nodesToAnimate = [];
    board.shortestPath = [];
};
module.exports = {startAnimation, instantAnimate};
},{}],2:[function(require,module,exports){
const Node = require("./node");
const dijkstra = require('./dijkstra');
const {startAnimation, instantAnimate} = require('./animation.js');

function Board(height, width){
    this.height = height;
    this.width = width;
    this.grid = []; // array of Node(s)
    this.nodes = {}; // "id" -> Node
    this.busy = false; // In between algorithm and animation
    this.start = null; // Start Node
    this.end = null;  // End Node
    this.pressedNodetype = null; // Type of Pressed Node
    this.previousNode = null;  // Previous Node
    this.mouseDown = false; // Some cell selected and mouse down
    this.nodesToAnimate = []; // Nodes for animation
    this.shortestPath = []; // Nodes in Shortest Path
    this.algorithmDone = false;
    this.specialTypes = ['start', 'end'];
}

// Creates Grid using HTML Tables and every table cell is given id according to its row and column
// Initially assigned class is unvisited
Board.prototype.createGrid= function (){
    let girdHtml = "";
    for(let r=0;r<this.height;r++){
        let row = [];
        let rowHtml = `<tr id="${r}">`;
        for(let c= 0;c<this.width;c++){
            let id = `${r}-${c}`;
            let node = new Node(id);
            rowHtml += `<td id="${id}" class = "instant-unvisited"></td>`;
            row.push(node);
            this.nodes[`${id}`] = node;
        }
        rowHtml+= '</tr>'
        girdHtml += rowHtml;
        this.grid.push(row);
    }
    document.getElementById('grid').innerHTML = girdHtml;
}

// Mouse Events are added to each of the grid cells
Board.prototype.addEventListeners = function(){
    for(let r=0;r<this.height;r++){
        for(let c=0;c<this.width;c++){
            let nodeId = `${r}-${c}`;
            let currentNode = this.nodes[nodeId];
            let currentHTMLNode = document.getElementById(nodeId);
            currentHTMLNode.onmousedown = (e)=>{
                e.preventDefault();
                if(this.busy){
                    return;
                }
                this.mouseDown = true;
                if(currentNode.type === 'start' || currentNode.type ==='end'){
                    this.previousNode = currentNode;
                    this.pressedNodetype = currentNode.type;
                }else{
                    this.pressedNodetype = 'unvisited';
                    this.changeNormalNode(currentNode);
                }
            };
            currentHTMLNode.onmouseenter = (e)=>{
                e.preventDefault();
                if(this.busy){
                    return;
                }
                if(this.mouseDown){
                    if(this.pressedNodetype === 'start' || this.pressedNodetype ==='end'){
                        if(currentNode.type ==='start' || currentNode.type ==='end'){
                            return;
                        }
                        this.changeSpecialNode(currentNode);
                        if(this.pressedNodetype ==='start'){
                            currentNode.type ='start';
                        }else if(this.pressedNodetype === 'end'){
                            currentNode.type = 'end';
                        }
                    }else {
                        this.changeNormalNode(currentNode);
                    }
                }
            };
            currentHTMLNode.onmouseup = (e)=>{
                e.preventDefault();
                this.mouseDown =false;
                if(this.pressedNodetype ==='start'){
                    this.start = currentNode;
                }else if(this.pressedNodetype ==='end'){
                    this.end = currentNode;
                }
                this.pressedNodetype = 'unvisited';
            };

        }
    }
    document.getElementById('startAlgo_btn').onclick = ()=>{
        if(this.busy) return;
        this.run();
    }
    document.getElementById('clearPath_btn').onclick = ()=>{
        if(this.busy) return;
        this.clearPath();
    }
    document.getElementById('maze-1').onclick = ()=>{
        this.createMaze(this.recursiveDivisionMaze);
    }
    document.getElementById('maze-2').onclick = ()=>{
        this.createMaze(this.createPrimsMaze);
    }
}
Board.prototype.setStart = function (node){
    if(typeof node === 'string'){
        node = this.nodes[node];
    }
    if(this.start){
        this.start.type = 'unvisited';
        document.getElementById(this.start.id).className = 'unvisited';
    }
    this.nodes[node.id].type = 'start';
    this.start =node;
    document.getElementById(node.id).className = 'start';
}
Board.prototype.setEnd = function (node){
    if(typeof node === 'string'){
        node = this.nodes[node];
    }
    if(this.end){
        this.end.type = 'unvisited';
        document.getElementById(this.end.id).className = 'unvisited';
    }
    this.nodes[node.id].type = 'end';
    this.end =node;
    document.getElementById(node.id).className = 'end';
}
Board.prototype.changeNormalNode = function (currentNode){
    let nodeHtml= document.getElementById(currentNode.id);
    if(this.mouseDown && (currentNode.type !== 'start' && currentNode.type !== 'end')){
        currentNode.lastNodeType = currentNode.type;
        currentNode.type = (currentNode.type ==='wall')?'unvisited': 'wall';
        nodeHtml.className = (currentNode.type ==='unvisited')?'unvisited':'wall';
    }
}

Board.prototype.changeSpecialNode =function(currentNode){
    if(this.previousNode && this.previousNode.id !== currentNode.id){
        let nodeHtml = document.getElementById(currentNode.id);
        let prevElement = document.getElementById(this.previousNode.id);
        nodeHtml.className = prevElement.className;
        currentNode.lastNodeType = currentNode.type;
        currentNode.type = this.previousNode.type;
        prevElement.className = `instant-${this.previousNode.lastNodeType}`;
        this.previousNode.type = this.previousNode.lastNodeType;
        this.previousNode = currentNode;

        if(this.pressedNodetype ==='start'){
            this.start = currentNode;
        }else if(this.pressedNodetype ==='end'){
            this.end = currentNode;
        }

        if(!this.algorithmDone){
            return;
        }
        this.clearPath();
        dijkstra(this.start, this.end, this, this.nodes, 'grid');
        this.formShortestPath();
        instantAnimate(this);
    }
}

Board.prototype.createMaze = function (mazeAlgo){
    if(this.busy){
        return;
    }
    this.busy = true;
    this.clearWalls();
    this.clearPath();
    this.nodesToAnimate = [];
    mazeAlgo.apply(this,[ 0, this.width-1, 0, this.height-1]);
    startAnimation(this);
}

function randomInRange(a, b){
    return Math.floor(Math.random()*(Math.abs(a-b)+1)+ Math.min(a, b));
}

Board.prototype.recursiveDivisionMaze = function (col1, col2, row1, row2){
    let relevantClassNames = ["start", "end"];
    if(Math.abs(row1-row2) < 4 || Math.abs(col2-col1)< 4){
        return;
    }
    if(Math.abs(col2-this.width+1)<1e-9 && Math.abs(row2-this.height+1)< 1e-9 && Math.abs(col1+row1)<1e-9){
        for(let r =0;r <= row2;r++){
            let node  = this.nodes[`${r}-${col2}`];
            let currentHTMLNode = document.getElementById(node.id);
            if(!relevantClassNames.includes(currentHTMLNode.className)){
                this.nodes[node.id].type = 'wall';
                this.nodesToAnimate.push(node);
            }
            node  = this.nodes[`${r}-${0}`];
            currentHTMLNode = document.getElementById(node.id);
            if(!relevantClassNames.includes(currentHTMLNode.className)){
                this.nodes[node.id].type = 'wall';
                this.nodesToAnimate.push(node);
            }
        }
        for(let r =0;r <= col2;r++){
            let node  = this.nodes[`${0}-${r}`];
            let currentHTMLNode = document.getElementById(node.id);
            if(!relevantClassNames.includes(currentHTMLNode.className)){
                this.nodes[node.id].type = 'wall';
                this.nodesToAnimate.push(node);
            }
            node  = this.nodes[`${row2}-${r}`];
            currentHTMLNode = document.getElementById(node.id);
            if(!relevantClassNames.includes(currentHTMLNode.className)){
                this.nodes[node.id].type = 'wall';
                this.nodesToAnimate.push(node);
            }
        }
    }
    if(Math.abs(row1-row2) < Math.abs(col1 - col2)){
        let dif = Math.abs(col1 - col2);
        dif = Math.floor((dif+1)/2);
        let c1 = 2*randomInRange(1, dif-1)+ col1;
        let dif2 = Math.abs(row1 -row2);
        dif2 = Math.floor(dif2/2);
        let r1 = 2*randomInRange(0, dif2-1)+1 + row1;
        for(let r = row1+1;r <row2 ;r++){
            if(r != r1){
                let node  = this.nodes[`${r}-${c1}`];
                let currentHTMLNode = document.getElementById(node.id);
                if(!relevantClassNames.includes(currentHTMLNode.className)){
                    this.nodes[node.id].type = 'wall';
                    this.nodesToAnimate.push(node);
                }
            }
        }
        this.recursiveDivisionMaze(col1,c1 , row1, row2);
        this.recursiveDivisionMaze(c1, col2,  row1, row2);
    }else{
        let dif = Math.abs(row1 - row2);
        dif = Math.floor((dif+1)/2);
        let c1 = 2*randomInRange(1, dif-1)+ row1;
        let dif2 = Math.abs(col1 -col2);
        dif2 = Math.floor(dif2/2);
        let r1 = 2*randomInRange(0, dif2-1)+1 + col1;
        for(let r = col1+1;r <col2 ;r++){
            if(r != r1){
                let node  = this.nodes[`${c1}-${r}`];
                let currentHTMLNode = document.getElementById(node.id);
                if(!relevantClassNames.includes(currentHTMLNode.className)){
                    this.nodes[node.id].type = 'wall';
                    this.nodesToAnimate.push(node);
                }
            }
        }
        this.recursiveDivisionMaze(col1, col2, row1, c1);
        this.recursiveDivisionMaze(col1, col2, c1, row2);
    }
}
// Board.prototype.recursiveDivisionMaze = function (col1, col2, row1, row2){
//     if(Math.abs(col1-col2) < 2 || Math.abs(row1 - row2) < 2){
//         return;
//     }
//     let r1 = randomInRange(row1, row2);
//     let r2 = randomInRange(row1+1, row2-1);
//     let c1 = randomInRange(col1, col2);
//     let c2 = randomInRange(col1+1, col2-1);
//     for(let c = col1 ;c < col2+1;c++){
//         if(c== c1){
//             if(Math.abs(col2-c)+1 > 6){
//                 c1 = randomInRange(c1+1, col2 );
//             }
//             continue;
//         }
//         let node = this.nodes[`${r2}-${c}`]
//         let currentHTMLNode = document.getElementById(node.id);
//         let relevantClassNames = ["start","end"];
//         if(!relevantClassNames.includes(currentHTMLNode.className)){
//             // currentHTMLNode.className = 'wall';
//             this.nodes[node.id].type = 'wall';
//             this.nodesToAnimate.push(node);
//         }
//     }
//     for(let r = row1 ;r < row2+1;r++){
//         if(r== r1){
//             if(Math.abs(row2-r)+1 > 6){
//                 r1 = randomInRange(r1+1, row2 );
//             }
//             continue;
//         }
//         let node = this.nodes[`${r}-${c2}`]
//         let currentHTMLNode = document.getElementById(node.id);
//         let relevantClassNames = ["start","end"];
//         if(!relevantClassNames.includes(currentHTMLNode.className)){
//             // currentHTMLNode.className = 'wall';
//             this.nodesToAnimate.push(node);
//             this.nodes[node.id].type = 'wall';
//         }
//     }
//     this.recursiveDivisionMaze(col1, c2-1, row1,r2-1 );
//     this.recursiveDivisionMaze(c2+1, col2, row1,r2-1 );
//     this.recursiveDivisionMaze(col1, c2-1, r2+1, row2 );
//     this.recursiveDivisionMaze(c2+1, col2, r2+1, row2 );
// }

Board.prototype.createPrimsMaze = function (){
    Object.keys(this.nodes).forEach((nodeId)=>{
        if(this.specialTypes.includes(this.nodes[nodeId].type)) return;
        this.nodes[nodeId].type = 'wall';
        document.getElementById(nodeId).className = 'wall';
    })
    let inMaze =[];
    inMaze.push(this.nodes[`${2*randomInRange(0, (this.height-1)/2-1)}-${2*randomInRange(0, (this.width-1)/2 -1)}`]);
    let nextPossible = [...this.getNeighbours(inMaze[0], 2)];
    this.setStart(inMaze[0]);
    // inMaze[0].type = 'unvisited';
    // document.getElementById(inMaze[0].id).className = 'unvisited';

    function connect(node1, node2){
        let [r1, c1] = node1.id.split('-').map((i)=>parseInt(i));
        let [r2, c2] = node2.id.split('-').map((i)=>parseInt(i));
        let cur = this.nodes[`${(r1+r2)/2}-${(c1+c2)/2}`];
        if(this.specialTypes.includes(cur.type)) return;
        cur.type = 'unvisited';
        this.nodesToAnimate.push(cur);
        // document.getElementById(cur.id).className = 'unvisited';
    }
    while(nextPossible.length !==0){
        let nextIndex = randomInRange(0, nextPossible.length-1);
        let nextNode = nextPossible[nextIndex];
        if(this.specialTypes.includes(nextNode.type)) continue;
        let lastNodes = this.getNeighbours(nextNode, 2).filter((node)=> inMaze.indexOf(node) !==-1);
        let lastNode;
        lastNode = lastNodes[randomInRange(0, lastNodes.length-1)];
        connect.bind(this)(lastNode, nextNode);
        nextNode.type = 'unvisited';
        this.nodesToAnimate.push(nextNode);
        // document.getElementById(nextNode.id).className = 'unvisited';
        inMaze.push(nextNode);
        nextPossible.splice(nextIndex, 1);
        nextPossible.push(...this.getNeighbours(nextNode,2).filter((node)=> nextPossible.indexOf(node)=== -1 && inMaze.indexOf(node)===-1 && !this.specialTypes.includes(node.type)));
        // nextPossible = nextPossible.filter((node)=>{
        //     // console.log(node, this.getNeighbours(node).filter((node)=> {return node in inMaze}));
        //     return this.getNeighbours(node).filter((node)=> {return inMaze.indexOf(node) !== -1}).length <= 1 && inMaze.indexOf(node)=== -1;
        // });
    }
}

Board.prototype.createMazeRecursiveDiv = function (col1,col2,row1, row2,it){
    if(it==1){
        this.clearWalls();
    }
    let random = Math.random()*(Math.abs(col1-col2+1))+col1;
    random = Math.floor(random);
    let random2 = Math.random()*Math.abs(row1-row2+1)+row1;
    random2 = Math.floor(random2);
    if(Math.abs(col1-col2)>Math.abs(row2-row1)){
        if(col2-col1<=4){
            return;
        }
        // random = Math.floor((col1+col2)/2);
        for(let i=row1+1;i<row2;i++){
            if(random2==i){
                continue;
            }
            let node = this.grid[i][random];
            let currentHTMLNode = document.getElementById(node.id);
            let relevantClassNames = ["start","end"];
            if(!relevantClassNames.includes(currentHTMLNode.className)){
                currentHTMLNode.className = 'wall';
                this.nodes[node.id].type = 'wall';
            }
        }
        this.createMazeRecursiveDiv(col1, random-1,row1,row2, it+1);
        this.createMazeRecursiveDiv(random+1, col2,row1,row2, it+1);
    }else {
        if(row2-row1<=4){
            return;
        }
        // random2 = Math.floor((row1+row2)/2);
        for(let i=col1+1;i<col2;i++){
            if(random ==i){
                continue;
            }
            let node = this.grid[random2][i];
            let currentHTMLNode = document.getElementById(node.id);
            let relevantClassNames = ["start","end"];
            if(!relevantClassNames.includes(currentHTMLNode.className)){
                currentHTMLNode.className = 'wall';
                this.nodes[node.id].type = 'wall';
            }
        }
        this.createMazeRecursiveDiv(col1, col2,row1,random2-1, it+1);
        this.createMazeRecursiveDiv(col1, col2,random2+1,row2, it+1);
    }
}

Board.prototype.getNeighbours = function(node, stride = 1){
    let neighbours = [];
    let [row,col] = node.id.split('-').map(x => parseInt(x));
    for(let i=0;i<2;i++){
        for(let j=0;j<2;j++){
            let nrow = row +(i-j)*stride;
            let ncol = col + (j+i-1)*stride;
            let neighbour = this.nodes[`${nrow}-${ncol}`];
            if(neighbour){
                neighbours.push(neighbour);
            }
        }
    }
    return neighbours;
}

Board.prototype.clearPath = function(){
    this.algorithmDone = false;
    let nodes = Object.keys(this.nodes);
    for(let i=0;i<nodes.length ;i++){
        let node  = this.nodes[nodes[i]];
        let nodeHtml = document.getElementById(node.id);
        if(node.type !=='start'&& node.type !== 'wall' && node.type !== 'instant-wall' && node.type !== 'end'){
            node.type = 'unvisited';
            nodeHtml.className = 'instant-unvisited';
        }
        node.distance = Infinity;
        node.previousNode = null;
    }
}

Board.prototype.clearWalls = function () {
    Object.keys(this.nodes).forEach(node => {
        let nodeHtml = document.getElementById(node);
        if(this.nodes[node].type ==='wall' || this.nodes[node].type === 'instant-wall'){
            this.nodes[node].type = 'unvisited';
            nodeHtml.className = 'instant-unvisited';
        }
    });
}

Board.prototype.run = function(){
    if(!this.busy){
        this.clearPath();
        this.busy = true;
        dijkstra(this.start,this.end,this,this.nodes,'grid');
        this.formShortestPath();
        startAnimation(this);
    }
}

Board.prototype.init = function (){
    this.createGrid();
    this.setStart('10-18');
    this.setEnd('10-35');
    this.addEventListeners();
};

Board.prototype.formShortestPath = function(){
    this.shortestPath = [];
    let cur = this.nodes[this.end.id];
    while(cur && cur !== this.start ){
        this.shortestPath.push(cur);
        cur = cur.previousNode;
    }
    if(!cur){
        this.shortestPath = [];
    }else
        this.shortestPath.reverse();
}
module.exports = Board;
},{"./animation.js":1,"./dijkstra":3,"./node":4}],3:[function(require,module,exports){
const dijkstra = (start,end,board,nodes,gtype)=>{
    if(gtype=='grid'){
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
                return false;
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
},{}],4:[function(require,module,exports){
function Node(id,type = 'unvisited'){
    this.id = id;
    this.previousNode = null;
    this.distance = Infinity;
    this.type = type;
    this.lastNodeType = 'unvisited';
}

module.exports = Node;
},{}],5:[function(require,module,exports){
const Node = require('../../algorithms/graph/node.js');
const Board = require('../../algorithms/graph/board.js');

document.addEventListener('DOMContentLoaded',()=>{
    let g = document.getElementsByClassName('maingrid')[0];
    let height = parseInt(window.innerHeight)-65;
    let width = parseInt(window.innerWidth);
    console.log(height);
    // let b = new Board(Math.floor(height/25)-2,Math.floor(width/25)-5);
    let b = new Board(23, 59);
    // b = new Board(24,48);
    b.init();
    window.b = b;
});
},{"../../algorithms/graph/board.js":2,"../../algorithms/graph/node.js":4}]},{},[5]);
