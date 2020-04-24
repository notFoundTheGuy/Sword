// 注册组件
const PREFIX = 'lee'
var registerComponents = function(vue, ...components) {
    components.forEach(component=>{
        let prefix = component.prefix || PREFIX
        component.name = `${prefix}-${component.name}`

        vue.component(component.name, component);    
    });
}

// 注册指令
var registerDirective = function(Vue) {
    // vue.directive(component.name, component)
}

export {
    registerComponents,
    registerDirective
}