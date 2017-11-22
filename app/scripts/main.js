
var contract_abidefinition = '[{"constant":false,"inputs":[],"name":"getNum","outputs":[{"name":"n","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"n","type":"uint256"}],"name":"setNum","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"x","type":"uint256"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"caller","type":"address"},{"indexed":true,"name":"oldNum","type":"bytes32"},{"indexed":true,"name":"newNum","type":"bytes32"}],"name":"NumberSetEvent","type":"event"}]';
var contract_bytecode = '0x6060604052341561000c57fe5b604051602080610168833981016040528080519060200190919050505b806000819055505b505b610126806100426000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806367e0badb146044578063cd16ecbf146067575bfe5b3415604b57fe5b60516084565b6040518082815260200191505060405180910390f35b3415606e57fe5b60826004808035906020019091905050608f565b005b600060005490505b90565b60006000549050816000819055506000546001026000191681600102600019163373ffffffffffffffffffffffffffffffffffffffff167f108fd0bf2253f6baf35f111ba80fb5369c2e004b88e36ac8486fcee0c87e61ce60405180905060405180910390a45b50505600a165627a7a72305820b86215323334042910c2707668d7cc3c3ec760d2f5962724042482293eba5f6b0029';

var accounts;

function run(){
    accounts = web3.personal.listAccounts;
    getDefaultAccountInfo();

}
function loadAppData() {
    try {
        window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        setMessage('connection_status', ": Connected");
        run();
    } catch (e) {
        console.log(e)
        setError('connection_status', ": Disconnected");
        setError('errors', "Web3 failed to initialize");
    }
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
    setMessage('other_accounts', accounts.split(',').join(', '));
}
$(document).ready(function(){
    loadAppData();
});