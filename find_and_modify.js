(function() {
  'use strict';
  // Code adapted from https://github.com/meteor/meteor/issues/1070

  // Helper func to run shared validation code
  function validate(collection, args) {
    if(!collection._name)
        throw new Meteor.Error(405,
                               "findAndModify: Must have collection name.");

    if(!args)
      throw new Meteor.Error(405, "findAndModify: Must have args.");

    if(!args.query)
      throw new Meteor.Error(405, "findAndModify: Must have query.");

    if(!args.update && !args.remove)
      throw new Meteor.Error(405,
                             "findAndModify: Must have update or remove.");
  };

  if (Meteor.isServer) {
    Meteor.Collection.prototype.findAndModify = function(args){
      validate(this, args);

      var q = {};
      q.query = args.query || {};
      q.sort = args.sort || {};
      if (args.update)
        q.update = args.update;

      q.options = {};
      if (args.new !== undefined)
        q.options.new = args.new;
      if (args.remove !== undefined)
        q.options.remove = args.remove;
      if (args.upsert !== undefined)
        q.options.upsert = args.upsert;

      var db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
      var collectionObj = db.collection(this._name);

      var wrappedFunc = Meteor.wrapAsync(collectionObj.findAndModify, 
                                         collectionObj);
      return wrappedFunc(
        q.query,
        q.sort,
        q.update,
        q.options
      );
    };
  }

  if (Meteor.isClient) {
    Meteor.Collection.prototype.findAndModify = function(args) {
      validate(this, args);

      var findOptions = {};
      if (args.sort !== undefined)
        findOptions.sort = args.sort;
      if (args.skip !== undefined)
        findOptions.skip = args.skip;

      var ret = this.findOne(args.query, findOptions);
      if (args.remove) {
        if (ret) this.remove({_id: ret._id});
      }

      else {
        if (args.upsert && !ret) {
          var writeResult = this.upsert(args.query, args.update);
          if (writeResult.insertedId && args.new)
            return this.findOne({_id: writeResult.insertedId}, findOptions);
          else if (findOptions.sort)
            return {};
          return null;
        }

        else if (ret) {
          this.update({_id: ret._id}, args.update);
          if (args.new)
            return this.findOne({_id: ret._id}, findOptions);
        }
      }

      return ret;
    };
  }
    
})();


