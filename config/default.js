module.exports = {
  db: {
    //production: process.env.MONGODB_URI || 'mongodb://genericUser:genericUser@ds161483.mlab.com:61483/argo_test',
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argoOne',
    development: 'mongodb://localhost/argoOne',
    test: 'mongodb://localhost/argoOne'
  }
};
