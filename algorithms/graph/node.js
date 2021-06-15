function Node(id,type = 'unvisited'){
    this.id = id;
    this.previousNode = null;
    this.distance = Infinity;
    this.type = type;
    this.lastNodeType = 'unvisited';
}

module.exports = Node;