<template>
    <div class="container-w" ref="container">
        <template v-for="(imgArr,out_index) in picGroup">
            <template v-if="imgArr.length > 0">
                <img
                    v-for="(item, index) in imgArr"
                    :src="item.url"
                    :key="out_index+'-'+index"
                    :width="item.finalWidth"
                    :height="item.finalHeight"
                />
            </template>
        </template>
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
    name: "imgfill-w",
    props: {
        imglist: {
            type: Array,
            default: () => {
                return [];
            }
        },
        // 设置一个基准高度
        standardHeight: {
            type: Number,
            default: 200
        }
    },
    data() {
        return {
            picGroup: [[]],
            containerWidth: ""
        };
    },
    mounted() {
        this.containerWidth = this.$refs.container.offsetWidth- this.getScrollBarWidth();
        this.computeStandardWidth();
        this.picGroup = this.mapImgGroup();
    },
    methods: {
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
        },
        // 计算基准高度对应的基准宽度并赋值
        computeStandardWidth() {
            this.imglist.forEach(item => {
                item.standardWidth =
                    (this.standardHeight * item.width) / item.height;
            });
        },
        mapImgGroup() {
            const CONTAINER_WIDTH = this.containerWidth;
            const STANDARD_HEIGHT = this.standardHeight;
            let cache = 0;
            let count = 0;
            let picGroup = [[]];
            // 分组{realWidth: '',realHeight: '',url}
            this.imglist.forEach(item => {
                cache += item.standardWidth;
                if (cache > CONTAINER_WIDTH) {
                    cache = item.standardWidth;
                    count++;
                    picGroup.push([]);
                }
                picGroup[count].push(item);
            });

            // 最终调整
            picGroup.forEach(item_outer => {
                var totalWidth = 0;
                item_outer.forEach(item_inner => {
                    totalWidth += item_inner.standardWidth;
                });
                var ratio = totalWidth / CONTAINER_WIDTH;
                item_outer.forEach(item_inner => {
                    // totalWidth / CONTAINER_WIDTH = STANDARD_HEIGHT / finalHeight
                    // ratio = totalWidth / CONTAINER_WIDTH = STANDARD_HEIGHT / finalHeight
                    item_inner.finalHeight = STANDARD_HEIGHT / ratio;
                    // w/h = fw/fh
                    // item_inner.finalWidth = item_inner.standardWidth * item_inner.finalHeight / STANDARD_HEIGHT
                    item_inner.finalWidth = item_inner.standardWidth / ratio;
                });
            });

            return picGroup;
            // 渲染
            picGroup.forEach(item_outer => {
                item_outer.forEach(item_inner => {
                    var img = new Image();
                    img.src = item_inner.url;
                    img.width = item_inner.finalWidth;
                    img.height = item_inner.finalHeight;
                    document.querySelector("#container").appendChild(img);
                });
            });
        }
    }
};
</script>

<style lang="less" scoped>
.container-w {
    font-size: 0;
    img {
        border: 2px solid #fff;
    }
}
</style>