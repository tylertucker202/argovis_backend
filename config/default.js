module.exports = {
  db: {
    //production: 'mongodb://testUser:Sasiamovnoa12!@ds161483.mlab.com:61483/argo_test',
    production:  process.env.MONGODB_URI || 'mongodb://localhost/argo',
    development: 'mongodb://localhost/argo',
    test: 'mongodb://localhost/argo'
  }
};
