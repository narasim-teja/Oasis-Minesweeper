/* eslint-disable react/prop-types */

function GameBoard({ onCellClick, selectedCells, sessionSelectedMoves }) {
  const renderCell = (cellNumber) => {
    // Adjust for 0-based indexing from the smart contract
    const adjustedCellNumber = cellNumber - 1;
    
    const isSelected = selectedCells.includes(adjustedCellNumber);
    const isPreviouslySelected = sessionSelectedMoves.flat().includes(adjustedCellNumber);
    
    let cellClass = "w-12 h-12 border border-gray-600 flex items-center justify-center text-lg font-bold rounded-md transition-colors duration-200";
    
    if (isSelected || isPreviouslySelected) {
      cellClass += " bg-blue-500 text-white";
    } else {
      cellClass += " bg-gray-700 hover:bg-gray-600";
    }

    return (
      <button
        key={cellNumber}
        className={cellClass}
        onClick={() => onCellClick(adjustedCellNumber)}
        disabled={isPreviouslySelected}
      >
        {cellNumber}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
      {[...Array(25)].map((_, index) => renderCell(index + 1))}
    </div>
  );
}

export default GameBoard;
