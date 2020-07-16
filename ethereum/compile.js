const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

//Delete the build folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);
//Read 'Campaign.sol' from contracts folder.
//Compile both the contracts
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf-8');
const output = solc.compile(source, 1).contracts;
//Check if the directory exists and if dosent it creates one
fs.ensureDirSync(buildPath);

for (let contract in output) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract] //What we need to put in the json file
    );
}

