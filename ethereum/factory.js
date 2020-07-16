import web3 from './web3';
//We need to provide the contract abi and interface
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    //1st Argument is the abi
    JSON.parse(CampaignFactory.interface),
    '0xd16792c31307238C5c729F8Ba60b73eBCF38A570'
);

export default instance;
