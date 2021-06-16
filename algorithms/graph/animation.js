const startAnimation = (board)=>{
    let nodes = board.nodesToAnimate;
    let speed = board.speed;
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
        },speed);
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