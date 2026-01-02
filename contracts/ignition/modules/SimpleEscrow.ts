import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleEscrowModule", (m) => {
  // Deploy the SimpleEscrow contract
  const simpleEscrow = m.contract("SimpleEscrow");

  return { simpleEscrow };
});
