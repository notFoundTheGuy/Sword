<template>
    <div class="container-h" ref="container">
        <ul>
            <li v-for="(group, index) in imgGroup" :key="'column'+index">
                <img
                    v-for="(item, index) in group.imglist"
                    :key="index"
                    :src="item.url"
                    :width="item.finalWidth"
                    :height="item.finalHeight"
                />
            </li>
        </ul>
    </div>
</template>

<script>
/**
 * imglist结构：
 * [
 *     {
 *          width: '',
 *          height: '',
 *          src: ''
 *      }
 * ]
 *
 */
export default {
    name: "imgfill-h",
    props: {
        imglist: {
            type: Array,
            default: () => {
                return [];
            }
        },
        // 设置一个基准高度
        column: {
            type: Number,
            default: 3
        }
    },
    data() {
        return {
            columnWidth: "",
            imgGroup: []
        };
    },
    mounted() {
        this.initImgGroup();
        this.calcColumnWidth();
        this.addImgs(this.imglist);
    },
    watch: {
        column() {
            this.initImgGroup();
            this.calcColumnWidth();
            this.addImgs(this.imglist);
        }
    },
    methods: {
        initImgGroup() {
            this.imgGroup = [];
            for (let i = 0; i < this.column; i++) {
                this.imgGroup.push({
                    height: 0,
                    imglist: []
                });
            }
        },
        calcColumnWidth() {
            let containerWidth =
                this.$refs.container.offsetWidth - this.getScrollBarWidth();

            this.columnWidth = containerWidth / this.column;
        },
        addImgs(list) {
            list.forEach(imgItem => {
                // 找出最小高度
                let minHeight = Math.min(
                    ...this.imgGroup.map(item => item.height)
                );

                // 计算出图片应该展示的宽高
                let finalWidth = this.columnWidth;
                let finalHeight = (finalWidth / imgItem.width) * imgItem.height;

                this.imgGroup.some(group => {
                    if (group.height === minHeight) {
                        group.imglist.push({
                            url: imgItem.url,
                            finalWidth: finalWidth,
                            finalHeight: finalHeight
                        });
                        group.height += finalHeight;
                        return true;
                    }
                });
            });
        },
        // 获取滚动条宽度
        getScrollBarWidth() {
            var el = document.createElement("p"),
                styles = {
                    width: "100px",
                    height: "100px",
                    overflowY: "scroll"
                },
                i;

            // 这里很巧妙，先定义了一个styles对象，里面写了各种样式值，然后通过for in将这个对象的值赋给p元素的style对象
            // 而不用通过style.width=***等来给p的样式对象赋值。
            for (i in styles) {
                el.style[i] = styles[i];
            }

            // 将元素加到body里面
            document.body.appendChild(el);

            var scrollBarWidth = el.offsetWidth - el.clientWidth;
            //将添加的元素删除
            el.remove();
            return scrollBarWidth;
        }
    }
};
</script>
<style lang="less" scoped>
.container-h {
    font-size: 0;
    img {
        border: 2px solid #fff;
    }

    ul {
        display: flex;
    }
}
</style>