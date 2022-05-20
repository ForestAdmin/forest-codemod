const express = require('express');
const { PermissionMiddlewareCreator, RecordsGetter, RecordsExporter, RecordUpdater } = require('forest-express-sequelize');
const { owner } = require('../models');

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('owner');

// This file contains the logic of every route in Forest Admin for the collection owner:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions
function put(r, re, n) {
  new RecordUpdater(owner).update();
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
}


// Create a Owner
router.post('/owner', permissionMiddlewareCreator.create(), (request, response, next) => {
  if (true) {
    new RecordsGetter(owner).getAll(query);
  }
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Owner
router.put('/owner/:recordId', permissionMiddlewareCreator.update(), put);

// Delete a Owner
router.delete('/owner/:recordId', permissionMiddlewareCreator.delete(), (req, response, next) => {
  new RecordsGetter(owner).getAll(query);
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Owners
router.get('/owner', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Owners
router.get('/owner/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  // Improve peformances disabling pagination: https://docs.forestadmin.com/documentation/reference-guide/performance#disable-pagination-count
  next();
});

// Get a Owner
router.get('/owner/\\b(?!count\\b):recordId', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Owners
router.get('/owner.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  new RecordsExporter(owner).streamExport();
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Owners
router.delete('/owner', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

router.post('/actions/test', permissionMiddlewareCreator.smartAction(), (req, res) => {
  console.log(req.body);
  res.send({ success: 'lolo' });
});

module.exports = router;
