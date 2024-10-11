import React from "react";

function Cell({ cellNumber, isSelected, onClick }) {
  const handleClick = () => {
    onClick(cellNumber);
  };

  return (
    <td
      onClick={handleClick}
      className={`w-16 h-16 border border-gray-300 cursor-pointer text-center align-middle ${
        isSelected ? "bg-blue-500 text-white" : "bg-white text-gray-800"
      } hover:bg-gray-200`}
    >
      {cellNumber}
    </td>
  );
}

export default Cell;
