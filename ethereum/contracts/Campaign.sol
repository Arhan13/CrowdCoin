pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint256 minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests; //Now we can make instances
    address public manager;
    uint256 public minimumContribution;
    mapping(address => bool) public approvers; //Those who have contributed
    uint256 public approversCount;

    //To tell if the individual is the manager
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    //Constructor
    function Campaign(uint256 minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    // Contribute Function
    function contribute() public payable {
        //Check if the amount is greater than minimum
        require(msg.value > minimumContribution);

        //Makes sender true, as a contributer
        approvers[msg.sender] = true;

        approversCount++;
    }

    //Create Request Function
    function createRequest(
        string description,
        uint256 value,
        address recipient
    ) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    //Approve Request
    function approveRequest(uint256 index) public {
        //This is the required request
        Request storage request = requests[index];

        //Contributer or not
        require(approvers[msg.sender]);
        //To make sure person has not voted
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    //Finalize Request
    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }
}





