import axios from 'axios';
const SkillComponent = {
    data() {
        return {
          btn_ctl: {
            activate_skills_save_btn: false
          }
        }
    },
    methods: {
        validateSkillFormV(){
          var skillValidated=this.brandProfile.skills.filter(sk=>!sk.entry).length==0;
          return skillValidated && this.btn_ctl.activate_skills_save_btn;
        },
        addSkillV(){
          this.brandProfile.skills.push({});
          this.btn_ctl.activate_skills_save_btn= true;
        },
        removeSkillV(index){
            this.brandProfile.skills.splice(index,1);
            this.btn_ctl.activate_skills_save_btn= true;
        },
        settingSkillsV(){
          const brandId =  this.getIdentity().brandId; // Auth.getIdentity();
          this.brandProfile.skills = this.brandProfile.skills.filter(skill=>{
            return skill.entry;
          })
          settingSkills(brandId,this.brandProfile.skills).then(response=>{
            if(response.data.code==200){
              this.btn_ctl.activate_skills_save_btn = false;
            }
         });
        }
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
 return updateSkillForBrand(brandId,dto)
}
export default SkillComponent;

