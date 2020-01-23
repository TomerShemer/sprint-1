'use strict';

var MINE = '💣';
var FLAG = '🚩';
var EMPTY = '';

var SMILEY = '😃';
var SMILEY_DEAD = '😵';
var SMILEY_WIN = '😎';


var gLevel = {
    size: 4,
    mines: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard;
var gGameInterval;
var isFirstClick;
var isHintClicked = false;

var livesLeft;
var marksLeft;
var hintsLeft;
var safeClicksLeft;

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    livesLeft = 3
    document.querySelector('.lives').innerText = livesLeft;
    safeClicksLeft = 3
    document.querySelector('.safe-click span').innerText = safeClicksLeft;
    hintsLeft = 3
    document.querySelector('.hint-btn span').innerText = hintsLeft;
    marksLeft = gLevel.mines;
    document.querySelector('.marks-counter').innerText = marksLeft;
    gGame.isOn = true;
    isFirstClick = true;
    document.querySelector('.best-times .easy').innerText = localStorage.getItem('easy')
    document.querySelector('.best-times .medium').innerText = localStorage.getItem('medium')
    document.querySelector('.best-times .hard').innerText = localStorage.getItem('hard')
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false,
                isSafe: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHtml = '';

    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var className = (board[i][j].isShown && !board[i][j].isHinted) ? 'clicked' : '';
            className += (board[i][j].isHinted) ? ' hinted' : '';
            strHtml += `<td id="cell-${i}-${j}" onclick="cellClicked(this, ${i}, ${j})" 
            class="${className}" oncontextmenu="cellMarked(${i}, ${j})">`
            if (board[i][j].isMarked) strHtml += FLAG;
            if (board[i][j].isShown) {
                if (board[i][j].isMine) {
                    strHtml += MINE
                } else if (board[i][j].minesAroundCount === 0) {
                    strHtml += EMPTY
                } else {
                    strHtml += board[i][j].minesAroundCount
                }
            }
            strHtml += '</td>'
        }
        strHtml += '</tr>'
    }

    document.querySelector('.container').innerHTML = strHtml;
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {

            var currCell = board[i][j]
            if (currCell.isMine) {
                // Try to shorten, getting undefined for non existing cells (even with 'if (currCell)')
                if (i === 0) {
                    if (j === 0) {
                        board[i][j + 1].minesAroundCount++
                        board[i + 1][j + 1].minesAroundCount++
                    } else if (j === board[0].length - 1) {
                        board[i][j - 1].minesAroundCount++
                        board[i + 1][j - 1].minesAroundCount++
                    } else {
                        board[i][j - 1].minesAroundCount++
                        board[i][j + 1].minesAroundCount++
                        board[i + 1][j - 1].minesAroundCount++
                        board[i + 1][j + 1].minesAroundCount++
                    }
                    board[i + 1][j].minesAroundCount++
                } else if (i === board.length - 1) {
                    if (j === 0) {
                        board[i - 1][j + 1].minesAroundCount++;
                        board[i][j + 1].minesAroundCount++
                    } else if (j === board[0].length - 1) {
                        board[i - 1][j - 1].minesAroundCount++;
                        board[i][j - 1].minesAroundCount++;
                    } else {
                        board[i - 1][j - 1].minesAroundCount++;
                        board[i - 1][j + 1].minesAroundCount++;
                        board[i][j - 1].minesAroundCount++;
                        board[i][j + 1].minesAroundCount++;
                    }
                    board[i - 1][j].minesAroundCount++
                } else {
                    if (j === 0) {
                        board[i - 1][j + 1].minesAroundCount++
                        board[i][j + 1].minesAroundCount++;
                        board[i + 1][j + 1].minesAroundCount++;
                    } else if (j === board[0].length - 1) {
                        board[i - 1][j - 1].minesAroundCount++;
                        board[i][j - 1].minesAroundCount++;
                        board[i + 1][j - 1].minesAroundCount++

                    } else {

                        board[i - 1][j - 1].minesAroundCount++;
                        board[i - 1][j + 1].minesAroundCount++;
                        board[i][j - 1].minesAroundCount++;
                        board[i][j + 1].minesAroundCount++;
                        board[i + 1][j - 1].minesAroundCount++
                        board[i + 1][j + 1].minesAroundCount++
                    }
                    board[i + 1][j].minesAroundCount++
                    board[i - 1][j].minesAroundCount++
                }
            }
        }
    }
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (isFirstClick) {
        placeMines(gBoard, i, j);
        setMinesNegsCount(gBoard);
        isFirstClick = !isFirstClick
        displayTime();
        renderBoard(gBoard);
    }
    var currCell = gBoard[i][j];
    if (currCell.isShown || currCell.isMarked) return

    //if hint is active before clicking
    if (isHintClicked) {
        var kStartIdx = (i - 1 > 0) ? i - 1 : 0;
        var kEndIdx = (i + 1 < gBoard.length) ? i + 1 : gBoard.length - 1;
        var lStartIdx = (j - 1 > 0) ? j - 1 : 0;
        var lEndIdx = (j + 1 < gBoard[0].length) ? j + 1 : gBoard[0].length - 1;
        for (var k = kStartIdx; k <= kEndIdx; k++) {
            for (var l = lStartIdx; l <= lEndIdx; l++) {
                if (gBoard[k][l].isShown) continue
                gBoard[k][l].isShown = true;
                gBoard[k][l].isHinted = true;


            }
        }
        setTimeout(function () {
            for (k = kStartIdx; k <= kEndIdx; k++) {
                for (l = lStartIdx; l <= lEndIdx; l++) {
                    if (gBoard[k][l].isHinted)
                        gBoard[k][l].isShown = false;
                    gBoard[k][l].isHinted = false;
                }
            }

            elCell.classList.remove('clicked')
            renderBoard(gBoard)
        }, 1000);
        document.querySelector('.hint-btn').style.backgroundColor = '';
        isHintClicked = false
        renderBoard(gBoard)
        return
    }

    // if clicked on mine
    if (currCell.isMine) {
        currCell.isShown = true;
        checkGameOver(i, j)
        renderBoard(gBoard)
        return
    }

    // if cell is ok to click
    currCell.isShown = true;
    if (currCell.minesAroundCount === 0 && currCell.isMine === false) expandShown(gBoard, i, j)
    elCell.classList.add('clicked')
    gGame.shownCount++
    renderBoard(gBoard);
    checkGameOver(i, j)
}

function cellMarked(i, j) {
    if (!gGame.isOn) return
    var currCell = gBoard[i][j];
    if (currCell.isShown) return
    if (currCell.isMarked) {
        currCell.isMarked = false
        document.querySelector('.marks-counter').innerText++
        marksLeft++
        gGame.markedCount--
    } else {
        if (marksLeft === 0) return
        gGame.markedCount++
        currCell.isMarked = true;
        document.querySelector('.marks-counter').innerText--
        marksLeft--
    }
    renderBoard(gBoard);
    checkGameOver(i, j)
}


function checkGameOver(i, j) {
    if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
        //check lives
        if (livesLeft > 1) {
            livesLeft--
            document.querySelector('.lives').innerText = livesLeft;
            gGame.shownCount++
            marksLeft--
            document.querySelector('.marks-counter').innerText--
        } else {
            //game lost
            livesLeft--
            document.querySelector('.lives').innerText = livesLeft;
            gGame.isOn = false
            clearInterval(gGameInterval)
            document.querySelector('.smiley').innerText = SMILEY_DEAD;
        }
    }
    if ((gGame.shownCount + gGame.markedCount) === gLevel.size ** 2) {
        //game won
        gGame.isOn = false
        clearInterval(gGameInterval)
        document.querySelector('.smiley').innerText = SMILEY_WIN;
        saveBestTime(gLevel.size);

    }
}

function expandShown(board, i, j) {
    var kStartIdx = (i - 1 > 0) ? i - 1 : 0;
    var kEndIdx = (i + 1 < board.length) ? i + 1 : board.length - 1;
    var lStartIdx = (j - 1 > 0) ? j - 1 : 0;
    var lEndIdx = (j + 1 < board[0].length) ? j + 1 : board[0].length - 1;
    for (var k = kStartIdx; k <= kEndIdx; k++) {
        for (var l = lStartIdx; l <= lEndIdx; l++) {
            var currCell = board[k][l];
            if (!currCell.isShown) {
                currCell.isShown = true;
                gGame.shownCount++;
                if (currCell.minesAroundCount === 0 && currCell.isMine === false) {
                    expandShown(board, k, l);
                }
            }
        }
    }
    renderBoard(board)
}



function placeMines(board, i, j) {
    var minesPlacedCount = 0
    while (minesPlacedCount < gLevel.mines) {
        var randI = getRandomInt(0, gLevel.size);
        var randJ = getRandomInt(0, gLevel.size);
        if (i === randI && j === randJ) continue;
        if (!board[randI][randJ].isMine) {
            board[randI][randJ].isMine = true;
            minesPlacedCount++;
        }
    }
}

function resetGame() {
    clearInterval(gGameInterval)
    document.querySelector('.timer').innerText = 0;
    document.querySelector('.smiley').innerText = SMILEY;
    marksLeft = gLevel.mines;
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    initGame();
}

function displayTime() {
    gGameInterval = setInterval(function () {
        gGame.secsPassed++;
        document.querySelector('.timer').innerText = gGame.secsPassed;
    }, 1000)
}

function setDifficulty(size) {
    gLevel.size = size;
    gLevel.mines = (size === 4) ? 2 : (size === 8) ? 12 : 30
    resetGame()
}

function hintCell() {
    if (isFirstClick || !gGame.isOn || hintsLeft === 0) return
    if (isHintClicked) {
        isHintClicked = false
        hintsLeft++
        document.querySelector('.hint-btn').style.backgroundColor = '';
    } else {
        isHintClicked = true
        hintsLeft--

        document.querySelector('.hint-btn').style.backgroundColor = 'green';
    }
    document.querySelector('.hint-btn span').innerText = hintsLeft;
}

function safeClick() {
    if (isFirstClick || !gGame.isOn || safeClicksLeft === 0) return
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine || (currCell.isShown && !currCell.isHinted)) continue
            var safePos = { i: i, j: j }
            safeCells.push(safePos);
        }
    }
    if (safeCells.length === 0) {
        alert('There are no more safe places to click!')
        return
    }
    var safeSpot = safeCells[getRandomInt(0, safeCells.length - 1)]
    safeClicksLeft--
    document.querySelector(`#cell-${safeSpot.i}-${safeSpot.j}`).style.backgroundColor = 'red'
    document.querySelector('.safe-click').style.backgroundColor = 'green';
    setTimeout(function () {
        document.querySelector('.safe-click').style.backgroundColor = '';
        document.querySelector(`#cell-${safeSpot.i}-${safeSpot.j}`).style.backgroundColor = ''
    }, 1500);
    document.querySelector('.safe-click span').innerText = safeClicksLeft;
}

function saveBestTime(size) {
    var difficulty = (size === 4) ? 'easy' : (size === 8) ? 'medium' : 'hard';
    var bestTime = 0
    bestTime += +localStorage.getItem(difficulty)
    if (bestTime < gGame.secsPassed && bestTime > 0) return
    localStorage.setItem(difficulty, gGame.secsPassed)
}