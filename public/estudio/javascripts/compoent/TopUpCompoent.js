import axios from 'axios';
const TopUpCompoent = {
    data() {
      return {
        top_up_amount_little: 12.00,
        top_up_amount_big: 0.00,
        drawable: "0.00"
      }
    },
    methods: {
        getTopUpTotalV(){
            return Number(this.top_up_amount_little) + Number(this.top_up_amount_big);
        },
        topUpV(){
            topUp(this.top_up_amount_big,this.top_up_amount_little);
        },
        getDrawableV(){
            getDrawable().then(response=>{
                if(response.data.code == 200){
                    this.drawable = response.data.billboard.drawable;
                }
            })
        }

    },
    created(){
        this.getDrawableV();
     }
}
async function getFinanceBillBoard(){
    const url = "/api/v1/team/finance_board";
  return await axios.get(url);
}
async function newtopUp(dto){
    const url = "/api/v1/web_estudio/order/top_up";
    return await axios.post(url,dto);
}

function getDrawable(){
    return getFinanceBillBoard();
}

function topUp(amountBig,amountLittle){
    const dto={
        amountLittle: amountLittle,
        amountBig: amountBig
    }
    newtopUp(dto).then((response)=>{
        if(response.data.code == 200){
            // if create order success ,forward to pay 
            const merchantUserId = response.data.order.merchantUserId;
            const merchantOrderId = response.data.order.merchantOrderId;
            window.location.href= '/api/payment/goAlipay.html?merchantUserId=' + merchantUserId + '&merchantOrderId=' + merchantOrderId;
        }
    });
}

export default TopUpCompoent;