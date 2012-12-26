(function ($) {
    /**
     * Ticker module implementation.
     *
     * @author Veith Zäch
     * @namespace Tc.Module
     * @class Ticker
     * @extends Tc.Module
     */
    Tc.Module.Ticker = Tc.Module.extend({

        /**
         * Initializes the Ticker module.
         *
         * @method init
         * @constructor
         * @param {jQuery} $ctx the jquery context
         * @param {Sandbox} sandbox the sandbox to get the resources from
         * @param {String} modId the unique module id
         */
        init:function ($ctx, sandbox, modId) {
            // call base constructor
            this._super($ctx, sandbox, modId);
            this._initmoustache();
            var self = this;
            self.data = [];
            self._initmoustache();
            self.duration = {'show':1000, 'pause':10000, hide:1000};
            self.contentElement = $('.content', $ctx);
        },

        /**
         * Hook function to do all of your module stuff.
         *
         * @method on
         * @param {Function} callback function
         * @return void
         */
        on:function (callback) {
            var $ctx = this.$ctx,
                self = this;
            self.loadData();

            // cycle
            self.numOfItems = self.data.length;
            self.currentItem = 0;

            self.startCycle();

            callback();
        },
        startCycle:function () {
            var $ctx = this.$ctx,
                self = this;
            self.contentElement.fadeOut(self.duration.hide,function () {
                self.renderNews(self.currentItem);
            }).delay(200).fadeIn(self.duration.show);


            setTimeout(function () {
                self.startCycle();
            }, (self.duration.pause + self.duration.hide + self.duration.show));
            self.currentItem += 1;
            if (self.currentItem == self.numOfItems) {
                self.currentItem = 0;
            }
        },
        loadData:function () {
            var $ctx = this.$ctx,
                self = this;
            // daten als array
            self.data[0] = {'headline':'headline', 'url':'https://url.com'};



        },

        renderNews:function (index) {
            var $ctx = this.$ctx,
                self = this;

            self.contentElement.html(self.handlebar.ticker(self.data[index]));
        },
        /**
         * Hook function to trigger your events.
         *
         * @method after
         * @return void
         */
        after:function () {

        },
        moustache:{},
        handlebar:{},
        _initmoustache:function () {
            // moustaches und Handlebars aufbauen
            var $ctx = this.$ctx,
                self = this;
            $('script', $ctx).each(function (i, e) {
                var moustache = $(e);
                var name = moustache.attr('name');
                self.moustache[name] = moustache.html();
                self.handlebar[name] = Handlebars.compile((moustache.html()));
            });


        }

    });
})(Tc.$);

function tiledisco() {
    var frontarr = jQuery("DIV.listcontent li");

    for (var i = 0; i < 100; i++) {
        frontarr.each(function () {
            jQuery(this).css("background", "none repeat scroll 0 0 " + randomColor());
            var self = this;
            setTimeout(function () {
                jQuery(self).css("background", "none repeat scroll 0 0 " + randomColor());
                jQuery(self).hover();
            }, i * 500);
        });
    }


}

function randomColor() {
    return "#" + Math.floor(Math.random() * 16777216).toString(16);
}
var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";
$(document).keydown(function(e) {
    kkeys.push( e.keyCode );
    if ( kkeys.toString().indexOf( konami ) >= 0 ){
        $(document).unbind('keydown',arguments.callee);
        tiledisco();



    }
});