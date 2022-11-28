class Ball{
    constructor(position){
        this.position = position;
        this.vel = {
            x: 5,
            y: -15    ,
        }
        this.height = 25;
        this.mass = 1;
    }
//x
    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, ballRadius, 0, 2 * Math.PI);
        c.fillStyle = "green";
        c.fill();
        c.stroke();
    }

    collision(player) {
        let a;
        let x;
        let y;
      
        a = 2*ballRadius + ballRadius;
        x = player.position.x - this.position.x;
        y = player.position.y - this.position.y;
      
        if (a > Math.sqrt((x * x) + (y * y))) {
          if(this.position.x + ballRadius >= canvas.width){
            player.vel.x = 0;
            player.position.x = canvas.width - player.size;
          }
          if(this.position.x - ballRadius <= 0){
            player.vel.x = 0;
            player.position.x = player.size;
          }
          return true;
        } else {
          return false;
        }
      }

    update(){
        this.draw();
        this.position.x += this.vel.x;
        this.vel.y += gravity;
        this.position.y += this.vel.y;
        //floor
        if(this.position.y + this.height >= canvas.height){
            this.position.y = canvas.height - this.height;
            this.vel.y = -this.vel.y * bounce;
        }
        //ceiling
        if(this.position.y - ballRadius <= 0){
            this.position.y = ballRadius;
            this.vel.y *= -1 * bounce;
        }
        if(this.position.x -ballRadius <= 0 || this.position.x+ballRadius >= 1024){
            this.vel.x *= -1 * bounce;
            if(this.vel.x > 0)
                this.position.x = ballRadius;
            else this.position.x = 1024-ballRadius;
        }
    }
}
