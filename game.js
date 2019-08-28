var game;
var sizeConfig = {
    width: 540,
    height: 960
}

var colorConfig = {
    title: '#ffffff',
    notice: '#ffffff',
    startText: '#ffffff',
    note: 0xffffff, // Don't use '# 'color number
    validArea: 0x333333, // Don't use '# 'color number
    keyGuideText: '#bfbfbf',
    score: '#ffc105',
}

var music;
var musicStopFlag = false;
var countDownTimer;

var score;

var notes = []
var noteTimeTable = [ // Oasis - Don't Look Back In Anger
                    // intro
                    [8800,1], [9200,4], [9500,2], [9900,3], [10300,1], [10600,4], [11000,2], [11400,3], 
                    [11700,1], [12100,4], [12500,2], [12800,3], [13200,1], [13600,1], [13800,2], [14000,3], 
                    [14300,4], [14700,1], [15000,4], [15500,2], [15800,3], [16100,1], [16500,4], [16900,2], 
                    [17200,3], [17600,1], [18000,4], [18300,1], [18700,2], [19200,1], [19400,2], [19600,1], 
                    [19800,2], [20100,1], 

                    // verse (vocal)
                    [20550,1], [20600,3], [20950,2], [21300,4], [21650,1], [21800,3], [22400,3], [22750,2],
                    [23150,1], [23700,2], [23850,2], [24600,1], [24750,3], [24950,4], [25300,1], [25650,2],
                    [26050,4], [26650,3], [26800,2], [28200,1], [28550,1], [28800,4], [29150,1], [29550,3],
                    [29700,4], [32300,1], [32650,1], [33350,2], [33550,1], [34100,4],
                    [34450,4], [34850,2], [35400,2], [35550,3], [36300,1], [36450,1], [36650,3], [37000,3],
                    [37400,2], [37750,1], [38300,1], [38450,2], [39900,4], [40300,3], [40500,2], [40800,4],
                    [44300,1], [44500,1], [44650,2], [45050,3], [45200,3], [45750,4], [46150,4],
                    [46450,2], [46850,1], [50150,1], [50350,1], [50550,3], [50900,4], [51100,2], [51600,1], 
                    [51950,1], [52300,4], [52700,3], [55600,2], [56000,1], [56350,2], [56900,4], [57100,4],
                    [57250,2], [57450,3], [58550,1], [58950,2], [59300,2], [59650,4], [59850,4], [60200,3],
                    [60350,1], [61450,1], [61850,3], [62200,2], [62600,3], [62750,4], [63300,1],
                    [63500,4], [63900,1], [64250,2], [66950,3], [67150,1], 
                    [68800,2], [70250,3], [70600,1], [70950,4], [72050,2], [72500,3], [72800,1], [73100,4],
                    [80900,1], [81250,4], [81600,2], [83050,3], [83450,2], [83800,4], [84150,3],
                    [84550,1], [85300,4], [85600,3], [86000,2], [86700,3], [87100,1], [87450,4],
                    [88000,2], [88150,1], [90700,3], [92200,3], [92900,2], [93250,2], [95650,4],
                    [96200,2], [96400,1], [96950,4], [97100,4], [97500,3], [98400,1], [98800,1],
                    [99000,4], [99300,4]
                    ];



// note class (rectangle)
class note extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, width, height, position, time) {
        super(scene, x, y, width, height, colorConfig.note);
        
        this.state = 1; // 1: alive, 0: dead
        this.position = position;
        this.time = time;
        this.fallingFlag = true;
        this.disappear = this.scene.tweens.add({
                            targets: this,
                            paused: true,
                            scaleX: 1.5,
                            scaleY: 1.5,
                            alpha: 0,
                            duration: 300,
                            onComplete: ()=>{
                                // this.disappear.remove();
                                this.destroy();
                                // console.log(notes.length);
                            }
                        }, this.scene);

        this.setDepth(3);
        scene.add.existing(this);
    }

    // falling the note
    preUpdate(){
        if(this.fallingFlag){
            this.y += 10;
        }
        else{
            this.disappear.play();
        }
        
        if(this.fallingFlag && this.y > sizeConfig.height+100){
            notes.shift()
            this.disappear.remove();
            this.destroy();         
        }
    }

    stopFalling(){
        this.fallingFlag = false;
    }
}





// Load Resources Scene
class bootGame extends Phaser.Scene{
    constructor(){
        super("BootGame");
    }

    preload(){
        // Load Assets (Images, GameMusics);        
        this.load.image("backGroundImage", "assets/noel.jpg");
        this.load.image("home", "assets/home.png");
        this.load.image("reset", "assets/reset.png");
        this.load.image("pause", "assets/pause.png");
        this.load.audio('selectedMusic', "assets/don't_look_back_in_anger_cut_version.mp3"); 	



        /** The process of making & running Loading Bar (Progress Bar) 
         * This source code of the progressBar is written by https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/ **/

        // Make progressBar
        var progressBar = this.add.graphics();

        // Make ProgressBox
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(sizeConfig.width/4, sizeConfig.height/4, sizeConfig.width/2, 50);
        
        // Make Loading Text
        var loadingText = this.make.text({
            x: sizeConfig.width / 2,
            y: sizeConfig.height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '30px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Make Percent Text
        var percentText = this.make.text({
            x: sizeConfig.width / 2,
            y: sizeConfig.height / 2 - 5,
            text: '0%',
            style: {
                font: '26px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Make AssetText (This tells us the loading status of the assets)
        var assetText = this.make.text({
            x: sizeConfig.width / 2,
            y: sizeConfig.height / 2 + 50,
            text: '',
            style: {
                font: '26px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);
        
        // Run ProgressBar
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(sizeConfig.width/4+10, sizeConfig.height/4+10, (sizeConfig.width/2-20) * value, 30);
        });
        
        // Set text asset loading (We can see the assets being loaded)
        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });

        // All loading is complete.
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
    }
    create(){
        this.scene.start("Title");
    }
}

// Title Page
class title extends Phaser.Scene{
    constructor(){
        super("Title");
    }

    create(){
        // Make Title Text
        var titleText = this.add.text(sizeConfig.width/2, sizeConfig.height/4, "HC Jam");
        titleText.setFontSize(70);
        titleText.setColor(colorConfig.title);
        titleText.setOrigin(0.5);

        // Make Game Notice Text
        var notice = this.add.text(sizeConfig.width/2, (sizeConfig.height/4)*(2.5), "Click Start or Press Spacebar");
        notice.setFontSize(30);
        notice.setOrigin(0.5);
        notice.setColor(colorConfig.notice);

        // Make Start Button
        var startButton = this.add.text(sizeConfig.width/2, (sizeConfig.height/4)*3, 'Start');
        startButton.setFontSize(50);
        startButton.setOrigin(0.5);
        startButton.setColor(colorConfig.startText);
        startButton.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
            this.scene.scene.start("PlayGame");
        });

        // Add Key Event for starting game
        this.input.keyboard.on('keydown-SPACE', function (event) {
            this.scene.scene.start("PlayGame");
        });
    }
}

// Play MyRhythmGame Scene
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");

        
    }

    preload(){
        this.noteTimer = 5800; // 8600
        this.noteDropFlag = 0;

        sizeConfig.validAreaX = 0;
        sizeConfig.validAreaY = (sizeConfig.height/10)*9;
        sizeConfig.validAreaWidth = sizeConfig.width/4;
        sizeConfig.validAreaHeight = sizeConfig.height/10;
    }
    
    create(){
        // Attach BackgroundImage        
        this.add.image(sizeConfig.width/2, sizeConfig.height/2, 'backGroundImage').setDepth(0);

        // Make Pause Icon
        var pauseIcon = this.add.image(sizeConfig.width, 10, 'pause');
        pauseIcon.setOrigin(1,0);
    
        // Make Score
        score = this.add.text(sizeConfig.width/2, sizeConfig.height/8, "0");
        score.setFontSize(120);
        score.setColor(colorConfig.score);
        score.setOrigin(0.5);
        score.setVisible(false);
        score.setDepth(5);

        // Make CountDown to start game;
        var countDown = this.add.text(sizeConfig.width/2, sizeConfig.height/8, "3");
        countDown.setFontSize(120);
        countDown.setColor('#ffffff');
        countDown.setOrigin(0.5);

        // Make KeyGuide for each lines;
        this.makeKeyGuideText("Q",(sizeConfig.width/8), (sizeConfig.height/20)*19);
        this.makeKeyGuideText("W", (sizeConfig.width/8)*3, (sizeConfig.height/20)*19);
        this.makeKeyGuideText("O", (sizeConfig.width/8)*5, (sizeConfig.height/20)*19);
        this.makeKeyGuideText("P", (sizeConfig.width/8)*7, (sizeConfig.height/20)*19);

        // Make JudgeBar
        var judgeBar = [];
            
        for(let i = 0; i < 4; ++i){
            judgeBar.push(this.makeOneJudgeArea(sizeConfig.validAreaWidth * i, sizeConfig.validAreaY, sizeConfig.validAreaWidth, sizeConfig.validAreaHeight, colorConfig.validArea));
        }
        
        // Ready to play music
        music = this.sound.add('selectedMusic');
        music.setVolume(0.75);
        
        // Set Key Event (Q, W, O, P);
        this.setInputEvent(judgeBar, pauseIcon);
        
        
        // Truly Play Game
        countDownTimer = this.time.addEvent({
            delay: 750,   // ms
            callback: ()=>{
                this.countDownGameStart(countDown, countDownTimer.getRepeatCount());
                if(countDownTimer.getRepeatCount() === 0){
                    countDown.destroy();
                    score.setVisible(true);
                }
            },
            paused: false,
            repeat: 3
        }); 

        
        this.time.delayedCall(4150, ()=>{ //normal: 4650 | hard: 3700
            music.play();
        }, null, this); 
        
        this.time.addEvent({
            delay: 50, // 50 miliseconds (0.05 seconds)
            callback: ()=>{
                this.noteTimer += 50;
                this.dropNote();
            },
            callbackScope: this,
            paused: false,
            loop: true
        });
    }
    
    countDownGameStart(text, value){
        if(text.text > 1){
            text.setText(value-1);
        }
        else {
            text.setFontSize(75);
            text.setText("Game Start!!")
        }
    }

    // Drop note to the music
    dropNote(){
        if(noteTimeTable.length > this.noteDropFlag){
            if(noteTimeTable[this.noteDropFlag][0] == this.noteTimer){
                if(noteTimeTable[this.noteDropFlag][1] === 1){
                    notes.push(new note(this, (sizeConfig.width/8), 0, sizeConfig.width/4, sizeConfig.height/30, 1, noteTimeTable[this.noteDropFlag][0]));
                }
                else if(noteTimeTable[this.noteDropFlag][1] === 2){
                    notes.push(new note(this, (sizeConfig.width/8)*3, 0, sizeConfig.width/4, sizeConfig.height/30, 2, noteTimeTable[this.noteDropFlag][0]));    
                }
                else if(noteTimeTable[this.noteDropFlag][1] === 3){
                    notes.push(new note(this, (sizeConfig.width/8)*5, 0, sizeConfig.width/4, sizeConfig.height/30, 3, noteTimeTable[this.noteDropFlag][0]));
                }
                else if(noteTimeTable[this.noteDropFlag][1] === 4){
                    notes.push(new note(this, (sizeConfig.width/8)*7, 0, sizeConfig.width/4, sizeConfig.height/30, 4, noteTimeTable[this.noteDropFlag][0]));        
                }

                this.noteDropFlag++; 
            }  
        }
        else if(this.noteTimer > 115000){
            music.stop();
            this.scene.start("GameOver");
        } 
    }


    setInputEvent(judgeLine, pauseIcon){
        for(let i = 0; i < 4; ++i){
            judgeLine[i].setInteractive().on('pointerdown', function(pointer, localX, localY, event){
                judgeLine[i].setFillStyle(colorConfig.validArea, 1);
                this.scene.judgeNote(i+1);
            });
            judgeLine[i].setInteractive().on('pointerup', function(pointer, localX, localY, event){
                judgeLine[i].setFillStyle(colorConfig.validArea, 0.6);
            });
        }
        
        this.input.keyboard.on('keydown', function (event) {
            if(event.key === 'q'){
                judgeLine[0].setFillStyle(colorConfig.validArea, 1);
                this.scene.judgeNote(1);
            }
            else if(event.key === 'w'){
                judgeLine[1].setFillStyle(colorConfig.validArea, 1);
                this.scene.judgeNote(2);
            }
            else if(event.key === 'o'){
                judgeLine[2].setFillStyle(colorConfig.validArea, 1);
                this.scene.judgeNote(3);
            }
            else if(event.key === 'p'){
                judgeLine[3].setFillStyle(colorConfig.validArea, 1);
                this.scene.judgeNote(4);
            }
            else if(event.key === 'Escape'){
                this.scene.pauseGame();
            }
            else{
                console.log('keydown: Not QWOP');
            }
        });

        this.input.keyboard.on('keyup', function (event) {
            if(event.key === 'q'){
                judgeLine[0].setFillStyle(colorConfig.validArea, 0.6);
            }
            else if(event.key === 'w'){
                judgeLine[1].setFillStyle(colorConfig.validArea, 0.6);
            }
            else if(event.key === 'o'){
                judgeLine[2].setFillStyle(colorConfig.validArea, 0.6);
            }
            else if(event.key === 'p'){
                judgeLine[3].setFillStyle(colorConfig.validArea, 0.6);
            }
            else{
                console.log('keyup: Not QWOP');
            }
        });

        pauseIcon.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
            this.scene.pauseGame();
        });
    }

    // Pause the Game
    pauseGame(){
        music.pause();
        game.scene.pause("PlayGame");
        game.scene.run("PauseGame");
    }

    // Judge Note 
    judgeNote(line){
        notes.forEach(element => {
            if(element.position === line && element.y < (sizeConfig.height/10)*11 && element.y > sizeConfig.validAreaY-50){
                console.log(`${element.time} || ${element.position}`);
                element.stopFalling();
                notes.shift();
                score.setText(parseInt(score.text) + 10);
                return;
            }
        });
    }

    // Make Judge Bar 
    makeOneJudgeArea(x, y, width, height,color){
        var judgeBar = this.add.rectangle(x, y, width, height, color);
        judgeBar.setFillStyle(color, 0.5);
        judgeBar.setOrigin(0);
        judgeBar.setDepth(1);
        return judgeBar;
    }

    // Show 4 Keys
    makeKeyGuideText(value, x, y){
        let text = this.add.text(x, y, value);
        text.setFontSize(50);
        text.setColor(colorConfig.keyGuideText);
        text.setOrigin(0.5);
        text.setDepth(2);
    }
}

// GamePause Scene
class pauseGame extends Phaser.Scene{
    constructor(){
        super("PauseGame");
    }
    
    create(){
        this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor32(0, 0, 0, 125));
        
        let pauseText = this.add.text(sizeConfig.width/2., sizeConfig.height/2, "Pause");
        pauseText.setFontSize(100);
        pauseText.setColor(colorConfig.keyGuideText);
        pauseText.setOrigin(0.5);
        pauseText.setDepth(5);
        pauseText.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
            this.scene.resumeGame(pauseText);
        });
        
        this.input.keyboard.on('keydown-ESC', function (event) {
            this.scene.resumeGame(pauseText);
        });
    }

    resumeGame(pauseText){
        pauseText.setText(3);
        let restartTimer = this.time.addEvent({
            delay: 750,
            callback: ()=>{   
                if(restartTimer.getRepeatCount() != 1){
                    pauseText.setText(restartTimer.getRepeatCount()-1);
                } 
                else{
                    game.scene.stop("PauseGame");
                    game.scene.resume("PlayGame");
                    music.resume();
                }
            },
            repeat: 3
        });
    }
}

// GameOver Scene
class gameOver extends Phaser.Scene{
    constructor(){
        super("GameOver");
    }
    
    create(){
        // Show Score of The Game
        var result = this.add.text(sizeConfig.width/2, sizeConfig.height/5, score.text);
        result.setOrigin(0.5);
        result.setColor(colorConfig.score);
        result.setFontSize(200);

        // Make HomeIcon
        var homeIcon = this.add.image(sizeConfig.width/3, (sizeConfig.height/5)*2, "home");
        homeIcon.setOrigin(0.5);
        homeIcon.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
            game.scene.stop('GameOver');
            game.scene.start("Title");
        });

        // Make ResetIcon
        var resetIcon = this.add.image((sizeConfig.width/3)*2, (sizeConfig.height/5)*2, "reset");
        resetIcon.setOrigin(0.5);
        resetIcon.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
            notes = [];
            game.scene.stop('GameOver');
			game.scene.start('PlayGame');;
        });

        // Show rankings
        for(let i = 0; i < 5; ++i){
            var record = this.add.text(sizeConfig.width/2, (sizeConfig.height/20)*(15-i), "Record");
            record.setFontSize(30);
            record.setColor('#ffffff');
            record.setOrigin(0.5);
        }
    }
}

// Run Game
window.onload = function () {
	var config = {
		type: Phaser.AUTO,
		backgroundColor: 0x123456,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: sizeConfig.width,
            height: sizeConfig.height
        },
		physics: {
			default: 'arcade',
			arcade: {
				debug: false
			}
		},
		scene: [bootGame, title, playGame, pauseGame, gameOver]
	};
    game = new Phaser.Game(config);
	// window.resize();
	// window.addEventListener("resize", resize, false);
}



// Resize by ratio
function resize() {
	var canvas = document.querySelector("canvas");
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	var windowRatio = windowWidth / windowHeight;
	var gameRatio = game.config.width / game.config.height;
	if (windowRatio < gameRatio) {
		canvas.style.width = windowWidth + "px";
		canvas.style.height = (windowWidth / gameRatio) + "px";
	} else {
		canvas.style.width = (windowHeight * gameRatio) + "px";
		canvas.style.height = windowHeight + "px";
	}
}