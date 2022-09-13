<template>
    <div
        ref="wrapper"
        class="wrapper"
        :style="`--color: ${color};--size:${vwSize};`"
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
                            <div class="tips">{{ refreshingText }}</div>
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
                <div v-show="!loading">
                    <slot name="loadingBefore">
                        <div class="tips">{{ loadText }}</div>
                    </slot>
                </div>
                <div v-show="loading">
                    <slot name="loading">
                        <div class="loading-wrapper">
                            <div class="loading"></div>
                            <div class="tips">{{ refreshingText }}</div>
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
    // observeDOM: true,
};
const pullupStateMap = Object.freeze({
  DEFAULT: 0,
  INSIDE: 1,
  OUTSIDE: 2

})
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
            default: 28,
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
        // 本次上拉加载是否有新数据
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
        refreshingText: {
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
            pullupState: pullupStateMap.DEFAULT,
            pullupStateMap,
            loadText: "上拉加载",
            lock: false,
            preMaxScrollY: 0
        };
    },
    mounted() {
        setTimeout(() => {
            this.__initScroll();
            // 如果开启了上拉加载的功能，首次组件渲染完成就通知父组件去拉数据
            if (this.openLoad) {
                this.pullingUpHandler();
            }
             
        }, 20);
    },
    methods: {
        // 初始化滚动视图组件
        __initScroll() {
            if (!this.$refs["wrapper"]) {
                return;
            }

            // 合并初始化的配置项
            let config = {bounce: {top: false, bottom: false}};
            if (this.openRefresh) {
                config.bounce.top = true
                config.pullDownRefresh = { threshold: 60, stop: 60 };
            }
            if(this.openLoad) {
              config.bounce.bottom = true
              config.pullUpLoad = {threshold: -60};
            }
            

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
            // 派发初始化成功事件
            this.$emit("ready", this.scroll);

            // 派发滚动事件
            this.scroll.on("scroll", (pos) => {
                this.$emit("scroll", pos);
                if(this.openLoad) {
                  this.checkPullUpThreshold()
                }
            });
            if (this.openLoad) {
                // 监听上拉加载事件
                // this.scroll.on("pullingUp", this.pullingUpHandler);
                // 监听end事件
                this.scroll.on("touchEnd", () => {
                  if(this.pullupState === this.pullupStateMap.INSIDE) {
                    if(this.lock) return
                    this.lock = true
                    console.log("加载更多");
                    this.scroll.maxScrollY -= 60
                    this.pullingUpHandler()
                  }
                })
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
        // 检查上拉的阈值
        checkPullUpThreshold() {
          if(this.locateInsideThresholdBoundary()) {
            this.pullupState = this.pullupStateMap.INSIDE
            this.loadText = "释放加载更多"
          } else {
            this.pullupState = this.pullupStateMap.OUTSIDE
            this.loadText = "上拉加载"
          }
        },
        // 是否定位在阈值内
        locateInsideThresholdBoundary() {
          return this.scroll.y <= this.scroll.maxScrollY - 60
        },

        // 处理上拉加载
        pullingUpHandler() {
            this.$emit("update:loading", true);
            this.$emit("update:finished", false)
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
        finishPullUp() {
          this.lock = false
        }
    },
    computed: {
        vwSize() {
            if (!isNaN(Number(this.size)) || this.size.indexOf("px") !== -1) {
                return `${parseFloat(this.size) / 7.5}vw`;
            } else {
                return this.size;
            }
        },
    },
    watch: {
        // 监听到loading结束就刷新
        loading(val) {
            if(!val) {
              if(this.finished) {
                this.loadText = "没有更多了"
                setTimeout(() => {
                  this.refresh()
                  this.finishPullUp()
                }, 300)
              } else {
                this.loadText = "加载成功"
                this.$nextTick(() => {
                  this.refresh()
                  this.finishPullUp()
                })
              }
              
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

.wrapper .load-tips {
  position: absolute;
  width: 100%;
  transform: translateZ(1px);
}

.wrapper .tips {
    padding: 34px 0;
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
    box-sizing: border-box;
    width: calc(var(--size) * 1.2);
    height: calc(var(--size) * 1.2);
    border-width: 2px;
    border-style: solid;
    border-color: var(--color);
    border-top-color: transparent;
    border-radius: 100%;
    animation: circle infinite 0.75s linear;
}

.wrapper .loading-wrapper .tips {
    margin-left: 20px;
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
