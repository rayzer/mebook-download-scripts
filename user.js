// ==UserScript==
// @icon         http://mebook.cc/wp-content/themes/a-supercms-3.7/favicon.ico
// @name         mebook download
// @namespace    ray.leex@gmail.com
// @author       Ray
// @description	 Download epub from mebook.cc with one click ( pan.baidu.com )
// @match        *://pan.baidu.com/share/*
// @match        *://mebook.cc/download.php*
// @require      http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js
// @version      0.0.2
// @grant        GM_addStyle
// ==/UserScript==
(function () {
    'use strict';
    /*自定义CSS样式-开始*/
    GM_addStyle('.my_baidu_link{color:red!important;text-decoration:none!important;border: 1px dotted red;padding: 2px;}');
    /*自定义CSS样式-结束*/

    var location = self.location;
    var location_pathname = location.pathname;

    /**
    * 提取网盘链接中的密码
    * str  要匹配的字符串
    * rule 分割符
    */
    var arrayTool = {
        getSplit: function (str, rule) {
			return str.split(rule);
		},
		getUbound: function (array) {
			return (array[array.length - 1]).replace(/(^\s*)|(\s*$)/g, "");
		},
		length: function (array) {
			return array.length;
		}
    };

    /**
    *渲染网盘链接
    */
    function activelink( baidu_pan_link_pattern ) {
        var baidu_pan_password;
        var baidu_pan_link;

        $('.desc').each(function (index, value) {
            var password_pattern = /百度网盘密码[：:]?[ A-Za-z0-9]*/g;

            var password_text = ($(this).html()).match(password_pattern);
            if (password_text) {
                console.log("Found password text: "+ password_text);
                var passArray = arrayTool.getSplit(password_text[0], ":");
                if (passArray.length < 2) {
                    passArray = arrayTool.getSplit(password_text[0],"：");
                }
                baidu_pan_password = arrayTool.getUbound(passArray);
                console.log("Found password text: " + baidu_pan_password);
            }
        });

        $('.list').each(function (index, value) {
            var link = ($(this).html()).match(baidu_pan_link_pattern);
            if (link) {
                var ss = $(this).html();
                ss = ss.replace(baidu_pan_link_pattern, '$&" class="my_baidu_link"');
                $(this).html(ss);

                $(value).find(".my_baidu_link").each(function (i, v) {
                    var o_href = $(v).attr("href");
                    var n_href = o_href + "#" + baidu_pan_password;
                    $(v).attr("href", n_href);
                    baidu_pan_link = n_href;
                    //Debug
                    console.log("URL = " + o_href + " ---- " + "提取码 = " + baidu_pan_password);
                });
            }
        });
        return baidu_pan_link;
    }

    /**
    *提取网盘链接中的密码
    */
    var getCode = function (rule) {
        var code = location.hash.slice(1, 5);
        if ((rule || /([a-z\d]{4})/i.exec(code))) {
            code = RegExp.$1;
        } else code = null;
        return code;
    };

    $(function () {
        //百度网盘链接自动跳转
        if (window.location.href.indexOf("mebook.cc/download.php") != -1 ) {
            //example: href="http://pan.baidu.com/s/1i53So53"
            var baidu_pan_link_pattern = /((?:https?:\/\/)?(?:yun|pan|eyun)\.baidu\.com\/(?:s\/\w*(((-)?\w*)*)?|share\/\S*\d\w*))/g;
            var new_address = activelink(baidu_pan_link_pattern);
            window.location.href=new_address;
        }

        //百度网盘提取码自动补全
        if (location_pathname.indexOf("/share/") != -1 && $("#accessCode") !== null) {
            var code = getCode();
            $('form input').val(code);
            $('form a[title=提取文件]').click();
        }

        //TODO: 百度网盘自动进入目录

        //TODO: 百度网盘自动下载azw3,mobi,epub之一

    });
})();