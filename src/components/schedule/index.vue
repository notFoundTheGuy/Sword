<template>
    <div class="schedule" :style="{width: isCollapse ? '60px':'500px'}">
        <template v-if="!isCollapse">
            <calendar v-model="curDate" :startDay="startDay">
                <template v-slot:head>
                    <!-- <Icon type="md-menu"
                          size="28"
                          @click="isCollapse = !isCollapse"
                    class="pointer" />-->
                    <i class="iconfont icon-enabled menu-icon" @click="isCollapse = !isCollapse"></i>
                </template>
                <div class="operators">
                    <p
                        v-for="(item, index) in dealedOperators"
                        :key="index"
                        @click="setOperator(item)"
                        :class="{active: curOperator.id == item.id}"
                    >{{item.name}}</p>
                </div>
            </calendar>
            <section ref="timeWrapper">
                <ul>
                    <li v-for="(item, index) in timeLineArr" :key="index">
                        <label>{{item.label}}</label>
                        <p></p>
                    </li>
                </ul>
                <div
                    class="time-wrapper"
                    v-for="(busyTimes,weekIndex) in curOperator.busyTimesArr"
                    :key="'week'+weekIndex"
                >
                    <template v-if="curDate.cycle == 'day'">
                        <p
                            class="time-now"
                            v-if="curDate.day == today"
                            :style="{top: now.positionY+'px'}"
                        ></p>
                        <!-- dayTimeList -->
                        <div v-for="(item, index) in dayTimeGroup" :key="'group'+index">
                            <p
                                class="time-block"
                                v-for="(item, index) in item.children"
                                :key="'time'+index"
                                :class="{active: item.active, clash: item.isClash}"
                                :title="item.label ? item.label : `${ subject } ${interviewTypeName} ${item.start} - ${item.end} ${interviewModeName}`"
                                :style="{top: item.positionY+'px',height: item.height+'px',lineHeight: item.height+'px'}"
                            >
                                <template
                                    v-if="item.height > 20 && curDate.cycle != 'week'"
                                >{{item.label ? item.label : `${ subject } ${interviewTypeName} ${item.start} - ${item.end} ${interviewModeName}`}}</template>
                            </p>
                        </div>
                    </template>
                    <template v-else>
                        <p
                            class="time-now"
                            v-if="curDate.week && curDate.week[weekIndex] == today"
                            :style="{top: now.positionY+'px'}"
                        ></p>
                        <!-- weekTimeList -->
                        <div
                            v-for="(item, index) in weekTimeGroups[weekIndex]"
                            :key="'group'+index"
                        >
                            <p
                                class="time-block"
                                v-for="(item, index) in item.children"
                                :key="'time'+index"
                                :class="{active: item.active, clash: item.isClash}"
                                :title="item.label ? item.label : `${ subject } ${interviewTypeName} ${item.start} - ${item.end} ${interviewModeName}`"
                                :style="{top: item.positionY+'px',height: item.height+'px',lineHeight: item.height+'px'}"
                            >
                                <template
                                    v-if="item.height > 20 && curDate.cycle != 'week'"
                                >{{item.label ? item.label : `${ subject } ${interviewTypeName} ${item.start} - ${item.end} ${interviewModeName}`}}</template>
                            </p>
                        </div>
                    </template>
                    <!-- busytimeList -->
                    <p
                        class="busy-time-block"
                        v-for="(item, index) in busyTimes"
                        :key="'busytime'+index"
                        :class="{active: item.active}"
                        :style="{top: item.positionY+'px',height: item.height+'px',lineHeight: item.height+'px'}"
                    ></p>
                </div>
            </section>
        </template>
        <template v-else>
            <div class="menu-wrap">
                <i class="iconfont icon-enabled menu-icon" @click="isCollapse = !isCollapse"></i>
            </div>
        </template>
    </div>
</template>

<script>
import Calendar from "./Calendar.vue";
import cloneDeep from "lodash/cloneDeep";
var $moment = require("moment");
$moment.locale("zh-CN");
export default {
    name: "schedule",
    props: {
        distance: {
            type: Number,
            default: 60
        },
        timeList: {
            type: Array,
            default: []
        },
        operators: {
            type: Array,
            default: []
        },
        collapse: {
            type: Boolean,
            default: true
        },
        interviewTypeName: {
            type: String,
            default: ""
        },
        interviewModeName: {
            type: String,
            default: ""
        },
        subject: {
            type: String,
            default: '正在安排事项'
        }
    },
    data() {
        return {
            startTime: 0,
            endTime: 24,
            range: {
                start: 0,
                end: 24
            },
            // 一小时时间间隔的高度
            cellHeight: 40,
            dealedOperators: [],
            curOperator: null,
            isCollapse: true,
            curDate: {},
            startDay: "",
            today: $moment().format("YYYY-MM-DD"),
            // 过滤过的timeList
            filteredTimeList: []
        };
    },
    components: { Calendar },
    computed: {
        // 左侧时间线条
        timeLineArr() {
            let arr = [];
            let stepSize = this.distance / 60;
            for (let i = this.range.start; i <= this.range.end; i += stepSize) {
                arr.push({
                    count: i,
                    // 转换：eg:11.5 -> 11:30
                    label: parseInt(i) + ":" + this.pushZero((i % 1) * 60)
                });
            }
            return arr;
        },
        now() {
            let time = $moment().format("HH:mm");
            let positionY = this.getPositionYByTime(time);
            return {
                time: time,
                positionY: positionY
            };
        },
        dayTimeGroup() {
            let filteredTimeList = cloneDeep(this.filteredTimeList);
            return this.buildGroup(this.setComputedItems(filteredTimeList));
        },
        weekTimeGroups() {
            let timeList = cloneDeep(this.timeList);
            let Groups = [];
            if (this.curDate.week) {
                this.curDate.week.forEach(day => {
                    let curDayTimes = timeList.filter(
                        item => item.date === day
                    );
                    Groups.push(
                        this.buildGroup(this.setComputedItems(curDayTimes))
                    );
                });
            }
            return Groups;
        }
    },
    watch: {
        dayTimeGroup: {
            handler() {
                let curTimeObj = "";
                this.dayTimeGroup.forEach(group => {
                    group.children.forEach(item => {
                        if (item.active) {
                            curTimeObj = item;
                        }
                    });
                });

                this.locateTo(curTimeObj);
            }
        },
        operators: {
            handler() {
                // 整合 ‘全部’人员
                let allTime = [];
                for (
                    let i = 0;
                    i < this.operators[0].busyTimesArr.length;
                    i++
                ) {
                    allTime[i] = [];
                }
                this.operators.forEach(item => {
                    item.busyTimesArr.forEach((timeArr, index) => {
                        allTime[index] = allTime[index].concat(timeArr);
                    });
                });
                this.dealedOperators = [
                    {
                        name: "全部",
                        id: "All",
                        busyTimesArr: allTime
                    }
                ].concat(this.operators);

                // 计算位置
                this.dealedOperators.forEach(item => {
                    item.busyTimesArr = item.busyTimesArr.map(
                        (times, index) => {
                            return this.setComputedItems(times);
                        }
                    );
                });

                this.curOperator = this.dealedOperators[0];
            },
            immediate: true
        },
        collapse: {
            handler() {
                this.isCollapse = this.collapse;
            },
            immediate: true
        },
        isCollapse(oldval, newVal) {
            this.$emit("openStatusChange", newVal);
        },
        curDate() {
            this.$emit("dateChange", this.curDate);
            this.setFilteredTimeList();
            this.updateClashStatus();
        },
        timeList: {
            handler() {
                this.setMinDate();
                this.setFilteredTimeList();
                // this.filteredTimeList = cloneDeep(this.timeList)
                this.$nextTick(() => {
                    this.updateClashStatus();
                });
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        // 从最小的一天开始
        setMinDate() {
            let dateArr = this.timeList.map(item => $moment(item.date));
            this.startDay = $moment.min
                .apply(this, dateArr)
                .format("YYYY-MM-DD");
        },
        setFilteredTimeList() {
            this.filteredTimeList = cloneDeep(this.timeList).filter(
                item => item.date === this.curDate.day
            );
        },
        pushZero(num) {
            if (Number(num) < 10) {
                return "0" + num;
            } else {
                return num;
            }
        },
        // 计算每个元素位置和时间跨度
        setComputedItems(arr) {
            return arr.map((item, index) => {
                item.positionY = this.getPositionYByTime(item.start);
                item.height = item.duration * (this.cellHeight / 60);
                this.$set(
                    item,
                    "end",
                    this.getEndTime(item.start, item.duration)
                );
                this.$set(
                    item,
                    "range",
                    this.getMinutesRange(item.start, item.end)
                );
                return item;
            });
        },
        // 分组，处理相交情况
        buildGroup(timeArr) {
            let dayTimeGroup = [];
            timeArr.forEach(item => {
                let timeStart = item.range[0];
                let timeEnd = item.range[1];
                let isCross = dayTimeGroup.some(group => {
                    // 相交判断
                    if (
                        this.isRangeCross(item.range, [group.start, group.end])
                    ) {
                        group.start =
                            timeStart > group.start ? group.start : timeStart;
                        group.end = timeEnd > group.end ? timeEnd : group.end;
                        group.children.push(item);
                        return true;
                    }
                });
                if (!isCross) {
                    dayTimeGroup.push({
                        start: timeStart,
                        end: timeEnd,
                        children: [item]
                    });
                }
            });
            return dayTimeGroup;
        },
        getPositionYByTime(time) {
            // eg: time-11:25
            let hours = Number(String(time).split(":")[0]);
            let minutes = Number(String(time).split(":")[1]);
            return hours * this.cellHeight + (minutes / 60) * this.cellHeight;
        },
        getEndTime(start, duration) {
            let startHours = Number(String(start).split(":")[0]);
            let startMinutes = Number(String(start).split(":")[1]);
            let endHours =
                startHours + parseInt((startMinutes + duration) / 60);
            let endMinutes = (startMinutes + duration) % 60;
            if (endHours >= 24) {
                return "00:00";
            }
            return endHours + ":" + endMinutes;
        },
        // 获取分钟数范围---用于判断相交
        getMinutesRange(start, end) {
            return [this.getMinutes(start), this.getMinutes(end)];
        },
        // 1:10 => 70
        getMinutes(timeStr) {
            return (
                Number(timeStr.split(":")[0]) * 60 +
                Number(timeStr.split(":")[1])
            );
        },
        locateTo(curTimeObj) {
            const PADDING = 20;
            if (curTimeObj) {
                let wrapper = this.$refs.timeWrapper;
                if (wrapper) {
                    wrapper.scrollTop = curTimeObj.positionY - PADDING;
                }
            }
        },
        // 设置面试官
        setOperator(item) {
            this.curOperator = item;
            this.updateClashStatus();
        },
        // [100,200],[199,300] true
        isRangeCross(range1, range2) {
            return (
                (range2[0] <= range1[0] && range1[0] <= range2[1]) ||
                (range2[0] <= range1[1] && range1[1] <= range2[1]) ||
                (range1[0] <= range2[0] && range1[1] >= range2[1])
            );
        },
        updateClashStatus() {
            let busyTimes =
                this.curDate.cycle == "day"
                    ? this.curOperator.busyTimesArr[0]
                    : this.curOperator.busyTimesArr[
                          this.curDate.weekSelectIndex
                      ];
            if (!busyTimes) return;
            this.setComputedItems(this.filteredTimeList);
            this.filteredTimeList.forEach(item => {
                let timeStart = item.range[0];
                let timeEnd = item.range[1];
                let isCross = busyTimes.some(busyItem => {
                    // 相交判断
                    return this.isRangeCross(item.range, busyItem.range);
                });
                item.isClash = isCross;
            });
        }
    }
};
</script>

<style lang="less" scoped>
.schedule {
    position: fixed;
    top: 0;
    right: 0;
    background: #fff;
    height: 100%;
    width: 600px;
    z-index: 9999;
    box-shadow: -4px 0px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s linear;
    > .menu-wrap {
        padding: 25px 20px;
    }
    > section {
        height: calc(~"100% - 140px");
        overflow-y: auto;
        overflow-x: hidden;
        padding: 15px 0;
        @cellHeight: 40px;
        display: flex;
        ul {
            li {
                display: flex;
                height: @cellHeight;
                label {
                    width: 100px;
                    text-align: right;
                    padding-right: 15px;
                    position: relative;
                    top: -10px;
                }
                p {
                    flex: 1;
                    &::after {
                        content: "";
                        display: block;
                        background: #ddd;
                        height: 1px;
                        width: 100%;
                    }
                }
            }
        }
        .time-wrapper {
            position: relative;
            flex: 1;
            > .time-now {
                position: absolute;
                background: #55a8fd;
                width: 100%;
                height: 2px;
                &::before {
                    content: "";
                    display: block;
                    border-radius: 100px;
                    width: 8px;
                    height: 8px;
                    position: relative;
                    top: -3px;
                    background: #55a8fd;
                }
            }
            > div {
                display: flex;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                .time-block {
                    margin-right: 1px;
                    flex: 1;
                    position: relative;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: #8b55db;
                    background-color: rgba(139, 85, 219, 0.15);
                    border-radius: 3px;
                    transition: all 0.3s;
                    padding: 0 10px;
                    z-index: 5;
                    &.active {
                        border-left: 4px solid #8b55db;
                    }
                    &:hover {
                        transform: scale(1.02);
                    }
                    &.clash {
                        color: #ff8054;
                        background-color: rgba(231, 102, 59, 0.2);
                    }
                    &.active.clash {
                        border-left: 4px solid #ff8054;
                    }
                }
            }
            .busy-time-block {
                transition: all 0.3s;
                position: absolute;
                width: 100%;
                background-color: rgba(62, 116, 230, 0.1);
                z-index: 4;
                border-radius: 3px;
            }
        }
    }

    .menu-icon {
        font-size: 22px;
        cursor: pointer;
    }
}
</style>
