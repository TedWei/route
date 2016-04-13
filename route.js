/**
*name:route
*depends: js [zepto,utils]
*depends: css none
*depends:  
*html template example:
*target:<div id="target"><main...</main></div>
*write all ajax page load content in main
*events bind on like this
*   <a href="/index.html" data-route="/index.html" route-target="#weui_tab_bd">
*
* use it:
* requirejs(['/js/components/route/route.js'], function(route) {
*     route();
* })
*
**/
define(['zepto', 'utils'], function($, utils) {
	var routes={};
    window.onpopstate = function(e) {
        window.popstateTimer && clearTimeout(window.popstateTimer);
        window.popstateTimer = setTimeout(function() {
            location.href=location.href;
        }, 200);
    }
    $(window).on("hashchange", function() {
        window.popstateTimer && clearTimeout(window.popstateTimer);
    });

    function Route(options) {
        var self = this;
        if (!options || !options.routes) {
            $('body [data-route]').each(function(index, el) {
                var route = {};
                route.url = $(el).attr('href');
                route.temp = $(el).attr('data-route');
                route.target = $(el).attr('route-target');
                route.el = el;
                self.updateRoute(route);
            });
        }
        var _default = {
            routes: routes
        }
        var settings = $.extend(_default, options);
        routes = settings.routes;
        self.settings = settings;
    }
    Route.prototype.updateActive = function(route) {
        var target = route.target;
        routes[target].activeRoute = route;
    }
    function diffRoute(a,b){
    	var diffs = ['el','target','url','temp'];
    	for (var i = diffs.length - 1; i >= 0; i--) {
    		var diff = diffs[i];
    		if(a[diff] !=b[diff]){
    			return false;
    		}
    	}
    	return true;
    }
    Route.prototype.updateRoute = function(route){
    	var target = route.target;
    	routes[target] = routes[target] || {};
    	routes[target]['binds'] = routes[target]['binds'] || []
    	var binds = routes[target]['binds'] || [];
    	for (var i = binds.length - 1; i >= 0; i--) {
    		if (diffRoute(binds[i],route)){
    			return false;
    		}
    	}
    	routes[target]['binds'].push(route);
    	Route.prototype.bindRoute(route.el,route);
    }
    Route.prototype.isActive = function(route) {
        var target = route.target;
        return routes[target].activeRoute == route;
    }
    Route.prototype.bindRoute = function(dom, route) {
        var self = this;
        $(dom).on('click', function(e) {
            e.preventDefault();
            if (self.isActive(route)) {
                return false;
            } else {
                self.updateActive(route);
            }
            $(route.target).addClass('loading');
            self.loadPage(route);
        })
    }

    function init(options) {
        return new Route(options)
    }

    Route.prototype.loadPage = function(route) {
        var self = this;
        var promise = $.ajax({
            url: route.url,
            success: function(data, xhr) {
                $(route.target).removeClass('loading').find('main').replaceWith(data.substring(data.indexOf('<main'), data.indexOf('</main>') + 10));
                utils.init(); //更新query参数
                utils.Ajat.run(); //重新执行ajat渲染
                $('body').trigger("asynhash");
                $(route.target).trigger('load');
                self.updateActive(route);
                utils.initForm();
                history.pushState({}, document.title, route.url);
                init()
            }
        });
        promise.fail(function(xhr, status) {
            if (status == "abort") return;
            var msg;
            switch (status) {
                case 'parsererror':
                    msg = "数据响应格式异常!";
                    break;
                case 'timeout':
                    msg = "数据响应格式异常!";
                    break;
                case 'offline':
                    msg = "数据响应格式异常!";
                    break;
                default:
                    msg = "请求失败，请稍后再试!"
                    break;
            }
            lib.popup.result({ bool: false, text: msg });
        });
    }
    return init
})
