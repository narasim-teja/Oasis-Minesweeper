/* eslint-disable react/prop-types */

import { Button } from "./ui/button";

function GameBoard({ onCellClick, selectedCells, sessionSelectedMoves }) {
  const renderCell = (cellNumber) => {
    // Adjust for 0-based indexing from the smart contract
    const adjustedCellNumber = cellNumber - 1;

    const isSelected = selectedCells.includes(adjustedCellNumber);
    const isPreviouslySelected = sessionSelectedMoves
      .flat()
      .includes(adjustedCellNumber);

    return (
      <Button
        key={cellNumber}
        size="icon"
        variant="secondary"
        disabled={isPreviouslySelected}
        onClick={() => onCellClick(adjustedCellNumber)}
        className="border"
      >
        {isSelected || isPreviouslySelected ?
          <img src="/rose.png" alt="rose" />
        : cellNumber}
      </Button>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
      {[...Array(25)].map((_, index) => renderCell(index + 1))}
    </div>
  );
}

export default GameBoard;
