module.exports = {
  db: {
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argo',
    development: 'mongodb://127.0.0.1:27017/argo',
    docker: 'mongodb://database/argo',
    test: 'mongodb://127.0.0.1:27017/argo-express-test',
    REMOTE_DB: 'mongodb://testUser:testUser1@ds141786.mlab.com:41786/argo-express-test',
    jg: 'mongodb://127.0.0.1:27017/JG'
  },

  startDate: {
    production: 'yesterday',
    development: '2017-12-20',
    docker: 'yesterday',
    test: '2018-11-10',
    travis_test: '2018-11-10',
    jg: '2017-12-20',
  }
};
