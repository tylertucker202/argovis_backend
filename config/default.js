module.exports = {
  db: {
    //production: process.env.MONGODB_URI || 'mongodb://genericUser:genericUser@ds161483.mlab.com:61483/argo_test',
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argo',
    development: 'mongodb://localhost/argo',
    docker: 'mongodb://database/argo',
    test: 'mongodb://localhost/argo'
  },

  startDate: {
    production: 'yesterday',
    development: '2017-12-20',
    docker: 'yesterday',
    test: '2018-11-10'
  }
};
