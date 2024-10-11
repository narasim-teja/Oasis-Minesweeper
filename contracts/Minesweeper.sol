// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

contract Minesweeper {
    struct Game {
        uint256 betAmount;
        uint256 winnings;
        uint256 startTime;
        uint8 safeMoves;
        mapping(uint8 => uint8) bombPositions; // 0: safe, 1: bomb
        bool isActive;
        uint8[] movesMade; // Array to store moves made by the player
    }

    mapping(address => Game) private games;
    mapping(address => uint256) public balances;
    address[] public players;

    uint256 public constant ENTRY_FEE_MIN = 0.1 ether;
    uint256 public constant ENTRY_FEE_MAX = 0.5 ether;
    uint256 public constant TIME_LIMIT = 3 minutes;
    uint8 public constant GRID_SIZE = 25;
    uint8 public constant NUM_MINES = 3;

    event GameStarted(address indexed player, uint256 betAmount);
    event PlayerHitMine(address indexed player, uint256 lostAmount);
    event GameCashOut(address indexed player, uint256 winnings);
    event WinningsWithdrawn(address indexed player, uint256 amount);

    // Start a new game
    function startGame() external payable {
        require(msg.value >= ENTRY_FEE_MIN && msg.value <= ENTRY_FEE_MAX, "Invalid entry fee");
        if (games[msg.sender].isActive && block.timestamp > games[msg.sender].startTime + TIME_LIMIT) {
            games[msg.sender].isActive = false; // Automatically end the game
            games[msg.sender].winnings = 0;
            games[msg.sender].movesMade = new uint8[](0);
        }
        require(!games[msg.sender].isActive, "Game already in progress");

        Game storage game = games[msg.sender];
        game.betAmount = msg.value;
        game.startTime = block.timestamp;
        game.safeMoves = 0;
        game.winnings = game.betAmount; // should initialize to their bet.amount actually
        game.movesMade = new uint8[](0);
        game.isActive = true;

        initializeGame(msg.sender);
        players.push(msg.sender);

        emit GameStarted(msg.sender, msg.value);
    }

    // Internal function to initialize game
    function initializeGame(address player) internal {
        bytes memory randomBytes = Sapphire.randomBytes(32, "");
        uint256 randomSeed = uint256(keccak256(randomBytes));
        Game storage game = games[player];

        // Initialize bombPositions mapping to zero
        for (uint8 i = 0; i < GRID_SIZE; i++) {
            game.bombPositions[i] = 0;
        }

        // Place NUM_MINES bombs randomly
        uint8 bombsPlaced = 0;
        while (bombsPlaced < NUM_MINES) {
            uint8 index = uint8(uint256(keccak256(abi.encode(randomSeed, bombsPlaced))) % GRID_SIZE);

            if (game.bombPositions[index] == 0) {
                game.bombPositions[index] = 1;
                bombsPlaced++;
            }
            randomSeed++; // Change seed to get different values
        }
    }

    // Make moves
    function makeMoves(uint8[] calldata positions) external {
        Game storage game = games[msg.sender];
        require(game.isActive, "No active game");
        require(block.timestamp <= game.startTime + TIME_LIMIT, "Game time expired");
        require(positions.length > 0, "No positions selected");

        // Check if the moves have already been made
        for (uint256 i = 0; i < positions.length; i++) {
            uint8 pos = positions[i];
            require(pos < GRID_SIZE, "Invalid position");

            // Ensure the position has not been played yet
            require(!isPositionPlayed(game, pos), "The selected move has already been played");
        }

        bool hitMine = false;
        for (uint256 i = 0; i < positions.length; i++) {
            uint8 pos = positions[i];

            if (game.bombPositions[pos] == 1) {
                // Player hit a mine
                hitMine = true;
                game.isActive = false;
                game.winnings = 0;
                game.movesMade = new uint8[](0);
                break;
            } else {
                // Increment safe moves and record the position
                game.safeMoves++;
                game.movesMade.push(pos);
            }
        }

        if (!hitMine) {
            // Update winnings
            uint256 multiplier = 100 + (game.safeMoves * 4);
            game.winnings = (game.betAmount * multiplier) / 100;
        }

        if (hitMine) {
            emit PlayerHitMine(msg.sender, game.betAmount);
        }
    }

    // Helper function to check if a position has been played
    function isPositionPlayed(Game storage game, uint8 pos) internal view returns (bool) {
        for (uint256 i = 0; i < game.movesMade.length; i++) {
            if (game.movesMade[i] == pos) {
                return true; // Position has already been played
            }
        }
        return false; // Position has not been played
    }

    // Cash out winnings
    function cashOut() external {
        Game storage game = games[msg.sender];
        require(block.timestamp <= game.startTime + TIME_LIMIT, "Game time expired");
        require(game.isActive, "No active game");

        balances[msg.sender] += game.winnings;

        game.isActive = false;

        emit GameCashOut(msg.sender, game.winnings);
    }

    // Withdraw winnings
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit WinningsWithdrawn(msg.sender, amount);
    }

    // View current possession of amount
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    // View function to get the player's game state
    function getGameState() external view returns (bool isActive, uint256 winnings, uint8 safeMoves, uint256 timeRemaining, uint8[] memory movesMade) {
        Game storage game = games[msg.sender];

        uint8 currentSafeMoves = game.isActive ? game.safeMoves : 0;
        uint256 sessionWinnings = game.isActive ? game.winnings : 0;

        // Calculate the remaining time (if the game is still active)
        if (game.isActive) {
            timeRemaining = (game.startTime + TIME_LIMIT > block.timestamp) 
                ? (game.startTime + TIME_LIMIT - block.timestamp) 
                : 0;
        } else {
            timeRemaining = 0;
        }

        // Return the moves made
        return (game.isActive, sessionWinnings, currentSafeMoves, timeRemaining, game.movesMade);
    }

    // Fallback function
    receive() external payable {}
}
