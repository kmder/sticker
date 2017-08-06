// Saves options to chrome.storage.sync.
function save_options() {
    var baseCurrency = document.getElementById('baseCurrency').value;
    var refreshRateInMinutes = document.getElementById('refreshRate').value;
    var account = document.getElementById('account').value;
    chrome.storage.sync.set({
        baseCurrency: baseCurrency,
        refreshRateInMinutes: refreshRateInMinutes,
        account : account
    }, function () {
    });
}

// Restores state using the preferences stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        baseCurrency: "USD",
        refreshRateInMinutes: "5",
        account: ""
    }, function (items) {
        document.getElementById('baseCurrency').value = items.baseCurrency;
        document.getElementById('refreshRate').value = items.refreshRateInMinutes;
        document.getElementById('account').value = items.account;
    });
}

function registerOnChangeEventListner(elements) {
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('change', save_options);
    }
}

function registerOnInputEventListner(elements) {
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('input', save_options);
    }
}
function initView() {
    var currencySelect = document.getElementById('baseCurrency');
    for(var i = 0, l = currencies.length; i < l; i++) {
        var option = currencies[i];
        currencySelect.options.add( new Option(option, option, false) );
    }

    restore_options();
}

var currencies = ["BTC", "USD", "EUR", "CHF", "GBP", "AUD", "BGN", "BRL", "CAD", "CNY", "CZK", "DKK", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "ZAR"];

document.addEventListener('DOMContentLoaded', initView);
registerOnChangeEventListner(document.getElementsByTagName('select'));
document.getElementById('account').addEventListener('input', save_options);