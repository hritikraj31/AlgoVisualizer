const Node = require("./node");
const dijkstra = require('./grid_graph_algo/dijkstra');
const {startAnimation, instantAnimate} = require('./animation.js');
const aStar = require('./grid_graph_algo/a_star');

/**
 * Board 
 * 
 * Useful Definitions
 * busy -> Animation and Algorithm is not complete
 * mouseDown -> some cell is selected and mouse is down
 * previousNode -> To keep track of the last clicked node (when changing special nodes)
 * lastAlgo -> Last Algorithm Function
 * @param {number} height 
 * @param {number} width 
 */
function Board(height, width){
    this.height = height;
    this.width = width;
    this.grid = [];
    this.nodes = {};
    this.busy = false;
    this.start = null;
    this.end = null;
    this.pressedNodetype = null;
    this.previousNode = null;
    this.mouseDown = false;
    this.nodesToAnimate = [];
    this.shortestPath = [];
    this.algorithmDone = false;
    this.specialTypes = ['start', 'end'];
    this.lastAlgo = null;
    this.speed = 10;
}

/**
 * It creates Grid using HTML Tables and assigns each cell id {row-column}
 */
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

/* Mouse Event and button event listeners are added using this function */
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
    document.getElementById('dijkstra').onclick = ()=>{
        if(this.busy) return;
        this.run(dijkstra);
    }
    document.getElementById('aStar').onclick = ()=>{
        if(this.busy) return;
        this.run(aStar);
    }
    document.getElementById('clearPath_btn').onclick = ()=>{
        if(this.busy) return;
        this.clearPath();
    }
    document.getElementById('clearBoard_btn').onclick = ()=>{
        if(this.busy) return;
        this.clearBoard();
    }
    document.getElementById('maze-1').onclick = ()=>{
        this.createMaze(this.recursiveDivisionMaze);
    }
    document.getElementById('maze-2').onclick = ()=>{
        this.createMaze(this.createPrimsMaze);
    }
    document.getElementById('sp-fast').onclick = ()=>{
        this.speed = 10;
    }
    document.getElementById('sp-med').onclick = ()=>{
        this.speed = 20;
    }
    document.getElementById('sp-slow').onclick = ()=>{
        this.speed = 30;
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

/**
 * This function toggles the current node's type between 'wall' and 'unvisited'
 * @param {Node} currentNode 
 */
Board.prototype.changeNormalNode = function (currentNode){
    let nodeHtml= document.getElementById(currentNode.id);
    if(this.mouseDown && (currentNode.type !== 'start' && currentNode.type !== 'end')){
        currentNode.lastNodeType = currentNode.type;
        currentNode.type = (currentNode.type ==='wall')?'unvisited': 'wall';
        nodeHtml.className = (currentNode.type ==='unvisited')?'instant-unvisited':'wall';
    }
}

/**
 * This function is used to move special nodes
 * @param {Node} currentNode 
 * @returns {undefined}
 */
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
        this.lastAlgo(this);
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

/**
 * This function recursively forms the maze. Here the parameters signifies the bounding box of the current grid part.
 * This function assumes that all odd numbered indexes are walls and even ones are normal grid cells.
 * @param {number} col1 Frame Starting Column Index
 * @param {number} col2 Frame Ending Column 
 * @param {number} row1 Frame Starting Row Number
 * @param {number} row2 Franme Ending Row Number
 * @returns {undefined}
 */
Board.prototype.recursiveDivisionMaze = function (col1, col2, row1, row2){
    let relevantClassNames = ["start", "end"];
    if(Math.abs(row1-row2) < 4 || Math.abs(col2-col1)< 4){
        return;
    }
    if(Math.abs(col2-this.width+1)<1e-9 && Math.abs(row2-this.height+1)< 1e-9 && Math.abs(col1+row1)<1e-9){
        // Forming The Boundary..
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

Board.prototype.clearBoard = function(){
    this.clearPath();
    this.clearWalls();
    this.setStart('10-18');
    this.setEnd('10-35');
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

Board.prototype.run = function(algo){
    if(!this.busy){
        this.clearPath();
        this.busy = true;
        this.lastAlgo = algo;
        algo(this);
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