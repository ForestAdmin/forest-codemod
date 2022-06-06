const { collection } = require('forest-express-sequelize');

function hook (record) {
  const a = record.aProps;
  return a;
}

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
      load: ({ fields, record }) => {
        const name = 'a field';
        const field = fields[name];
        field.value = 'init your field';
        fields.action.value = 'ici';
        field.value = hook(record);
        return fields;
      },
      change: {
        onFieldChanged: ({ fields, record }) => {
          const field = fields['a field'];
          field.value = 'what you want';
          const field2 = fields.blbl;
          field2.value = record.aProps;
          return fields;
        }
      }
    }
  }, {
    type: 'single',
    name: 'test',
    hooks: {
      load: ({ fields, record }) => {
        const field = fields['a field'];
        field.value = 'init your field';
        const { tata, toto } = fields;
        tata.value = record.aProps;
        toto.value = record.anotherProps;
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
