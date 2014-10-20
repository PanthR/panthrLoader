(function(define) {'use strict';
define(function(require) {

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
      requireModule: function requireModule(name) {
         return getSetProperty(this.main, name);
      },
      addModule: function addModule(name, obj) {
         getSetProperty(this.main, name, obj);
      },
      // Returns an existing type (or errors if not available)
      // TODO -- implement this
      requireClass: function requireClass(name) {
         return getSetProperty(this.main, name);
      },
      addClass: function addClass(name, obj) {
         // Add new type
         // TODO: Enforce name starting with capital letter
         getSetProperty(this.main, name, obj);
         return this;
      },
      getClass: function getClass(name) {
         return getSetProperty(this.main, name);
      },
      // Adds a new method to a "module". Maybe allow multiple methods
      // Typical formats:
      // addModuleMethod('Stats', 'sum', f);
      // addModuleMethod('Stats.sum', f);
      // addModuleMethod('Stats', { sum: f, mean: g });
      addModuleMethod: function addModuleMethod(module, name, method) {
         var params;
         params = normalizeArguments(module, name, method);
         safeMixin(this.requireModule(params.module), params.methods);
         return this;
      },
      // Adds a new class method to a "type". Maybe allow multiple methods
      // Notice you can use this to add a subclass as a class property
      addClassMethod: function addClassMethod(type, name, method) {
         var params;
         params = normalizeArguments(type, name, method);
         safeMixin(this.getClass(params.module), params.methods);
         return this;
      },
      // Adds a new instance/prototype method to a "type".
      // Maybe allow multiple methods
      addInstanceMethod: function addInstanceMethod(type, name, method) {
         var params;
         params = normalizeArguments(type, name, method);
         safeMixin(this.getClass(params.module).prototype, params.methods);
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
   // 
   // Note:  for addModuleMethod('Stats.subA.sum', f), need to break at the *last* dot.
   function normalizeArguments(module, name, method) {
      var bindings, regexp;
      bindings = {};
      regexp = /^(.*)\.([^\.]*)$/
      if (typeof method !== 'undefined') {
         bindings[name] = method;
      } else if (typeof name !== 'function') {
         return { module: module, methods: name};
      } else {
         module = module.match(regexp);
         if (module == null) {
            throw new Error('Invalid module method specification in addModuleMethod');
         }
         bindings[module[2]] = name;
         module = module[1];
      } 
      return { module: module, methods: bindings };
   }

   // if third argument omitted, it's a "get" call
   // `path` takes the form 'part1.part2.part3.part4' with 1 or more parts.
   // root is an object, like this.main
   function getSetProperty(root, path, property) {
      if (!Array.isArray(path)) { path = path.split('.'); }
      while (path.length > 1) {
         if (!root.hasOwnProperty(path[0])) {
            throw new Error('bad path: ' + path[0]);
         }
         root = root[path.shift()];
      }
      if (property == null) { // get call
         if (!root.hasOwnProperty(path[0])) {
            throw new Error('bad path: ' + path[0]);
         }
         return root[path[0]];
      }
      // else, throw error if the set would be an over-write
      if (root.hasOwnProperty(path[0])) {
         throw new Error('Warning!!!! Trying to set existing property: ' + path[0]);
      }
      root[path[0]] = property;
      return;
   };

   // Takes an object to mix in to, `obj1`, and an object to mix, `obj2`.
   // Writes to console.error if the objects have any property in common
   // (and doesn't mix that property).
   function safeMixin(obj1, obj2) {
      Object.keys(obj2).forEach(function(key) {
         if (obj1.hasOwnProperty(key)) {
            console.error('Warning!!!! Trying to set existing property: ', key);
         } else {
            obj1[key] = obj2[key];
         }
      });
   };

   return Loader;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
