// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title SimpleEscrow
 * @notice A simple escrow contract where buyer deposits ETH and can later release to seller or refund
 * @dev Uses ReentrancyGuard pattern and state management for security
 */
contract SimpleEscrow {
    // Escrow states
    enum State {
        AWAITING_DELIVERY,  // Funds deposited, waiting for work completion
        COMPLETE,           // Funds released to seller
        REFUNDED            // Funds returned to buyer
    }

    // Escrow details
    struct Escrow {
        address payable buyer;
        address payable seller;
        uint256 amount;
        State state;
    }

    // Storage
    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;
    
    // Reentrancy guard
    uint256 private locked = 1;

    // Events
    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event FundsReleased(uint256 indexed escrowId, address indexed seller, uint256 amount);
    event FundsRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);

    // Errors
    error Unauthorized();
    error InvalidState();
    error InvalidAmount();
    error TransferFailed();
    error ReentrancyDetected();

    // Modifiers
    modifier nonReentrant() {
        if (locked != 1) revert ReentrancyDetected();
        locked = 2;
        _;
        locked = 1;
    }

    modifier onlyBuyer(uint256 _escrowId) {
        if (msg.sender != escrows[_escrowId].buyer) revert Unauthorized();
        _;
    }

    modifier inState(uint256 _escrowId, State _state) {
        if (escrows[_escrowId].state != _state) revert InvalidState();
        _;
    }

    /**
     * @notice Creates a new escrow with deposited ETH
     * @param _seller Address of the seller who will receive funds
     * @return escrowId The ID of the newly created escrow
     */
    function createEscrow(address payable _seller) external payable returns (uint256) {
        if (msg.value == 0) revert InvalidAmount();
        if (_seller == address(0)) revert Unauthorized();

        uint256 escrowId = escrowCount++;
        
        escrows[escrowId] = Escrow({
            buyer: payable(msg.sender),
            seller: _seller,
            amount: msg.value,
            state: State.AWAITING_DELIVERY
        });

        emit EscrowCreated(escrowId, msg.sender, _seller, msg.value);
        
        return escrowId;
    }

    /**
     * @notice Releases funds to the seller (only buyer can call)
     * @param _escrowId The ID of the escrow to release
     */
    function releaseFunds(uint256 _escrowId) 
        external 
        onlyBuyer(_escrowId) 
        inState(_escrowId, State.AWAITING_DELIVERY)
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        
        // Update state before transfer (CEI pattern)
        escrow.state = State.COMPLETE;
        
        uint256 amount = escrow.amount;
        address payable seller = escrow.seller;

        // Transfer funds
        (bool success, ) = seller.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit FundsReleased(_escrowId, seller, amount);
    }

    /**
     * @notice Refunds deposited funds to the buyer (only buyer can call)
     * @param _escrowId The ID of the escrow to refund
     */
    function refund(uint256 _escrowId) 
        external 
        onlyBuyer(_escrowId) 
        inState(_escrowId, State.AWAITING_DELIVERY)
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        
        // Update state before transfer (CEI pattern)
        escrow.state = State.REFUNDED;
        
        uint256 amount = escrow.amount;
        address payable buyer = escrow.buyer;

        // Transfer funds
        (bool success, ) = buyer.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit FundsRefunded(_escrowId, buyer, amount);
    }

    /**
     * @notice Gets full escrow details
     * @param _escrowId The ID of the escrow
     * @return buyer, seller, amount, state
     */
    function getEscrow(uint256 _escrowId) 
        external 
        view 
        returns (address, address, uint256, State) 
    {
        Escrow memory escrow = escrows[_escrowId];
        return (escrow.buyer, escrow.seller, escrow.amount, escrow.state);
    }
}