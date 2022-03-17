const axios = require('axios').default


class EtherScan{
    constructor(){
        this.axios = axios.create({
            baseURL:`${process.env.ETHERSCAN_BASE_URL}/api`
        })
        this.token = process.env.ETHERSCAN_API_KEY
        
    }


    /**
     * 
     * @param {String} address
     * @param {String} params
     * @returns {Promise<>}
     */
    async getBalance({address}={}){
        const response = await this.axios.get(`/`,{
            params:{
                module:"account",
                action:"balance",
                address,
                tag:"latest",
                apikey:this.token
            }
        })

        return response
    }
}


module.exports = new EtherScan()