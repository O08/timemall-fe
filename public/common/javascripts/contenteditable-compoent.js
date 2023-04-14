const ContentediableComponent = {
    props: ['modelValue','placeholder'],
    template: `<div class="textarea" role="textbox" contenteditable  :placeholder="placeholder" ref="editor" v-html="modelValue"   @focus="focusEditor" @blur="blurEditor"></div>`,
    data () {
        return{
            oldval: this.modelValue ,
            isLocked: true
        }
    },
    methods: {
        blurEditor (event) {
            this.isLocked = false;
            if(this.oldval !== this.$refs.editor.innerText){
                this.$emit('update:modelValue', this.$refs.editor.innerText);
                this.$emit('change', '');
            }
        },
        focusEditor (event) {
            this.isLocked = true;
        }
    }

   
  }
  export {ContentediableComponent}