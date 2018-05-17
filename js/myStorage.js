//localStorage封装
;(function () {
    //暴露接口
    window.ms = {
        set: set,
        get: get
    };
    function set(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }
    function get(key) {
        var json = localStorage.getItem(key);
        if(json) {
            return JSON.parse(json);
        }
    }
})();