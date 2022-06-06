<template>
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
</template>

<script>
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
</script>

<style  scoped>
.test {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
}
.cell {
    height: 108px;
    font-size: 26px;
    border-bottom: 1px solid #ccc;
    line-height: 108px;
    text-align: center;
}
</style>
