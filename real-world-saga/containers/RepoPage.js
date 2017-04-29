import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {single, multiple} from '../../distribution-saga/saga/loadDataHOC'
import get from 'lodash/get'

import Repo from '../components/Repo'
import User from '../components/User'
import List from '../components/List'


function getSearchUrl(state){

  const { login, name } = state.router.params
  return {search:`${login}/${name}`}
}


@multiple('users', getSearchUrl)
@single('repos', (state,ownProps)=> {
  const { login, name } = state.router.params
  return `${login}/${name}`
})
class RepoPage extends Component {
  constructor(props) {
    super(props)
    this.renderUser = this.renderUser.bind(this)
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this)
  }

  componentWillMount() {
    this.props.loadRepo(this.props.fullName)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullName !== this.props.fullName) {
      this.props.loadRepo(nextProps.fullName)
    }
  }

  handleLoadMoreClick() {
    this.props.loadMoreUsers(this.props.fullName)
  }

  renderUser(user) {
    return (
      <User user={user}
            key={user.login} />
    )
  }

  render() {
    const { repo, owner, name } = this.props
    if (!repo || !owner) {
      return <h1><i>Loading {name} details...</i></h1>
    }

    const { users, isFetching, nextPageUrl } = this.props
    return (
      <div>
        <Repo repo={repo}
                    owner={owner} />
        <hr />
        <List renderItem={this.renderUser}
              items={users}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading stargazers of ${name}...`}
              isFetching={isFetching}
              nextPageUrl={nextPageUrl} />
      </div>
    )
  }
}

RepoPage.propTypes = {
  repo: PropTypes.object,
  fullName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  owner: PropTypes.object,
}

function mapStateToProps(state) {
  const { login, name } = state.router.params
  const {
    entities: { users, repos }
  } = state

  const fullName = `${login}/${name}`
  return {
    fullName,
    name,
    owner: get(repos[fullName], 'owner')
  }
}

export default connect(mapStateToProps, {
})(RepoPage)
