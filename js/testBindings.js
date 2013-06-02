(function ($) {
    /**
     * @author Veith Zäch
     * @namespace Tc.Module
     * @class TcTemplate
     * @extends Tc.Module
     */
    Tc.Module.Testbindings = Tc.Module.extend({

        /**
         * Initializes the Default module.
         *
         * @method init
         * @constructor
         * @param {jQuery} $ctx the jquery context
         * @param {Sandbox} sandbox the sandbox to get the resources from
         * @param {String} modId the unique module id
         */
        init: function ($ctx, sandbox, modId) {

            var self = this;

            // call base constructor
            this._super($ctx, sandbox, modId);
            self.connectResources();
            self.initDot();

        },

        connectResources: function () {
            var $ctx = this.$ctx,
                self = this;
            self.logs = new Tc.zu.rest('/rest/com.zuizz.core.logs');
        },


        renderData: function (data) {
            var $ctx = this.$ctx,
                self = this;
            $('.item').html(self.dot.item(data))

        },

        /**
         * Hook function to do all of your module stuff.
         *
         * @method on
         * @param {Function} callback function
         * @return void
         */
        on: function (callback) {
            var $ctx = this.$ctx,
                self = this;
            callback();
            $('button.btn-danger', $ctx).click(function () {
                console.dir(self.logentry.attributes)
                console.dir(self.logs.modified_attributes)
            });

            $('button.btn-primary', $ctx).click(function () {
                self.logentry.set('message','changed');
            });

            $('span',$ctx).blur(function(){ $(this).trigger('change') });
        },

        /**
         * Hook function to trigger your events.
         *
         * @method after
         * @return void
         */
        after: function () {
            var $ctx = this.$ctx,
                self = this;
            $('.item').html(self.dot.item())
            self.logs.get(156, {200: function (d) {
                self.logentry = new Tc.zu.bind($ctx, 'log',d.data);
                self.logentry.onChange = function(a,b){
                    var d={};
                    d[a] = b;
                    self.logs.set(d)
                };

                //self.logentry.data(d.data);
                //self.logentry.set('key','value');
            }})
        }


    });
})(Tc.$);