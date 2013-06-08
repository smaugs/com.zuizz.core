(function ($) {
    /**
     * Itemlist is a tokenizer, autocomplete and search ding
     *
     *
     * @author Veith Zäch
     * @namespace Tc.Module
     * @class Itemlist
     * @extends Tc.Module
     */
    Tc.Module.Itemlist = Tc.Module.extend({

        /**
         * Initializes the Default module.
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
            var self = this;

            self.initOptions();
            self.initKeys();
            self.updatelock = false;
            self.initElements();
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
            self.highlight = null;

            self.initEnabledBlocks();
            self.initBindings();


            callback();
        },

        /**
         * Hook function to trigger your events.
         *
         * @method after
         * @return void
         */
        after:function () {
            var $ctx = this.$ctx,
                self = this;

            if (self.options.query.runInitialQuery == true) {
                self.queryData(true);
            }

        },
        adjustListHeight:function (height) {
            var $ctx = this.$ctx,
                self = this;
            if (height === 'auto') {
                // höhen setzen
                var list_top = self.list.offset().top;
                var container_bottom = parseInt($ctx.css('height'), 10) + $ctx.offset().top;
                var list_height = container_bottom - list_top - self.options.list.bottom;

                $('div.list', $ctx).css('height', list_height);
                self.listheight = list_height;

            } else {
                $('div.list', $ctx).css('height', height);
            }
        },
        formatResult:function () {

        },
        itemSelect:function (index) {
            var $ctx = this.$ctx,
                self = this;
            self.fire("itemSelected", index);
        },
        itemDeSelect:function (index) {
            var $ctx = this.$ctx,
                self = this;
            self.fire("itemDeSelected", index);
        },

        addToken:function (index) {
            var $ctx = this.$ctx,
                self = this;
            //TODO:: add Token via formatToken
        },
        removeToken:function (index) {
            var $ctx = this.$ctx,
                self = this;
            //TODO:: remove token to tokenlist
        },

        itemHovered:function (data) {
            var $ctx = this.$ctx,
                self = this;
            self.fire("itemHovered", data);
        },
        queryData:function (initialQuery) {
            if (initialQuery === undefined) {
                initialQuery = false;
            }

            var $ctx = this.$ctx,
                self = this;
            if(self.search.val() == ''){
                initialQuery = true;
            }

            if (self.search.val().length < self.options.query.minimumInputLength && !initialQuery) {
                return;
            }
            self.adjustListHeight(this.options.list.height);

            // reset pagination
            self.page = 0;
            self.data = [];
            self.loadingState(true);
            self.list.html('');
            $.ajax({
                url:self.options.query.url,
                type:self.options.method,
                data:self.prepareAjaxData(initialQuery),
                cache:self.options.query.cache,
                statusCode:{
                    200:function (response) {
                        self.data = response[self.options.query.resultArray];

                        $.each(response[self.options.query.resultArray], function (i, record) {

                            self.list.append(self.formatResult(record));
                            // go to first result
                         if(!initialQuery){
                             self.setHighlight(0);
                         }

                        });
                        if (response[self.options.query.resultArray].length == self.options.pagination.limit) {
                            self.updatelock = false;
                        }


                        self.loadingState(false);
                    },
                    204:function () {
                        self.loadingState(false);
                    }
                }
            });


        },
        getMoreData:function () {
            var $ctx = this.$ctx,
                self = this;


            // incrase pagination
            self.page += 1;
            self.loadingState(true);

            $.ajax({
                url:self.options.query.url,
                type:self.options.method,
                data:self.prepareAjaxData(false),
                cache:self.options.query.cache,
                statusCode:{
                    200:function (response) {


                        self.data = self.data.concat(response[self.options.query.resultArray]);


                        $.each(response[self.options.query.resultArray], function (i, record) {
                            self.list.append(self.formatResult(record));
                        });
                        if (response[self.options.query.resultArray].length == self.options.pagination.limit) {
                            self.updatelock = false;
                        }
                        self.loadingState(false);
                    },
                    202:function () {
                        self.loadingState(false);
                    },
                    204:function () {
                        self.loadingState(false);
                    }
                }
            });
        },
        prepareAjaxData:function (init) {
            var $ctx = this.$ctx,
                self = this;

            var ajaxdata = {};
            if (init === true) {
                if (self.options.query.initialQuery !== false && self.search.val() == '') {
                    ajaxdata[self.options.query.parameter] = self.options.query.initialQuery;

                }
                if (self.search.val() != '') {
                    ajaxdata[self.options.query.parameter] = self.search.val();
                }
            } else {
                ajaxdata[self.options.query.parameter] = self.search.val();

                if (self.options.query.initialQuery !== false && self.search.val() == '') {
                    ajaxdata[self.options.query.parameter] = self.options.query.initialQuery;
                }

            }


            if (self.options.query.data !== null) {
                $.extend(true, ajaxdata, self.options.query.data);
            }


            // fields
            if (self.options.query.fields !== null) {
                ajaxdata[self.options.query.fields_parameter] = self.options.query.fields;

            }

            // order
            var order = {};
            order[self.options.order.parameter] = {};
            $('.orderby > button.active', self.order).each(function () {
                var index = $(this).index();
                switch (self.options.order.parameter_mode) {
                    case 'switch':
                        order[self.options.order.parameter] = self.options.order.items[index].key;
                        break;
                    case 'array':
                        order[self.options.order.parameter][self.options.order.items[index].key] = self.options.order.items[index].value;
                        break;

                    case 'prefix':
                        order[self.options.order.parameter + '_' + self.options.order.items[index].key] = self.options.order.items[index].value;
                        break;
                }
            });
            $.extend(true, ajaxdata, order);

            var orderdir = {};

            $('.orderdir > button.active', self.order).each(function () {
                var index = $(this).index();
                orderdir[self.options.order.orderdir.parameter] = self.options.order.orderdir.items[index].value;

            });
            $.extend(true, ajaxdata, orderdir);


            // scope
            var scope = {};
            scope[self.options.scope.parameter] = {};
            $('button.active', self.scope).each(function () {
                var scopeindex = $(this).data('index');

                switch (self.options.scope.parameter_mode) {
                    case 'switch':
                        scope[self.options.scope.parameter] = self.options.scope.items[scopeindex].key;
                        break;
                    case 'array':
                        scope[self.options.scope.parameter][self.options.scope.items[scopeindex].key] = self.options.scope.items[scopeindex].value;
                        break;

                    case 'prefix':
                        scope[self.options.scope.parameter + '_' + self.options.scope.items[scopeindex].key] = self.options.scope.items[scopeindex].value;
                        break;
                }

            });

            $.extend(true, ajaxdata, scope);


            // pagination
            if (self.options.pagination.enable) {
                var pagdata = {};
                if (self.options.pagination.mode === 'offset') {
                    pagdata[self.options.pagination.parameter[1]] = self.page * self.options.pagination.limit;
                }
                if (self.options.pagination.mode === 'page') {
                    pagdata[self.options.pagination.parameter[1]] = self.page;
                }
                pagdata[self.options.pagination.parameter[0]] = self.options.pagination.limit;
                $.extend(true, ajaxdata, pagdata);
            }
            return ajaxdata;
        },
        renderData:function (data) {
            var $ctx = this.$ctx,
                self = this;

        },
        moveHighlight:function (direction) {
            var $ctx = this.$ctx,
                self = this;
            var children = self.list.children();
            // nur verschieben wenn es inhalt hat
            if (children.length > 0) {
                self.highlight += direction;
                if (self.highlight < 0) {
                    self.highlight = 0;
                }
                if (self.highlight + 1 >= children.length) {
                    self.highlight = children.length - 1;

                    if (!self.updatelock) {
                        self.updatelock = true;
                        self.getMoreData();
                    }


                }

                self.setHighlight(self.highlight);
            }
        },
        setHighlight:function (index) {
            var $ctx = this.$ctx,
                self = this;
            self.highlight = index;
            var children = self.list.children();
            // nur verschieben wenn es inhalt hat
            children.removeClass('highlighted');
            children.eq(index).addClass('highlighted');
            // scrollen wenn es ausser sichtweite kommt


            var child, hb, rb, y;
            child = $(children[index]);

            if (index === 0) {
                // if the first element is highlighted scroll all the way to the top,
                // that way any unselectable headers above it will also be scrolled
                // into view

                self.list.scrollTop(0);
                return;
            }

            hb = child.offset().top + child.outerHeight();

            // if this is the last child lets also make sure select2-more-results is visible
            if (index === children.length - 1) {
                if (self.updatelock == false) {
                    self.updatelock = true;
                    self.getMoreData();
                }

            }

            rb = self.list.offset().top + self.list.outerHeight();
            if (hb > rb) {
                self.list.scrollTop(self.list.scrollTop() + (hb - rb));
            }
            y = child.offset().top - self.list.offset().top;

            // make sure the top of the element is visible
            if (y < 0) {
                self.list.scrollTop(self.list.scrollTop() + y); // y is negative
            }
        },
        selectHighlighted:function () {
            var $ctx = this.$ctx,
                self = this;

            if (self.highlight !== null) {

                if (self.options.multiple !== true) {
                    // deselect others if not multiple
                    self.list.children().removeClass('selected');
                }
                if (self.list.children().eq(self.highlight).hasClass('selected')) {
                    // deselect
                    self.list.children().eq(self.highlight).removeClass('selected');
                    self.itemDeSelect(self.highlight);
                    if (self.options.tokenizer === true) {
                        self.removeToken(self.highlight);
                    }
                } else {
                    // select
                    self.list.children().eq(self.highlight).addClass('selected');
                    if (self.options.tokenizer === true) {
                        self.addToken(self.highlight);

                    }

                    self.itemSelect(self.highlight);

                }
            }


        },
        _defaultOptions:{
            "query":{
                "url":"/.json",
                "parameter":"f1010q",
                "method":"GET",
                "minimumInputLength":2,
                "cache":false,
                "debounce":200,
                "data":null, // additional query data, {'key':'value','num':4}
                "fields":['id', 'title', 'info'],
                "resultArray":"results",
                "initialQuery":false,
                "runInitialQuery":true
            },
            "tokenizer":false,
            "multiple":false,
            "pagination":{
                "enable":true,
                "limit":10, // num of requested elements per call
                "mode":"offset", //offset or page, page 3 is offset 30
                "parameter":['limit', 'offset'] // Parameter names for pagination
            },
            "scope":{
                "enable":true, // enable to use scope
                "enable_ui":true, // enable to see the scope ui
                "default":0, // index of per default enabled scope as mirrored bit mask, 0 = none 1 = first 3 = first and second (3=b11 => on on ,4=b100 => off off on 8=b1000 => off off off on)
                "flavour":"radio", // checkbox or radio
                "parameter":"scope", // prefix for scope
                "parameter_mode":"array", // array , prefix or switch , array requests f1_scope[scope1] = value , f1_scope[scope2] = value   prefix requests f1_scopescope1 = value | switch requests f1_scope = scope1 (works with flavour radio only)
                "items":[
                    {"key":"new", "value":true, "label":"New"},
                    {"key":"all", "value":true, "label":"All"}
                ]
            },
            "list":{
                "height":"auto", //auto or height in px, 145
                "bottom":30 //bottom margin in px for autoheight calculations, add order height i.e.
            },
            "order":{
                "enable":true, // enable to use scope
                "enable_ui":true, // enable to see the scope ui
                "enable_order_dir":true, // enables A-z, Z-a buttons
                "default":0, // index of per default enabled scope as mirrored bit mask, 0 = none 1 = first 2 =  second (3=b10 => off on ,4=b100 => off off on 8=b1000 => off off off on)
                "default_order_dir":0,
                "flavour":"radio", // checkbox or radio
                "parameter":"f1010sort", // prefix for scope
                "parameter_mode":"array", // array , prefix or switch , array requests f1_scope[scope1] = value , f1_scope[scope2] = value   prefix requests f1_scopescope1 = value | switch requests f1_scope = scope1 (works with flavour radio only)
                "items":[
                    {"key":"order", "value":true, "label":"Sort Order A"},
                    {"key":"order", "value":true, "label":"Sort Order B"}
                ],
                "orderdir":{
                    "parameter":"f1010order_dir",
                    "items":[
                        {"key":"a-z", "value":"asc", "label":"a-Z", "selected":true},
                        {"key":"z-a", "value":"desc", "label":"z-A"}
                    ]
                }
            },
            formatResult:this.formatResult,
            formatSelection:this.formatSelection,
            formatToken:this.formatSelection
        },
        initOptions:function () {
            var $ctx = this.$ctx,
                self = this;
            var useroptions = $('i.options', $ctx).data();
            self.options = {};
            $.extend(true, self.options, self._defaultOptions);
        },
        initElements:function () {
            var $ctx = this.$ctx,
                self = this;
            self.search = $('input', $ctx);

            self.list = $('div.list', $ctx);
            self.scope = $('div.scope', $ctx);
            self.order = $('div.order', $ctx);
            self.token = $('div.token', $ctx);
        },
        initEnabledBlocks:function () {
            var $ctx = this.$ctx,
                self = this;


            // scope
            if (self.options.scope.enable) {
                if (self.options.scope.enable_ui) {
                    self.scope.show();
                }else{
                    self.scope.hide();
                }

                $.each(self.options.scope.items, function (i, item) {
                    var active = '';
                    // append scope
                    if (item.selected) {
                        active = 'active';

                    }
                    self.scope.append('<button type="button" data-index="' + i + '" class="btn btn-mini ' + active + '">' + item.label + '</button>');
                });


            } else {
                self.scope.hide();
            }
            // token
            if (self.options.tokenizer) {
                self.token.show();
            } else {
                self.token.hide();
            }
            // order
            if (self.options.order.enable) {
                self.order.show();
                $.each(self.options.order.items, function (i, item) {
                    var active = '';
                    // append order
                    if (item.selected) {
                        active = 'active';
                    }
                    $('.orderby', self.order).append('<button type="button" data-index="' + i + '" class="btn btn-mini ' + active + '">' + item.label + '</button>');
                });


            } else {
                self.order.hide();
            }
        },
        initBindings:function () {
            var $ctx = this.$ctx,
                self = this;
            self.installKeyUpChangeEvent(self.search);


            var debounced = self.debounce(function () {
                self.queryData();
            }, self.options.query.debounce);


            self.search.on('mouseup', function () {
                $(this).select();
            });


            self.list.on('scroll', function (e) {

                if (self.list.scrollTop() + self.list.height() > self.list.prop('scrollHeight') - 80 && self.updatelock == false) {

                    self.updatelock = true;
                    self.getMoreData();
                }

            });

            $('button', self.scope).on('click', function () {
                self.search.focus();

                if(self.options.scope.flavour == 'radio'){
                    $('button', self.scope).removeClass('active');
                    $(this).addClass('active');
                }


                // reset and redo search on scope change
                self.queryData(true);
            });

            $('div.orderdir button', self.order).on('click', function () {
                self.search.focus();
                $('div.orderdir button', self.order).removeClass('active');
                $(this).addClass('active');
                // reset and redo search on order change
                self.queryData(true);
            });

            $('div.orderby button', self.order).on('click', function () {
                self.search.focus();
                $('div.orderby button', self.order).removeClass('active');
                $(this).addClass('active');
                // reset and redo search on order direction change
                self.queryData(true);
            });


            self.search.bind("keyup-change", function () {
                debounced();
            });
            self.list.on("hover", 'div', function (e) {
                self.setHighlight($(this).index());
            });

            /*
            self.list.on("click", 'div', function (e) {
                //self.search.focus();

                self.setHighlight($(this).index());
                self.selectHighlighted();
            });
            */

            self.search.bind("keydown", function (e) {
                if (e.which === self.KEY.PAGE_UP || e.which === self.KEY.PAGE_DOWN) {
                    // prevent the page from scrolling
                    killEvent(e);
                    return;
                }
                switch (e.which) {
                    case self.KEY.UP:
                    case self.KEY.DOWN:
                        self.moveHighlight((e.which === self.KEY.UP) ? -1 : 1);
                        break;

                    case self.KEY.TAB:
                    case self.KEY.ENTER:
                        self.selectHighlighted();
                }
            });

        },

        installKeyUpChangeEvent:function (element) {
            var key = "keyup-change-value";
            element.bind("keydown", function () {
                if ($.data(element, key) === undefined) {
                    $.data(element, key, element.val());
                }
            });
            element.bind("keyup", function () {
                var val = $.data(element, key);
                if (val !== undefined && element.val() !== val) {
                    $.removeData(element, key);
                    element.trigger("keyup-change");
                }
            });
        },
        initKeys:function () {
            var $ctx = this.$ctx,
                self = this;

            self.KEY = {
                TAB:9,
                ENTER:13,
                ESC:27,
                SPACE:32,
                LEFT:37,
                UP:38,
                RIGHT:39,
                DOWN:40,
                SHIFT:16,
                CTRL:17,
                ALT:18,
                PAGE_UP:33,
                PAGE_DOWN:34,
                HOME:36,
                END:35,
                BACKSPACE:8,
                DELETE:46,
                isArrow:function (k) {
                    k = k.which ? k.which : k;
                    switch (k) {
                        case KEY.LEFT:
                        case KEY.RIGHT:
                        case KEY.UP:
                        case KEY.DOWN:
                            return true;
                    }
                    return false;
                },
                isControl:function (e) {
                    var k = e.which;
                    switch (k) {
                        case KEY.SHIFT:
                        case KEY.CTRL:
                        case KEY.ALT:
                            return true;
                    }

                    if (e.metaKey) return true;

                    return false;
                },
                isFunctionKey:function (k) {
                    k = k.which ? k.which : k;
                    return k >= 112 && k <= 123;
                }
            };
        },
        debounce:function (func, threshold, execAtBeginning) {
            var timeout;
            return function debounced() {
                var obj = this, args = arguments;

                function delayed() {
                    if (!execAtBeginning) {
                        func.apply(obj, args);
                    }
                    timeout = null;
                }

                if (timeout) {
                    clearTimeout(timeout);
                }
                else if (execAtBeginning) {
                    func.apply(obj, args);
                }

                timeout = setTimeout(delayed, threshold || 500);
            };
        },
        loadingState:function (state) {
            var $ctx = this.$ctx,
                self = this;
            if (state) {
                $ctx.addClass('loading');
            } else {
                $ctx.removeClass('loading');
            }

        }

    });
})(Tc.$);