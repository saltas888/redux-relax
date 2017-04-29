import defaultConfigs from './config'
import merge from 'lodash/merge'
import * as Utils from './utils'

class Data {
  constructor(){
    this._configs = defaultConfigs

  }
  reinitialize(configs){
    // const test = await Utils.validateConfigs(configs)
    // if(!test) throw new Error('error')
    this._configs = merge(this._configs, configs)
  }
  get configs(){
    return this._configs
  }
  get autoEntities(){
    return this._configs.entities.filter(entity=> !entity.auto)
  }
}
export default new Data()