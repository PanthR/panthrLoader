(function(define) {'use strict';
define(function(require) {

   return function mixin(obj, methods) {
      var key;

      for (key in methods) {
         if (methods.hasOwnProperty(key)) {
            obj[key] = methods[key];
         }
      }
   };

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
