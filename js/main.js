;(function () {
    'use strict';
    var Event = new Vue();
    var remindSound = document.getElementById("remind-sound");
    function copy(obj) {
        return Object.assign({}, obj);
    }
    Vue.component('task', {
        template: '#task-tpl',
        props: ['task'],
        methods: {
            action: function(name, params) {
                    Event.$emit(name, params);
            }
        }
    });
    new Vue({
        el: '#main',
        data: {
            taskList: [],
            lastId: 0,
            currentTask: {},
            inputDetailShow: false,
            noTodo: true,
            noCompleted: true
        },
        mounted: function () {
            var me = this;
            this.taskList = ms.get('taskList') || this.taskList;
            this.lastId = ms.get('lastId') || this.lastId;
            Event.$on('remove', function (id) {
                if(id) {
                    me.remove(id);
                }
            });
            Event.$on('toggleComplete', function (task) {
                if(task) {
                    me.toggleComplete(task);
                }
            });
            Event.$on('setCurrent', function (task) {
                if(task) {
                    me.setCurrent(task);
                }
            });
            Event.$on('toggleDetail', function (task) {
                if(task) {
                    me.toggleDetail(task);
                }
            });
            //提醒
            setInterval(function () {
                me.checkRemind();
            }, 1000);
            this.isEmpty();
        },
        methods: {
            //添加、更新，根据是否有id来区分
            merge: function () {
                var isUpdate = this.currentTask.id;
                if(isUpdate) {
                    var index = this.findIndex(isUpdate);
                    Vue.set(this.taskList, index, copy(this.currentTask));
                }else{
                    var title = this.currentTask.title;
                    if(!title && title !== 0) {
                        return;
                    }
                    var task = copy(this.currentTask);
                    this.lastId++;
                    ms.set('lastId', this.lastId);
                    task.id = this.lastId;
                    task.completed = false;
                    this.taskList.push(task);
                    console.log(task);
                }
                this.resetCurrent();
            },
            toggleInputDetail: function () {
                this.inputDetailShow = !this.inputDetailShow;
            },
            //删除
            remove: function (id) {
                var index = this.findIndex(id);
                this.taskList.splice(index, 1);
            },
            //点击更新，设置当前编辑项
            setCurrent: function (task) {
                this.currentTask = copy(task);
            },
            //点击提交之后清空表单
            resetCurrent: function () {
                this.setCurrent({});
            },
            //根据ID查找索引
            findIndex: function (id) {
                return this.taskList.findIndex(function(item) {
                    return item.id === id;
                });
            },
            toggleComplete: function (id) {
                var index = this.findIndex(id);
                Vue.set(this.taskList[index], 'completed', !this.taskList[index].completed);
            },
            checkRemind: function () {
                var me = this;
                this.taskList.forEach(function(item, index){
                    var remind = item.remind;
                    if(!remind || item.remindConfirmed) {
                        return;
                    }
                    remind = (new Date(remind)).getTime();
                    var now = (new Date(remind)).getTime();
                    if(now >= remind){
                        remindSound.play();
                        var confirmed = confirm(item.title);
                        Vue.set(item, 'remindConfirmed', confirmed);
                    }
                });
            },
            toggleDetail: function (id) {
                var index = this.findIndex(id);
                Vue.set(this.taskList[index], 'showDetail', !this.taskList[index].showDetail);
            },
            isEmpty: function () {
                this.noTodo = !this.taskList.find(function (item) {
                    return item.completed === false;
                });
               this.noCompleted = !this.taskList.find(function (item) {
                    return item.completed === true;
                });
                console.log('this.noTodo:' + this.noTodo + ',this.noCompleted:' + this.noCompleted);
            }
        },
        watch: {
            //taskList一有变化就更新localStorage
            taskList:{
                deep: true,
                handler: function(newVal, oldVal) {
                    if(newVal) {
                        ms.set('taskList', newVal);
                    }else {
                        ms.set('taskList', []);
                    }
                    this.isEmpty();
                }
            }
        }
    });
})();