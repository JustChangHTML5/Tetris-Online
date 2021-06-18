var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var nextDisplay = document.getElementById("nextimg");
var scoreDisplay = document.getElementById("score");
var highScoreDisplay = document.getElementById("highScore");
//Easter egg! (303)-800-0717
const tetrominos = [[[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [-1, 0], [1, 0], [-1, -1]], [[0, 0], [1, 0], [-1, 0], [-1, 1]], [[0, 0], [0, 1], [1, 1], [1, 0]], [[0, 0], [1, 0], [1, -1], [2, -1]], [[0, 0], [-1, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]]];//I, J, L, O, S, T, Z
const tetrominoImg = ["/sources/blocks/I_Tetromino-0.png", "/sources/blocks/J_Tetromino-0.png", "/sources/blocks/L_Tetromino-0.png", "/sources/blocks/O_Tetromino-0.png", "/sources/blocks/S_Tetromino-0.png", "/sources/blocks/T_Tetromino-0.png", "/sources/blocks/Z_Tetromino-0.png"];
const playfieldWidth = 10;
const playfieldHeight = 23;
const gridSize = 20;
var curTetromino = null;
var tetrominoNum = 0;
var nextTetrominoNum = 0;
var counter = 0;
var gameSpeed = 100;
var speed = 100;
var score = 0;
var bagNum = [0, 1, 2, 3, 4, 5, 6];
var pause = false;

canvas.width = playfieldWidth * gridSize;
canvas.height = playfieldHeight * gridSize;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRanBagNum() {
    if (bagNum.length != 1) {
        var num = getRandomInt(bagNum.length);
        var returnVal = bagNum[num];
        bagNum.splice(num, 1);
        return returnVal;
    } else {
        var returnVal = bagNum[getRandomInt(bagNum.length)];
        bagNum = [0, 1, 2, 3, 4, 5, 6];
        return returnVal;
    }
}

document.onkeydown = function (event) {
    switch (event.keyCode) {
        case 37:
            var newTetromino = moveTetrominoLeft();
            updatePlayfield(newTetromino, tetrominoNum + 1);
            curTetromino = newTetromino;
        break;
        case 38:
            var newTetromino = rotateTetromino(curTetromino);
            updatePlayfield(newTetromino, tetrominoNum + 1);
            curTetromino = newTetromino;
        break;
        case 39:
            var newTetromino = moveTetrominoRight();
            updatePlayfield(newTetromino, tetrominoNum + 1);
            curTetromino = newTetromino;
        break;
        case 40:
            speed = 3;
        break;
    }
};

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function drawLine(x, y, x0, y0) {
    ctx.beginPath();
    ctx.strokeStyle = "gray";
    ctx.moveTo(x, y);
    ctx.lineTo(x0, y0);
    ctx.stroke();
}

function drawRect(x, y, width, height, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.stroke();
}

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function includes(arr, search) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][0] == search[0] && arr[i][1] == search[1]) {
            return true;
        }
    }
    
    return false;
}

function exists(arr, search) {
    return arr.some(row => row.includes(search));
}

class MatrixNode {
    constructor(key, xm, ym) {
        this.xm = xm;
        this.ym = ym;
        this.key = key;
    }

    update(key, xm, ym) {
        this.xm = xm;
        this.ym = ym;
        this.key = key;
    }
}

class Matrix {
    constructor() {
        this.nodes = [];
        this.nodesData = [];
        this.sizeX = 0;
        this.sizeY = 0;
        this.size = 0;
    }

    update(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var updateNode = nodes[i];
            var node = this.nodes[i];
            node.update(updateNode.key, updateNode.xm, updateNode.ym);
        }
    }

    build(sizeX, sizeY) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.size = this.sizeX * this.sizeY;

        for (var y = 1; y <= this.sizeY; y++) {
            for (var x = 1; x <= this.sizeX; x++) {
                let newNode = new MatrixNode(0, x, y);
                this.nodes.push(newNode);
            }
            x = 0;
        }
    }

    clear() {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].key != 0) {
                this.nodes[i].key = 0;
            }
        }
    }

    getNode(x, y) {
        if (y <= 0) {
            let bufferNode = new MatrixNode(0, 0, 0);
            return bufferNode;
        } else if (x <= 0) {
            let bufferNode = new MatrixNode(0, 0, 0);
            return bufferNode;
        } else if (y > this.sizeY) {
            let bufferNode = new MatrixNode(0, 0, 0);
            return bufferNode;
        } else if (x > this.sizeX) {
            let bufferNode = new MatrixNode(0, 0, 0);
            return bufferNode;
        }
        return this.nodes[(y - 1) * this.sizeX + x - 1];
    }

    getRow(rowNum) {
        var returnRow = [];
        for (var i = 0; i < this.sizeX; i++) {
            returnRow.push(this.getNode(i + 1, rowNum).key);
        }
        return returnRow;
    }

    find(key) {
        var keyNodes = [];

        for (i = 0; i < keyNodes.length; i++) {
            if (this.nodes[i].key == key) {
                keyNodes.push(this.nodes[i]);
            }
        }

        return keyNodes;
    }
}

let playfield = new Matrix();
playfield.build(playfieldWidth, playfieldHeight);

function spawnTetromino(type, colorNum) {
    const spawnPoint = [5, 2];
    var returnTetromino = [];
    var lost = false;

    for (var i = 0; i < type.length; i++) {
        if (playfield.getNode(type[i][0] + spawnPoint[0], type[i][1] + spawnPoint[1]).key != 0) {
            lost = true;
            break;
        }
        playfield.getNode(type[i][0] + spawnPoint[0], type[i][1] + spawnPoint[1]).key = colorNum + 1;
        returnTetromino.push([type[i][0] + spawnPoint[0], type[i][1] + spawnPoint[1]]);
    }

    if (lost) {
        return true;
    }

    return returnTetromino;
}

function drawGrid() {
    for (var column = 1; column <= playfieldWidth; column++) {
        drawLine(column * gridSize, 0, column * gridSize, playfieldHeight * gridSize);
    }

    for (var row = 1; row <= playfieldHeight; row++) {
        drawLine(0, row * gridSize, playfieldWidth * gridSize, row * gridSize);
    }
}

function drawTetrominos() {
    for (var i = 0; i < playfield.nodes.length; i++) {
        var node = playfield.nodes[i];
        switch(node.key) {
            case 1:
                drawRect((node.xm - 1) * gridSize + 1, (node.ym - 1) * gridSize + 1, gridSize - 1, gridSize - 1, "cyan");
                break;

            case 2:
                drawRect((node.xm - 1) * gridSize + 1, (node.ym - 1) * gridSize + 1, gridSize - 1, gridSize - 1, "blue");
                break;

            case 3:
                drawRect((node.xm - 1) * gridSize + 1, (node.ym - 1) * gridSize + 1, gridSize - 1, gridSize - 1, "orange");
                break;

            case 4:
                drawRect((node.xm - 1) * gridSize + 1, (node.ym - 1) * gridSize + 1, gridSize - 1, gridSize - 1, "yellow");
                break;

            case 5:
                drawRect((node.xm - 1) * gridSize + 1, (node.ym - 1) * gridSize + 1, gridSize - 1, gridSize - 1, "green");
                break;

            case 6:
                drawRect((node.xm - 1) * gridSize + 1, (node.ym - 1) * gridSize + 1, gridSize - 1, gridSize - 1, "purple");
                break;

            case 7:
                drawRect((node.xm - 1) * gridSize + 1, (node.ym - 1) * gridSize + 1, gridSize - 1, gridSize - 1, "red");
                break;
            
            default:
                continue;
        }
    }
}

function updateCurTetromino() {
    var updateTetromino = [];
    for (var i = 0; i < curTetromino.length; i++) {
        updateTetromino.push([curTetromino[i][0], curTetromino[i][1] + 1]);
        if (curTetromino[i][1] + 1 > playfieldHeight) {
            curTetromino = null;
            return true;
        } else if (playfield.getNode(curTetromino[i][0], curTetromino[i][1] + 1).key != 0) {
            if (!includes(curTetromino, [curTetromino[i][0], curTetromino[i][1] + 1])) {
                curTetromino = null;
                return true;
            } 
        }
    }

    return updateTetromino;
}

function moveTetrominoRight() {
    var updateTetromino = [];
    if (curTetromino != null) {
        for (var i = 0; i < curTetromino.length; i++) {
            updateTetromino.push([curTetromino[i][0] + 1, curTetromino[i][1]]);
            if (curTetromino[i][0] + 1 > playfieldWidth) {
                return curTetromino;
            } else if (playfield.getNode(curTetromino[i][0] + 1, curTetromino[i][1]).key != 0) {
                if (!includes(curTetromino, [curTetromino[i][0] + 1, curTetromino[i][1]])) {
                    return curTetromino;
                } 
            }
        }
    }
    return updateTetromino;
}

function moveTetrominoLeft() {
    var updateTetromino = [];
    if (curTetromino != null) {
        for (var i = 0; i < curTetromino.length; i++) {
            updateTetromino.push([curTetromino[i][0] - 1, curTetromino[i][1]]);
            if (curTetromino[i][0] - 1 < 1) {
                return curTetromino;
            } else if (playfield.getNode(curTetromino[i][0] - 1, curTetromino[i][1]).key != 0) {
                if (!includes(curTetromino, [curTetromino[i][0] - 1, curTetromino[i][1]])) {
                    return curTetromino;
                } 
            }
        }
    }
    return updateTetromino;
}

function rotateTetromino(tetromino) {
    returnTetromino = [];
    for (var i = 0; i < tetromino.length; i++) {
        var rotateBlock = rotate(tetromino[0][0], tetromino[0][1], tetromino[i][0], tetromino[i][1], -90);
        if (playfield.getNode(rotateBlock[0], rotateBlock[1]).key != 0) {
            if (!includes(tetromino, [rotateBlock[0], rotateBlock[1]])) {
                return tetromino;
            } 
            
        }
        if (rotateBlock[0] > playfieldWidth || rotateBlock[0] < 1 || rotateBlock[1] > playfieldHeight || rotateBlock[1] < 1) {
            return tetromino;
        }
        returnTetromino.push(rotateBlock);
    }

    return returnTetromino;
}

function updatePlayfield(newTetromino, color) {
    for (var i = 0; i < curTetromino.length; i++) {
        playfield.getNode(curTetromino[i][0], curTetromino[i][1]).key = 0;
    }

    for (var i = 0; i < newTetromino.length; i++) {
        playfield.getNode(newTetromino[i][0], newTetromino[i][1]).key = color;
    }
}

function checkRow() {
    var workingRows = [];
    for (var i = 0; i < playfieldHeight; i++) {
        var row = playfield.getRow(i + 1);
        if (row.includes(0) == false) {
            for (var j = 0; j < playfield.sizeX; j++) {
                playfield.getNode(j + 1, i + 1).key = 0;
            }
            workingRows.push(i);
        }
    }

    for (var i = 0; i < workingRows.length; i++) {
        var rows = [];
        for (var j = 1; j < workingRows[i] + 1; j++) {
            rows.push(playfield.getRow(j));
        }

        for (var j = 0; j < workingRows[i]; j++) {
            var row = rows[j];
            for (var k = 0; k < playfield.sizeX; k++) {
                playfield.getNode(k + 1, j + 2).key = row[k];
            }
        }
        score += 100;
        gameSpeed = gameSpeed * 90 / 100;
    }
}

function main() {
    if (pause == false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (counter == 0) {
            if (curTetromino == null) {
                tetrominoNum = getRanBagNum(tetrominos.length);
                nextTetrominoNum = getRanBagNum(tetrominos.length);
                curTetromino = spawnTetromino(tetrominos[tetrominoNum], tetrominoNum - 1);
                nextDisplay.src = tetrominoImg[nextTetrominoNum];
            }
        }

        drawGrid();
        drawTetrominos();

        if (counter == 0) {
            var newTetromino = updateCurTetromino();
            if (newTetromino == true) {
                checkRow();
                tetrominoNum = nextTetrominoNum;
                nextTetrominoNum = getRanBagNum(tetrominos.length);
                curTetromino = spawnTetromino(tetrominos[tetrominoNum], tetrominoNum);
                if (curTetromino == true) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    nextDisplay.src = "/sources/lose/losing.jpg";
                    var highScore = getCookie("TetrisHighScore");
                    if (highScore == "") {
                        setCookie("TetrisHighScore", score, 365);
                    } else if (score > highScore) {
                        setCookie("TetrisHighScore", score, 365);
                    }
                    clearInterval(gameLoop);
                } else {
                    nextDisplay.src = tetrominoImg[nextTetrominoNum];
                }
            } else {
                updatePlayfield(newTetromino, tetrominoNum + 1);
                curTetromino = newTetromino;
            }
        }

        if (counter < speed) {
            counter++;
        }

        else {
            counter = 0;
        }

        if (speed != gameSpeed) {
            speed = gameSpeed;
            score++;
        }
        scoreDisplay.innerHTML = "Score: " + score.toString();
        highScoreDisplay.innerHTML = "High Score: " + getCookie("TetrisHighScore").toString();
    }

}

function startGame() {
    var gameLoop = setInterval(main, 10);
}

function resetGame() {
    curTetromino = null;
    tetrominoNum = 0;
    nextTetrominoNum = 0;
    counter = 0;
    gameSpeed = 100;
    speed = 100;
    score = 0;
    playfield.clear();
    var gameLoop = setInterval(main, 10);
}