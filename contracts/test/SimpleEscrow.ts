import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther, formatEther, getAddress } from "viem";

import { network } from "hardhat";

describe("SimpleEscrow", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("should have initial escrow count of 0", async function () {
    const [deployer] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    const escrowCount = await publicClient.readContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "escrowCount",
    });
    
    assert.equal(escrowCount, 0n, "Initial escrow count should be 0");
  });

  it("should create an escrow successfully", async function () {
    const [buyer, seller] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    const amount = parseEther("1");
    
    const hash = await buyer.writeContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "createEscrow",
      args: [seller.account.address],
      value: amount,
    });
    
    await publicClient.waitForTransactionReceipt({ hash });
    
    const escrowCount = await publicClient.readContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "escrowCount",
    });
    
    assert.equal(escrowCount, 1n, "Escrow count should be 1 after creation");
    
    const escrowDetails = await publicClient.readContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "getEscrow",
      args: [0n],
    });
    
    assert.equal(getAddress(escrowDetails[0]), getAddress(buyer.account.address), "Buyer should match");
    assert.equal(getAddress(escrowDetails[1]), getAddress(seller.account.address), "Seller should match");
    assert.equal(escrowDetails[2], amount, "Amount should match");
    assert.equal(escrowDetails[3], 0, "State should be AWAITING_DELIVERY (0)");
  });

  it("should revert when creating escrow with zero amount", async function () {
    const [buyer, seller] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    await assert.rejects(
      async () => {
        await buyer.writeContract({
          address: simpleEscrow.address,
          abi: simpleEscrow.abi,
          functionName: "createEscrow",
          args: [seller.account.address],
          value: 0n,
        });
      },
      (error: Error) => {
        return error.message.includes("InvalidAmount");
      },
      "Should revert when amount is 0"
    );
  });

  it("should revert when creating escrow with zero address seller", async function () {
    const [buyer] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    await assert.rejects(
      async () => {
        await buyer.writeContract({
          address: simpleEscrow.address,
          abi: simpleEscrow.abi,
          functionName: "createEscrow",
          args: ["0x0000000000000000000000000000000000000000"],
          value: parseEther("1"),
        });
      },
      (error: Error) => {
        return error.message.includes("Unauthorized");
      },
      "Should revert when seller is zero address"
    );
  });

  it("should release funds to seller", async function () {
    const [buyer, seller] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    const amount = parseEther("1");
    
    // Create escrow
    const createHash = await buyer.writeContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "createEscrow",
      args: [seller.account.address],
      value: amount,
    });
    
    await publicClient.waitForTransactionReceipt({ hash: createHash });
    
    const sellerBalanceBefore = await publicClient.getBalance({
      address: seller.account.address,
    });
    
    // Release funds
    const releaseHash = await buyer.writeContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "releaseFunds",
      args: [0n],
    });
    
    await publicClient.waitForTransactionReceipt({ hash: releaseHash });
    
    const sellerBalanceAfter = await publicClient.getBalance({
      address: seller.account.address,
    });
    
    assert.equal(
      sellerBalanceAfter - sellerBalanceBefore,
      amount,
      "Seller should receive the escrowed amount"
    );
    
    // Check state is COMPLETE (1)
    const escrowDetails = await publicClient.readContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "getEscrow",
      args: [0n],
    });
    
    assert.equal(escrowDetails[3], 1, "State should be COMPLETE (1)");
  });

  it("should refund funds to buyer", async function () {
    const [buyer, seller] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    const amount = parseEther("1");
    
    // Create escrow
    const createHash = await buyer.writeContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "createEscrow",
      args: [seller.account.address],
      value: amount,
    });
    
    await publicClient.waitForTransactionReceipt({ hash: createHash });
    
    const buyerBalanceBefore = await publicClient.getBalance({
      address: buyer.account.address,
    });
    
    // Refund
    const refundHash = await buyer.writeContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "refund",
      args: [0n],
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: refundHash });
    
    const buyerBalanceAfter = await publicClient.getBalance({
      address: buyer.account.address,
    });
    
    const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
    
    // Buyer should receive refund minus gas costs
    assert.equal(
      buyerBalanceAfter - buyerBalanceBefore + gasUsed,
      amount,
      "Buyer should receive the refunded amount (accounting for gas)"
    );
    
    // Check state is REFUNDED (2)
    const escrowDetails = await publicClient.readContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "getEscrow",
      args: [0n],
    });
    
    assert.equal(escrowDetails[3], 2, "State should be REFUNDED (2)");
  });

  it("should revert if non-buyer tries to release funds", async function () {
    const [buyer, seller, attacker] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    const amount = parseEther("1");
    
    // Create escrow
    const createHash = await buyer.writeContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "createEscrow",
      args: [seller.account.address],
      value: amount,
    });
    
    await publicClient.waitForTransactionReceipt({ hash: createHash });
    
    // Try to release as attacker
    await assert.rejects(
      async () => {
        await attacker.writeContract({
          address: simpleEscrow.address,
          abi: simpleEscrow.abi,
          functionName: "releaseFunds",
          args: [0n],
        });
      },
      (error: Error) => {
        return error.message.includes("Unauthorized");
      },
      "Should revert when non-buyer tries to release funds"
    );
  });

  it("should create multiple escrows", async function () {
    const [buyer, seller] = await viem.getWalletClients();
    
    const simpleEscrow = await viem.deployContract("SimpleEscrow", []);
    
    const numEscrows = 5;
    
    for (let i = 0; i < numEscrows; i++) {
      const hash = await buyer.writeContract({
        address: simpleEscrow.address,
        abi: simpleEscrow.abi,
        functionName: "createEscrow",
        args: [seller.account.address],
        value: parseEther("0.1"),
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
    }
    
    const escrowCount = await publicClient.readContract({
      address: simpleEscrow.address,
      abi: simpleEscrow.abi,
      functionName: "escrowCount",
    });
    
    assert.equal(escrowCount, BigInt(numEscrows), `Should have ${numEscrows} escrows`);
  });
});