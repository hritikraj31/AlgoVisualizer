const Node = require('../../algorithms/graph/node.js');
const Board = require('../../algorithms/graph/board.js');

document.addEventListener('DOMContentLoaded',()=>{
    let g = document.getElementsByClassName('maingrid')[0];
    // let height = parseInt(g.offsetHeight);
    // let width = parseInt(g.offsetWidth);
    // console.log(height);
    // let b = new Board(Math.floor(height/25)-2,Math.floor(width/25)-1);
    b = new Board(24,48);
    b.init();
    window.b = b;
});