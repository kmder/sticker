var stellarNetUrl = "https://horizon.stellar.org/";
var stellarServer = new StellarSdk.Server(stellarNetUrl);

var defaultSettings = {
        baseCurrency: "USD",
        refreshRateInMinutes: "5",
        account: ""
    };

var settings = {};

var balance = 1;
var price = 0;

function formatBalance(num) {
    var format = "";

    if(num < 0.0001){
        format = "0.0e+0";
    }
    else if (num < 1000) {
        var r = num.toString().split(".")[0].length;
        format = r == 1 ? "0.0000" : r == 2 ? "0.000" : "0.00";
    }
    else {
        var r = (Math.floor(Math.log(num) / Math.LN10) + 1) % 3;
        format = r == 0 ? "0.0a" : r == 1 ? "0.000a" : "0.0a";
    }
  
    return numeral(num).format(format);
};

function updateBadgeText(value) {
    chrome.browserAction.setBadgeText({
            text: formatBalance(value)
        });
}

function updateBalance() {
    var publicKey = settings.account;

    if (publicKey) {
        stellarServer.accounts()
        .accountId(publicKey)
        .call()
        .then(function (accountResult) {
            balance = parseFloat(accountResult.balances[0].balance);
            updatePrice();
        })
        .catch(function (err) {
            balance = 1;
            updatePrice();
        })
    }
    else {
        balance = 1;
        updatePrice();
    }
}

function updatePrice() {
    var baseCurrency = settings.baseCurrency;
    var url = `https://api.coinmarketcap.com/v1/ticker/stellar/?convert=${baseCurrency}`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            var result = JSON.parse(xmlHttp.responseText);
            price = parseFloat(result[0][`price_${baseCurrency.toLowerCase()}`]);
            updateBadgeText(balance * price);
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

var settedTimeout;

function run() {
    chrome.storage.sync.get(defaultSettings, function (obj) {
        if (settedTimeout) clearTimeout(settedTimeout)
        settings = obj;
        updateBalance();
        settedTimeout = setTimeout(run, settings.refreshRateInMinutes * 1000 * 60);
    });
};

chrome.storage.onChanged.addListener(function(changes, namespace) {
    run();
});

run();