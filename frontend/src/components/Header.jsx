import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export function Header() {
  return (
    <header className="static top-0 flex items-center justify-between border-b p-4 bg-background/75 backdrop-blur-sm hover:shadow-sm transition-shadow">
      <p className="text-xl md:text-2xl lg:text-3xl font-semibold">
        Oasis Minesweeper
      </p>
      <DynamicWidget />
    </header>
  );
}
