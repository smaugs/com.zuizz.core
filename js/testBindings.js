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
            self.logs = new Tc.zu.rest('/rest/com.zuizz.core.logs');
            self.initDot();
            self.autobutton();

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
                console.dir(self.logForm.attributes)
                console.dir(self.logs.modified_attributes)
            });

            $('span', $ctx).blur(function () {
                $(this).trigger('change')
            });
        },

        'tcb-hide': function (e) {
            var $ctx = this.$ctx,
                self = this;
            $(e).hide()
        },
        'tcb-alert': function (e) {
            var $ctx = this.$ctx,
                self = this;
            alert(334)
        },
        'tcb-save': function (e) {
            var $ctx = this.$ctx,
                self = this;
            self.logs.save()
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

                self.logForm = new Tc.zu.bind($ctx, 'log', d.data);

                self.logForm.fields.label.beforeChange = function (val) {
                    $ctx.append('<hr>')
                };

                self.logForm.fields.label.onChange = function (val) {
                    $ctx.append(val)
                };
                self.logForm.onChange = function (a, b, ev) {
                    var d = {};
                    d[a] = b;
                    self.logs.set(d)
                    console.dir(a)
                };

                //self.logForm.data(d.data);
                //self.logForm.set('key','value');
            }})
        }


    });
})(Tc.$);