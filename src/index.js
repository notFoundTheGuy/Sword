import { registerComponents,registerDirective } from './utils/register'
// 公用样式
import './style-core/index.less';

import treeTable from './components/tree-table/index.vue'
import monthPicker from './components/mouth-picker/index.vue'
import editSelect from './components/edit-select/index.vue'
import formatInput from './components/format-input/index.vue'
import multiSteps from './components/multi-steps/index.vue'
import schedule from './components/schedule/index.vue'
import imgFillW from './components/image-container/imgfill-w.vue'
import imgFillH from './components/image-container/imgfill-h.vue'
import imgcard from './components/image-container/imgcard.vue'
// import imageContainerH from './components/image-container/container-h.vue'

// 移动端
// import mplayer from './touch-temp/h5MusicPlayer.vue'
// import sticky from './touch-temp/sticky.vue'
// import slideOperator from './touch-temp/slide-operator.vue'



var plugin = {
    install: function(Vue, options) {
        // var tags = [
        //     'form-group', 
        //     'input-group', 
        //     'input-addon', 
        //     'switch-u'
        // ];
        // if(document.registerElement) {
        //     tags.forEach(tagName=>{
        //     document.registerElement(tagName);
        //     })
        // }

        // 注册组件
        registerComponents(Vue, 
            // mplayer,
            // sticky,
            // slideOperator,
            treeTable,
            monthPicker,
            editSelect,
            formatInput,
            multiSteps,
            schedule,
            imgFillW,
            imgFillH,
            imgcard
        )
    }
}

export default plugin