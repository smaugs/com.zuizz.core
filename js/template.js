(function ($) {
    /**
     * @author Veith Zäch
     * @namespace Tc.Module
     * @class TcTemplate
     * @extends Tc.Module
     */
    Tc.Module.TcTemplate = Tc.Module.extend({

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

            self.initDot();
            this.registerListener(sandbox);
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
        },

        /**
         * Hook function to trigger your events.
         *
         * @method after
         * @return void
         */
        after: function () {

        },

        registerListener: function (sandbox) {
            var $ctx = this.$ctx,
                self = this;

        },

        clearContent: function () {
            var $ctx = this.$ctx,
                self = this;

        },
        loadData: function () {
            var $ctx = this.$ctx,
                self = this;

            $.ajax({
                url: '/rest/***.******.****.templates/.json',
                type: 'GET',
                data: {
                    id: self.id   //int
                },

                statusCode: {
                    200: function (response) {

                        self.renderData(response.data);

                    },
                    204: function (response) {
                        //Es sind keine Daten für die gestellte Anfrage vorhanden.
                    }
                }
            });
        },
        renderData: function (data) {
            var $ctx = this.$ctx,
                self = this;
            $('.textblock').html(self.dot.textblock(data))
            $('.textblock').fadeIn();
        },


        initDot: function () {
            var $ctx = this.$ctx,
                self = this;
            self.dot = {};

            $('script', $ctx).each(function (i, e) {
                var dot = $(e);
                self.dot[dot.attr('name')] = doT.template(dot.html());
            });

        }

    });
})(Tc.$);