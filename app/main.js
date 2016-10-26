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
  model: User,
  comparator: function(m){
    return m.get(this.sortField);
  },
  setSortField: function(field, direction){
    this.sortField = field;
    this.sortDirection = direction;
  },
  sortBy: function(iterator, context){
    var obj = this.models,
    direction = this.sortDirection;
    return _.pluck(_.map(obj, function (value, index, list){
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right){
      var a = direction === "ASC" ? left.criteria : right.criteria;
      var b = direction === "ASC" ? right.criteria : left.criteria;
      if (a != b){
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  }
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
    this.sortField = "lastName";
    this.sortDirection = "ASC";
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
    }));
  },
  sortUsers: function(flag){
    if (flag.target.id === 'name'){
      var name = 'lastName';
    } else {
      var name = flag.target.id;
    }
    if (this.sortFlag === false){
      this.sortFlag = true;
      this.collection.setSortField(name, "ASC");
      this.collection.sort();
    } else {
      this.sortFlag = false;
      this.collection.setSortField(name, "DESC");
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

var FormView = Backbone.Marionette.View.extend({
  tagName: 'form',
  template: "#form-view",
  ui: {
    submit: '.submit'
  },
  events: {
    'click @ui.submit': "submitForm"
  },
  regions: {
    body: {
      el: '#form-view-panel'
    }
  },
  onRender: function(){
    this.showChildView('body', new UsersFormView({
    }))
  },
  submitForm: function(){
    console.log("submitted")
  }
})

var UsersFormView = Backbone.Marionette.View.extend({
  template: "#users-form-view",
})
var PageView = Backbone.Marionette.View.extend({
  template: '#page-template',
  regions: {
    body: {
      el: '#table-view',
    },
    form: {
      el: '#form-view',
    }
  },
  onRender: function(){
    this.showChildView('body', new UsersTableView({
      collection: this.collection,
    }));
    this.showChildView('form', new FormView({
    }))
  },
})
var users = new Users();
users.fetch();

var usersView = new PageView({
  collection: users
});

var myApp = new Marionette.Application({
  region: "#main"
});

myApp.showView(usersView);