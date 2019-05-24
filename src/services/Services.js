import { Endpoint, Request } from '../helpers/RestClientHelper'

const Services = {
    getDrivers: Endpoint(Request.GET, '/drivers'),
}
  
export default Services
  