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

var marksLeft = gLevel.mines;
var gBoard;
var seconds = 0;
var gGameInterval;
var isFirstClick = false

function initGame() {
    gBoard = buildBoard();
    placeMines(gBoard);
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    gGame.isOn = true
    seconds = 0
    document.querySelector('.marks-counter').innerText = marksLeft
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
                isMarked: false
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
            var className = (board[i][j].isShown) ? 'clicked' : '';
            strHtml += `<td onclick="cellClicked(this, ${i}, ${j})" class="${className}" oncontextmenu="cellMarked(this, ${i}, ${j})">`
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
                // Try to shorten, maybe a double neighbour loop? getting undefined for non existing cells
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
    var currCell = gBoard[i][j];
    if (currCell.isShown || currCell.isMarked) return
    if (currCell.isMine) {
        currCell.isShown = true;
        checkGameOver(i, j)
        renderBoard()
        return
    }
    currCell.isShown = true;
    if (currCell.minesAroundCount === 0 && currCell.isMine === false) expandShown(gBoard, i, j)
    elCell.classList.add('clicked')
    gGame.shownCount++
    renderBoard(gBoard);
    checkGameOver(i, j)
}

function cellMarked(elCell, i, j) {
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
        //game lost
        gGame.isOn = false
        clearInterval(gGameInterval)
        document.querySelector('header button').innerText = SMILEY_DEAD;
    } else if ((gGame.shownCount + gGame.markedCount) === gLevel.size ** 2) {
        //game won
        gGame.isOn = false
        clearInterval(gGameInterval)
        document.querySelector('header button').innerText = SMILEY_WIN;

    }
}

function expandShown(board, i, j) {
    var kStartIdx = (i - 1 > 0) ? i - 1 : 0;
    var kEndIdx = (i + 1 < board.length) ? i + 1 : board.length - 1;
    var lStartIdx = (j - 1 > 0) ? j - 1 : 0;
    var lEndIdx = (j + 1 < board[0].length) ? j + 1 : board[0].length - 1;
    for (var k = kStartIdx; k <= kEndIdx; k++) {
        for (var l = lStartIdx; l <= lEndIdx; l++) {
            if (!board[k][l].isShown) {
                board[k][l].isShown = true
                gGame.shownCount++
            }
        }
    }
    renderBoard(board)
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function placeMines(board) {
    var minesPlacedCount = 0
    while (minesPlacedCount < gLevel.mines) {

        var randI = getRandomInt(0, gLevel.size)
        var randJ = getRandomInt(0, gLevel.size)
        if (!board[randI][randJ].isMine) {
            board[randI][randJ].isMine = true
            minesPlacedCount++
        }
    }
}

function resetGame() {
    clearInterval(gGameInterval)
    document.querySelector('.timer').innerText = 0;
    document.querySelector('header button').innerText = SMILEY;
    marksLeft = gLevel.mines;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    initGame()
}

