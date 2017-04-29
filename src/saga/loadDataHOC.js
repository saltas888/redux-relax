import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux';

import get from 'lodash/get'
import omit from 'lodash/omit'

import * as Utils from '../shared/utils'
import Data from '../shared/data'

const inflect = require('i')();

export const multiple = (entity, dataRetriever) => {
  return WrappedComponent =>{
    const entityData = Data.configs.entities.find(e=>e.name === entity)
    class Connected extends React.Component {

      shouldComponentUpdate(nextProps, nextState) {
        // if(nextProps[entity] !== this.props[entity] || nextProps.isFetching !== this.props.isFetching) return true
        return true
      }

      componentWillMount() {
        this.props[`load${Utils.capitalize(entity)}`](dataRetriever(this.props.state, this.props).search || 'default')
      }

      render() {
        return <WrappedComponent  {...this.props} />
      }
    }

    function mapDispatchToProps(dispatch) {
        return bindActionCreators({
          [`load${Utils.capitalize(entity)}`]: query => Utils.action(`LOAD_${entity.toUpperCase()}`, {[entityData.paginationKey || 'query']:query}),
          [`loadMore${Utils.capitalize(entity)}`]: query => Utils.action(`LOAD_MORE_${entity.toUpperCase()}`, {[entityData.paginationKey || 'query']:query})
        }, dispatch);
    }

    function mapStateToProps(state, ownProps) {
      const entities = get(state,`entities.${entity}`)
      const entityPaginationData = get(state,`pagination.${entity}.${dataRetriever(state, ownProps).search || 'default'}`) || { ids: [] }
      const data = entityPaginationData.ids.map(id => entities[id])
      return {
        state,
        [entity]:data,
        ...omit(entityPaginationData, ['ids'])
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(Connected);
  }
}

export const single = (entity, idRetriever) => {
  
  return WrappedComponent =>{
    const entityData = Data.configs.entities.find(e=>e.name === entity)
    const loadEntityFuncName = `load${Utils.capitalize(inflect.singularize(entity))}`
    class Connected extends React.Component {

      shouldComponentUpdate(nextProps, nextState) {
        // if(nextProps[inflect.singularize(entity)] !== this.props[inflect.singularize(entity)]) return true
        return true
      }

      componentWillMount() {
        this.props[loadEntityFuncName](idRetriever(this.props.state, this.props))
      }

      render() {
        return <WrappedComponent  {...this.props} />
      }
    }

    function mapDispatchToProps(dispatch) {
        return bindActionCreators({
          [loadEntityFuncName]: id => (
            Utils.action(`LOAD_${inflect.singularize(entity).toUpperCase()}`, {[entityData.uniqueIdAttribute || 'id']: id})
          )
        }, dispatch);
    }

    function mapStateToProps(state, ownProps) {

      const data = get(state,`entities.${entity}.${idRetriever(state, ownProps)}`)
      return {
        state,
        [inflect.singularize(entity)]:data,
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(Connected);
  }
}
