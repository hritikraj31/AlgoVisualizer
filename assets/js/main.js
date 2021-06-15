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