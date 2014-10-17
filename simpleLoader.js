(function(define) {'use strict';
define(function(require) {

   var mixin;

   mixin = require('./mixin');

   function Loader (main) {
      this.setMain(main);
   }

   Loader.prototype = {
      // Set the main object
      setMain: function setMain(newMain) {
         this.main = newMain;
      },
      // Returns an existing module (or loads if not available)
      // Convention: Modules lowercase, Classes uppercase
      requireModule: function requireModule(name) { return this.main[name]; },
      addModule: function addModule(name, obj) { this.main[name] = obj; },
      // Returns an existing type (or errors if not available)
      requireClass: function requireClass(name) { return this.main[name]; },
      addClass: function addClass(name, obj) {
         // Add new type
         // TODO: Enforce name starting with capital letter
         this.main[name] = obj;
         return this;
      },
      getClass: function getClass(name) { return this.main[name]; },
      // Adds a new method to a "module". Maybe allow multiple methods
      // Typical formats:
      // addModuleMethod('Stats', 'sum', f);
      // addModuleMethod('Stats.sum', f);
      // addModuleMethod('Stats', { sum: f, mean: g });
      addModuleMethod: function addModuleMethod(module, name, method) {
         var params;
         params = normalizeArguments(module, name, method);
         mixin(this.requireModule(params.module), params.methods);
         return this;
      },
      // Adds a new class method to a "type". Maybe allow multiple methods
      addClassMethod: function addClassMethod(type, name, method) {
         var params;
         params = normalizeArguments(type, name, method);
         mixin(this.getClass(params.module), params.methods);
         return this;
      },
      // Adds a new instance/prototype method to a "type". Maybe allow multiple methods
      addInstanceMethod: function addInstanceMethod(type, name, method) {
         var params;
         params = normalizeArguments(type, name, method);
         mixin(this.getClass(params.module).prototype, params.methods);
         return this;
      },
      loadModule: function loadModule(moduleFun) {
         moduleFun(this);
      }
   };

   // Converts all these formats to a "{ module: 'Stats', methods: { sum: f, ... }}" type
   // addModuleMethod('Stats', 'sum', f);
   // addModuleMethod('Stats.sum', f);
   // addModuleMethod('Stats', { sum: f, mean: g });
   function normalizeArguments(module, name, method) {
      var bindings;
      bindings = {};
      if (typeof method !== 'undefined') {
         bindings[name] = method;
      } else if (typeof name !== 'function') {
         return { module: module, methods: name};
      } else {
         module = module.split('.');
         if (module.length !== 2) {
            throw new Error('Invalid module method specification in addModuleMethod');
         }
         bindings[module[1]] = name;
         module = module[0];
      } 
      return { module: module, methods: bindings };
   }

   return Loader;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
