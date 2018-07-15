module.exports = {
  db: {
    //production: process.env.MONGODB_URI || 'mongodb://genericUser:genericUser@ds161483.mlab.com:61483/argo_test',
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argo',
<<<<<<< HEAD
    development: 'mongodb://localhost/argoTrouble',
    test: 'mongodb://localhost/argo2'
=======
    development: 'mongodb://localhost/argo',
    test: 'mongodb://localhost/argo'
>>>>>>> 8ee24ff717d9a4ba29ba7582143d88883b63882b
  }
};
