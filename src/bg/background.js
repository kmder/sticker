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
var settedTimeout;

async function getBalance(publicKey) {
    return new Promise(
        async (resolve, reject) => {
            var result = 1; // by default, return a balance of 1

            if (publicKey) {

                try {
                    var accountResult = await stellarServer.accounts().accountId(publicKey).call();
                    result = parseFloat(accountResult.balances[0].balance);
                } 
                catch (e) {
                    console.log(e);
                }
            }
            resolve(result);
        }
    );
}

async function getPrice(baseCurrency) {
    return new Promise(
        async (resolve, reject) => {
            let requestResult = await request({url: `https://api.coinmarketcap.com/v1/ticker/stellar/?convert=${baseCurrency}`})
            var result = JSON.parse(requestResult);
            var price = parseFloat(result[0][`price_${baseCurrency.toLowerCase()}`]);
            resolve(price);
        }
    )
}

function formatBalance(value) {
    var format = "";

    if(value < 0.0001){
        format = "0.0e+0";
    }
    else if (value < 1000) {
        var r = value.toString().split(".")[0].length;
        format = r == 1 ? "0.0000" : r == 2 ? "0.000" : "0.00";
    }
    else {
        var r = (Math.floor(Math.log(value) / Math.LN10) + 1) % 3;
        format = r == 0 ? "0.0a" : r == 1 ? "0.000a" : "0.0a";
    }
  
    return numeral(value).format(format);
};

function updateBadgeText(value) {
    chrome.browserAction.setBadgeText({
            text: formatBalance(value)
        });
}

function updateTooltip(value, currency) {
    var title = `1 XLM = ${value} ${currency}`
    chrome.browserAction.setTitle({title});
}

function run() {
    chrome.storage.sync.get(defaultSettings, async function (obj) {
        if (settedTimeout) clearTimeout(settedTimeout)
        settings = obj;

        let balance = await getBalance(settings.account);
        let price = await getPrice(settings.baseCurrency);
        var amount = balance * price;
        var formattedAmount = formatBalance(amount);

        updateBadgeText(formattedAmount);
        updateTooltip(price, settings.baseCurrency);

        settedTimeout = setTimeout(run, settings.refreshRateInMinutes * 1000 * 60);
    });
};

chrome.storage.onChanged.addListener(function(changes, namespace) {
    run();
});

chrome.browserAction.onClicked.addListener(function(tab) { 
    run(); 
});

run();