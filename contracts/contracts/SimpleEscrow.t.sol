// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {SimpleEscrow} from "./SimpleEscrow.sol";
import {Test} from "forge-std/Test.sol";

contract SimpleEscrowTest is Test {
    SimpleEscrow escrow;
    address payable buyer;
    address payable seller;

    function setUp() public {
        escrow = new SimpleEscrow();
        buyer = payable(address(0x1));
        seller = payable(address(0x2));
        
        // Fund the buyer account
        vm.deal(buyer, 100 ether);
    }

    function test_InitialValue() public view {
        assertEq(escrow.escrowCount(), 0, "Initial value should be 0");
    }

    function testFuzz_Inc(uint8 x) public {
        vm.assume(x > 0 && x <= 100); // Ensure we have at least 1 iteration
        
        for (uint8 i = 0; i < x; i++) {
            vm.prank(buyer);
            escrow.createEscrow{value: 1 ether}(seller);
        }
        assertEq(escrow.escrowCount(), x, "Value after calling createEscrow x times should be x");
    }

    function test_CreateEscrow() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: 1 ether}(seller);
        
        (address storedBuyer, address storedSeller, uint256 amount, SimpleEscrow.State state) = escrow.getEscrow(escrowId);
        
        assertEq(storedBuyer, buyer, "Buyer should match");
        assertEq(storedSeller, seller, "Seller should match");
        assertEq(amount, 1 ether, "Amount should match");
        assertEq(uint(state), uint(SimpleEscrow.State.AWAITING_DELIVERY), "State should be AWAITING_DELIVERY");
    }

    function test_CreateEscrowWithZeroAmount() public {
        vm.prank(buyer);
        vm.expectRevert(SimpleEscrow.InvalidAmount.selector);
        escrow.createEscrow{value: 0}(seller);
    }

    function test_CreateEscrowWithZeroAddress() public {
        vm.prank(buyer);
        vm.expectRevert(SimpleEscrow.Unauthorized.selector);
        escrow.createEscrow{value: 1 ether}(payable(address(0)));
    }
}