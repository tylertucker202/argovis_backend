module.exports = {
  db: {
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argo',
    development: 'mongodb://localhost/argo',
    docker: 'mongodb://database/argo',
    test: 'mongodb://localhost/argo-express-test',
    jg: 'mongodb://localhost/JG'
  },

  startDate: {
    production: 'yesterday',
    development: '2017-12-20',
    docker: 'yesterday',
    test: '2018-11-10',
    jg: '2017-12-20',
  }
};
