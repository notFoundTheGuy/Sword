<template>
    <div class="picker">
        <div class="wrap" ref="wrap">
            <table>
                <tr class="year-row">
                    <td
                        v-for="(item,index) in dateArr"
                        :key="index"
                        :colspan="item.monthCount"
                    >{{item.year}}</td>
                </tr>
                <tr class="month-row">
                    <td
                        v-for="(item, index) in months"
                        :key="index"
                        v-if="!item.disabled"
                        @mousedown="selectStart(item,index,$event)"
                        @mouseover="selecting(item,index,$event)"
                        @mouseup="selectEnd(item,index,$event)"
                        @click="clickSelect(item)"
                        :class="{selected: isExistedInResult(item.year,item.month) > -1 || isExistedInRangeResult(item.year,item.month) > -1}"
                    >{{item.month}}</td>
                    <td
                        v-else
                        @mousedown="selectStart(item,index,$event)"
                        :class="[{disabled: item.disabled}, {'dis-selected': isExistedInOnceSelected(item.year,item.month) > -1}]"
                    >{{item.month}}</td>
                </tr>
            </table>
        </div>
        <button class="mt-10" v-if="hasReset" @click="reset">重置</button>
    </div>
</template>
<script>
export default {
    name: "month-picker",
    props: {
        monthRange: {
            type: Array,
            required: true
        },
        disabledMonths: {
            type: Array,
            default: []
        },
        onceSelectedMonths: {
            type: Array,
            default: []
        },
        width: {
            type: [Number,String],
            default: "100%"
        },
        hasReset: {
            type: Boolean
        }
    },
    data() {
        return {
            dateArr: [],
            months: [],
            canSelect: false,
            result: [],
            rangeResult: [],
            tempResult: [], //用于拖拽反选缓存result
            startIndex: -1,
            endIndex: -1,
            currentOverIndex: -1, // 防止多次触发
            disabledMonthsDealed: [],
            onceSelectedMonthsDealed: []
        };
    },
    computed: {
        resultShow() {
            return this.result.map(item => {
                return `${item.year}-${this.pushZero(item.month)}`;
            });
        }
    },
    watch: {
        result: function() {
            this.$emit("change", this.result, this.resultShow);
        }
    },
    created() {
        this.disabledMonthsDealed = this.toObjArray(this.disabledMonths);
        this.onceSelectedMonthsDealed = this.toObjArray(
            this.onceSelectedMonths
        );
        this.formateMonthRange();
        this.getMonths();
    },
    mounted() {
        document.querySelector("body").addEventListener("mouseup", () => {
            if (this.selectEnd) {
                this.selectEnd();
            }
        });
        // 设置wrap宽度
        this.$refs.wrap.style.width = this.width;
    },
    methods: {
        getMonths() {
            this.pushOnceSelected();
            this.dateArr.forEach(year => {
                year.months.forEach(month => {
                    let isDisabled = this.isDisabled(year.year, month);
                    let isOnceSelected = this.isOnceSelected(year.year, month);
                    this.months.push({
                        year: year.year,
                        month: month,
                        disabled: isDisabled,
                        onceSelected: isOnceSelected
                    });
                });
            });
        },
        pushOnceSelected() {
            this.onceSelectedMonthsDealed.forEach(item => {
                this.result.push(item);
            });
        },
        formateMonthRange() {
            let start = this.monthRange[0];
            let startYear = Number(start.split("-")[0]);
            let startMonth = Number(start.split("-")[1]);
            let end = this.monthRange[1];
            let endYear = Number(end.split("-")[0]);
            let endMonth = Number(end.split("-")[1]);
            for (let i = 0; i <= endYear - startYear; i++) {
                this.dateArr.push({
                    year: startYear + i
                });
            }
            this.dateArr.forEach((item, index) => {
                if (index === 0) {
                    item.monthCount = 13 - startMonth;
                    item.months = [];
                    for (let i = 0; i < 13 - startMonth; i++) {
                        item.months.push(startMonth + i);
                    }
                } else if (index === this.dateArr.length - 1) {
                    item.monthCount = endMonth;
                    item.months = [];
                    for (let i = 0; i < endMonth; i++) {
                        item.months.push(i + 1);
                    }
                } else {
                    item.monthCount = 12;
                    item.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                }
            });
        },
        selectStart(item, index, e) {
            this.canSelect = true;
            this.startIndex = index;
            this.tempResult = JSON.parse(JSON.stringify(this.result));
        },
        selecting(item, index, e) {
            if (!this.canSelect) return;
            this.endIndex = index;
            if (index === this.currentOverIndex) {
                return;
            }
            this.currentOverIndex = index;
            if (this.startIndex < this.endIndex) {
                this.rangeResult = this.months.slice(
                    this.startIndex,
                    this.endIndex + 1
                );
            } else {
                this.rangeResult = this.months.slice(
                    this.endIndex,
                    this.startIndex + 1
                );
            }
            this.filterExisted(item);
        },
        selectEnd(item, index, e) {
            this.canSelect = false;
            this.concatResult();
            this.clearData();
        },
        concatResult() {
            this.rangeResult.forEach(item => {
                if (
                    this.isExistedInResult(item.year, item.month) < 0 &&
                    !item.disabled
                ) {
                    this.result.push(item);
                }
            });
        },
        clearData() {
            this.currentOverIndex = -1;
            this.tempResult = [];
            this.rangeResult = [];
        },
        filterExisted() {
            // 过滤result
            this.result = this.result.filter(item => {
                let existIndex = this.isExistedInRangeResult(
                    item.year,
                    item.month
                );
                if (existIndex < 0) {
                    return true;
                }
            });
            // 过滤rangeResult
            this.tempResult.forEach(item => {
                let existIndex = this.isExistedInRangeResult(
                    item.year,
                    item.month
                );
                if (existIndex > -1) {
                    this.rangeResult.splice(existIndex, 1);
                    return false;
                }
            });
        },
        isExistedInResult(year, month) {
            let existIndex = -1;
            this.result.some((item, index) => {
                if (
                    year === Number(item.year) &&
                    month === Number(item.month)
                ) {
                    existIndex = index;
                    return true;
                }
            });
            return existIndex;
        },
        isExistedInOnceSelected(year, month) {
            let existIndex = -1;
            this.onceSelectedMonthsDealed.some((item, index) => {
                if (
                    year === Number(item.year) &&
                    month === Number(item.month)
                ) {
                    existIndex = index;
                    return true;
                }
            });
            return existIndex;
        },
        isExistedInRangeResult(year, month) {
            let existIndex = -1;
            this.rangeResult.some((item, index) => {
                if (
                    year === Number(item.year) &&
                    month === Number(item.month) &&
                    !item.disabled
                ) {
                    existIndex = index;
                    return true;
                }
            });
            return existIndex;
        },
        clickSelect(item) {
            let existIndex = this.isExistedInResult(item.year, item.month);
            if (existIndex > -1) {
                this.result.splice(existIndex, 1);
            } else {
                this.result.push(item);
            }
        },
        pushZero(num) {
            return num > 9 ? num : "0" + num;
        },
        // ['2016-9']=>[year: 2016,month: 9]
        toObjArray(arr) {
            if (!arr) return [];
            return arr.map(item => {
                return {
                    year: Number(item.split("-")[0]),
                    month: Number(item.split("-")[1])
                };
            });
        },
        isDisabled(year, month) {
            return this.disabledMonthsDealed.some(item => {
                return year === item.year && Number(month) === item.month;
            });
        },
        isOnceSelected(year, month) {
            return this.onceSelectedMonthsDealed.some(item => {
                return year === item.year && Number(month) === item.month;
            });
        },
        reset() {
            this.result = [];
            this.pushOnceSelected();
        }
    }
};
</script>
<style lang="less" scoped>
@import '../../style-core/settings.less';
table {
    border: 1px solid #d8d8d8;
    border-left: none;
    border-collapse: collapse;
    user-select: none;
}
@yearHeight: 40px;
@monthHeight: 60px;
@cellWidth: 30px;
td {
    border-left: 1px solid #d8d8d8;
    border-top: 1px solid #d8d8d8;
    height: @monthHeight;
    width: @cellWidth;
    min-width: @cellWidth;
    text-align: center;
    box-sizing: border-box;
}
.month-row {
    td:hover {
        background: #7992fd;
        color: #fff;
    }
    .disabled,
    .disabled:hover {
        color: #333;
        background: #eee;
    }
    .dis-selected,
    .dis-selected:hover {
        background: #62afff9c;
        color: #333;
    }
    .selected {
        background: @themeprimary;
        background-image: linear-gradient(135deg, #6167f0, #7992fd);
        color: #fff;
    }
}
.year-row td {
    font-size: 15px;
    height: @yearHeight;
    line-height: @yearHeight;
}
.picker {
    user-select: none;
    position: relative;
    @wrapPadding: 10px;
    &::before {
        content: "";
        width: 1px;
        height: @yearHeight + @monthHeight;
        background: #eee;
        position: absolute;
        left: 0;
        top: @wrapPadding;
    }
    &::after {
        content: "";
        width: 1px;
        height: @yearHeight + @monthHeight;
        background: #eee;
        position: absolute;
        right: 0;
        top: @wrapPadding;
    }
    .wrap {
        width: 100%;
        overflow: auto;
        padding: @wrapPadding 0;
        position: relative;
        &::-webkit-scrollbar {
            height: 7px;
            cursor: pointer;
        }
        &::-webkit-scrollbar-thumb {
            cursor: pointer;
            border-radius: 10px;
        }
    }
}
</style>