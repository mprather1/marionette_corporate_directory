Backbone.Model.prototype.idAttribute = '_id';
String.prototype.capitalizedFirstLetter = function(){
  return this.charAt(0).toUpperCase() + this.slice(1);
};

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var User = Backbone.Model.extend({
  urlRoot: "http://localhost:8000/api/users"
});

var Users = Backbone.Collection.extend({
  url: "http://localhost:8000/api/users",
  model: User
});

var UserView = Backbone.Marionette.View.extend({
  tagName: 'tr',
  template: '#user-row',
  serializeData: function(){
    return {
      "firstName": this.model.attributes.firstName.capitalizedFirstLetter(),
      "lastName": this.model.attributes.lastName.capitalizedFirstLetter(),
      "phone": this.model.attributes.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
      "email": this.model.attributes.email
    };
  }
});

var UsersView = Backbone.Marionette.CollectionView.extend({
  tagName: 'tbody',
  childView: UserView,
});

var UsersTableView = Backbone.Marionette.View.extend({
  initialize: function(){
    this.sortFlag = null
  },
  tagName: "table",
  className: 'table table-hover',
  template: '#user-table',
  events: {
    'click .table-header': 'sortUsers',
    'mouseover .table-header': 'mouseoverFunc',
    'mouseout .table-header': 'mouseoutFunc'
  },
  regions: {
    body: {
      el: 'tbody',
      replaceElement: true
    }
  },
  onRender: function(){
    this.showChildView('body', new UsersView({
      collection: this.collection,
      sort: false
    }));
    this.showChildView('body', new UsersView({
      collection: this.collection
    }));
  },
  sortUsers: function(flag){
    console.log(flag.target.id)
    if (flag.target.id === 'name'){
      var name = 'lastName';
    } else {
      var name = flag.target.id;
    }
    if (this.sortFlag === false){
      // var order = 'asc';
      console.log(this.sortFlag)
      this.collection.comparator = function(user){
        console.log(user.get(name))
        return -user.get(name)
      }
      this.sortFlag = true;
      this.collection.sort();
    } else {
      console.log(this.sortFlag)
      // order = 'desc';
      this.collection.comparator = function(user){
        console.log(user.get(name))
        return user.get(name)
      }
      this.sortFlag = false;
      this.collection.sort();
    }
  },
  mouseoverFunc: function(event){
    $(event.currentTarget).css({"background-color":"yellow","cursor":"pointer"});
  },
  mouseoutFunc: function(event){
    $(event.currentTarget).css("background-color", "#999999");
  }
});

var users = new Users();
users.fetch();

var usersView = new UsersTableView({
  collection: users
});

var myApp = new Marionette.Application({
  region: "#main"
});

myApp.showView(usersView);