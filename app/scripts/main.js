
var contract_abidefinition = [{"constant":false,"inputs":[{"name":"yourName","type":"bytes32"}],"name":"interact","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"currentName","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fromAddres","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastUpdatedMinutes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"},{"indexed":true,"name":"addr","type":"address"},{"indexed":true,"name":"timeUpdated","type":"uint256"}],"name":"Interaction","type":"event"}];
var contract_bytecode = "0x6060604052341561000f57600080fd5b6102798061001e6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806312e92de314610067578063627776621461008e5780638c659ab7146100bf578063bd5b383714610114575b600080fd5b341561007257600080fd5b61008c60048080356000191690602001909190505061013d565b005b341561009957600080fd5b6100a1610202565b60405180826000191660001916815260200191505060405180910390f35b34156100ca57600080fd5b6100d261020b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561011f57600080fd5b610127610235565b6040518082815260200191505060405180910390f35b806000816000191690555033600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555042600181905550600154600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600054600019167f8c3f8124db3586b01b1a3687e65ac69ea4815aa8e9479454b8a8963bf1c6c2a860405160405180910390a450565b60008054905090565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000603c600154420381151561024757fe5b049050905600a165627a7a723058209d7f20d5c9ef2926604fe153126d40413ee08aad90effb48a47d8dfcbd195fc80029";
var contract_address = "0xb441a0bbf61f94f2d34d8cc6ba7e2fef0b81bc69";
var contract = null;
var web3;
var accounts;

function run(){
    accounts = web3.personal.listAccounts;
    getDefaultAccountInfo();
    getContractData(contract_address);

}
function loadAppData() {
    try {
        web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        setMessage('connection_status', ": Connected");
        setMessage('contract_address', contract_address);
        run();
    } catch (e) {
        console.log(e)
        setError('connection_status', ": Disconnected");
        setError('errors', "Web3 failed to initialize");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



async function getReceiptData(contract){
    var receiptData;
    while(true){
        receiptData = web3.eth.getTransactionReceipt(contract.transactionHash);
        if(receiptData && receiptData.contractAddress){
            setMessage('contract_address', receiptData.contractAddress);
            break;
        }    
        await sleep(1000);
    }
}

function deployContract() {
    var exampleContract = web3.eth.contract(contract_abidefinition);
    var password = "abcd1234";
    var coinbase = web3.eth.coinbase;
    web3.personal.unlockAccount(coinbase, password);

    var contract = exampleContract.new({from: coinbase, gas: 1000000, data: contract_bytecode});
    getReceiptData(contract);

}
function setError(idSelector, msg) {
    $("#"+idSelector).text(msg).addClass('error');
}

function setMessage(idSelector, msg) {
    $("#"+idSelector).text(msg).removeClass('error');
}

function getDefaultAccountInfo() {
    var coinbase = web3.eth.coinbase;
    setMessage('current_etherbase', coinbase);

    var balanceInWei = web3.eth.getBalance(coinbase);
    setMessage('current_bal', web3.fromWei(balanceInWei)+ " ether");
    setMessage('other_accounts', accounts.join(', '));
}
// var e = {
//     fromBlock: lastEventBlockProcessed,
//     toBlock: TO_BLOCK,
//     address: Interaction_Address,
//     topics: [null, null, null, null]
// };
// filterWatch && filterWatch.stopWatching(),
// filterWatch = web3.eth.filter(e)
function getContractData(address) {
    contract = web3.eth.contract(contract_abidefinition).at(address);
}

function getContractInstance() {
    let contract = web3.eth.contract(contract_abidefinition).at(contract_address);
    return contract;
}

var txrowTpl = "<h5 class=\"text-muted\">Transaction Status :: <span id=\"tx-status{0}\"></span></h5>";
var numTx = 0;
async function sendMessageWithContract(message) {
    
    let coinbase = web3.eth.coinbase;
    web3.personal.unlockAccount(coinbase, "abcd1234", 5000);
    let contract = getContractInstance(contract_address);
    let receipt = contract.interact.sendTransaction(message, {from: coinbase});
    console.log(receipt);
    let tpl = txrowTpl.substring(0).replace('{0}', numTx);
    let id = parseInt(numTx);
    numTx++;
    $('#transactions').append(tpl);
    setError('tx-status'+id, "INCOMPLETE");
    while(true){
        let receiptData = web3.eth.getTransactionReceipt(receipt);
        if(receiptData){
            setMessage('tx-status'+id, "COMPLETE");
            break;
        }    
        await sleep(1000);
    }
}

var eventRowTpl = "<div style='display:flex;' class=\"text-muted\"><div style='width:33%'>{0}</div> <div style='width:33%'>{1}</div> <div style='width:33%'>{2}</div></div>";
function watchMessages(){
    let contract = getContractInstance(contract_address);
    contract.Interaction((error, result) => {
        let tpl = eventRowTpl.replace('{0}', web3.toAscii(result.args.name)).replace('{1}', Date(result.args.timeUpdated).toLocaleLowerCase()).replace('{2}', result.address);
        $('#events').append(tpl);
        console.log(result);
    })
}
$(document).ready(function(){
    loadAppData();
    $('#deploy_contract').click(function(event){
        event.preventDefault();
        deployContract();
        return 0; // safari
    });

    $('#send_message').click(function(event){
        event.preventDefault();
        let message = $('#message_text').val();
        sendMessageWithContract(message);
        return 0;
    });

    watchMessages();
});