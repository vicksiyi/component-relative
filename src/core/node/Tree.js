export class Tree {
    constructor(options) {
        /**
         * id: string
         * name: string
         * fromId: string
         * parent: string
         * children: string[]
         * detail: any
         */
        this.nodes = new Map; // 一个map
        this.root = null; // string
        this.sources = []; // string[]
        this.load(options.data);
    }
    load(data) {
        const { nodes, sources, root } = data;
        for (let id in nodes) {
            const node = nodes[id];
            this.nodes.set(node.id, node);
        }
        this.sources = sources;
        this.root = root;
    }
}