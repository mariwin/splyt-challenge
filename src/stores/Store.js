import { observable, action } from 'mobx'
import { RestClient } from '../helpers/RestClientHelper'
import Services from '../services/Services'

const Client = new RestClient()

const ob = observable({
    taxiList: [],
    zoom:14,
    selected: undefined,
    sliderVal: 10
})

const actions = {
    getTaxi: action(() => {
        let param = {
            latitude: '51.5049375',
            longitude: '-0.0964509',
            count: Store.ob.sliderVal ? Store.ob.sliderVal : 10
        }
        Client.call(Services.getDrivers, param, {})
          .then(res => {
            console.log(res)
            ob.taxiList = res.data
          })
          .catch(() => {
          })
      })
}

const Store = {
    ob,
    actions
}

export default Store