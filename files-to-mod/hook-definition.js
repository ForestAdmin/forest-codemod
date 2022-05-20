const { collection } = require('forest-express-sequelize');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection('owner', {
  actions: [{
    type: 'single',
    name: 'test',
    hooks: {
      load: ({ fields }) => {
        const name = 'a field';
        const field = fields[name];
        field.value = 'init your field';
        fields.action.value = 'ici';
        return fields;
      },
      change: {
        onFieldChanged: ({ fields }) => {
          const field = fields['a field'];
          field.value = 'what you want';
          const field2 = fields.blbl;
          return fields;
        }
      }
    }
  }, {
    type: 'single',
    name: 'test',
    hooks: {
      load: ({ fields }) => {
        const field = fields['a field'];
        field.value = 'init your field';
        const { tata, toto } = fields;
        return fields;
      },
      change: {
        onFieldChanged: ({ fields }) => {
          const field = fields['a field'];
          field.value = 'what you want';
          return fields;
        }
      }
    }
  }],
  fields: [],
  segments: [],
});
