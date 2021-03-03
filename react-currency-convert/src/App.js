import React from 'react';
import { useEffect, useState } from 'react';

import './App.css';
import CurrencyRow from './components/CurrencyRow';

const BASE_URL = 'https://api.exchangeratesapi.io/latest';

function App() {
  const [currencyOptions, setCurrenceOptions] = useState([]);
  const [fromCurrency, setFromCurrency] = useState();
  const [toCurrency, setToCurrency] = useState();
  const [exchangeRate, setExchangeRate] = useState();
  const [amount, setAmount] = useState(1);
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true);

  let toAmount, fromAmount;
  if (amountInFromCurrency) {
    fromAmount = amount;
    toAmount = amount * exchangeRate;
  } else {
    toAmount = amount;
    fromAmount = amount / exchangeRate;
  }

  useEffect(() => {
    fetch(BASE_URL)
      .then((res) => res.json())
      .then((data) => {
        const firstCurrency = Object.keys(data.rates)[0];
        setCurrenceOptions([data.base, ...Object.keys(data.rates)])
        setFromCurrency(data.base);
        setToCurrency(firstCurrency);
        setExchangeRate(data.rates[firstCurrency]);
      });
  }, []);

  useEffect(() => {
    if (fromCurrency != null && toCurrency != null) {
      fetch(`${BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`)
        .then((res) => res.json())
        .then((data) => { setExchangeRate(data.rates[toCurrency]) });
    }
  }, [toCurrency, fromCurrency]);

  function handleFromAmountOnChange(e) {
    setAmount(e.target.value);
    setAmountInFromCurrency(true);
  }

  function handleToAmountOnChange(e) {
    setAmount(e.target.value);
    setAmountInFromCurrency(false);
  }

  return (
    <>
      <h1>Hello World</h1>
      <CurrencyRow 
        currencyOptions={currencyOptions} 
        selectedCurrency={fromCurrency}
        onChangeCurrency={e => setFromCurrency(e.target.value)}
        onChangeAmount={handleFromAmountOnChange}
        amount={fromAmount}
      />
      <div className="equals"> = </div>
      <CurrencyRow 
        currencyOptions={currencyOptions} 
        selectedCurrency={toCurrency}
        onChangeCurrency={e => setToCurrency(e.target.value)}
        onChangeAmount={handleToAmountOnChange}
        amount={toAmount}
      />
    </>
  );
}

export default App;
