<template>
    <div class="img-card">
        <!-- <div :style="{backgroundImage:`url(${imgUrl})`}"></div> -->
        <div :style="{backgroundImage:`url(${imgUrl})`}"></div>
    </div>
</template>
<script>
export default {
    name: "imgcard",
    props: {
        imgUrl: String
    },
    ratio: {}
};
</script>

<style lang="less" scoped>
.img-card {
    width: 100%;
    height: 100%;
    > div {
        @ratio: 1.3;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        width: 100%;
        height: 100%;
        // padding-top: 100% / @ratio;
    }
}
</style>