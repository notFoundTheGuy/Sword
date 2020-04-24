<template>
    <table :border="border" :default="!border" class="nowrap">
        <tr v-for="(items, idx) in titles" :key="'a-'+idx">
            <th
                v-for="(item, index) in items"
                :key="'th-'+index"
                :rowspan="item.rows"
                :colspan="item.cols"
                :class="[{ tc: index !== 0 }, item.class]"
            >{{ item.text }}</th>
        </tr>
        <tr
            :class="{ selected: get(activeNode, 'id') == item.id }"
            v-for="(item, index) in list"
            :key="'b-'+index"
            @click="
                (activeNode = item),
                    $emit('click', find(nodes, { id: item.id }))
            "
        >
            <td class="wrap tree-td">
                <div :style="{ 'padding-left': `${item.level * 15}px` }">
                    <template v-if="item.hasChildren">
                        <span class="icons">
                            <i
                                class="iconfont icon-plus"
                                type="arrow-right-b"
                                size="14"
                                v-if="!isOpened(item)"
                                @click.stop="open(item)"
                            ></i>
                            <i
                                class="iconfont icon-min"
                                type="arrow-down-b"
                                size="14"
                                v-else
                                @click.stop="close(item)"
                            ></i>
                        </span>
                    </template>
                    <i v-else class="icon placeholder"></i>
                    <p>{{ head(values(item.row)).text }}</p>
                </div>
            </td>
            <td
                v-for="(cell, index_inner) in drop(values(item.row))"
                :key="'td-'+index_inner"
                class="tc"
                @mouseenter="openPopover($event)"
                @mouseleave="closePopover($event)"
                :class="cell.class"
                :ref="cell.text + index"
            >
                {{ cell.text }}
                <div class="popover" v-if="cell.hover">
                    <i></i>
                    <p>{{ cell.hover.title }}</p>
                    <p>{{ cell.hover.value }}</p>
                </div>
            </td>
            <td class="operates" v-if="item.operates && item.operates.length > 0">
                <span
                    v-for="(operate, index) in item.operates"
                    :key="'arrow-'+index"
                    @click="$emit('operatefn', [operate, item])"
                >{{ operate }}</span>
            </td>
        </tr>
    </table>
</template>
<script>
import head from "lodash/head";
import isEmpty from "lodash/isEmpty";
import keys from "lodash/keys";
import isNil from "lodash/isNil";
import drop from "lodash/drop";
import get from "lodash/get";
import find from "lodash/find";
import values from "lodash/values";

export default {
    name: "tree-table",
    props: {
        nodes: {
            type: Array,
            defualt: []
        },
        border: {
            type: Boolean,
            defualt: false
        },
        fixLeft: {
            type: Number,
            defualt: 1
        },
        fixRight: {
            type: Number,
            defualt: 0
        },
        titles: {
            type: Array,
            defualt: []
        }
    },
    data() {
        return {
            opened: [],
            activeNode: null
        };
    },
    computed: {
        tree() {
            return roundin(this.nodes);
        },
        list() {
            var list = [];
            var vm = this;
            try {
                (function traverse(nodes, ancestors) {
                    nodes.forEach(node => {
                        list = list.concat({
                            level: ancestors.length,
                            id: node.id,
                            row: node.row,
                            title: node.title,
                            hasChildren: !isEmpty(node.children),
                            operates: node.operates,
                            origin: node.origin
                        });
                        if (vm.isOpened(node))
                            traverse(node.children, ancestors.concat(node));
                    });
                })(this.tree, []);
            } catch (e) {
                console.log(e);
            }
            return list;
        }
    },
    methods: {
        drop,
        head,
        values,
        find,
        get,
        // 鼠标悬浮
        openPopover(e) {
            let el = e.target.children[0];
            if (el) {
                el.style.display = "block";
            }
        },
        closePopover(e) {
            let el = e.target.children[0];
            if (el) {
                el.style.display = "none";
            }
        },
        open(node) {
            this.opened = this.opened.concat(node.id);
        },
        close(node) {
            this.opened = this.opened.filter(id => id !== node.id);
        },
        isOpened(node) {
            return !isEmpty(this.opened.filter(id => id == node.id));
        },
        toggle(node) {
            if (this.isOpened(node)) this.close(node);
            else this.open(node);
        }
    }
};
function roundin(arr, id) {
    var children = [];
    var last = [];
    arr.forEach(function(item) {
        if (item.pid == id) children.push(item);
        else last.push(item);
    });
    children.forEach(function(item) {
        var result = roundin(last, item.id);
        item.children = result.children;
        last = result.last;
    });
    return isNil(id) ? children : { children, last };
}
</script>
<style lang="less" scoped>
@import '../../style-core/settings.less';
tr.selected > td {
    // background: #c6e1ff !important;
}
.control {
    font-size: 1.2em;
    cursor: pointer;
    vertical-align: text-bottom;
    margin-right: 3px;
}
.icons {
    display: inline-block;
    cursor: pointer;
}
.icons i {
    color: @themeprimary;
    font-size: 14px;
}
.placeholder {
    display: inline-block;
    width: 14px;
    height: 8px;
}
.select-all-box {
    margin-left: 20px;
}
.operates > span {
    color: #55a8fd;
    cursor: pointer;
    margin-left: 10px;
}

td {
    position: relative;
}
th {
    border: 1px solid #fff;
}
.popover {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    z-index: 21;
    background: #fff;
    padding: 5px 10px;
    box-shadow: 0 0 16px -3px rgba(0, 0, 0, 0.42);
    text-align: left;
    border-radius: 4px;
    display: none;
}
.popover > i:first-child {
    display: block;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    border-right: 6px solid #fff;
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
}
.wrap {
    white-space: normal !important;
}
.tree-td div {
    display: flex;
    align-items: center;
}
.tree-td p {
    line-height: 1.5em;
    padding-left: 5px;
}
.operates span:first-child {
    margin: 0;
}
</style>