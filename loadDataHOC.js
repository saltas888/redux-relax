import React from 'react'
import connect from 'react-redux/lib/components/connect'
import {bindActionCreators} from 'redux';

export default (WrappedComponent,{entity}) => {

  return class extends React.Component {

    static WrappedComponent = WrappedComponent;

    render() {
      return <WrappedComponent  {...this.props} />
    }
  }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      //actions
    }, dispatch);
}

function mapStateToProps(store) {
    return {
        //data
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Downloads);