var config = {};

config.mongoURI = {
  development: 'mongodb://localhost/company_directory',
  production: 'mongodb://localhost/company_directory',
  test: 'mongodb://localhost/company_directory_test'
};

module.exports = config;