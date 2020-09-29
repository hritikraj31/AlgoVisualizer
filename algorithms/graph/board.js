const Node = require("./node");
const dijkstra = require('./dijkstra');
const startAnimation = require('./animation.js');

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
}

Board.prototype.createGrid= function (){
    let girdHtml = "";
    for(let r=0;r<this.height;r++){
        let row = [];
        let rowHtml = `<tr id="${r}">`;
        for(let c= 0;c<this.width;c++){
            let id = `${r}-${c}`;
            let node = new Node(id);
            rowHtml += `<td id="${id}"></td>`;
            row.push(node);
            this.nodes[`${id}`] = node;
        }
        rowHtml+= '</tr>'
        girdHtml += rowHtml;
        this.grid.push(row);
    }
    document.getElementById('grid').innerHTML = girdHtml;
}

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
                    this.pressedNodetype = 'normal';
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
                    this.start = currentNode.id;
                }else if(this.pressedNodetype ==='end'){
                    this.end = currentNode.id;
                }
                this.pressedNodetype = 'normal';
            };

        }
    }
    document.getElementById('startAlgo_btn').onclick = ()=>{
        this.clearPath();
        this.run();
    }
    document.getElementById('clearPath_btn').onclick = ()=>{
        this.clearPath();
    }
    document.getElementById('createMaze_btn').onclick = ()=>{
        this.createMaze();
    }
}
Board.prototype.setStart = function (node){
    if(typeof node === 'string'){
        node = this.nodes[node];
    }
    this.nodes[node.id].type = 'start';
    this.start =node.id;
    document.getElementById(node.id).className = 'start';
}
Board.prototype.setEnd = function (node){
    if(typeof node === 'string'){
        node = this.nodes[node];
    }
    this.nodes[node.id].type = 'end';
    this.end =node.id;
    document.getElementById(node.id).className = 'end';
}
Board.prototype.changeNormalNode = function (currentNode){
    let nodeHtml= document.getElementById(currentNode.id);
    if(this.mouseDown && (currentNode.type !== 'start' && currentNode.type !== 'end')){
        currentNode.type = (currentNode.type ==='wall')?'unvisited': 'wall';
        nodeHtml.className = (nodeHtml.className ==='wall')?'unvisited':'wall';
    }
}
Board.prototype.clearPath = function(){
    let nodes = Object.keys(this.nodes);
    for(let i=0;i<nodes.length ;i++){
        let node  = this.nodes[nodes[i]];
        let nodeHtml = document.getElementById(node.id);
        if(node.type !=='start'&& node.type !== 'wall' && node.type !== 'end'){
            node.type = 'unvisited';
            nodeHtml.className = '';
        }
        node.distance = Infinity;
        node.previousNode = null;
    }
}
Board.prototype.changeSpecialNode =function(currentNode){
    if(this.previousNode && this.previousNode.id !== currentNode.id){
        let nodeHtml = document.getElementById(currentNode.id);
        let prevElement = document.getElementById(this.previousNode.id);
        nodeHtml.className = prevElement.className;
        prevElement.className = 'normal';
        this.previousNode.type = 'unvisited';
        this.previousNode = currentNode;
    }
}

Board.prototype.createMaze = function (){
    this.clearWalls();
    this.createMazeRecursiveDiv(0,this.width-1,0,this.height-1,1);
    return;
    Object.keys(this.nodes).forEach(node => {
    let random = Math.random();
    let currentHTMLNode = document.getElementById(node);
    let relevantClassNames = ["start", "end"];
    let randomTwo = 0.3;
    if (random < randomTwo && !relevantClassNames.includes(currentHTMLNode.className)) {
        currentHTMLNode.className = "wall";
        this.nodes[node].type = "wall";
    }
    });
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

Board.prototype.clearWalls = function () {
    Object.keys(this.nodes).forEach(node => {
        let nodeHtml = document.getElementById(node);
        if(this.nodes[node].type ==='wall'){
            this.nodes[node].type = 'unvisited';
            nodeHtml.className = '';
        }
    });
}
Board.prototype.run = function(){
    if(!this.busy){
        this.busy = true;
        dijkstra(this.start,this.end,this,this.nodes,'grid');
        this.formShortestPath();
        startAnimation(this);
    }
}

Board.prototype.init = function (){
    this.createGrid();
    this.setStart('2-2');
    this.setEnd('10-5');
    this.addEventListeners();
};

Board.prototype.formShortestPath = function(){
    this.shortestPath = [];
    let cur = this.nodes[this.end];
    while(cur && cur.id !== this.start ){
        this.shortestPath.push(cur);
        cur = cur.previousNode;
    }
    if(!cur){
        this.shortestPath = [];
    }else
        this.shortestPath.reverse();
}
module.exports = Board;