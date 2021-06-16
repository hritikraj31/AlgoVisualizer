/**
 * Binary Heap Data Structure
 * @param {Array} array 
 * @param {function} comperator Function to choose check if first argument is of higher priority than second argument.
 */
function Heap(array, comperator ){
    this.heap = [];
    if(array && array instanceof Array){
        this.heap = array;
    }
    this.size = this.heap.length;
    if(typeof comperator !== 'function'){
        throw new Error("Comperator given for heap is not a function");
    }
    this.comperator = comperator;
    this.build();
}


/**
 * This function bubbles down the element to its correct position in O(log n)
 * It assumes that left and right child of binary heap are themselves heap structure.
 * @param {number} index Heap arrays index of the element
 */
Heap.prototype.bubbleDown = function(index){
    while(index < this.size){
        let highest = this.heap[index];
        let ind = index;
        if(2*ind+1 < this.size && this.comperator(highest, this.heap[2*ind+1]) ){
            ind = 2*ind+1;
            highest = this.heap[ind];
        }
        if(2*ind+2 < this.size && this.comperator(highest, this.heap[2*ind+2]) ){
            ind = 2*ind+2;
            highest = this.heap[ind];
        }
        highest = this.heap[ind];
        this.heap[ind] = this.heap[index];
        this.heap[index] = highest;
        if(Math.abs(ind- index) < 1e-9){
            break;
        }
        index = ind;
    }
}
/**
 * This function bubbles up the element to its correct position in O(log n)
 * It assumes that parent and above it are themselves heap structure.
 * @param {number} index Heap arrays index of the element
 */
Heap.prototype.bubbleUp = function(index){
    while(index > 0){
        let highest = this.heap[index];
        let ind = index;
        if(!this.comperator(highest , this.heap[Math.floor((index-1)/2)])){
            ind = Math.floor((index-1)/2);
            highest = this.heap[ind];
        }
        highest = this.heap[ind];
        this.heap[ind] = this.heap[index];
        this.heap[index] = highest;
        if(Math.abs(ind- index) < 1e-9){
            break;
        }
        index = ind;
    }
}

/**
 * Returns Element with highest priority in O(log n)
 * @returns {number} Popped Element
 */
Heap.prototype.pop = function (){
    if(this.size ===0){
        return null;
    }
    let temp = this.heap[this.size-1];
    this.heap[this.size-1] = this.heap[0];
    this.heap[0] = temp;
    this.size--;
    this.bubbleDown(0);
    return this.heap.pop();
}

/**
 * @returns {number} Element with highest priority in O(1)
 */
Heap.prototype.top = function(){
    if(this.size==0){
        return null;
    }
    return this.heap[0];
}

/**
 * This function builds the heap array in O(n)
 */
Heap.prototype.build = function(){
    if(this.heap && this.heap instanceof Array)
    for(let i = Math.floor((this.size-2)/2); i>=0;i--){
        this.bubbleDown(i);
    }
}

/**
 * This function pushes the element in the heap in O(log n).
 * @param {any} element Element to be pushed
 */
Heap.prototype.push = function (element){
    this.heap.push(element);
    this.bubbleUp(this.size);
    this.size = this.size+1;
}

/**
 * checks whether heap is empty{true} or not{false};
 * @returns {Boolean}
 */
Heap.prototype.empty = function(){
    return this.heap.length===0;
}

module.exports = Heap;