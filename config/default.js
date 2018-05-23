module.exports = {
  db: {
    //production: process.env.MONGODB_URI || 'mongodb://genericUser:genericUser@ds161483.mlab.com:61483/argo_test',
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argoTrouble',
    development: 'mongodb://localhost/argo2',
    test: 'mongodb://localhost/argo2'
  }
};
