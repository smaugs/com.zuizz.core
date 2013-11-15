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
            self.logs = new Tc.zu.rest('/rest/com.zuizz.core.logs/');


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


            $('span', $ctx).blur(function () {
                $(this).trigger('change')
            });
        },
        'tcb-log': function (e) {
            var $ctx = this.$ctx,
                self = this;
            console.dir(self.logForm)
            console.dir(self.logs.modified_attributes)
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
            self.logs.get('vva', {200: function (d) {

                self.logForm = new Tc.zu.bind($ctx, 'log', d.data);

                self.logForm.fields.label.beforeChange = function (val) {
                    $ctx.append('<hr>')
                };
                self.logForm.onChangeAfterFields = function (a, b) {

                };
               // self.logForm.debounceTreshhold = 0;
                self.logForm.set('cb', 'c');
                self.logForm.set('radio', 'option333');
                self.logForm.set('chbox', ['option1', 'option3']);
                self.logForm.set('cbm', ['a', 'd', 'b']);

                self.logForm.fields['cb'] = {'onChange': function (key, val) {
                    $ctx.append(key + ' --> ' + val)

                }};

                self.logForm.fields['label'] = {'onChange': function (key, val) {
                    $('div.progress.progress-success > div.bar').css('width', val.length + '%');

                }};

                self.logForm.fields['chbox'] = {'onChange': function (key, val) {
                    $('div.progress.deblau > div.bar').css('width', val.length*12 + '%');

                }};

                self.logForm.fields['cbm'] = {'onChange': function (key, val) {
                    $ctx.append(key + ' --> ' + val)
                    $('div.progress > div.bar-danger').css('width', val.length*10 + '%');
                }};
                self.logForm.onChange = function (a, b) {
                    var d = {};
                    d[a] = b;
                    self.logs.set(d)


                };

                //self.logForm.data(d.data);
                //self.logForm.set('key','value');
            }})
        }


    });
})(Tc.$);