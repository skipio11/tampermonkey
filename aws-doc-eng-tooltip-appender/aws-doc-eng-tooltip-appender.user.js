// ==UserScript==
// @name         AWS Document English Tooltip Appender
// @namespace    https://github.com/skipio11/tampermonkey/
// @version      0.22
// @updateURL    https://raw.githubusercontent.com/skipio11/tampermonkey/master/aws-doc-eng-tooltip-appender/aws-doc-eng-tooltip-appender.meta.js
// @downloadURL  https://raw.githubusercontent.com/skipio11/tampermonkey/master/aws-doc-eng-tooltip-appender/aws-doc-eng-tooltip-appender.user.js
// @description  This script has a function to display English tooltips in the AWS Korean Document.
// @author       skipio11
// @include      https://docs.aws.amazon.com/ko_kr/*/*/*Guide/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/*guide/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/dev/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/dg/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/ug/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/gsg/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/user/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/mgmt/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/ag/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/red-ug/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/mem-ug/*.html
// @include      https://docs.aws.amazon.com/ko_kr/general/*/gr/*.html
// @exclude      https://docs.aws.amazon.com/ko_kr/*/*/*/*.html?iframe
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        none
// ==/UserScript==

//var $ = window.jQuery;
(function() {
    'use strict';
    var $ = window.jQuery;
    const iframeId = 'en_us_iframe';

    $(document).ready(function(){
        addLocationChangedEvent();
        execute();
    });

    const execute = function(){
        loadEnUsDocument(function(){
            try{
                processDocument();
                addTooltipCss();
            }
            catch(e){
                console.warn(e);
            }
        });
    };

    const loadEnUsDocument = function(callback){
        let enUsDocumentUrl = getEnUsDocumentUrl();

        if($("#"+iframeId).attr('src') == enUsDocumentUrl){
            return;
        }

        if($("#"+iframeId).length > 0){
            $("#"+iframeId).attr('src', enUsDocumentUrl);
            return;
        }

        $('<iframe>', { src: enUsDocumentUrl, id:  iframeId, width:0, height:0, frameborder: 0, scrolling: 'no'}).appendTo('.awsdocs-container');
        $("#"+iframeId).on('load', function(){
            console.info('iframe ready');
            callback(this);
        });
    };

    const processDocument = function(){
        let currentDomRootObj = $('#main-col-body');
        let enUsDomRootObj = $("#"+iframeId).contents().find('#main-col-body');

        let currentMap = makeMapByHeader(removeAwsuiAlert(currentDomRootObj));
        let enUsMap = makeMapByHeader(removeAwsuiAlert(enUsDomRootObj));

        currentMap.forEach(function(currentObjArray, key) {
            let enUsObjArray = enUsMap.get(key);
            if(enUsObjArray == null){
                console.warn('en_us contents missing. ' + key);
            }
            else{
                processByHeader(currentObjArray, enUsObjArray);
            }
        });
    };

    const processByHeader = function(currentObjArray, enUsObjArray){
        let targetTags = ['h1', 'h2', 'h3', 'p'];
        let divTags = ['div'];

        for(let i=0; i<currentObjArray.length && i<enUsObjArray.length; i++){
            var currentObj = currentObjArray[i];
            var enUsObj = enUsObjArray[i];

            if(targetTags.includes(getTag(currentObj))){
                appendTooltip(currentObj, enUsObj);
            }
            if(divTags.includes(getTag(currentObj))){
                processDiv(currentObj.find('p'), enUsObj.find('p'));
                processDiv(currentObj.find('span'), enUsObj.find('span'));
                processDiv(currentObj.find('li'), enUsObj.find('li'));
            }
        }
    };

    const getSummaryTextFromObj = function(objList){
        try{
            return trimText(objList.text()).substring(0, 20);
        }
        catch(e){
        }
    }

    const processDiv = function(currentObjList, enUsObjList){
        if(currentObjList.length != enUsObjList.length){
            console.warn('cannot process div.', getSummaryTextFromObj(currentObjList) + " / " + getSummaryTextFromObj(enUsObjList));
            return false;
        }

        for(let i=0; i<currentObjList.length && i<enUsObjList.length; i++){
            var currentObj = currentObjList.eq(i);
            var enUsObj = enUsObjList.eq(i);

            if(hasChildTags(currentObj, ['p'])){
                continue;
            }

            if(getTag(currentObj) != 'p' && hasParentTags(currentObj, ['p', 'li', 'span', 'code'])){
                continue;
            }

            appendTooltip(currentObj, enUsObj);
        }
    };

    const hasChildTags = function(obj, tagNameArray){
        for(let i=0; i<tagNameArray.length; i++){
            if(obj.find(tagNameArray[i]).length >0) return true;
        }
        return false;
    }

    const hasParentTags = function(obj, tagNameArray){
        for(let i=0; i<tagNameArray.length; i++){
            if(obj.closest(tagNameArray[i]).length >0) return true;
        }
        return false;
    }

    const makeMapByHeader = function(objList){
        const map = new Map();
        let objId = "";
        for(let i=0; i<objList.length; i++){
            let obj = objList.eq(i);
            if(getTag(obj).startsWith('h')){
                objId = obj.attr('id');
                map.set(objId, []);
            }
            map.get(objId).push(obj);
        }
        return map;
    };

    const getTag = function(obj){
        try{
            return obj.prop('tagName').toLowerCase();
        }
        catch(e){
            console.warn(e);
        }
        return '';
    };

    const appendTooltip = function(currentObj, enUsObj){
        currentObj.attr('data-title', trimText(enUsObj.text()));
    }

    const trimText = function(orgText){
        let trimmedText = '';
        orgText.split('\n').forEach(function(val, index, array){
            trimmedText += val.trim() + ' ';
        });
        return trimmedText;
    };

    const removeAwsuiAlert = function(domRootObj){
        // remove awsui-alert
        if(domRootObj.find('awsui-alert').length > 0){
            return domRootObj.children().slice(2);
        }
        return domRootObj.children().slice(1);
    };

    const getEnUsDocumentUrl = function(){
        let currentDocumentUrl = $(location).attr('href');
        let enUsDocumentUrl = currentDocumentUrl.replace("/ko_kr/", "/en_us/");

        enUsDocumentUrl = enUsDocumentUrl.split('#')[0] + '?iframe';

        return enUsDocumentUrl;
    };

    const addTooltipCss = function(){
        let style = `
<style>
[data-title]:hover:after {
opacity: 1;
transition: all 0.1s ease 0.5s;
visibility: visible;
}
[data-title]:after {
content: attr(data-title);
position: absolute;
font-size: 90%;
left: 0%;
top: 105%;
padding: 4px 4px 4px 8px;
color: #222;
border-radius: 3px;
box-shadow: 0px 0px 4px #222;
background-color: #F4F4F4;
opacity: 0;
z-index: 99999;
visibility: hidden;
width: 100%;
}
[data-title] {
position: relative;
}
</style>
`
        $('head').append(style);
    };

    const addLocationChangedEvent = function(){
        history.pushState = ( f => function pushState(){
            var ret = f.apply(this, arguments);
            window.dispatchEvent(new Event('LocationChanged'));
            //console.info('pushState');
            return ret;
        })(history.pushState);

        window.addEventListener('LocationChanged', function(){
            //console.info('LocationChanged triggered');
            execute();
        });
    };
})();