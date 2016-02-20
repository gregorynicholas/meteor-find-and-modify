
function validate(collection, args) {
  if(!collection._name)
      throw new Meteor.Error(405, "findAndModify: invalid collection._name");

  if(!args)
    throw new Meteor.Error(405, "findAndModify: pass args.");

  if(!args.query)
    throw new Meteor.Error(405, "findAndModify: args must have query.");

  if(!args.update && !args.remove)
    throw new Meteor.Error(405, "findAndModify: args missing update or remove.");
};

Mongo.Collection.prototype.findAndModify = function(){
  validate(this, arguments);

  var q = {};
  q.query = arguments.query || {};
  q.sort = arguments.sort || {};
  q.options = {};
  if (arguments.update)
    q.update = arguments.update;
  
  // hmm...  _. fn here..?
  if (arguments.new !== undefined)
    q.options.new = arguments.new;
  if (arguments.remove !== undefined)
    q.options.remove = arguments.remove;
  if (arguments.upsert !== undefined)
    q.options.upsert = arguments.upsert;
  if (arguments.fields !== undefined)
    q.options.fields = arguments.fields;

  // if upsert and not provided an _id, assign default string with $setOnInsert
  if (q.options.upsert) {
    q.update = q.update || {};
    q.update.$setOnInsert = q.update.$setOnInsert || {};
    q.update.$setOnInsert._id = q.update.$setOnInsert._id || Random.id(17);
  } 

  var collection = this.rawCollection();
  var fn = Meteor.wrapAsync(collection.findAndModify,  collection);

  return fn(
    q.query,
    q.sort,
    q.update,
    q.options
  );
};
