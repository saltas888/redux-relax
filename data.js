import defaultConfigs from './config'
import merge from 'lodash/merge'
class Data {
  constructor(){
    this._configs = defaultConfigs
  }
  reinitialize(configs){
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