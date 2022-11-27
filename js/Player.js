class Player{
    constructor(position){
        this.size=100;
        this.position = position;
        this.vel = {
            x: 0,
            y: 1,
        }
        this.height = 50;
        this.mass = 1;
    }

    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, 2*ballRadius, 0, 2 * Math.PI);
        c.fillStyle = "red";
        c.fill();
        c.stroke();
    }

    update(){
        this.draw();
        this.position.x += this.vel.x;
        this.position.y += this.vel.y;
        if(this.position.y + this.height + this.vel.y< canvas.height)
            this.vel.y += gravity;
        else this.vel.y = 0;

    }
}