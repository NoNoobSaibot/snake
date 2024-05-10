let animationID;

class Game{
	
	constructor(){
		if(Game.instance)
			return Game.instance;
		
		this.conrolled = true;
		this.Setting();
		this.Controller();
	}
	Start(){
		animationID = requestAnimationFrame(this.Update.bind(this));
	}
	
	Setting(){
		this.playGround = document.querySelector('canvas');
		this.playGround.style.backgroundColor = '#6dc98';
		this.playGround.width = 400;
		this.playGround.height = 400;
		this.gameobject = new Map();
		
		this.ctx2D = this.playGround.getContext("2d");
		
		this.startTime = 0;
		this.timer = 0;
	}
	
	Controller(){
		document.addEventListener('keydown', (e)=>{
			
			let playerDir = this.gameobject.get('Snake').tails[0].Dir;
			
			if(this.conrolled){
			
				if (e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'ArrowUp' || e.key == 'ArrowDown'){
					
					if(playerDir == 'ArrowLeft' && e.key != 'ArrowRight' || playerDir == 'ArrowRight' && e.key != 'ArrowLeft'){
						this.gameobject.get('Snake').tails[0].Dir = e.key; 
					}else if(playerDir == 'ArrowUp' && e.key != 'ArrowDown' || playerDir == 'ArrowDown' && e.key != 'ArrowUp'){
						this.gameobject.get('Snake').tails[0].Dir = e.key; 
					}
					else{
						this.gameobject.get('Snake').tails[0].Dir = playerDir;
					}
					
					this.conrolled = false;
				}
			}
		});
	}
	
	Update(timestamp){
		 //ТАЙМЕР АНИМАЦИИ
		this.timer = timestamp - this.startTime;
		
		// ПРОВЕРКА НА GAME OVER
		
		if(this.gameobject.get('Snake').failed){
			cancelAnimationFrame(animationID);
			return this.GameOver();
		}
		
		//УСТАНОВКА
		if( this.timer > 1000/12 ){
			
			this.conrolled = true;
			this.startTime = timestamp;
			this.gameobject.get('Snake').Direction();
			this.gameobject.get('Snake').LogicEat(this.gameobject.get('Eat'),this.gameobject.get('Score'));
						
		}
		// РИСУЕМ ПОЛЕ
		this.Draw(this.playGround.clientWidth,this.playGround.clientHeight);
		//ОБНОВЛЯЕМ ЦИКЛ ЧЕРЕЗ
		
		animationID = requestAnimationFrame(this.Update.bind(this));
	}
	
	SetGameObject(id,object){
		this.gameobject.set(id,object);
	}
	
	Draw(width,height){
		
		this.ctx2D.clearRect(0,0,width,height);  //очищаем
		this.ctx2D.beginPath();  				// заново рисуем
		
           for(let i = 0; i < 20; i++){
		   let rectX = width/20 * i;
		   
		   for(let j = 0; j < 20; j++) {
			   
				let rectY = height/20 * j;

				this.gameobject.get('Snake').print(this.ctx2D,i,j,rectX,rectY);

				if(this.gameobject.has('Eat'))
				this.gameobject.get('Eat').print(this.ctx2D,i,j,rectX,rectY);

			    this.gameobject.get('Score').print(this.ctx2D,i,j,rectX,rectY);

				this.gameobject.get('Grid').print(this.ctx2D,i,j,rectX,rectY);

		   }
		} 
	}
	
	Delete(object){
		delete this.gameobject[object];
		console.log(`Объект ${object} удален`);
	}

	GameOver(){
		this.ctx2D.fillStyle = 'black';
		this.ctx2D.fillRect(0,0,this.playGround.clientWidth,this.playGround.clientHeight);
		// ТЕКСТ
		this.ctx2D.font = '30px Agency FB'; // Устанавливаем шрифт и размер текста
        this.ctx2D.fillStyle = 'white'; // Устанавливаем цвет текста
        this.ctx2D.fillText('GAME OVER',this.playGround.clientWidth/2 - 100,this.playGround.clientHeight/2 ); // Рисуем текст на указанных координатах
		this.ctx2D.fillStyle = 'orange'; // Устанавливаем цвет текста
        this.ctx2D.fillText('Score: ' + this.gameobject.get('Score').getScore(),this.playGround.clientWidth/2 - 100,this.playGround.clientHeight/2 - 50 ); // Рисуем текст на указанных координатах
	}
}

class Texture{

	constructor(){
		this.X = 0;
		this.Y = 1;
		this.Width = 20;
		this.Height = 20;
	}

	printCanvas(ctx2D,rectX,rectY){
		ctx2D.lineWidth = 1;
		ctx2D.strokeStyle = '#333333';
		ctx2D.strokeRect(rectX,rectY,this.Width,this.Height);
	}

	print(ctx2D,i,j,rX,rY){	

		if(this.Y < j)
		this.printCanvas(ctx2D,rX,rY);
   }
}

class Score{
	constructor(){
		this.count = 0;
		this.X = 0;
		this.Y = 1;
		this.Width = 500;
		this.Height = 37;
		this.Color = '#3F3E3D';
	}
    
	getScore(){
		return this.count;
	}
    setScore(sc){
		this.count += sc;
	}
	
	printCanvas(ctx2D,rectX,rectY){

		// РАМКА
		ctx2D.lineWidth = 3;
		ctx2D.strokeStyle = '#51DFFF';
		ctx2D.strokeRect(rectX,rectY,this.Width,this.Height);
		// ФОН
		ctx2D.fillStyle = this.Color;
		ctx2D.fillRect(rectX,rectY,this.Width,this.Height);
		// ТЕКСТ
		ctx2D.font = '25px Agency FB'; // Устанавливаем шрифт и размер текста
        ctx2D.fillStyle = 'white'; // Устанавливаем цвет текста
        ctx2D.fillText(this.getScore(), rectX + 200, rectY + 25); // Рисуем текст на указанных координатах
	}
	
	print(ctx2D,i,j,rX,rY){
		if(this.X == i && this.Y > j){
			this.printCanvas(ctx2D,rX,rY);
		}
	}
}


class Snake{
	constructor(){
			this.tails = new Array();
			this.failed = false;
			this.Esophagus = new Array(); // пищевод
			this.image = new Image();
	}
	
	setHead(id,coorX,coorY,width,height){
		this.tails[0] = new Tail(id,'Image/head.png',coorX,coorY,width,height);
	}
	setTail(id,coorX,coorY,width,height){
		this.tails.push(new Tail(id,'Image/tail.png',coorX,coorY,width,height));
	}
	
    printCanvas(ctx2D,segment,rectX,rectY){
		ctx2D.drawImage(segment.Image,rectX,rectY,segment.Width,segment.Height);
    }
	
	print(ctx2D,i,j,rX,rY){
		 for(let ii = 0; ii < this.tails.length; ii++){
		 if(this.tails[ii].X == i && this.tails[ii].Y == j){
			  this.printCanvas(ctx2D,this.tails[ii],rX,rY);
		    }
		}
	}
	
    Direction(){  
  
	for(let ii = 0; ii < this.tails.length; ii++){
	   
		switch(this.tails[ii].Dir){
			case 'ArrowLeft': this.tails[ii].X--; break;
			case 'ArrowRight': this.tails[ii].X++; break;
			case 'ArrowUp': this.tails[ii].Y--; break;
			case 'ArrowDown': this.tails[ii].Y++; break;
		}
		
		if(this.tails[ii].X > 19){
		this.tails[ii].X = 0;
		}
		else if(this.tails[ii].X < 0){
		this.tails[ii].X = 19;
		}
		else if(this.tails[ii].Y > 19){
		this.tails[ii].Y = 2;
		}
		else if(this.tails[ii].Y < 2){
		this.tails[ii].Y = 19;
		}
    }
  
    for(let ii = this.tails.length - 1; ii > 0; ii--){
        if(ii != 0){
            this.tails[ii].Dir = this.tails[ii-1].Dir;
        }
    }
  
  }
  
  LogicEat(eat,score){
	
		let end = this.tails.length - 1; // конец хвоста
		
		for(let ii = 1; ii < this.tails.length; ii++){
			if(this.tails[0].X == this.tails[ii].X && this.tails[0].Y == this.tails[ii].Y){
				this.failed = true;
			}
		}

		if(this.tails[0].X == eat.X && this.tails[0].Y == eat.Y){
            
			this.Esophagus.unshift({eatenX:eat.X,eatenY:eat.Y}); // получаем координаты съеденной пищи
			game.Delete('Eat'); 					// удаляем съеденную пищу
			game.SetGameObject('Eat',new Eat()); // устанавливаем в игре новую пищу
			score.setScore(10);
		}
		
		for(const e of this.Esophagus){

			if(this.tails[end].X == e.eatenX && this.tails[end].Y == e.eatenY){
				this.setTail('tail',e.eatenX,e.eatenY,20,20);
				this.Esophagus.pop();   
			}
		}

	}
}

class Eat{
	constructor(){
		this.Width = 20;
		this.Height = 20;
		this.Color  = '#FF2E00';
		this.setRandomLocation();
		this.replace = false;
		this.image = new Image();
	}
	
	getRandomNumber(min,max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	setRandomLocation(){
	  let randomcoor = setInterval(()=>{
			this.X = this.getRandomNumber(2,19);
			this.Y = this.getRandomNumber(2,19);
			this.replace = false;
			
			for(let ii = 0; ii < snake.tails.length; ii++){
				if(snake.tails[ii].X == this.X && snake.tails[ii].Y == this.Y){
					this.X = -99;
					this.Y = -99;
					this.replace = true;
					console.log('this.X = -99 this.Y = -99');
					break;
				}
			}

			if(this.replace == false)
			clearInterval(randomcoor);
			
		},1000);
	}
	printCanvas(ctx2D,rectX,rectY){

		this.image.src = 'Image/eat.png';
		ctx2D.drawImage(this.image,rectX,rectY,this.Width,this.Height);
	}
	print(ctx2D,i,j,rX,rY){
		 if(this.X == i && this.Y == j){
			this.printCanvas(ctx2D,rX,rY);
		}
	}
	
}

class Tail{
	constructor(id,path,coorX,coorY,width,height){
		this.id = id;
		this.X = coorX;
		this.Y = coorY;
		this.Width = width;
		this.Height = height;
		this.Dir = 'None';
		this.Image = new Image();
		this.ImageInit(path);
	}

	ImageInit(path){
		this.Image.src = path;
	}
}

let game = new Game();
let snake = new Snake();
let score = new Score();

snake.setHead('head',10,10,20,20);  // начальная установка головы
snake.tails[0].Dir = 'ArrowLeft'; // начальная установка направления 

game.SetGameObject('Snake',snake); // добавляем в игру змейку
game.SetGameObject('Eat', new Eat());     // добавляем в игру еду
game.SetGameObject('Score',score); // добавляем в игру очки
game.SetGameObject('Grid',new Texture()); // добавляем в игру сетку

game.Start();					  // запускаем игру


/*

*/