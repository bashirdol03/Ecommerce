import dotenv from 'dotenv';
export default dotenv.config();

// ALLOWS THE USE OF ENVIRONMENT VARIABLES IN THE TESTS , USEFUL FOR SIGNING TOKEN WITH SECRETKEY
/*
THE SCRIPTS IN PACKAGE JSON MUST LOOK LIKE THIS BELOW

--runInBand stops parallel tests running and inconsistency with test results

"scripts": {
    "start": "nodemon server.js",
    "test": "jest --watchAll --runInBand --setupFiles dotenv/config"
  },
*/
