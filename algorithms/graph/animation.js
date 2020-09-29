const startAnimation = (board)=>{
    let nodes = board.nodesToAnimate;
    function timeout(index){
        setTimeout(()=>{
            if(index===nodes.length){
                board.nodesToAnimate =[];
                animateShortestPath(board);
            }else{
                let current =document.getElementById(nodes[index].id);
                if(current.className !== 'start' && current.className !== 'end')
                    current.className = 'visited';
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

module.exports = startAnimation;