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
  urlRoot: "http://localhost:8000/api/users",
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

var Users = Backbone.PageableCollection.extend({
  url: "http://localhost:8000/api/users",
  mode: 'client',
  model: User,
  state: {
    pageSize: 12,
    sortKey: 'id',
    order: 1
  },
  queryParams: {
    totalPages: null,
    totalRecords: null,
  },
});

var UserView = Backbone.Marionette.View.extend({
  tagName: 'tr',
  template: '#user-row',
  serializeData: function(){
    return {
      "name": this.model.attributes.firstName.capitalizedFirstLetter() + " " + this.model.attributes.lastName.capitalizedFirstLetter(),
      "lastName": this.model.attributes.lastName.capitalizedFirstLetter(),
      "phone": this.model.attributes.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
      "email": this.model.attributes.email
    };
  }
});

var UsersView = Backbone.Marionette.CollectionView.extend({
  tagName: 'tbody',
  childView: UserView,
  initialize: function(){
    this.listenTo(Backbone, 'header:nextpage', this.nextPage),
    this.listenTo(Backbone, 'header:prevpage', this.prevPage)
    this.listenTo(Backbone, 'header:firstpage', this.firstPage)
    this.listenTo(Backbone, 'header:lastpage', this.lastPage)
  },
  prevPage: function(){
    this.collection.getPreviousPage();
  },
  nextPage: function(){
    this.collection.getNextPage();
  },
  firstPage: function(){
    this.collection.getFirstPage();
  },
  lastPage: function(){
    this.collection.getLastPage();
  }  
});

var UsersTableView = Backbone.Marionette.View.extend({
  initialize: function(){
    this.sortField = "lastName";
    this.sortDirection = "DESC";
    this.sortFlag = false;
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
    this.collection.setSorting('lastName')
    this.collection.fullCollection.sort();
  },
  sortUsers: function(flag){
    var name = flag.target.id;
    if (this.sortFlag === false){
      this.sortFlag = true;
      this.collection.setSorting(name, -1)
      this.collection.fullCollection.sort();
      this.collection.getFirstPage();
    } else {
      this.sortFlag = false;
      this.collection.setSorting(name, 1)
      this.collection.fullCollection.sort();
      this.collection.getFirstPage()
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
  initialize: function(){
    this.model = new User();
  },
  tagName: 'form',
  template: "#form-view-template",
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
    this.showChildView('body', new UsersFormView({
      model: this.model,
      collection: this.collection
    }));
  },
  submitForm: function(e){
    e.preventDefault();
    Backbone.trigger('header:submitusersform')
  },
  cancelForm: function(e){
    e.preventDefault();
    Backbone.trigger('header:cancelform')
  }
});

var UsersFormView = Backbone.Marionette.View.extend({
  initialize: function(){
    this.listenTo(Backbone, 'header:submitusersform', this.submitUsersForm)
  },
  template: "#users-form-template",
  onRender: function(){
    Backbone.Validation.bind(this, {
      model: this.model
    });
  },
  submitUsersForm: function(){
    var userAttrs = {
      firstName: $('#firstName_input').val(),
      lastName: $('#lastName_input').val(),
      email: $('#email_input').val(),
      phone: $('#phone_input').val()
    };
    this.model.set(userAttrs);
    if(this.model.isValid(true)){
      this.model.save();
      this.collection.add(this.model);
      Backbone.Validation.unbind(this);
      Backbone.trigger('header:cancelform')
    }
  }
});

var NavigationView = Backbone.Marionette.View.extend({
  template: "#navigation-template",
    events: {
    'click .prev-page': 'prevPage',
    'click .next-page': 'nextPage',
    'click .first-page': 'firstPage',
    'click .last-page': 'lastPage',
  },
  nextPage: function(){
    Backbone.trigger('header:nextpage')
  },
  prevPage: function(){
    Backbone.trigger('header:prevpage')
  },
  firstPage: function(){
    Backbone.trigger('header:firstpage')
  },
  lastPage: function(){
    Backbone.trigger('header:lastpage')
  },
  currentPage: function(e, i){
    console.log("e: " + e + " i: " + i) 
  }
})

var PageView = Backbone.Marionette.View.extend({
  tagName: "main",
  template: '#page-template',
  regions: {
    body: {
      el: '#table-view',
    },
    form: {
      el: '#form-view',
    },
    navigation: {
      el: '#navigation-view',
      replaceElement: false
    }
  },
  onRender: function(){
    this.showChildView('body', new UsersTableView({
      collection: this.collection,
    }));
    this.showChildView('form', new SidebarView({
      collection: this.collection,
    }));
    this.showChildView('navigation', new NavigationView({
      
    }));
  }
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
    this.showChildView('body', new FormView({
      collection: this.collection
    }));
  }
}));

var users = new Users();
users.fetch();

var usersView = new PageView({
  collection: users
});

var myApp = new Marionette.Application({
  region: "#main"
});

myApp.showView(usersView);