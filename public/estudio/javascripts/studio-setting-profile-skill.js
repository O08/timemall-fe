import axios from 'axios';
const SkillComponent = {
    data() {
        return {
           activeSaveSkillButton: false
        }
    },
    methods: {
        addSkillV(){
          this.brandProfile.skills.push({});
        },
        removeSkillV(index){
            this.brandProfile.skills.splice(index,1);
        },
        settingSkillsV(){
          const brandId =  this.getIdentity().brandId; // Auth.getIdentity();
          settingSkills(brandId,this.brandProfile.skills);
        }
    },
    watch: {
        'brandProfile.skills': {
          handler(newValue, oldValue) {
            this.activeSaveSkillButton = true;
            console.log('numbers正在被侦听')
          },
          deep: true
        },
    }
}
async function updateSkillForBrand(brandId,dto){
  const url = "/api/v1/web_estudio/brand/{brand_id}/skills".replace("{brand_id}",brandId);
  return await axios.put(url,dto)  
}
function settingSkills(brandId,skills){  
  const dto = {
    skill: {
      skills: skills
    }

  }
  updateSkillForBrand(brandId,dto);
}
export default SkillComponent;

