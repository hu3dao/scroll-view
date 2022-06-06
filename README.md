# 滚动视图组件
## 介绍
基于[better-scroll.js库](https://better-scroll.gitee.io/docs/zh-CN/)封装的vue2.x滚动视图组件，用于展示上下滚动的页面，解决了ios手机页面快速滚动卡死的问题，同时扩展了下拉刷新和上拉加载的功能，预设了刷新和加载过程每个阶段的插槽，做到极高的定制化
## 快速开始
### 引入
```shell
npm i @husandao/scroll-view -S
```
### 使用
```js
// 项目主入口main.js
import ScrollView from "@husandao/scroll-view";
import "@husandao/scroll-view/dist/style.css"
Vue.use(ScrollView)
```
## 注意事项
better-scroll文档解释了滚动原理：在滚动方向上，第一个子元素的长度超过了容器的长度时就可以滚动，当使用发现滚动不了时，请检查子元素的长度是否超过了容器的长度

<strong style="color: red; font-size: 18px">scroll-view组件内容元素在滚动方向上的长度必须大于容器元素，scroll-view的宽高设置为100%，所以父级元素要给定宽高</strong>

## 代码演示
### 基础用法

```html
<div class="test">
    <!-- 滚动区域 -->
    <scroll-view>
        <div class="cell" v-for="i in list" :key="i">{{ i }}</div>
    </scroll-view>
</div>
```
```js
export default {
    data() {
        return {
            list: [],
            loading: false,
            finished: false,
            refreshing: false,
        };
    },
    methods: {
        onLoad() {
            // 异步更新数据
            // setTimeout 仅做示例，真实场景中一般为 ajax 请求
            // 异步更新数据
            // setTimeout 仅做示例，真实场景中一般为 ajax 请求
            setTimeout(() => {
                for (let i = 0; i < 30; i++) {
                    this.list.push(this.list.length + 1);
                }
            }, 1000);
        }
    },
    created() {
        this.onLoad();
    },
};
```
```css
.test {
    width: 100vw;
    height: 100vh;
    background: #fff;
}
.cell {
    height: 108px;
    font-size: 18px;
    border-bottom: 1px solid #ccc;
    line-height: 108px;
    text-align: center;
}
```
### 上拉加载
scroll-view组件通过loading和finished两个变量控制加载状态。当组件滚动到底部时，scroll-view组件会给父组件抛出load事件同时将父组件的loading设置为true，父组件监听load事件发起异步操作更新数据，数据更新完毕后，将loading设置为false即可。如果数据已经全部加载完了，就将finishe设置为true即可。
```html
<div class="test">
    <!-- 滚动区域 -->
    <scroll-view
        :openLoad="true"
        :loading.sync="loading"
        :finished="finished"
        @load="onLoad"
    >
        <div class="cell" v-for="i in list" :key="i">{{ i }}</div>
    </scroll-view>
</div>
```
```js
export default {
    data() {
        return {
            list: [],
            loading: false,
            finished: false
        };
    },
    methods: {
        onLoad() {
            // 异步更新数据
            // setTimeout 仅做示例，真实场景中一般为 ajax 请求
            setTimeout(() => {
                for (let i = 0; i < 10; i++) {
                    this.list.push(this.list.length + 1);
                }

                // 加载状态结束
                this.loading = false;

                // 数据全部加载完成
                if (this.list.length >= 30) {
                    this.finished = true;
                }
            }, 1000);
        },

    },
};
```
```css
.test {
    width: 100vw;
    height: 100vh;
    background: #fff;
}
.cell {
    height: 108px;
    font-size: 18px;
    border-bottom: 1px solid #ccc;
    line-height: 108px;
    text-align: center;
}
```
### 下拉刷新
scroll-view组件通过refreshing变量控制刷新状态。当组件滚动到顶部时继续下拉一段距离，scroll-view组件会给父组件抛出refresh事件同时将父组件的refreshing设置为true，父组件监听refresh事件进行操作，操作完毕后，将refreshing设置为false即可，表示刷新成功。
```html
<div class="test">
    <!-- 滚动区域 -->
    <scroll-view
        :openRefresh="true"
        :refreshing.sync="refreshing"
        @refresh="onRefresh"
    >
        <div class="cell" v-for="i in list" :key="i">{{ i }}</div>
    </scroll-view>
</div>
```
```js
export default {
    data() {
        return {
            list: [],
            refreshing: false,
        };
    },
    methods: {
        onLoad() {
            // 异步更新数据
            // setTimeout 仅做示例，真实场景中一般为 ajax 请求
            setTimeout(() => {
                if (this.refreshing) {
                    this.list = [];
                    this.refreshing = false;
                }
                for (let i = 0; i < 20; i++) {
                    this.list.push(this.list.length + 1);
                }
            }, 1000);
        },
        onRefresh() {
            this.onLoad();
        },
    },
    created() {
        this.onLoad();
    },
};
```
```css
.test {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
}
.cell {
    height: 108px;
    font-size: 18px;
    border-bottom: 1px solid #ccc;
    line-height: 108px;
    text-align: center;
}
```
### 上拉加载+下拉刷新
完整的组件功能
```html
<div class="test">
    <!-- 滚动区域 -->
    <scroll-view
        :openLoad="true"
        :loading.sync="loading"
        :finished="finished"
        :openRefresh="true"
        :refreshing.sync="refreshing"
        @load="onLoad"
        @refresh="onRefresh"
    >
        <div class="cell" v-for="i in list" :key="i">{{ i }}</div>
    </scroll-view>
</div>
```
```js
export default {
    data() {
        return {
            list: [],
            loading: false,
            finished: false,
            refreshing: false,
        };
    },
    methods: {
        onLoad() {
            // 异步更新数据
            // setTimeout 仅做示例，真实场景中一般为 ajax 请求
            setTimeout(() => {
                if (this.refreshing) {
                    this.list = [];
                    this.refreshing = false;
                }
                for (let i = 0; i < 10; i++) {
                    this.list.push(this.list.length + 1);
                }

                // 加载状态结束
                this.loading = false;

                // 数据全部加载完成
                if (this.list.length >= 30) {
                    this.finished = true;
                }
            }, 1000);
        },
        onRefresh() {
            // 重置加载完毕的状态
            this.finished = false;

            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;
            this.onLoad();
        },
    },
};
```
```css
.test {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
}
.cell {
    height: 108px;
    font-size: 18px;
    border-bottom: 1px solid #ccc;
    line-height: 108px;
    text-align: center;
}
```
### 自定义提示
srcoll-view组件提供了color和size两个props，使用者可以简单的定制提示内容的颜色和font-size，srcoll-view组件使用vw作为单位（以iphone6 750px为基准，使用者也应传入此基准设计稿的值），传入数字（20）或者字符串（20px）,内部会自动转成vw单位，传入的是rem或em则不转换
```html
<div class="test">
    <!-- 滚动区域 -->
    <scroll-view
        :openLoad="true"
        :loading.sync="loading"
        :finished="finished"
        :openRefresh="true"
        :refreshing.sync="refreshing"
        color="skyblue"
        size="40px"
        @load="onLoad"
        @refresh="onRefresh"
    >
        <div class="cell" v-for="i in list" :key="i">{{ i }}</div>
    </scroll-view>
</div>
```
```js
export default {
    data() {
        return {
            list: [],
            loading: false,
            finished: false,
            refreshing: false,
        };
    },
    methods: {
        onLoad() {
            // 异步更新数据
            // setTimeout 仅做示例，真实场景中一般为 ajax 请求
            setTimeout(() => {
                if (this.refreshing) {
                    this.list = [];
                    this.refreshing = false;
                }
                for (let i = 0; i < 10; i++) {
                    this.list.push(this.list.length + 1);
                }

                // 加载状态结束
                this.loading = false;

                // 数据全部加载完成
                if (this.list.length >= 30) {
                    this.finished = true;
                }
            }, 1000);
        },
        onRefresh() {
            // 清空列表数据
            this.finished = false;

            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;
            this.onLoad();
        },
    },
};
```
```css
.test {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
}
.cell {
    height: 108px;
    font-size: 18px;
    border-bottom: 1px solid #ccc;
    line-height: 108px;
    text-align: center;
}
```

srcoll-view组件预设了下拉刷新和上拉加载各阶段的插槽，使用者可以通过插槽自定义提示内容，具有极高的自由度
```html
<div class="test">
    <!-- 滚动区域 -->
    <scroll-view
        :openLoad="true"
        :loading.sync="loading"
        :finished="finished"
        :openRefresh="true"
        :refreshing.sync="refreshing"
        @load="onLoad"
        @refresh="onRefresh"
    >
        <div slot="pulling" class="slot-tips">下拉刷新slot</div>
        <div slot="loosing" class="slot-tips">释放刷新slot</div>
        <div slot="refreshing" class="slot-tips">刷新中slot</div>
        <div slot="success" class="slot-tips">刷新成功slot</div>
        <div class="cell" v-for="i in list" :key="i">{{ i }}</div>
        <div slot="loading" class="slot-tips">加载中slot</div>
        <div slot="finished" class="slot-tips">加载完毕slot</div>
        <div slot="loadingBefore" class="slot-tips">上拉加载slot</div>
    </scroll-view>
</div>
```
```js
export default {
    data() {
        return {
            list: [],
            loading: false,
            finished: false,
            refreshing: false,
        };
    },
    methods: {
        onLoad() {
            // 异步更新数据
            // setTimeout 仅做示例，真实场景中一般为 ajax 请求
            setTimeout(() => {
                if (this.refreshing) {
                    this.list = [];
                    this.refreshing = false;
                }
                for (let i = 0; i < 10; i++) {
                    this.list.push(this.list.length + 1);
                }

                // 加载状态结束
                this.loading = false;

                // 数据全部加载完成
                if (this.list.length >= 30) {
                    this.finished = true;
                }
            }, 1000);
        },
        onRefresh() {
            // 清空列表数据
            this.finished = false;

            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;
            this.onLoad();
        },
    },
};
```
```css
.test {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
}
.cell {
    height: 108px;
    font-size: 18px;
    border-bottom: 1px solid #ccc;
    line-height: 108px;
    text-align: center;
}
.slot-tips {
    padding: 50px 0;
    text-align: center;
    color: red;
    font-size: 32px;
}
```
## API
### props
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
|openLoad|是否开启上拉加载|Boolean|false
| loading | 是否处于加载状态（.sync） | Boolean | false |
| finished | 是否已加载完成 | Boolean | false |
| loadingBeforeText | 加载前的提示提示文案 | String | 上拉加载更多 |
| loadingText | 加载过程中的提示文案 | String | 加载中 |
|finishedText | 加载完成后的提示文案 | String | 没有更多了 |
| openRefresh | 是否开启下拉刷新 | Boolean或Object | false |
| refreshing | 是否处于刷新状态 | Boolean | false |
| pullingText | 下拉过程的提示文案 | String | 下拉刷新 |
| loosingText | 释放过程的提示文案 | String | 手指释放刷新 |
| refreshingText | 刷新过程的提示文案 | String | 刷新中... |
| successText | 刷新成功的提示文案 | String | 刷新成功 |
| successDuration | 刷新成功提示展示时长(ms) | Number | 0 |
| color | 提示文案的颜色 | String | #000 |
| size | 提示文案的字体大小 | Number或String | 28 |

### event
| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ready | better-scroll初始化完成时触发 | 当前better-scroll对象 |
| scroll | 页面滚动时触发 | {x: 当前x轴滚动距离, y: 当前y轴滚动距离} |
| load | 上拉加载时触发 | - |
| refresh | 下拉刷新时触发 | - |

### slots
| 名称 | 说明 | 参数 |
| --- | --- | --- |
| pulling | 下拉过程提示内容 | - |
| loosing | 释放过程顶部内容 | - |
| refreshing | 刷新过程提示内容 | - |
| success | 刷新成功提示内容 | - |
| loadingBefore | 上拉过程提示内容 | - |
| loading | 加载过程提示内容 | - |
| finished | 加载完成提示内容 | - |