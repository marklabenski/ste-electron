const cryptoSettings = () => {
  const emptyCryptoSettings = {
    algorithm: '',
    method: '',
    parameters: [],
    options: {},
  };
  let actualCryptoSettings = {};
  const addParameter = (cryptoSettings, paramName, paramValue) => {
    const newSettings = Object.assign({}, cryptoSettings);
    newSettings.parameters.push({ paramName, paramValue });
    return newSettings;
  };
  const addOptions = (cryptoSettings, options) => {
    const newSettings = Object.assign({}, cryptoSettings);
    Object.keys(options).forEach((optionKey) => {
      const optionValue = options[optionKey];
      newSettings.options[optionKey] = optionValue;
    });
    return newSettings;
  };
  const addProp = (cryptoSettings, propName, propVal) => {
    const newSettings = Object.assign({}, cryptoSettings);
    newSettings[propName] = propVal;
    return newSettings;
  };
  return {
    createCryptoSettings() {
      actualCryptoSettings = emptyCryptoSettings;
      return this;
    },
    setMethod: (methodName) => {
      actualCryptoSettings = addProp('method', methodName);
      return this;
    },
    setAlgorithm: (algorithmName) => {
      actualCryptoSettings = addProp('algorithmName', algorithmName);
      return this;
    },
    addParameter: (paramName, paramValue) => {
      actualCryptoSettings = addParameter(actualCryptoSettings, paramName, paramValue);
      return this;
    },
    addOptions: (options) => {
      actualCryptoSettings = addOptions(actualCryptoSettings, options);
      return this;
    },
    getSettings: () => Object.assign({}, actualCryptoSettings),
  };
};

export default cryptoSettings;
