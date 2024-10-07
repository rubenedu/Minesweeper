import React, { useState, useEffect } from 'react';

interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighboringMines: number;
}

const App: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const rows = 9;
  const cols = 9;
  const mines = 10;

  const initBoard = (): Cell[][] => {
    let newBoard: Cell[][] = [];

    // Crear celdas
    for (let x = 0; x < rows; x++) {
      newBoard[x] = [];
      for (let y = 0; y < cols; y++) {
        newBoard[x][y] = {
          x: x,
          y: y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighboringMines: 0,
        };
      }
    }

    // Colocar minas
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * rows);
      const y = Math.floor(Math.random() * cols);

      if (!newBoard[x][y].isMine) {
        newBoard[x][y].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular minas vecinas
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        if (!newBoard[x][y].isMine) {
          let mineCount = 0;
          const neighbors = getNeighbors(x, y, newBoard);
          neighbors.forEach(neighbor => {
            if (neighbor.isMine) {
              mineCount++;
            }
          });
          newBoard[x][y].neighboringMines = mineCount;
        }
      }
    }

    return newBoard;
  };

  const getNeighbors = (x: number, y: number, board: Cell[][]): Cell[] => {
    const neighbors: Cell[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
          neighbors.push(board[nx][ny]);
        }
      }
    }

    return neighbors;
  };

  const revealCell = (x: number, y: number) => {
    if (gameOver || gameWon) return;

    let updatedBoard = [...board];
    let cell = updatedBoard[x][y];

    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.isMine) {
      setGameOver(true);
      alert('¡Has perdido!');
      // Revelar todas las minas
      updatedBoard.forEach(row =>
        row.forEach(c => {
          if (c.isMine) c.isRevealed = true;
        })
      );
      setBoard(updatedBoard);
      return;
    }

    if (cell.neighboringMines === 0) {
      const neighbors = getNeighbors(x, y, updatedBoard);
      neighbors.forEach(n => {
        if (!n.isRevealed && !n.isFlagged) {
          revealCell(n.x, n.y);
        }
      });
    }

    // Comprobar si se ha ganado
    let hiddenCells = 0;
    updatedBoard.forEach(row =>
      row.forEach(c => {
        if (!c.isRevealed) hiddenCells++;
      })
    );

    if (hiddenCells === mines) {
      setGameWon(true);
      alert('¡Has ganado!');
      // Marcar todas las minas
      updatedBoard.forEach(row =>
        row.forEach(c => {
          if (c.isMine) c.isFlagged = true;
        })
      );
    }

    setBoard(updatedBoard);
  };

  const flagCell = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();

    if (gameOver || gameWon) return;

    let updatedBoard = [...board];
    let cell = updatedBoard[x][y];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    setBoard(updatedBoard);
  };

  const resetGame = () => {
    setBoard(initBoard());
    setGameOver(false);
    setGameWon(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <div>
      <h1>Buscaminas</h1>
      <button onClick={resetGame}>Reiniciar</button>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 30px)` }}>
        {board.map((row, x) =>
          row.map((cell, y) => (
            <div
              key={`${x}-${y}`}
              onClick={() => revealCell(x, y)}
              onContextMenu={(e) => flagCell(e, x, y)}
              style={{
                width: 30,
                height: 30,
                border: '1px solid black',
                textAlign: 'center',
                lineHeight: '30px',
                backgroundColor: cell.isRevealed ? '#ddd' : '#999',
                color: cell.isMine ? 'red' : 'black',
              }}
            >
              {cell.isRevealed
                ? cell.isMine
                  ? '💣'
                  : cell.neighboringMines > 0
                  ? cell.neighboringMines
                  : ''
                : cell.isFlagged
                ? '🚩'
                : ''}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
