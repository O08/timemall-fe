import "/common/javascripts/import-jquery.js";
import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';

const DatepickerComponent = {
    props: ['modelValue','placeholder'],
    template: `<input type="text"  ref="datepicker" :value="modelValue" :placeholder="placeholder" class="form-control millstone-input-box"   autocomplete="off">`,
    data () {
        return{
            oldval: this.modelValue 
        }
    },
    methods: {
    },
    mounted() {
        var vm = this
        $(this.$el).datepicker({
            dateFormat: "yy-mm-dd",
            duration: "fast",
            onSelect: function(selectedDate) {
                vm.$emit('update:modelValue', selectedDate);
                vm.$emit('input', '');
            },
            onClose: function(selectedDate) {
                if(vm.oldval !== selectedDate){
                    vm.$emit('change', '')
                }
            }
        });
        $(this.$el).datepicker( $.datepicker.regional[ "zh-CN" ] );
     
    }
   
  }
  export {DatepickerComponent}
