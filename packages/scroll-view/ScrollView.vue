<template>
    <div
        ref="wrapper"
        class="wrapper"
        :style="`--color: ${color};--size:${remSize};`"
    >
        <div class="content">
            <!-- 下拉刷新 -->
            <div class="refresh-tips" v-if="openRefresh">
                <div v-show="pulling">
                    <slot name="pulling">
                        <div class="tips">{{ pullingText }}</div>
                    </slot>
                </div>
                <div v-show="loosing">
                    <slot name="loosing">
                        <div class="tips">{{ loosingText }}</div>
                    </slot>
                </div>
                <div v-show="refreshing">
                    <slot name="refreshing">
                        <div class="loading-wrapper">
                            <div class="loading"></div>
                            <div class="tips">{{ refreshingTest }}</div>
                        </div>
                    </slot>
                </div>
                <div v-show="success">
                    <slot name="success">
                        <div class="tips">{{ successText }}</div>
                    </slot>
                </div>
            </div>
            <!-- 主体内容 -->
            <slot></slot>
            <!-- 上拉加载 -->
            <div class="load-tips" v-if="openLoad">
                <div v-show="finished">
                    <slot name="finished">
                        <div class="tips">{{ finishedText }}</div>
                    </slot>
                </div>
                <div v-show="!finished && !loading">
                    <slot name="loadingBefore">
                        <div class="tips">{{ loadingBeforeText }}</div>
                    </slot>
                </div>
                <div v-show="!finished && loading">
                    <slot name="loading">
                        <div class="loading-wrapper">
                            <div class="loading"></div>
                            <div class="tips">{{ refreshingTest }}</div>
                        </div>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BScroll from "@better-scroll/core";
import ObserveDOM from "@better-scroll/observe-dom";
BScroll.use(ObserveDOM);
import Pullup from "@better-scroll/pull-up";
BScroll.use(Pullup);
import PullDown from "@better-scroll/pull-down";
BScroll.use(PullDown);

const defaultConfig = {
    probeType: 3,
    // 滚动到顶部或底部的回弹效果
    bounce: false,
    click: true,
    scrollX: false,
    scrollY: true,
    // 开启对 content 以及 content 子元素 DOM 改变的探测
    observeDOM: true,
};
export default {
    name: "ScrollView",
    props: {
        scrollConfig: {
            type: Object,
            default() {
                return {};
            },
        },
        // 提示文案的颜色
        color: {
            type: String,
            default: "#000",
        },
        // 提示文案的字体大小
        size: {
            type: Number | String,
            default: 26,
        },
        // 是否开启上拉加载
        openLoad: {
            type: Boolean,
            default: false,
        },
        // 是否处于加载状态
        loading: {
            type: Boolean,
            required: false,
        },
        // 是否已加载完成
        finished: {
            type: Boolean,
            required: false,
        },
        // 加载前的提示提示文案
        loadingBeforeText: {
            type: String,
            default: "上拉加载更多",
        },
        // 加载过程中的提示文案
        loadingText: {
            type: String,
            default: "加载中",
        },
        // 加载完成后的提示文案
        finishedText: {
            type: String,
            default: "没有更多了",
        },

        // 是否开启下拉刷新
        openRefresh: {
            type: Boolean | Object,
            default: false,
        },
        // 是否处于刷新状态
        refreshing: {
            type: Boolean,
            required: false,
        },
        // 下拉过程的提示文案
        pullingText: {
            type: String,
            default: "下拉刷新",
        },
        // 释放过程的提示文案
        loosingText: {
            type: String,
            default: "手指释放刷新",
        },
        // 刷新过程的提示文案
        refreshingTest: {
            type: String,
            default: "刷新中...",
        },
        // 刷新成功的提示文案
        successText: {
            type: String,
            default: "刷新成功",
        },
        // 刷新成功提示展示时长(ms)
        successDuration: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            pulling: false,
            loosing: false,
            success: false,
            scaleRatio: 1,
        };
    },
    mounted() {
        this.scaleRatio =
            37.5 /
            getComputedStyle(document.documentElement).fontSize.split("px")[0];
        setTimeout(this.__initScroll(), 20);
    },
    methods: {
        // 初始化滚动视图组件
        __initScroll() {
            if (!this.$refs["wrapper"]) {
                return;
            }

            // 合并初始化的配置项
            let config = {};
            if (this.openRefresh) {
                config.bounce = { top: true, bottom: false };
                config.pullDownRefresh = { threshold: 60, stop: 60 };
            }
            config.pullUpLoad = this.openLoad;

            config = Object.assign(
                {},
                defaultConfig,
                this.scrollConfig,
                config
            );
            // 初始化better-scroll
            this.scroll = new BScroll(this.$refs["wrapper"], config);

            this.scroll && this.addEvent();
        },
        addEvent() {
            // 派发滚动事件
            this.scroll.on("scroll", (pos) => {
                this.$emit("scroll", pos);
            });
            if (this.openLoad) {
                // 监听上拉加载事件
                this.scroll.on("pullingUp", this.pullingUpHandler);
            }
            if (this.openRefresh) {
                // 监听下拉刷新事件(3个阶段)
                this.scroll.on("enterThreshold", () => {
                    this.clearStatus();
                    this.pulling = true;
                });
                this.scroll.on("leaveThreshold", () => {
                    this.clearStatus();
                    this.loosing = true;
                });
                this.scroll.on("pullingDown", this.pullingDownHandler);
            }
        },
        // 处理上拉加载
        pullingUpHandler() {
            this.$emit("update:loading", true);
            this.$emit("load");
        },
        // 处理下拉刷新
        pullingDownHandler() {
            this.clearStatus();
            this.$emit("update:refreshing", true);
            this.$emit("refresh");
        },
        // 更新滚动视图组件
        refresh() {
            this.scroll && this.scroll.refresh();
        },
        // 滚动
        scrollToXY(x, y, time = 300) {
            this.scroll && this.scroll.scrollTo(x, y, time);
        },
        // 清除所有的状态
        clearStatus() {
            this.pulling = false;
            this.loosing = false;
            this.success = false;
        },
    },
    computed: {
        remSize() {
            if (!isNaN(Number(this.size)) || this.size.indexOf("px") !== -1) {
                return `${(parseFloat(this.size) / 75) * this.scaleRatio}rem`;
            } else {
                return this.size;
            }
        },
    },
    watch: {
        // 监听到loading结束就刷新
        loading(val) {
            if (!val) {
                this.$nextTick(() => {
                    this.refresh;
                    this.scroll.finishPullUp();
                });
            }
        },
        // 监听到refreshing结束就刷新
        refreshing(val) {
            if (!val) {
                if (this.successDuration < 20) {
                    this.clearStatus();
                    this.success = true;
                    this.$nextTick(this.scroll.finishPullDown);
                } else {
                    this.clearStatus();
                    this.success = true;
                    setTimeout(
                        this.scroll.finishPullDown,
                        this.successDuration
                    );
                }
            }
        },
        // 监听到加载完成后，关闭上拉加载
        finished(val) {
            if (val) {
                this.$nextTick(this.scroll.closePullUp);
            }
        },
    },
};
</script>

<style  scoped>
.wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.wrapper .refresh-tips {
    position: absolute;
    width: 100%;
    transform: translateY(-100%) translateZ(1px);
}

.wrapper .tips {
    padding: rem(44px 0);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color);
    font-size: var(--size);
}

.wrapper .loading-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.wrapper .loading-wrapper .loading {
    width: calc(var(--size) * 1.3);
    height: calc(var(--size) * 1.3);
    border-width: rem(3px);
    border-style: solid;
    border-color: var(--color);
    border-top-color: transparent;
    border-radius: 100%;
    transform-origin: center center;
    animation: circle infinite 0.75s linear;
}

.wrapper .loading-wrapper .tips {
    margin-left: rem(20px);
}

@keyframes circle {
    0% {
        transform: rotate(0);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
