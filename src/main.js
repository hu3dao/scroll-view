import Vue from "vue"
import App from "./App.vue"
import ScrollView from "../packages/scroll-view";

Vue.use(ScrollView)

new Vue({
    el: "#app",
    render: h => h(App)
}).$mount()