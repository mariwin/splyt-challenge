import axios from "axios";
import axiosRetry from "axios-retry";
import format from "string-template";

const inRange = (value, min, max) => value >= min && value <= max;

export const Request = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete"
};

export class RestClient {
  constructor(configs) {
    this._configs = Object.assign(
      {
        baseURL: "/",
        timeout: 60000,
        retry: 0,
        headers: {
        }
      },
      configs
    );
    
    this.headersConfig = this._configs.headers  
    this.axiosConfig = {
      baseURL: this._configs.baseURL,
      timeout: this._configs.timeout
    };

    this.client = axios.create(this.axiosConfig);
  }

  call = async (endpoint, urlParams, postValue) => {
    this.client.interceptors.request.use(
      config => {
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        return Promise.reject(error);
      }
    );

    axiosRetry(this.client, {
      retries: this._configs.retry || 0,
      retryDelay: retryCount => {
        return retryCount * 1000;
      }
    });

    let formatedUrl = ''
    if(endpoint.method === 'get'){
      if(urlParams){
        let attr = '?'
        let once = false
        for (var key in urlParams) {
          if (urlParams.hasOwnProperty(key)) {
              if(!once){
                once = true
                attr = attr + key + "=" + urlParams[key]
              }else{
                attr = attr + "&"+ key + "=" + urlParams[key]
              }
          }
        }
        formatedUrl = endpoint.uri + attr
      } 
    }else{
      formatedUrl = urlParams
      ? format(endpoint.uri, urlParams)
      : endpoint.uri;
    }
      
    const headerObj = Object.assign( {}, this.headersConfig )

    let requestConfig = {
      url: formatedUrl,
      method: endpoint.method,
      headers: Object.getOwnPropertyNames(headerObj).length !== 0 ? headerObj : null
    };

    try {
      let response = await this.client.request(requestConfig);
      return transformResponse(response);
    } catch (error) {
      if (error.response) {
        return Promise.reject(transformResponse(error.response));
      }
      if (axios.isCancel(error)) {
          return error.message
      } 
      return Promise.reject(error);
    }
  };
}

const wrapAxiosResponse = axiosResponse => {
  const wrappedResponse = {
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
    config: axiosResponse.config,
    headers: axiosResponse.headers,
    status: axiosResponse.status,
    data: axiosResponse.data
  };

  wrappedResponse.isOk = wrappedResponse.status == 200;
  wrappedResponse.isCreated = wrappedResponse.status == 201;
  wrappedResponse.isBadRequest = wrappedResponse.status == 400;
  wrappedResponse.isForbidden = wrappedResponse.status == 403;
  wrappedResponse.isNotFound = wrappedResponse.status == 404;
  wrappedResponse.isServerError = wrappedResponse.status == 500;
  wrappedResponse.isGatewayTimeout = wrappedResponse.status == 504;

  wrappedResponse.isSuccessful = inRange(wrappedResponse.status, 200, 299);
  wrappedResponse.isClientError = inRange(wrappedResponse.status, 400, 499);

  return wrappedResponse;
};

const transformResponse = response => {
  const wrappedResponse = wrapAxiosResponse(response);
  return wrappedResponse;
};

export const Endpoint = (method, url, cancelToken = null) => ({
  uri: url,
  method: method,
  cancelToken: cancelToken
});

const apiWrapper = { RestClient, Endpoint, Request };
export default apiWrapper;

