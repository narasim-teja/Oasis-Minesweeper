/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

function StartGame({ onStart }) {
  return (
    <button
      onClick={onStart}
      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Start Game
    </button>
  );
}

export default StartGame;
