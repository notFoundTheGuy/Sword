<template>
    <section class="select-wrap">
        <input
            ref="input"
            type="text"
            v-model="hereValue"
            :placeholder="placeholder"
            @focus="inputSearch()"
            @input="inputSearch()"
            @blur="blurFn"
        />
        <ul ref="listPanel" class="list" v-show="listShow">
            <li v-for="(item, index) in listData" :key="index" @click="selecting(item)">
                <slot v-bind="item">{{ textKey ? item[textKey] : item}}</slot>
            </li>
        </ul>
    </section>
</template>
<script>
import debounce from "lodash/debounce";

export default {
    name: "edit-select",
    model: {
        prop: "value",
        event: "input"
    },
    props: {
        value: String,
        textKey: String,
        valueKey: String,
        listData: {
            type: Array,
            default: []
        },
        placeholder: {
            type: String,
            default: ""
        }
    },
    data: () => {
        return {
            hereValue: "",
            list: "",
            listShow: false
        };
    },
    created() {
        this.hereValue = this.value;
    },
    watch: {
        listData: function() {
            this.listShow = this.listData.length > 0;
        },
        hereValue: function() {
            this.$emit("input", this.hereValue);
        },
        listShow: function() {
            if (this.listShow) {
                this.calcListPosition();
                window.addEventListener("scroll", this.calcListPosition);
            } else {
                window.removeEventListener("scroll", this.calcListPosition);
            }
        }
    },
    methods: {
        inputSearch: debounce(function() {
            this.$emit("search", this.hereValue);
        }, 200),
        blurFn() {
            setTimeout(() => {
                this.listShow = false;
            }, 200);
        },
        selecting(selectObj) {
            var value = this.valueKey ? selectObj[this.valueKey] : selectObj;
            this.hereValue = value;
        },
        calcListPosition() {
            var inputEl = this.$refs.input;
            var listEl = this.$refs.listPanel;
            var rect = inputEl.getBoundingClientRect();
            listEl.style.top = rect.bottom + "px";
            listEl.style.left = rect.left + "px";
            listEl.style.width = rect.width + "px";
        }
    }
};
</script>
<style lang="less" scoped>
.select-wrap {
    @li-height: 28px;
    display: inline-block;
    background: #fff;
    position: relative;
    input {
        position: relative;
        z-index: 35;
        width: 100%;
    }
    ul {
        z-index: 30;
        position: fixed;
        margin: 0;
        padding: 5px 0;
        text-align: left;
        background: #fff;
        box-shadow: 0px 0px 10px #999;
        max-height: @li-height * 8 + 10;
        overflow: auto;
        li {
            line-height: @li-height;
            cursor: pointer;
            padding:0 5px;
            &:hover {
                background: #eef6ff;
            }
        }
    }
}
</style>
