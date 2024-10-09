import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
      <h1 className="text-2xl font-bold text-white">Oasis Minesweeper</h1>
      <DynamicWidget />
    </header>
  );
}

export default Header;
