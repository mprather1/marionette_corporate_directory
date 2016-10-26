Backbone.Model.prototype.idAttribute = '_id';
String.prototype.capitalizedFirstLetter = function(){
  return this.charAt(0).toUpperCase() + this.slice(1);
};

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

_.extend(Backbone.Validation.callbacks, {
  valid: function (view, attr, selector) {
    var $el = view.$('[name=' + attr + ']'), 
        $group = $el.closest('.form-group');
    $group.removeClass('has-error');
    $group.find('.help-block').html('').addClass('hidden');
  },
  invalid: function (view, attr, error, selector) {
    var $el = view.$('[name=' + attr + ']'), 
      $group = $el.closest('.form-group');
    $group.addClass('has-error');
    $group.find('.help-block').html(error).removeClass('hidden');
  }
});

var User = Backbone.Model.extend({
  urlRoot: "http://68.103.65.157:8000/api/users",
  validation: {
    firstName: {
      required: true
    },
    lastName: {
      required: true
    },
    email: {
      required: true,
      pattern: 'email'
    },
    phone: {
      required: true,
      pattern: 'number',
      minLength: 10,
      maxLength: 10
    }
  },
});

var Users = Backbone.Collection.extend({
  url: "http://68.103.65.157:8000/api/users",
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

var UsersFormView = Backbone.Marionette.View.extend({
  initialize: function(){
    this.model = new User()
  },
  tagName: 'form',
  template: "#form-view",
  ui: {
    submit: '.submit-button',
    cancel: '.cancel-button'
  },
  events: {
    'click @ui.submit': "submitForm",
    'click @ui.cancel': 'cancelForm'
  },
  regions: {
    body: {
      el: '#form-view-panel'
    }
  },
  onRender: function(){
    Backbone.Validation.bind(this, {
      model: this.model
    });
  },
  submitForm: function(e){
    e.preventDefault();
    var userAttrs = {
      firstName: $('#firstName_input').val(),
      lastName: $('#lastName_input').val(),
      email: $('#email_input').val(),
      phone: $('#phone_input').val()
    };
    this.model.set(userAttrs);
    if(this.model.isValid(true)){
      console.log("valid")
      this.model.save();
      this.collection.add(this.model);
      Backbone.Validation.unbind(this);
      this.render();
    }
  },
  cancelForm: function(e){
    e.preventDefault();
    Backbone.trigger('header:cancelform')
  }
});

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
    this.showChildView('form', new SidebarView({
      collection: this.collection,
    }))
  },
});

var SidebarView = Backbone.Marionette.View.extend(({
  initialize: function(){
    this.listenTo(Backbone, 'header:cancelform', this.render)
  },
  template: "#sidebar-template",
  regions: {
    body: {
      el: "#sidebar-content"
    }
  },
  ui: {
    show: '.show-button'
  },
  events: {
    'click @ui.show': 'showForm'
  },
  showForm: function(){
    this.showChildView('body', new UsersFormView({
      collection: this.collection
    }))
  }
}))

var users = new Users();
users.fetch();

var usersView = new PageView({
  collection: users
});

var myApp = new Marionette.Application({
  region: "#main"
});

myApp.showView(usersView);