function Node(id,type = 'unvisited'){
    this.id = id;
    this.previousNode = null;
    this.distance = Infinity;
    this.type = type;
}

module.exports = Node;