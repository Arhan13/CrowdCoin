const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');//ABI
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;//Ganache accounts
let factory;//refrence to the deployed instance of the factory
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    // 3 steps basically
    // Extraction //Deployment //Send
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))//JSON => JavaScriptObj
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000'});

    //We will make campaign instance from factory
    await factory.methods.createCampaign('100').send({ 
        from: accounts[0],
        gas: '1000000'
    });
    // const addresses = await factory.methods.getDeployedCampaigns().call();
    // campaignAddress = addresses[0];//OR
    [campaignAddress]= await factory.methods.getDeployedCampaigns().call();
    //We need to get the contract from this address
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async() => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows people to contribute money and marks them as approvers', async() => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });
        const isContributer = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributer);
    });

    it('requires a minimum contribution', async() => {
        try{
            await campaign.methods.contribute().send({
                value:'5',
                from: accounts[0]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows allows a manager to make a payment request', async() => {
        await campaign.methods
            .createRequest('Buy batteries', '100', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });
        const request = await campaign.methods.requests(0).call();

        assert.equal('Buy batteries', request.description);
    });

    it('processes requests', async () => {
        await campaign.methods.contribute().send({
            from : accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods
            .createRequest('ABC', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({ from: accounts[0], gas:'1000000' });
        
        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);//Balance is a string
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);//String to decimal number
        
        assert(balance > 104);
    });
});
