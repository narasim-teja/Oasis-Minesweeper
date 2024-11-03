import { ExternalLinkIcon } from "@heroicons/react/outline";

const TestFaucet = () => {
  return (
    <div className="text-center border rounded-lg p-8 hover:underline underline-offset-8s transition-transform">
      <a
        href="https://faucet.testnet.oasis.dev/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-2xl font-semibold flex items-center justify-center"
      >
        Get Oasis Testnet Tokens Here ( Choose Sapphire )
        <ExternalLinkIcon className="h-4 w-4 ml-1" />
      </a>
    </div>
  );
};

export default TestFaucet;
