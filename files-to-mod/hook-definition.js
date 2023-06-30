const { collection } = require('forest-express-sequelize');

const {
  Owner
} = require('../models');

function hook (record) {
  const a = record.aProps;
  return a;
}

async function getRecordFromRequest(request) {
  const [id] = request.body.data.attributes.ids;
      
  return Owner.findByPk(id);
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
      load: async ({ fields, request }) => {
        const record = await getRecordFromRequest(request);
        const name = 'a field';
        const field = fields.find(field => field.field === name);
        field.value = 'init your field';
        fields.find(field => field.field === "action").value = 'ici';
        field.value = hook(record);
        return fields;
      },
      change: {
        hook_0: async ({ fields, request }) => {
          const record = await getRecordFromRequest(request);
          const field = fields.find(field => field.field === 'a field');
          field.value = 'what you want';
          const field2 = fields.find(field => field.field === "blbl");
          field2.value = record.aProps;
          return fields;
        },
      }
    }
  }, {
    type: 'single',
    name: 'test2',
    hooks: {
      load: async ({ fields, request }) => {
        const record = await getRecordFromRequest(request);
        const field = fields.find(field => field.field === 'a field');
        field.value = 'init your field';
        const toto = fields.find(field => field.field === "toto");
        const tata = fields.find(field => field.field === "tata");
        tata.value = record.aProps;
        toto.value = record.anotherProps;
        return fields;
      },
      change: {
        hook_0: ({ fields }) => {
          const field = fields.find(field => field.field === 'a field');
          field.value = 'what you want';
          fields.find(field => field.field === "nom").value = "load value";
          return fields;
        }
      }
    }
  }, {
    type: 'single',
    name: 'test3',
    hooks: {
      load: async prop => {
        const record = await getRecordFromRequest(prop.request);
        prop.fields.find(field => field.field === "nom").value = record.aProps;
        return prop.fields;
      },
      change: {
        hook_0: async context => {
          const record = await getRecordFromRequest(context.request);
          const plop = context.fields.find(field => field.field === "plop");
          plop.value = 'ici';
          if (context.fields.find(field => field.field === "nom").value.length > 4) {
            //do something
          }

          context.fields.find(field => field.field === "nom").value = record.aProps;

          return context.fields;
        }
      }
    }
}],
  fields: [],
  segments: [],
});
