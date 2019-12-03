import React, { Component } from "react";
import { connect } from "react-redux";
//import { sendForm } from "../actions";

import "./TelForm.css";
import "./flags.css";

export default class TelForm extends Component {
  state = {
    countries: [],
    showCountriesList: false,
    selectedCountry: "",
    selectedCountryCode: "",
    selectedCountryPrefix: "",
    selectedCountryMin: "",
    selectedCountryMax: "",
    inputValue: "+",
    loading: true,
    error: false,
    showPopUp: false,
    showMessage: false,
    alertMessage: " "
  };

  // Получение списка стран с сервера

  getCountries = async () => {
    const res = await fetch("https://koronapay.com/online/api/countries");
    if (!res.ok) {
      throw new Error(`Could not fetch, received ${res.status}`);
    }
    const body = await res.json();
    return body;
  };

  // Фильтруем список (есть страны без префиксов)

  onCountriesLoaded = countries => {
    const filteredCountries = countries.filter(element => {
      return element.phoneInfo;
    });
    this.setState({ countries: filteredCountries, loading: false });
  };

  componentDidMount() {
    this.getCountries().then(this.onCountriesLoaded);
  }

  onFocus = () => {
    this.handleCountriesListShow();
  };

  // Отрисовка списка стран (рисуем, если пользователь ранее не выбрал страну)

  handleCountriesListShow = () => {
    const { selectedCountry } = this.state;

    if (!selectedCountry) {
      this.setState({ showCountriesList: true });
    }
    return;
  };

  // Автоматический выбор префикса и флага (первая страна из списка)

  autoSelectPrefix = str => {
    const { countries, selectedCountryPrefix } = this.state;
    let prefix = `+${str.slice(0, 3)}`;

    let filteredCountries = countries.filter(element => {
      return element.phoneInfo.prefix.includes(prefix);
    });

    if (prefix !== selectedCountryPrefix && filteredCountries.length > 0) {
      this.setState({ showCountriesList: true, selectedCountry: "" });
    }

    if (filteredCountries.length > 0) {
      const code = filteredCountries[0].code;
      this.setState({
        selectedCountryPrefix: prefix,
        selectedCountryCode: code.toLowerCase()
      });
    }
    return;
  };

  // Обработка ввода в строку input

  onInputChange = e => {
    this.setState({ alertMessage: "" });

    const str = e.target.value;
    const filteredStr = this.inputValidation(str.slice(1));

    this.setState({ inputValue: `+${filteredStr}` });

    this.autoSelectPrefix(filteredStr);
    this.handleCountriesListShow();
  };

  // Валидация "на лету"  вводимого пользователем значения (рзрешено вводить только цифры)

  inputValidation = str => {
    const regex = /\d/g;
    const filteredStr = str.match(regex) ? str.match(regex).join("") : "";
    return filteredStr;
  };

  // Обработчик выбора пользователем страны из списка

  handleCountryClick = e => {
    const data = e.target.dataset;

    this.setState({
      selectedCountry: data.country[0] + data.country.slice(1).toLowerCase(),
      selectedCountryCode: data.code.toLowerCase(),
      selectedCountryPrefix: data.prefix,
      selectedCountryMin: data.min,
      selectedCountryMax: data.max,
      showCountriesList: false
    });

    if (this.state.inputValue < data.prefix) {
      this.setState({ inputValue: data.prefix });
    }

    this.substitute(data.prefix);
  };

  // Функция подставляет префикс выбранной страны в строку ввода

  substitute = str => {
    let tel = this.state.inputValue;
    const length = str.length;
    console.log(tel.slice(length));
    const newInputValue = str + tel.slice(length);
    this.setState({ inputValue: newInputValue });
  };

  // Обработчик отправки формы

  handleSubmit = e => {
    e.preventDefault();

    const {
      selectedCountry,
      selectedCountryMin,
      selectedCountryMax,
      selectedCountryPrefix
    } = this.state;

    const tel = this.state.inputValue.length;
    const min = +selectedCountryMin + selectedCountryPrefix.length;
    const max = +selectedCountryMax + selectedCountryPrefix.length;

    if (!selectedCountry.length) {
      this.setState({
        alertMessage: `Выберите страну из списка`
      });
      return;
    }

    if (tel >= min && tel <= max) {
      this.setState({ showPopUp: true });
    } else {
      this.setState({
        alertMessage: `Некорректный формат: введите номер длиной ${
          max === min ? max : `${min} - ${max}`
        } символов`
      });
    }
    return;
  };

  // Обработчик кликов на кнопки да/нет в диалоге отправки формы

  onBtnClick = bool => {
    this.setState({ showPopUp: false });
    if (bool) {
      this.setState({
        selectedCountry: "",
        selectedCountryCode: "",
        selectedCountryPrefix: "",
        selectedCountryMin: "",
        selectedCountryMax: "",
        inputValue: "+",
        showMessage: true
      });
      setTimeout(() => {
        this.setState({ showMessage: false });
      }, 5000);
    }
  };

  // Рендер-функция для отрисовки флага

  renderFlag = code => {
    const flag = `flag flag-${code}`;
    return <div className={flag}></div>;
  };

  // Рендер-функция для отрисовки списка стран

  renderDatalist = countries => {
    let template;
    const prefix = this.state.selectedCountryPrefix;
    const filteredCountries = countries.filter(element => {
      return element.phoneInfo.prefix.includes(prefix);
    });

    template = filteredCountries.map(element => {
      const flag = this.renderFlag(element.code.toLowerCase());
      return (
        <li
          key={element.id}
          data-prefix={element.phoneInfo.prefix}
          data-country={element.name}
          data-code={element.code}
          data-min={element.phoneInfo.minLength}
          data-max={element.phoneInfo.maxLength}
          onClick={e => this.handleCountryClick(e)}
        >
          {flag} {element.name} ({element.phoneInfo.prefix})
        </li>
      );
    });
    return template;
  };

  render() {
    const {
      countries,
      selectedCountry,
      selectedCountryCode,
      loading,
      inputValue,
      showCountriesList,
      showPopUp,
      showMessage,
      alertMessage
    } = this.state;

    const flag = selectedCountryCode
      ? this.renderFlag(selectedCountryCode)
      : null;

    const countriesList = showCountriesList ? (
      <ul>
        <li
          onClick={() => {
            this.setState({ showCountriesList: false });
          }}
        >
          Закрыть список стран
        </li>
        {this.renderDatalist(countries)}
      </ul>
    ) : null;

    const popUp = showPopUp ? (
      <div className="popUp">
        <p>Вы уверены, что хотите отправить сообщение?</p>
        <button onClick={() => this.onBtnClick(true)}>Да</button>
        <button onClick={() => this.onBtnClick(false)}>Нет</button>
      </div>
    ) : null;

    const popUpMessage = showMessage ? (
      <div className="popUp">
        <p>Сообщение было успешно отправлено</p>
      </div>
    ) : null;

    return loading ? (
      <p>Загрузка</p>
    ) : (
      <React.Fragment>
        <form onSubmit={e => this.handleSubmit(e)}>
          <p>Введите номер телефона (цифры 0-9) и выберите страну из списка.</p>
          <p className="country">Выбранная страна: {selectedCountry}</p>
          <input
            type="tel"
            list="countries"
            value={inputValue}
            onChange={e => this.onInputChange(e)}
            onFocus={() => this.onFocus()}
          />
          <span>{alertMessage}</span>
          <div className="flagIcon">{flag}</div>
          {countriesList}
          <button type="submit">Далее</button>
        </form>
        {popUp}
        {popUpMessage}
      </React.Fragment>
    );
  }
}

const mapStateToProps = store => {
  return {
    form: store.form
  };
};

connect(mapStateToProps)(TelForm);
