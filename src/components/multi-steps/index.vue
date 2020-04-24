<template>
    <div>
        <p class="steps-name" style>{{name}}</p>
        <div class="wrapper" :style="{width:width+'px'}" :class="{'has-multi-step':hasMultiStep}">
            <ul class="steps-content">
                <li
                    :class="[{pass: index_0 < stepAfterDeal.current -1},item.status,{active: index_0 === stepAfterDeal.current -1}]"
                    v-for="(item, index_0) in stepAfterDeal.data"
                    :key="index_0"
                >
                    <template v-if="!item.children">
                        <p class="title">
                            <span
                                class="icon"
                                :class="[item.icon,item.status,{active: index_0 === stepAfterDeal.current -1}]"
                            ></span>
                            <span class="text">{{item.title}}</span>
                            <i class="line" v-if="index_0 !== stepAfterDeal.data.length-1"></i>
                        </p>
                        <p class="notes">
                            <span
                                class="w-100 ellipsis inline-block"
                                v-for="(item, index) in item.notes"
                                :key="index"
                            >{{item}}</span>
                        </p>
                    </template>

                    <div v-else class="mul-wrap">
                        <i class="line"></i>
                        <div class="items">
                            <div v-for="(item, index) in item.children" :key="index">
                                <p
                                    class="title"
                                    :class="[{active: index_0 === stepAfterDeal.current -1},{pass: index === stepAfterDeal.subCurrent -1},item.status]"
                                >
                                    <i class="line"></i>
                                    <span
                                        class="icon"
                                        :class="[item.icon,item.status,{active: index_0 === stepAfterDeal.current -1},{pass: index === stepAfterDeal.subCurrent -1}]"
                                    ></span>
                                    <span class="text">{{item.title}}</span>
                                </p>
                                <p class="notes">
                                    <span
                                        class="w-100 ellipsis inline-block"
                                        v-for="(item, index) in item.notes"
                                        :key="index"
                                    >{{item}}</span>
                                </p>
                            </div>
                        </div>
                        <i class="line" v-if="index_0 !== stepAfterDeal.data.length-1"></i>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
export default {
    name: "multi-steps",
    props: {
        current: {
            type: [Number, String],
            default: 0
        },
        name: {
            type: String,
            default: ''
        },
        steps: {
            type: Array,
            default: {}
        },
        width: {
            type: [String, Number]
        }
    },
    data() {
        return {
            hasMultiStep: false
        };
    },
    watch: {
        steps: function() {
            this.update();
        },
        "steps.data": function() {
            this.update();
        }
    },
    computed: {
        stepAfterDeal() {
            let stepsObj = {}
            stepsObj.data = JSON.parse(JSON.stringify(this.steps));
            let curStep = String(this.current);
            stepsObj.current = isNaN(Number(curStep.split("-")[0])) ? 0 : Number(curStep.split("-")[0]);
            stepsObj.subCurrent = isNaN(Number(curStep.split("-")[1])) ? 0 : Number(curStep.split("-")[1]);
            return stepsObj;
        }
    },
    mounted() {
        this.update();
    },
    methods: {
        update() {
            this.$nextTick().then(() => {
                this.delLineBeforeMulti();
                this.checkHasMultiStep();
            });
        },
        delLineBeforeMulti() {
            // 删除多个条目中前step的短线
            [...document.querySelectorAll(".steps-content>li")].forEach(el => {
                el.classList.remove("no-suf-line");
            });
            [...document.querySelectorAll(".mul-wrap")].forEach(el => {
                el.parentElement.previousSibling.classList.add("no-suf-line");
            });
        },
        checkHasMultiStep() {
            this.hasMultiStep = this.steps.some(step => {
                if (step.children) {
                    return step.children.length > 0;
                }
            });
        }
    }
};
</script>
<style lang="less" scoped>
@import '../../style-core/settings.less';

@activeColor: @themeprimary;
@item-padding: 30px;
ul,
li {
    list-style: none;
}
ul {
    display: flex;
    color: #999;
    padding-left: 0;
}
div {
    position: relative;
}
.steps-name {
    font-size: 15px;
    top: 10px;
    font-weight: bold;
}
li {
    @line-color: #999;
    margin-right: 15px;
    .title {
        display: flex;
        align-items: center;
        font-size: 14px;
        min-width: 180px;
        line-height: 22px;
        span,
        i {
            display: block;
        }
        .icon {
            width: 20px;
            height: 20px;
            background-image: url(./assets/error.png);
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
        }
        .text {
            margin: 0 15px 0 8px;
        }
        .line {
            height: 1px;
            flex: 1;
            background-color: @line-color;
            min-width: 30px;
        }
    }
    .notes {
        font-size: 12px;
        color: #999;
        margin-left: 28px;
        max-width: 150px;
        > span {
            display: block;
        }
    }
    .mul-wrap {
        min-height: 180px;
        display: flex;
        align-items: center;
        > i.line {
            height: 1px;
            flex: 1;
            background-color: @line-color;
            width: 30px;
        }
        .items {
            .title {
                min-width: 210px;
                color: #999;
            }
            .title.active,
            .title.pass {
                color: @activeColor;
            }
            .title.error {
                color: #fd5555 !important;
                .icon {
                    background-image: url(./assets/error.png);
                }
            }
            .title.done {
                color: #55a8fd !important;
                .icon {
                    background-image: url(./assets/done.png);
                }
            }
            i.line {
                width: 30px;
                flex: unset;
                margin-right: 15px;
            }
            > div {
                padding: @item-padding 0;
                position: relative;
            }
            .notes {
                margin-left: 73px;
            }
            > div::before {
                content: "";
                display: block;
                width: 1px;
                height: 100%;
                position: absolute;
                left: 0;
                background: @line-color;
            }
            > div:first-child::before {
                top: @item-padding + 11px;
            }
            > div:last-child::before {
                bottom: @item-padding + 11px;
            }
        }
    }
}
.has-multi-step {
    margin-top: -@item-padding - 30px;
    padding-bottom: 15px;
    ul {
        align-items: center;
    }
    .notes {
        position: absolute;
    }
}
li.pass,
li.active {
    color: @activeColor;
    .line {
        background: @activeColor;
    }
    .items > div::before {
        background: @activeColor;
    }
    .mul-wrap {
        .line {
            background: @activeColor;
        }
        .items .title {
            color: @activeColor;
        }
    }
}
li.pass {
    .icon {
        background-image: url(./assets/done.png);
    }
}
.mul-wrap .title.pass {
    .icon {
        background-image: url(./assets/done.png);
    }
}
li.error {
    color: #fd5555;
    .icon {
        background-image: url(./assets/error.png);
    }
}
li.done {
    color: #55a8fd;
    .icon {
        background-image: url(./assets/done.png);
    }
}
li.no-suf-line {
    margin-right: 0;
    .title {
        min-width: 170px;
    }
    .line {
        display: none;
    }
}
.wrapper {
    overflow-x: auto;
}
</style>