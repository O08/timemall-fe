import axios from 'axios';
import {EventFeedMark,EventFeedCode,EventFeedScene} from "/common/javascripts/tm-constant.js";
import { getQueryVariable } from "/common/javascripts/util.js";


export default function EventFeed(params) {
    const {
        need_fetch_event_feed_signal = false,
        need_fetch_mutiple_event_feed = false,
        scene="",
        need_init = true
      } = params   
     return {
        data() {
            return {
                includeUnprocessedFeed: false,
                envent_feed_page_init_load_finish: false,
                eventFeed: {
                    records: []
                }
            }
        },
        methods: {
           fetchCreatedEventFeedSignalV(){

             if(need_fetch_event_feed_signal){
                fetchCreatedEventFeedSignal(scene).then(response=>{
                    if(response.data.code==200){
                        this.includeUnprocessedFeed = response.data.includeUnprocessedFeed;
                    }
                 })
             }
             
           },
           fetchMutipleEventFeedV(){
            if(need_fetch_mutiple_event_feed){
                fetchMutipleCreatedEventFeed(scene).then(response=>{
                    if(response.data.code==200){
                        this.eventFeed = response.data.eventFeed;
                        this.envent_feed_page_init_load_finish=true;
                    }
                 })
            }
           },
           sendEventFeedMessageNoticeV(serviceInfo,workFlowId){
            return sendEventFeedMessageNotice(scene,serviceInfo,workFlowId);
           },
           updateEventFeedMarkAsProcessedV(){
            const millstoneId = getQueryVariable("workflow_id");
            return updateEventFeedMarkAsProcessed(scene,millstoneId);
           },
           initEventFeedCompoentV(){
            this.fetchCreatedEventFeedSignalV();
            this.fetchMutipleEventFeedV();
           }

        },
        created: function() {
            if(need_init){
               this.initEventFeedCompoentV();
            }

        }
    }
    
}
async function getEventFeedSignal(scene,mark){
    const url="/api/v1/ms/event_feed/signal?scene="+scene+"&mark="+mark;
    return await axios.get(url);
}
async function getMutipleEventFeed(scene,mark){
    const url="/api/v1/ms/event_feed?scene="+scene+"&mark="+mark;
    return await axios.get(url);
}
async function eventFeedTrigger(dto){
    const url="/api/v1/ms/event_feed/trigger"
    return await axios.put(url,dto);
}
function fetchCreatedEventFeedSignal(scene){
   return getEventFeedSignal(scene,EventFeedMark.CREATED);
}
function fetchMutipleCreatedEventFeed(scene){
   return getMutipleEventFeed(scene,EventFeedMark.CREATED);
}
function sendPodMessageNoticeTrigger(appendix){
    const dto={
        eventCode: EventFeedCode.SEND_POD_MESSAGE_NOTICE,
        appendix: appendix
    }
    return eventFeedTrigger(dto);
}
function sendStudioMessageNoticeTrigger(appendix){
    const dto={
        eventCode: EventFeedCode.SEND_STUDIO_MESSAGE_NOTICE,
        appendix: appendix
    }
    return eventFeedTrigger(dto);
}
function updateEventFeedMarkAsProcessed(scene,workFlowId){
    const appendix={
        scene: scene,
        mark: EventFeedMark.PROCESSED,
        workFlowId: workFlowId
    }
    const dto={
        eventCode: EventFeedCode.UPDATE_EVENT_FEED_MARK,
        appendix: JSON.stringify(appendix)
    }
    return eventFeedTrigger(dto);
}
function sendEventFeedMessageNotice(scene,serviceInfo,workflowId){
    let appendix="";
   if(scene === EventFeedScene.POD){
    appendix={
        workFlowId: workflowId,
        down: serviceInfo.supplierUserId
    }
    sendStudioMessageNoticeTrigger(JSON.stringify(appendix));
   }
   if(scene === EventFeedScene.STUDIO){
    appendix={
        workFlowId: workflowId,
        down: serviceInfo.consumerUserId
    }
    sendPodMessageNoticeTrigger(JSON.stringify(appendix));
   }

}