import React from 'react'
import connect from 'react-redux/lib/components/connect'
import {bindActionCreators} from 'redux';
import * as Utils from './utils'
import get from 'lodash/get'

export default (entity, dataRetriever) => {

  return WrappedComponent =>{
    class Connected extends React.Component {

      static WrappedComponent = WrappedComponent;

      shouldComponentUpdate(nextProps, nextState) {
        if(nextProps[entity] !== this.props[entity] || nextProps.isFetching !== this.props.isFetching) return true
        return false
      }

      componentWillMount() {
        this.props[`load${Utils.capitalize(entity)}`](dataRetriever(this.props.state).search)
      }

      render() {
        return <WrappedComponent  {...this.props} />
      }
    }

    function mapDispatchToProps(dispatch) {
        return bindActionCreators({
          [`load${Utils.capitalize(entity)}`]: query => Utils.action(`LOAD_${entity.toUpperCase()}`, {query}),
          [`loadMore${Utils.capitalize(entity)}`]: query => Utils.action(`LOAD_MORE_${entity.toUpperCase()}`, {query})
        }, dispatch);
    }

    function mapStateToProps(state) {
      const entities = get(state,`entities.${entity}`)
      const entityPaginationData = get(state,`pagination.${entity}.${dataRetriever(state).search}`) || { ids: [] }
      const data = entityPaginationData.ids.map(id => entities[id])
      return {
        state,
        [entity]:data,
        isFetching:entityPaginationData.isFetching
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(Connected);
  }
}
