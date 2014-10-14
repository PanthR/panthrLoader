(function(define) {'use strict';
define(function(require) {

   var mixin;

   mixin = require('./mixin');

   function Loader (main) {
      this.main = main;
   }

   Loader.prototype = {
      // Set the main object
      setMain: function setMain(newMain) {
         this.main = newMain;
         if (!this.main.hasOwnProperty('_modules') {
            Object.defineProperty(this.main, '_modules', { value: {} });
         });
      },
      // Returns an existing module (or loads if not available)
      requireModule: function requireModule(name) { return this.main._modules[name]; },
      addModule: function addModule(name, obj) { this.main._modules[name] = obj; },
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
      if (typeof method !== 'undefined') { name = { name: method }; }
      if (typeof name === 'function') {
         module = module.split('.');
         if (module.length !== 2) {
            throw new Error('Invalid module method specification in addModuleMethod');
         }
         method = name;
         name = module[1];
         name = { name: method };
         module = module[0];
      }
      return { module: module, methods: name };
   }

   return Loader;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
