const ContentediableComponent = {
    props: ['modelValue','placeholder'],
    template: `<div class="textarea" role="textbox" contenteditable  :placeholder="placeholder" ref="editor" v-html="contentHtml"  @input="updateCode" @focus="focusEditor" @blur="blurEditor"></div>`,
    data () {
        return{
            oldval: this.modelValue ,
            contentHtml: this.modelValue || this.modelValue === 0 ? this.modelValue : '<div><br></div>',
            isLocked: true,
            lastEditRange: null
        }
    },
    methods: {
        updateCode: function($event) {
            this.$emit('update:modelValue', this.$refs.editor.innerText)
            this.$emit('input', '')
        },
        blurEditor (event) {
            this.isLocked = false
            if(this.oldval !== this.modelValue){
                this.$emit('change', '')
            }
        },
        focusEditor (event) {
            this.isLocked = true
        }
    },
    watch: {
        modelValue (val) {
            if (!this.isLocked) {
                this.contentHtml = this.modelValue;
            }
        }
    }
   
  }
  export {ContentediableComponent}