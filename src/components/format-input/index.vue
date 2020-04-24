<template>
    <input type="text" v-model="hereValue" @keyup="formatInput($event)" maxlength="20"/>
</template>

<script>
export default {
    name: 'format-input',
    model: {
        prop: "value",
        event: "input"
    },
    props: {
        regexp: {
            type: RegExp,
            default: null
        }
    },
    data() {
        return {
            hereValue: ''
        }
    },
    created() {
        this.hereValue = this.value
    },
    methods: {
        formatInput(e) {
            
            // /([^\d]|\s)/g
            var inputEl = e.target
            inputEl.value = inputEl.value.replace(/([^\d]|\s)/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
        
            //移动端部分机型浏览器存在替换后退格问题，解决方案
            var event = document.createEvent('HTMLEvents');
            event.initEvent("input", true, true);
            inputEl.dispatchEvent(event);

            this.$emit('input', this.hereValue)
        }
    },
    watch: {
        hereValue: function() {
            
        }
    }
}
</script>