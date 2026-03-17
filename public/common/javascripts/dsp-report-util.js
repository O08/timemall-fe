import { DspReportApi } from "/common/javascripts/dsp-report-api.js";
import { CodeMappingTypeEnum } from "/common/javascripts/tm-constant.js";

export function useDspReportUtil(scene, sceneUrl) {

    var _scene = scene;
    var _sceneUrl = sceneUrl;

    // report feature

    function initReportForm() {

        if (!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value) {
            document.querySelector('#caseMaterialFile').value = null;
        }

        return {
            fraudType: "",
            scene: _scene,
            sceneUrl: _sceneUrl,
            caseDesc: "",
            material: ""
        }
    }

    async function newReportCase(reportForm) {

        const materialFile = $('#caseMaterialFile')[0].files[0];

        var form = new FormData();
        if (!!materialFile) {
            form.append("material", materialFile);
        }
        form.append("fraudType", reportForm.fraudType);
        form.append("scene", reportForm.scene);
        form.append("sceneUrl", reportForm.sceneUrl);
        form.append("caseDesc", reportForm.caseDesc);
        return await DspReportApi.addNewReportCase(form);

    }
    async function loadReportIssueList(appObj) {
        const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE, "");
        var data = await response.json();
        if (data.code == 200) {

            appObj.reportOptions = data.codes.records;

        }
    }

    async function showOasisReportModal(loadReportIssueListV) {
        await loadReportIssueListV();
        $("#reportOasisModal").modal("show");
    }

    return { showOasisReportModal, loadReportIssueList, newReportCase, initReportForm }


}