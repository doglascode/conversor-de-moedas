const exchangeRateInfo = document.querySelector('.exchange-rate-info');
const firstCurrencySelect = document.querySelector('[name="currencyOne"]');
const secondCurrencySelect = document.querySelector('[name="currencyTwo"]');
const amoutCurrencyInput = document.querySelector('[name="currencyAmount"]');
const convertedCurrencyElement = document.querySelector('.converted-value');

let exchangeRate = {};

async function getExchangeRate(currency) {
  try {
    const url = `https://open.er-api.com/v6/latest/${currency}`;
    const fetchExchangeRate = await fetch(url);
    const exchangeRateData = await fetchExchangeRate.json();

    if (exchangeRateData.result !== 'success') {
      throw new Error(exchangeRateData['error-type']);
    }

    return exchangeRateData;
  } catch ({ message }) {
    const errorMessage = getErrorMessage(message);
    createErrorAlert(errorMessage);
  }
}

function getErrorMessage(errorName) {
  const messages = {
    'unsupported-code': 'Nenhuma moeda foi encontrada com o código informado',
    'malformed-request': `URL de requisição da API inválida`
  };

  return messages[errorName] || 'Não foi possível obter as informações';
}

function createErrorAlert(errorMessage) {
  const div = document.createElement('div');
  const button = document.createElement('button');

  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
  div.innerHTML = `<span>${errorMessage}</span>`;

  button.classList.add('btn-close');
  button.addEventListener('click', () => div.remove());

  div.appendChild(button);
  exchangeRateInfo.insertAdjacentElement('afterend', div);
}

function createSelectOptions(selectedCurrency) {
  return Object.keys(exchangeRate.rates).map(currency => {
    const selected = currency === selectedCurrency ? 'selected' : '';
    return `<option value="${currency}" ${selected}>${currency}</option>`;
  });
}

function showExchangeRateInfo() {
  const currrencyName = exchangeRateInfo.querySelector('.currency-name');
  const currencyPrecision = exchangeRateInfo.querySelector('.currency-precision');
  const currencyLastUpdate = exchangeRateInfo.querySelector('.currency-update');
  const currencyValue = exchangeRate.rates[secondCurrencySelect.value];

  currrencyName.textContent = `1 ${firstCurrencySelect.value}`;
  currencyPrecision.textContent = `${currencyValue} ${secondCurrencySelect.value}`;
  currencyLastUpdate.textContent = `Atualizado em ${formatLastUpdate()}`;

  showConvertedCurrency();
}

function formatLastUpdate() {
  const date = new Date(exchangeRate.time_last_update_utc);
  const lastUpdateStyle = Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'medium'
  });

  return lastUpdateStyle.format(date);
}

function showConvertedCurrency() {
  const inputValue = amoutCurrencyInput.value ? amoutCurrencyInput.valueAsNumber : 1;
  const currencyValue = exchangeRate.rates[secondCurrencySelect.value];
  const convertedValue = (inputValue * currencyValue).toFixed(2);

  convertedCurrencyElement.textContent = `${convertedValue} ${secondCurrencySelect.value}`;
}

async function start() {
  exchangeRate = await getExchangeRate('USD');

  firstCurrencySelect.innerHTML = createSelectOptions(exchangeRate.base_code);
  secondCurrencySelect.innerHTML = createSelectOptions('BRL');

  showExchangeRateInfo();
}

window.addEventListener('load', start);

firstCurrencySelect.addEventListener('input', async e => {
  exchangeRate = await getExchangeRate(e.target.value);

  showExchangeRateInfo();
});

secondCurrencySelect.addEventListener('input', showExchangeRateInfo);

amoutCurrencyInput.addEventListener('input', showConvertedCurrency);