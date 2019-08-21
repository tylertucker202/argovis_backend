module.exports = {
  db: {
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argo2',
    development: 'mongodb://localhost/argo2',
    docker: 'mongodb://database/argo2',
    test: 'mongodb://localhost/argo-express-test'
  },

  startDate: {
    production: 'yesterday',
    development: '2017-12-20',
    docker: 'yesterday',
    test: '2018-11-10'
  }
};
