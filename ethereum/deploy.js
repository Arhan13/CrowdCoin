const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const compileFactory = require("./build/CampaignFactory.json");

const provider = new HDWalletProvider(
  'involve boost area ethics soon shy mix deposit push flush riot fetch',
  'https://rinkeby.infura.io/v3/90a0be42f7634d90a6b0318e23e1cb07'
);

const web3 = new Web3(provider);

//Two pieces of async function

const deploy = async () => {
  //Two steps
  //get list of accounts

  //Here we are saying accounts because memonic is not restricted to only one account but to a lot of accounts
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  //Actual contract deployment statement
  const result = await new web3.eth.Contract(
    JSON.parse(compileFactory.interface)
  ) 
    //new contract we will provide ABI it comes in as json
    //here the interface is basically the ABI
    .deploy({ data: compileFactory.bytecode }) //Will contain the byte code and any initial statements
    .send({ gas: "1000000", from: accounts[0] }); //Now to send we need to give some gas and then tell where
  //Record the adress where it got deployed
  console.log("Contract deployed to", result.options.address);
};
deploy();
