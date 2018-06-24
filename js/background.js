
class AnimatedTriangulatedBackground {
    constructor(canvasid, width, height) {
        this.width = width;
        this.height = height;
        this.canvas = d3.select(canvasid).attr("width", this.width).attr("height", this.height).node();

        this._init();
    }

    _init() {
        this.context = this.canvas.getContext("2d");
        this.voronoi = d3.voronoi()
        this.FPS = 60,
        this.start = null,
        this.speed = 3 / this.FPS,
        this.npoints = this.width * this.height / 10000
        this.total = Math.max(3, this.npoints / 40.)

        // Generate data and draw first instance
        this.generate();
        this.redraw(); // quick first draw
        window.addEventListener("resize", this.resize.bind(this));
        window.requestAnimationFrame(this.step.bind(this));
    }

    generate() {
        this.vertices = this._genPoints(this.width, this.height);
        this.voronoi.extent([[-1, -1],[this.width + 1,this.height + 1]]);
    }

    resize() {
        // Prevent animating directly
        // during resizing
        if (!this.start)
            this.start = performance.now();

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.npoints = this.width * this.height / 10000
        this.total = Math.max(3, this.npoints / 40.)

        this.generate();
    }

    // Generate random points for triangulation
    _genPoints() {
        return d3.range(this.npoints).map(() => {
            return [
                // X
                Math.random() * this.width,
                // Y
                Math.random() * this.height,
                // X vector
                Math.random() * this.speed * this.total * (
                    Math.floor(Math.random() * 2) == 1
                    ? 1
                    : -1),
                // Y vector
                Math.random() * this.speed * this.total * (
                    Math.floor(Math.random() * 2) == 1
                    ? 1
                    : -1)
            ];
        });
    }

    // Bounce like a ball
    movePosition(site) {
        var x, y, dx, dy;
        [x, y, dx, dy] = site;

        // Flip direction on edge of canvas
        if (x < 0 || x > width)
            dx = -dx;
        if (y < 0 || y > height)
            dy = -dy;

        x += dx;
        y += dy;

        return [x, y, dx, dy];
    }

    step(timestamp) {
        var progress = timestamp - this.start;
        if (progress > 1000) {
            this.vertices = this.vertices.map(this.movePosition);
            this.redraw();
        }
        window.requestAnimationFrame(this.step.bind(this));
    }

    redraw() {

        var diagram = this.voronoi(this.vertices),
            delaunay = diagram.links(),
            voronoi = diagram.polygons();

        // Clear everything
        this.context.clearRect(0, 0, this.width, this.height);

        // Delaunay
        this.context.beginPath();
        delaunay.map(this.drawLine.bind(this));
        this.context.strokeStyle = "rgba(0,0,0,0.1)"; // opacity creates more aliased lines
        this.context.stroke();

        // Voronoi
        this.context.beginPath();
        voronoi.map(this.drawCell.bind(this));
        this.context.strokeStyle = "rgba(0,0,0,0.2)"; // opacity creates more aliased lines
        this.context.stroke();
    }

    drawLine(line) {
        // Line consists of source point and target point
        this.context.moveTo(line.source[0], line.source[1]);
        this.context.lineTo(line.target[0], line.target[1]);
    }

    drawCell(cell) {
        // Cell consists of several points
        this.context.moveTo(cell[0][0], cell[0][1]);
        for (var i = 1, m = cell.length; i < m; ++i) {
            this.context.lineTo(cell[i][0], cell[i][1]);
        }
        this.context.closePath();
    }
}

var width = window.innerWidth;
var height = window.innerHeight;
var background = new AnimatedTriangulatedBackground("canvas", width, height);
