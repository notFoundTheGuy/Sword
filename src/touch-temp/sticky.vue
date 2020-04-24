<template>
    <!-- 占位 -->
    <div class="sticky-container" id="sticky" :style="{height:height+'px',top:offset+'px'}">
        <div :class="{topFixed:isTopFixed}" :style="{top:offset+'px'}">
            <slot></slot>
        </div>
    </div>
</template>
<script>
export default {
    name: 'sticky',
    props: {
        height: {
            type: [Number,String],
            default: 0
        },
        offset: {
            type: [Number,String],
            default: 0
        }
    },
    data() {
        return {
            topDistance: '',
            isTopFixed: false
        }
    },
    mounted() {
        window.onload = this.addScrollListener
    },
    destroyed() {
        this.removeScrollListener()
    },
    methods: {
        isAndroid(){
            return true
            let u = navigator.userAgent;
            return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
        },
        // Android的nav粘性实现
        addScrollListener () {
            this.topDistance = document.querySelector('#sticky').offsetTop - this.offset
            console.warn(this.topDistance)
            this.checkNeedFixed()
            if (this.isAndroid()) {
                window.addEventListener('scroll',this.checkNeedFixed)
            }
        },
        removeScrollListener() {
            if (this.isAndroid()) {
                window.removeEventListener('scroll',this.checkNeedFixed)
            }
        },
        checkNeedFixed () {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
            if (scrollTop > this.topDistance) {
                this.isTopFixed = true
            }else {
                this.isTopFixed = false
            }
        },

    }
}
</script>
<style lang="less" scoped>
// 注意定位问题导致的提前固定offsetTop = 0
.sticky-container {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 99;
    > div {
        width: 100%;
    }
}
.topFixed {
    position: fixed;
    top: 0;
    left: 0;
}
</style>