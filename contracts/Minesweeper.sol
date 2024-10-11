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
    }

    mapping(address => Game) private games;
    mapping(address => uint256) public balances;
    address[] public players;

    uint256 public constant ENTRY_FEE_MIN = 0.1 ether;
    uint256 public constant ENTRY_FEE_MAX = 0.5 ether;
    uint256 public constant TIME_LIMIT = 10 minutes;
    uint8 public constant GRID_SIZE = 25;
    uint8 public constant NUM_MINES = 3;

    event GameCashOut(address indexed player, uint256 winnings);

    // Start a new game
    function startGame() external payable {
        require(msg.value >= ENTRY_FEE_MIN && msg.value <= ENTRY_FEE_MAX, "Invalid entry fee");
        require(!games[msg.sender].isActive, "Game already in progress");

        Game storage game = games[msg.sender];
        game.betAmount = msg.value;
        game.startTime = block.timestamp;
        game.safeMoves = 0;
        game.isActive = true;

        initializeGame(msg.sender);

        players.push(msg.sender);

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

        for (uint256 i = 0; i < positions.length; i++) {
            uint8 pos = positions[i];
            require(pos < GRID_SIZE, "Invalid position");

            if (game.bombPositions[pos] == 1) {
                // Player hit a mine
                game.isActive = false;
                return;
            } else {
                game.safeMoves++;
            }
        }

        // Update winnings
        uint256 multiplier = 100 + (game.safeMoves * 4);
        game.winnings = (game.betAmount * multiplier) / 100;

    }

    // Cash out winnings
    function cashOut() external {
        Game storage game = games[msg.sender];
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
    }

    // View current possession of amount
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    // View function to get the player's game state
    function getGameState() external view returns (bool isActive, uint256 winnings, uint8 safeMoves) {
        Game storage game = games[msg.sender];
        uint8 currentSafeMoves = game.isActive ? game.safeMoves : 0;
        uint256 sessionWinnings = game.isActive ? game.winnings : 0;
        return (game.isActive, sessionWinnings, currentSafeMoves);
    }

     // Fallback function
    receive() external payable {}
}
