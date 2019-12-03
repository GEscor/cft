export const initialState = {
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

export const formReducers = (state = initialState, action) => {
  switch (action.type) {
    case "SEND_FORM":
      return;
    default:
      return state;
  }
};
