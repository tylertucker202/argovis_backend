module.exports = {
  db: {
    //production: process.env.MONGODB_URI || 'mongodb://genericUser:genericUser@ds161483.mlab.com:61483/argo_test',
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argo',
    development: 'mongodb://localhost/argo3',
    docker: 'mongodb://database/argo3',
    test: 'mongodb://localhost/argo3'
  },

  startDate: {
    production: 'today',
    development: '2017-12-20',
    docker: 'today',
    test: '2018-11-10'
  }
};
