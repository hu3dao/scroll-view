<template>
    <div class="activity">
        <!-- 滚动区域 -->
        <scroll-view
            :openLoad="true"
            :loading.sync="loading"
            :finished="finished"
            :openRefresh="true"
            :refreshing.sync="refreshing"
            :successDuration="500"
            color="#666"
            size="20"
            @load="onLoad"
            @refresh="onRefresh"
            ref="scrollView"
        >
            <div slot="pulling" class="pulling-wrapper">下拉刷新</div>
            <div slot="loosing" class="loosing-wrapper">释放刷新</div>
            <div slot="refreshing" class="refreshing-wrapper">刷新中</div>
            <div slot="success" class="success-wrapper">成功</div>
            <div class="cell" v-for="i in list" :key="i">{{ i }}</div>
            <div slot="loading" class="loading-wrapper">加载中</div>
            <div slot="finished" class="finished-wrapper">加载完毕</div>
            <div slot="loadingBefore" class="loadingBefore-wrapper">
                上拉加载
            </div>
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
    created() {
        this.onLoad();
    },
};
</script>

<style  scoped>
.activity {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
}
.cell {
    height: 38px;
    font-size: 18px;
    border-bottom: 1px solid #ccc;
    line-height: 38px;
    text-align: center;
}
.loading-wrapper {
    padding: 50px 0;
    text-align: center;
    color: skyblue;
}
.finished-wrapper {
    padding: 30px 0;
    text-align: center;
    color: yellow;
}
.loadingBefore-wrapper {
    padding: 80px 0;
    text-align: center;
    color: red;
}
</style>
