<template>
    <header class="calendar">
        <div>
            <slot name="head"></slot>
            <p>
                <Icon type="ios-arrow-back"
                      size="24"
                      @click="pre"
                      class="pointer" />
                <span v-if="cycle == 'day'">{{operateDate.day_value == today ? '今天' : operateDate.day_text}}</span>
                <span v-else>{{operateDate.week_text}}</span>
                <Icon type="ios-arrow-forward"
                      size="24"
                      @click="next"
                      class="pointer" />
            </p>
            <div class="radio-group">
                <p @click="() => cycle = 'day'" :class="{'checked': cycle == 'day'}">日</p>
                <p @click="() => cycle = 'week'" :class="{'checked': cycle == 'week'}">周</p>
            </div>
            <!-- <RadioGroup v-model="cycle"
                        type="button">
                <Radio label="day">日</Radio>
                <Radio label="week">周</Radio>
            </RadioGroup> -->
        </div>

        <slot></slot>

        <ul class="week-bar"
            v-show="cycle == 'week'">
            <li v-for="(item, index) in weekCalendar"
                :key="index"
                :class="{active: weekSelectIndex == index}">
                <p>{{item.date}}</p>
                <p>{{item.dayTh}}</p>
                <span v-if="item.isToday">今</span>
            </li>
        </ul>

        <p class="back-today"
           v-if="showBackToday"
           @click="backToday">回到今天</p>
    </header>
</template>

<script>
var $moment = require('moment')
$moment.locale('zh-CN')

export default {
    name: 'Calendar',
    props: {
        startDay: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            cycle: 'day',
            operateDate: {
                day_value: '',
                week_start: '',
                week_end: ''
            },
            weekCalendar: [],
            weekSelectIndex: 0,
            today: $moment().format('YYYY-MM-DD')
        }
    },
    computed: {
        selectDate() {
            if (this.cycle == 'day') {
                return this.operateDate.day_value
            } else {
                return this.weekCalendar[this.weekSelectIndex].value
            }
        },
        showBackToday() {
            if (this.cycle == 'day') {
                return this.operateDate.day_value != this.today
            } else {
                // 一周外
                return !($moment().valueOf() > $moment(this.operateDate.week_start).valueOf() && $moment().valueOf() < $moment(this.operateDate.week_end).valueOf())
            }
        }
    },
    watch: {
        operateDate: {
            handler() {
                if (this.cycle == 'day') {
                    this.operateDate.day_text = $moment(this.operateDate.day_value).format('Y年MMMDo')
                } else {
                    let start = $moment(this.operateDate.week_start).format('Y年MMMDo')
                    let end = this.pushZero($moment(this.operateDate.week_end).date())
                    this.operateDate.week_text = start + '-' + end + '日'
                    this.getWeekCalenkar()
                }
            },
            deep: true
        },
        cycle() {
            this.setDefDate()
            this.$nextTick(() => {
                this.returnValue()
            })
        },
        selectDate() {
            this.returnValue()
        },
        startDay() {
            this.setDefDate()
        }
    },
    created() {
        this.setDefDate()
        // 暂时改为周视图
        this.cycle = 'week'
    },
    methods: {
        returnValue() {
            this.$emit('input', {
                cycle: this.cycle,
                day: this.selectDate,
                week: this.weekCalendar.length > 0 ? this.weekCalendar.map(item => item.value) : '',
                weekRange: {
                    start: this.weekCalendar.length > 0 ? this.weekCalendar[0].value : '',
                    end: this.weekCalendar.length > 0 ? this.weekCalendar[this.weekCalendar.length - 1].value : ''
                },
                weekSelectIndex: this.weekSelectIndex
            })
        },
        setDefDate() {
            let date = this.startDay ? this.startDay : $moment()
            if (this.cycle == 'day') {
                this.operateDate.day_value = $moment(date).format('YYYY-MM-DD')
                this.operateDate.day_text = $moment(this.operateDate.day_value).format('Y年MMMDo')
            } else {
                this.operateDate.week_start = $moment(date).startOf('week').format('YYYY-MM-DD')
                this.operateDate.week_end = $moment(date).endOf('week').format('YYYY-MM-DD')
            }
        },
        backToday() {
            this.setDefDate()
        },
        pre() {
            if (this.cycle == 'day') {
                this.operateDate.day_value = $moment(this.operateDate.day_value).subtract(1, 'd').format('YYYY-MM-DD')
            } else {
                this.operateDate.week_start = $moment(this.operateDate.week_start).subtract(7, 'd').format('YYYY-MM-DD')
                this.operateDate.week_end = $moment(this.operateDate.week_end).subtract(7, 'd').format('YYYY-MM-DD')
            }
        },
        next() {
            if (this.cycle == 'day') {
                this.operateDate.day_value = $moment(this.operateDate.day_value).add(1, 'd').format('YYYY-MM-DD')
            } else {
                this.operateDate.week_start = $moment(this.operateDate.week_start).add(7, 'd').format('YYYY-MM-DD')
                this.operateDate.week_end = $moment(this.operateDate.week_end).add(7, 'd').format('YYYY-MM-DD')
            }
        },
        getWeekCalenkar() {
            this.weekCalendar = []
            let weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
            weekArr.forEach((item, index) => {
                this.weekCalendar.push({
                    dayTh: item,
                    value: $moment(this.operateDate.week_start).add(index, 'd').format('YYYY-MM-DD'),
                    date: this.pushZero($moment(this.operateDate.week_start).add(index, 'd').date())
                })
                if($moment(this.operateDate.week_start).add(index, 'd').format('YYYY-MM-DD') == this.today) {
                    this.weekSelectIndex = index
                    this.weekCalendar[index].isToday = true
                }
            })
        },
        pushZero(val) {
            if (val < 10) {
                return '0' + val
            } else {
                return val
            }
        }
    }
}
</script>

<style lang="less" scoped>
@import '../../style-core/settings.less';
.calendar {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    > div:first-child {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 25px 20px;
        > p {
            color: #666;
            font-size: 18px;
            > span {
                margin: 0 5px;
                user-select: none;
            }
        }
    }
    > div.operators {
        display: flex;
        padding: 0 20px 10px 20px;
        > p {
            cursor: pointer;
            padding: 5px 15px;
            background: #eee;
            margin-right: 10px;
            border-radius: 3px;
            &.active {
                color: #fff;
                background: @themeprimary;
            }
        }
    }

    ul {
        padding: 0 20px 0 100px;
        display: flex;
        justify-content: space-between;
        position: relative;
        li {
            position: relative;
            padding-bottom: 5px;
            cursor: pointer;
            > p:first-child {
                font-size: 20px;
            }
            > p:last-child {
                font-size: 14px;
                color: #999;
            }
            &.active {
                border-bottom: 2px solid @themeprimary
            }
            > span {
                position: absolute;
                top: 6px;
                right: -3px;
                background: @themeprimary;
                border-radius: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 15px;
                height: 15px;
                font-size: 10px;
                color: #fff;
            }
        }
    }
    .back-today {
        position: absolute;
        right: 0px;
        bottom: -60px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #ddd;
        padding: 8px 15px;
        background: #fff;
        border-radius: 100px 0 0 100px;
        text-align: center;
        cursor: pointer;
        z-index: 10;
    }
}
.radio-group {
    display: flex;
    border-radius: 3px;
    p {
        padding:3px 10px;
        border: 1px solid #ddd;
        cursor: pointer;
        &.checked {
            border-color:@themeprimary;
        }
        &:first-child {
            border-right: 1px solid @themeprimary;
            border-radius: 3px 0 0 3px;
        }
        &:last-child {
            border-left-width: 0;
            border-radius: 0 3px 3px 0;
        }
    }
}
</style>


