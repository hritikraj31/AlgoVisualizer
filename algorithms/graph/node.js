/**
 * 
 * @param {string} id 
 * @param {string} type type of the node {wall, unvisited, visited}
 */
function Node(id,type = 'unvisited'){
    this.id = id;
    this.previousNode = null;  // For path reconstruction
    this.distance = Infinity;
    this.type = type;
    this.lastNodeType = 'unvisited';
}

module.exports = Node;