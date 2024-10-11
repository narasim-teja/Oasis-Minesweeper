import React from "react";
import Cell from "./Cell";

function GameBoard({ onCellClick, selectedCells }) {
  const gridSize = 5; // 5x5 grid

  const rows = [];
  for (let row = 0; row < gridSize; row++) {
    const cells = [];
    for (let col = 0; col < gridSize; col++) {
      const cellNumber = row * gridSize + col;
      cells.push(
        <Cell
          key={cellNumber}
          cellNumber={cellNumber}
          isSelected={selectedCells.includes(cellNumber)}
          onClick={onCellClick}
        />
      );
    }
    rows.push(
      <tr key={row}>
        {cells}
      </tr>
    );
  }

  return (
    <div className="border border-gray-500 p-4 rounded-lg bg-white shadow-lg">
      <table className="table-fixed border-collapse mx-auto">
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default GameBoard;
